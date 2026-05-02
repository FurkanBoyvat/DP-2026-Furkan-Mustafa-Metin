const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const pool = require('./config/database');

dotenv.config();

const app = express();

// ============== MIDDLEWARE ==============
app.use(helmet());
app.use(cors());

// ── Akıllı Logger Middleware ──────────────────────────────────────────────────
// Polling endpointlerinin başarılı (2xx) GET loglarını bastırır.
// Sadece şunları loglar: hatalar (4xx/5xx), mutasyonlar (POST/PUT/DELETE), özel eventler

// Polling loglama bastırma listesi
const SILENT_POLLING_PATTERNS = [
  /^\/api\/takip\/konum\/\d+$/,          // GET /api/takip/konum/:id
  /^\/api\/takip\/konumlar\/all/,         // GET /api/takip/konumlar/all
  /^\/api\/bolge-ihlalleri(\?.*)?$/,      // GET /api/bolge-ihlalleri
  /^\/api\/kisitli-alanlar\/aktif\/all/,  // GET /api/kisitli-alanlar/aktif/all
  /^\/api\/araclar(\?.*)?$/,              // GET /api/araclar
  /^\/api\/yakit\/sofor\/leaderboard/,    // GET /api/yakit/sofor/leaderboard*
  /^\/api\/yakit\/sofor\/kayitlar/,       // GET /api/yakit/sofor/kayitlar
  /^\/api\/kullanicilar\/soforler\/all/,  // GET /api/kullanicilar/soforler/all
  /^\/api\/bakim(\?.*)?$/,               // GET /api/bakim
];

const isSilentPolling = (method, url) => {
  if (method !== 'GET') return false;
  return SILENT_POLLING_PATTERNS.some(pattern => pattern.test(url));
};

app.use((req, res, next) => {
  const startTime = Date.now();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const silent = isSilentPolling(method, url);

  // Polling olmayan veya mutasyon isteklerini logla
  if (!silent) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
    if (req.body && Object.keys(req.body).length > 0) {
      const bodyStr = JSON.stringify(req.body);
      console.log(`  Body: ${bodyStr.substring(0, 300)}`);
    }
  }

  // Response hook: her zaman hataları logla, başarılı pollingleri loglamayacak
  const originalSend = res.send;
  res.send = function(data) {
    const statusCode = res.statusCode;
    const duration = Date.now() - startTime;
    const isError = statusCode >= 400;

    if (isError || !silent) {
      const timestamp = new Date().toISOString();
      const icon = statusCode >= 500 ? '❌' : statusCode >= 400 ? '⚠️ ' : '✅';
      console.log(`${icon} [${timestamp}] ${statusCode} ${method} ${url} (${duration}ms)`);
      if (isError && data) {
        const str = typeof data === 'string' ? data : JSON.stringify(data);
        console.log(`   ${str.substring(0, 300)}`);
      }
    }

    return originalSend.call(this, data);
  };

  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============== ROUTES ==============
const authRoutes = require('./routes/authRoutes');
const sirketRoutes = require('./routes/sirketRoutes');
const filoRoutes = require('./routes/filoRoutes');
const aracRoutes = require('./routes/aracRoutes');
const takipRoutes = require('./routes/takipRoutes');
const userRoutes = require('./routes/userRoutes');
const yakitRoutes = require('./routes/yakitRoutes');
const bakimRoutes = require('./routes/bakimRoutes');
const raporRoutes = require('./routes/raporRoutes');
const kisitliAlanRoutes = require('./routes/kisitliAlanRoutes');
const bolgeIhlalRoutes = require('./routes/bolgeIhlalRoutes');
const aracSoforRoutes = require('./routes/aracSoforRoutes');
const sirketYoneticiRoutes = require('./routes/sirketYoneticiRoutes');
const sirketDetayRoutes = require('./routes/sirketDetayRoutes');
const geofencingRoutes = require('./routes/geofencingRoutes');


// ============== API ENDPOINTS ==============
app.use('/api/auth', authRoutes);
app.use('/api/sirketler', sirketRoutes);
app.use('/api/filolar', filoRoutes);
app.use('/api/araclar', aracRoutes);
app.use('/api/takip', takipRoutes);
app.use('/api/kullanicilar', userRoutes);
app.use('/api/yakit', yakitRoutes);
app.use('/api/bakim', bakimRoutes);
app.use('/api/raporlar', raporRoutes);
app.use('/api/kisitli-alanlar', kisitliAlanRoutes);
app.use('/api/bolge-ihlalleri', bolgeIhlalRoutes);
app.use('/api/arac-soforleri', aracSoforRoutes);
app.use('/api/sirket-yoneticileri', sirketYoneticiRoutes);
app.use('/api/sirket-detaylari', sirketDetayRoutes);
app.use('/api/geofencing', geofencingRoutes);


// Health check
app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API çalışıyor',
    timestamp: new Date().toISOString()
  });
});

// 404 Handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Endpoint bulunamadı',
    path: req.originalUrl
  });
});

// ============== HATA HANDLER ==============
app.use((err, req, res, next) => {
  console.error('❌ Hata:', err);
  return res.status(err.status || 500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
  });
});

// ============== ADMIN KULLANICI OLUŞTUR ==============
const createAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@admin.com';
    const sifre = process.env.ADMIN_PASSWORD || 'admin123';

    const exists = await pool.query(
      'SELECT * FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (exists.rows.length === 0) {
      const hashedSifre = await bcrypt.hash(sifre, 10);
      await pool.query(
        `INSERT INTO kullanicilar (email, sifre, ad, soyad, telefon, rol)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [email, hashedSifre, 'Admin', 'Sistem', '0', 'admin']
      );
      console.log('✅ Admin kullanıcı oluşturuldu');
      console.log(`   📧 Email: ${email}`);
      console.log(`   🔐 Şifre: ${sifre}`);
    }
  } catch (error) {
    console.error('❌ Admin kullanıcı oluşturma hatası:', error.message);
  }
};

// ============== SERVER ==============
const PORT = process.env.PORT || 3000;

// Admin kullanıcı oluştur ve server'ı başlat
const startServer = async () => {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    
    // Admin kullanıcı oluştur
    await createAdminUser();

    const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('\n=====================================');
    console.log('🚀 ARAÇ TAKIP SİSTEMİ API');
    console.log('=====================================');
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`🌐 Ağ IP'si ile erişim: http://0.0.0.0:${PORT}`);
    console.log(`🌍 Ortam: ${process.env.NODE_ENV || 'development'}`);
    console.log('-------------------------------------');
    console.log('📍 AKTİF ENDPOİNTLER:');
    console.log('-------------------------------------');
    console.log('🔐 AUTHENTICATION:');
    console.log('   POST   /api/auth/login');
    console.log('   POST   /api/auth/register');
    console.log('   GET    /api/auth/profile');
    console.log('');
    console.log('🏢 ŞİRKETLER:');
    console.log('   GET    /api/sirketler');
    console.log('   GET    /api/sirketler/:sirket_id');
    console.log('   POST   /api/sirketler');
    console.log('   PUT    /api/sirketler/:sirket_id');
    console.log('   PUT    /api/sirketler/:sirket_id/detaylar');
    console.log('   DELETE /api/sirketler/:sirket_id');
    console.log('');
    console.log('📦 FİLOLAR:');
    console.log('   GET    /api/filolar');
    console.log('   GET    /api/filolar/:filo_id/istatistikler');
    console.log('   POST   /api/filolar');
    console.log('   PUT    /api/filolar/:filo_id');
    console.log('   DELETE /api/filolar/:filo_id');
    console.log('');
    console.log('🚗 ARAÇLAR:');
    console.log('   GET    /api/araclar');
    console.log('   GET    /api/araclar/:arac_id');
    console.log('   GET    /api/araclar/plaka/:plaka');
    console.log('   GET    /api/araclar/sayisi/toplam');
    console.log('   POST   /api/araclar');
    console.log('   PUT    /api/araclar/:arac_id');
    console.log('   DELETE /api/araclar/:arac_id');
    console.log('');
    console.log('📍 TAKIP SISTEMI:');
    console.log('   Konum Takibi:');
    console.log('     POST   /api/takip/konum/update');
    console.log('     GET    /api/takip/konum/:arac_id');
    console.log('     GET    /api/takip/konumlar/all');
    console.log('');
    console.log('   KM Takibi:');
    console.log('     POST   /api/takip/km/add');
    console.log('     GET    /api/takip/km/:arac_id');
    console.log('');
    console.log('   Hız Takibi:');
    console.log('     POST   /api/takip/hiz/add');
    console.log('     GET    /api/takip/hiz/:arac_id');
    console.log('     GET    /api/takip/hiz-stats/:arac_id');
    console.log('     POST   /api/takip/hiz/asimi');
    console.log('');
    console.log('👥 KULLANICILAR:');
    console.log('   GET    /api/kullanicilar');
    console.log('   GET    /api/kullanicilar/:kullanici_id');
    console.log('   POST   /api/kullanicilar');
    console.log('   PUT    /api/kullanicilar/:kullanici_id');
    console.log('   DELETE /api/kullanicilar/:kullanici_id');
    console.log('   GET    /api/kullanicilar/soforler/all');
    console.log('');
    console.log('⛽ YAKIT TAKIBI:');
    console.log('   Şoför Bazlı Değerler:');
    console.log('     GET    /api/yakit/sofor/kayitlar');
    console.log('     GET    /api/yakit/sofor/leaderboard');
    console.log('     POST   /api/yakit/sofor/kayitlar');
    console.log('     PUT    /api/yakit/sofor/kayitlar/:kayit_id');
    console.log('     DELETE /api/yakit/sofor/kayitlar/:kayit_id');
    console.log('   Araç Bazlı Değerler (Eski):');
    console.log('     GET    /api/yakit');
    console.log('     GET    /api/yakit/:kayit_id');
    console.log('     POST   /api/yakit');
    console.log('     PUT    /api/yakit/:kayit_id');
    console.log('     DELETE /api/yakit/:kayit_id');
    console.log('     GET    /api/yakit/arac/:arac_id');
    console.log('     GET    /api/yakit/rapor/aylik');
    console.log('');
    console.log('🔧 BAKIM TALEPLERI:');
    console.log('   GET    /api/bakim');
    console.log('   GET    /api/bakim/:talep_id');
    console.log('   POST   /api/bakim');
    console.log('   PUT    /api/bakim/:talep_id');
    console.log('   DELETE /api/bakim/:talep_id');
    console.log('');
    console.log('📊 RAPORLAR:');
    console.log('   GET    /api/raporlar');
    console.log('   GET    /api/raporlar/:rapor_id');
    console.log('   POST   /api/raporlar');
    console.log('   PUT    /api/raporlar/:rapor_id');
    console.log('   DELETE /api/raporlar/:rapor_id');
    console.log('   GET    /api/raporlar/sirket/:sirket_id');
    console.log('');
    console.log('🚫 KISITLI ALANLAR:');
    console.log('   GET    /api/kisitli-alanlar');
    console.log('   GET    /api/kisitli-alanlar/:alan_id');
    console.log('   POST   /api/kisitli-alanlar');
    console.log('   PUT    /api/kisitli-alanlar/:alan_id');
    console.log('   DELETE /api/kisitli-alanlar/:alan_id');
    console.log('   GET    /api/kisitli-alanlar/aktif/all');
    console.log('');
    console.log('⚠️  BOLGE IHLALLERI:');
    console.log('   GET    /api/bolge-ihlalleri');
    console.log('   GET    /api/bolge-ihlalleri/:ihlal_id');
    console.log('   POST   /api/bolge-ihlalleri');
    console.log('   PUT    /api/bolge-ihlalleri/:ihlal_id');
    console.log('   DELETE /api/bolge-ihlalleri/:ihlal_id');
    console.log('   GET    /api/bolge-ihlalleri/cozulmemis/all');
    console.log('');
    console.log('👨‍✈️  ARAÇ ŞOFORLERI:');
    console.log('   GET    /api/arac-soforleri');
    console.log('   GET    /api/arac-soforleri/:atama_id');
    console.log('   POST   /api/arac-soforleri');
    console.log('   PUT    /api/arac-soforleri/:atama_id');
    console.log('   DELETE /api/arac-soforleri/:atama_id');
    console.log('   GET    /api/arac-soforleri/aktif/all');
    console.log('');
    console.log('👔 ŞIRKET YONETICILERI:');
    console.log('   GET    /api/sirket-yoneticileri');
    console.log('   GET    /api/sirket-yoneticileri/:yonetici_atama_id');
    console.log('   POST   /api/sirket-yoneticileri');
    console.log('   PUT    /api/sirket-yoneticileri/:yonetici_atama_id');
    console.log('   DELETE /api/sirket-yoneticileri/:yonetici_atama_id');
    console.log('   GET    /api/sirket-yoneticileri/aktif/all');
    console.log('');
    console.log('📋 ŞIRKET DETAYLARI:');
    console.log('   GET    /api/sirket-detaylari');
    console.log('   GET    /api/sirket-detaylari/:detay_id');
    console.log('   POST   /api/sirket-detaylari');
    console.log('   PUT    /api/sirket-detaylari/:detay_id');
    console.log('   DELETE /api/sirket-detaylari/:detay_id');
    console.log('   GET    /api/sirket-detaylari/sirket/:sirket_id');
    console.log('   GET    /api/sirket-detaylari/aktif/all');
    console.log('');
    console.log('❤️  HEALTH CHECK:');
    console.log('   GET    /api/health');
    console.log('=====================================');
    console.log('');
    });

    // EADDRINUSE: Port dolu — temiz hata mesajı
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} zaten kullanımda!`);
        console.error(`   Çözüm: node start.js kullanın (otomatik temizler)`);
        console.error(`   veya: taskkill /F /IM node.exe komutu çalıştırın\n`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  } catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error);
    process.exit(1);
  }
};

// Server'ı başlat
startServer();

module.exports = app;

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

// Request Logger Middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent');
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  console.log(`  User-Agent: ${userAgent}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`  Body:`, JSON.stringify(req.body, null, 2));
  }
  
  // Response logger
  const originalSend = res.send;
  res.send = function(data) {
    const timestamp = new Date().toISOString();
    const statusCode = res.statusCode;
    console.log(`[${timestamp}] Response ${statusCode} for ${method} ${url}`);
    if (data && typeof data === 'object') {
      console.log(`  Response:`, JSON.stringify(data, null, 2));
    } else if (data) {
      console.log(`  Response:`, data.toString().substring(0, 200));
    }
    console.log('=== END ===');
    return originalSend.call(this, data);
  };
  
  console.log('---');
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

    app.listen(PORT, '0.0.0.0', () => {
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
  } catch (error) {
    console.error('❌ Sunucu başlatma hatası:', error.message);
    process.exit(1);
  }
};

// Server'ı başlat
startServer();

module.exports = app;

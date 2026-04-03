const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Kullanıcı Giriş
exports.login = async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gerekli',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await pool.query(
      'SELECT * FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre',
        code: 'INVALID_CREDENTIALS'
      });
    }

    const kullanici = result.rows[0];

    const eslesmeKontrol = await bcrypt.compare(sifre, kullanici.sifre);

    if (!eslesmeKontrol) {
      return res.status(401).json({
        success: false,
        message: 'Geçersiz email veya şifre',
        code: 'INVALID_CREDENTIALS'
      });
    }

    if (!kullanici.durum) {
      return res.status(403).json({
        success: false,
        message: 'Kullanıcı hesabı devre dışı',
        code: 'ACCOUNT_DISABLED'
      });
    }

    // Token oluştur
    const token = jwt.sign(
      {
        kullanici_id: kullanici.kullanici_id,
        email: kullanici.email,
        rol: kullanici.rol,
        ad: kullanici.ad,
        soyad: kullanici.soyad
      },
      process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    // Son giriş tarihini güncelle
    await pool.query(
      'UPDATE kullanicilar SET son_giris_tarih = CURRENT_TIMESTAMP WHERE kullanici_id = $1',
      [kullanici.kullanici_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Giriş başarılı',
      token,
      kullanici: {
        kullanici_id: kullanici.kullanici_id,
        email: kullanici.email,
        ad: kullanici.ad,
        soyad: kullanici.soyad,
        rol: kullanici.rol
      }
    });
  } catch (error) {
    console.error('Login Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};

// Kullanıcı Kayıt
exports.register = async (req, res) => {
  try {
    const { email, sifre, ad, soyad, telefon, rol } = req.body;

    if (!email || !sifre || !ad || !soyad || !telefon) {
      return res.status(400).json({
        success: false,
        message: 'Tüm alanlar gerekli',
        code: 'MISSING_FIELDS'
      });
    }

    // Email kontrolü
    const existsCheck = await pool.query(
      'SELECT * FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (existsCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu email zaten kayıtlı',
        code: 'EMAIL_EXISTS'
      });
    }

    // Şifreyi hashle
    const hashedSifre = await bcrypt.hash(sifre, 10);

    // Kullanıcı oluştur
    const result = await pool.query(
      `INSERT INTO kullanicilar (email, sifre, ad, soyad, telefon, rol)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING kullanici_id, email, ad, soyad, rol`,
      [email, hashedSifre, ad, soyad, telefon, rol || 'surucü']
    );

    const yeniKullanici = result.rows[0];

    // Token oluştur
    const token = jwt.sign(
      {
        kullanici_id: yeniKullanici.kullanici_id,
        email: yeniKullanici.email,
        rol: yeniKullanici.rol
      },
      process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli',
      { expiresIn: process.env.JWT_EXPIRE || '24h' }
    );

    return res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      token,
      kullanici: yeniKullanici
    });
  } catch (error) {
    console.error('Register Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      code: 'SERVER_ERROR',
      error: error.message
    });
  }
};



// Profil Bilgileri
exports.profil = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token gerekli', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli');
    const kullanici_id = decoded.kullanici_id;

    // Kullanıcı bilgilerini al
    const userResult = await pool.query(
      'SELECT kullanici_id, email, ad, soyad, telefon, rol, durum, olusturulma_tarihi, son_giris_tarih FROM kullanicilar WHERE kullanici_id = $1',
      [kullanici_id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' });
    }

    const kullanici = userResult.rows[0];
    let sirket = null;

    // Şirket bilgilerini bul (Yönetici mi?)
    const yoneticiSirket = await pool.query(
      `SELECT s.*, sd.* 
       FROM sirket_yoneticileri sy
       JOIN sirketler s ON sy.sirket_id = s.sirket_id
       LEFT JOIN sirket_detaylari sd ON s.sirket_id = sd.sirket_id
       WHERE sy.kullanici_id = $1`,
      [kullanici_id]
    );

    if (yoneticiSirket.rows.length > 0) {
      sirket = yoneticiSirket.rows[0];
    } else {
      // Şoför mü?
      const soforSirket = await pool.query(
        `SELECT s.*, sd.* 
         FROM arac_soforleri asf
         JOIN araclar a ON asf.arac_id = a.arac_id
         JOIN sirketler s ON a.sirket_id = s.sirket_id
         LEFT JOIN sirket_detaylari sd ON s.sirket_id = sd.sirket_id
         WHERE asf.kullanici_id = $1`,
        [kullanici_id]
      );
      if (soforSirket.rows.length > 0) {
        sirket = soforSirket.rows[0];
      }
    }

    let istatistikler = null;
    if (sirket) {
      const filoSayisiResult = await pool.query('SELECT COUNT(*) FROM filolar WHERE sirket_id = $1', [sirket.sirket_id]);
      const aracSayisiResult = await pool.query('SELECT COUNT(*) FROM araclar WHERE sirket_id = $1', [sirket.sirket_id]);
      
      istatistikler = {
        filoSayisi: parseInt(filoSayisiResult.rows[0].count),
        aracSayisi: parseInt(aracSayisiResult.rows[0].count)
      };
    }

    return res.status(200).json({
      success: true,
      kullanici,
      sirket: sirket ? {
        sirket_id: sirket.sirket_id,
        sirket_adi: sirket.sirket_adi,
        vergi_no: sirket.vergi_no,
        telefon: sirket.telefon,
        email: sirket.email,
        web_sitesi: sirket.web_sitesi,
        istatistikler,
        detay: {
          musteri_hizmetler_telefon: sirket.musteri_hizmetler_telefon,
          merkez_adres: sirket.merkez_adres,
          merkez_il: sirket.merkez_il,
          merkez_ilce: sirket.merkez_ilce,
          merkez_posta_kodu: sirket.merkez_posta_kodu,
          kulucu_ad: sirket.kulucu_ad,
          kulucu_soyad: sirket.kulucu_soyad,
          kulucu_unvan: sirket.kulucu_unvan,
          muhasebe_email: sirket.muhasebe_email,
          muhasebe_telefon: sirket.muhasebe_telefon,
          logo_url: sirket.logo_url
        }
      } : null
    });
  } catch (error) {
    console.error('Profil Hatası:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası', code: 'SERVER_ERROR' });
  }
};

// Profil Güncelleme
exports.updateProfile = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token gerekli', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli');
    const kullanici_id = decoded.kullanici_id;

    const { ad, soyad, telefon } = req.body;

    if (!ad || !soyad || !telefon) {
      return res.status(400).json({ success: false, message: 'Ad, soyad ve telefon gerekli', code: 'MISSING_FIELDS' });
    }

    const result = await pool.query(
      `UPDATE kullanicilar 
       SET ad = $1, soyad = $2, telefon = $3, guncelleme_tarihi = CURRENT_TIMESTAMP 
       WHERE kullanici_id = $4 
       RETURNING kullanici_id, email, ad, soyad, telefon, rol`,
      [ad, soyad, telefon, kullanici_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' });
    }

    return res.status(200).json({
      success: true,
      message: 'Profil başarıyla güncellendi',
      kullanici: result.rows[0]
    });
  } catch (error) {
    console.error('Profil Güncelleme Hatası:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası', code: 'SERVER_ERROR' });
  }
};

// Şifre Değiştirme
exports.changePassword = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Token gerekli', code: 'NO_TOKEN' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arac_takip_sistemi_gizli_anahtar_2026_jwt_secret_key_cok_guvenli');
    const kullanici_id = decoded.kullanici_id;

    const { mevcutSifre, yeniSifre } = req.body;

    if (!mevcutSifre || !yeniSifre) {
      return res.status(400).json({ success: false, message: 'Mevcut şifre ve yeni şifre gerekli', code: 'MISSING_FIELDS' });
    }

    // Kullanıcıyı bul
    const userResult = await pool.query('SELECT sifre FROM kullanicilar WHERE kullanici_id = $1', [kullanici_id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı', code: 'USER_NOT_FOUND' });
    }

    const user = userResult.rows[0];

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(mevcutSifre, user.sifre);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mevcut şifre hatalı', code: 'INVALID_PASSWORD' });
    }

    // Yeni şifreyi hashle
    const hashedSifre = await bcrypt.hash(yeniSifre, 10);

    // Güncelle
    await pool.query(
      'UPDATE kullanicilar SET sifre = $1, guncelleme_tarihi = CURRENT_TIMESTAMP WHERE kullanici_id = $2',
      [hashedSifre, kullanici_id]
    );

    return res.status(200).json({
      success: true,
      message: 'Şifre başarıyla değiştirildi'
    });
  } catch (error) {
    console.error('Şifre Değiştirme Hatası:', error);
    return res.status(500).json({ success: false, message: 'Sunucu hatası', code: 'SERVER_ERROR' });
  }
};

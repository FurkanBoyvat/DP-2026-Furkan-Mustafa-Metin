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
    const result = await pool.query(
      'SELECT kullanici_id, email, ad, soyad, telefon, rol, durum, olusturulma_tarihi, son_giris_tarih FROM kullanicilar WHERE kullanici_id = $1',
      [req.kullanici.kullanici_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı',
        code: 'USER_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      kullanici: result.rows[0]
    });
  } catch (error) {
    console.error('Profil Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      code: 'SERVER_ERROR'
    });
  }
};

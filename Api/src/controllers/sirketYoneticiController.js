const pool = require('../config/database');

// Tüm şirket yöneticilerini listele
const getAllSirketYoneticileri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sy.*, k.ad as yonetici_ad, k.soyad as yonetici_soyad, 
              k.email as yonetici_email, k.telefon as yonetici_telefon,
              s.sirket_adi
       FROM sirket_yoneticileri sy
       LEFT JOIN kullanicilar k ON sy.yonetici_id = k.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       ORDER BY sy.atama_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket yöneticileri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket yöneticilerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticileri getirilemedi',
      error: error.message
    });
  }
};

// Tek şirket yöneticisi getir
const getSirketYoneticisiById = async (req, res) => {
  try {
    const { yonetici_atama_id } = req.params;
    
    const result = await pool.query(
      `SELECT sy.*, k.ad as yonetici_ad, k.soyad as yonetici_soyad, 
              k.email as yonetici_email, k.telefon as yonetici_telefon,
              s.sirket_adi
       FROM sirket_yoneticileri sy
       LEFT JOIN kullanicilar k ON sy.yonetici_id = k.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       WHERE sy.yonetici_atama_id = $1`,
      [yonetici_atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket yöneticisi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket yöneticisi başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket yöneticisi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticisi getirilemedi',
      error: error.message
    });
  }
};

// Şirket yöneticisi ataması oluştur
const createSirketYoneticisi = async (req, res) => {
  try {
    const { 
      yonetici_id, 
      sirket_id, 
      yonetici_seviyesi, 
      yetki_kapsami,
      atama_tarihi 
    } = req.body;
    
    const atama_yapan_id = req.user.kullanici_id;
    
    const result = await pool.query(
      `INSERT INTO sirket_yoneticileri 
       (yonetici_id, sirket_id, yonetici_seviyesi, yetki_kapsami, atama_tarihi, atama_yapan_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [yonetici_id, sirket_id, yonetici_seviyesi, yetki_kapsami, atama_tarihi, atama_yapan_id]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket yöneticisi başarıyla atandı'
    });
  } catch (error) {
    console.error('Şirket yöneticisi atama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticisi atanamadı',
      error: error.message
    });
  }
};

// Şirket yöneticisi güncelle
const updateSirketYoneticisi = async (req, res) => {
  try {
    const { yonetici_atama_id } = req.params;
    const { yonetici_seviyesi, yetki_kapsami, atama_durumu } = req.body;
    
    const result = await pool.query(
      `UPDATE sirket_yoneticileri 
       SET yonetici_seviyesi = $1, yetki_kapsami = $2, atama_durumu = $3
       WHERE yonetici_atama_id = $4
       RETURNING *`,
      [yonetici_seviyesi, yetki_kapsami, atama_durumu, yonetici_atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket yöneticisi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket yöneticisi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şirket yöneticisi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticisi güncellenemedi',
      error: error.message
    });
  }
};

// Şirket yöneticisi atamasını sil
const deleteSirketYoneticisi = async (req, res) => {
  try {
    const { yonetici_atama_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM sirket_yoneticileri WHERE yonetici_atama_id = $1 RETURNING *',
      [yonetici_atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket yöneticisi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Şirket yöneticisi ataması başarıyla silindi'
    });
  } catch (error) {
    console.error('Şirket yöneticisi silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticisi silinemedi',
      error: error.message
    });
  }
};

// Şirkete göre yöneticileri getir
const getSirketYoneticileriBySirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT sy.*, k.ad as yonetici_ad, k.soyad as yonetici_soyad, 
              k.email as yonetici_email, k.telefon as yonetici_telefon
       FROM sirket_yoneticileri sy
       LEFT JOIN kullanicilar k ON sy.yonetici_id = k.kullanici_id
       WHERE sy.sirket_id = $1
       ORDER BY sy.atama_tarihi DESC`,
      [sirket_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket yöneticileri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket yöneticilerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket yöneticileri getirilemedi',
      error: error.message
    });
  }
};

// Kullanıcıya göre yönetici atamalarını getir
const getSirketYoneticileriByKullanici = async (req, res) => {
  try {
    const { yonetici_id } = req.params;
    
    const result = await pool.query(
      `SELECT sy.*, s.sirket_adi
       FROM sirket_yoneticileri sy
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       WHERE sy.yonetici_id = $1
       ORDER BY sy.atama_tarihi DESC`,
      [yonetici_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Kullanıcının yönetici atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kullanıcının yönetici atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcının yönetici atamaları getirilemedi',
      error: error.message
    });
  }
};

// Aktif şirket yöneticilerini getir
const getAktifSirketYoneticileri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sy.*, k.ad as yonetici_ad, k.soyad as yonetici_soyad, 
              k.email as yonetici_email, k.telefon as yonetici_telefon,
              s.sirket_adi
       FROM sirket_yoneticileri sy
       LEFT JOIN kullanicilar k ON sy.yonetici_id = k.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       WHERE sy.atama_durumu = 'aktif'
       ORDER BY s.sirket_adi, sy.yonetici_seviyesi`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif şirket yöneticileri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif şirket yöneticilerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif şirket yöneticileri getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllSirketYoneticileri,
  getSirketYoneticisiById,
  createSirketYoneticisi,
  updateSirketYoneticisi,
  deleteSirketYoneticisi,
  getSirketYoneticileriBySirket,
  getSirketYoneticileriByKullanici,
  getAktifSirketYoneticileri
};

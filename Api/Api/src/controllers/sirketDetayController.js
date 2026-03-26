const pool = require('../config/database');

// Tüm şirket detaylarını listele
const getAllSirketDetaylari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sd.*, s.sirket_adi
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       ORDER BY sd.olusturulma_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket detaylarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayları getirilemedi',
      error: error.message
    });
  }
};

// Tek şirket detayı getir
const getSirketDetayiById = async (req, res) => {
  try {
    const { detay_id } = req.params;
    
    const result = await pool.query(
      `SELECT sd.*, s.sirket_adi
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       WHERE sd.sirket_detay_id = $1`,
      [detay_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket detayı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket detayı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket detayı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayı getirilemedi',
      error: error.message
    });
  }
};

// Şirket detayı oluştur
const createSirketDetayi = async (req, res) => {
  try {
    const { 
      sirket_id, 
      musteri_hizmetler_telefon, 
      merkez_adres, 
      merkez_il,
      merkez_ilce,
      merkez_posta_kodu,
      kulucu_ad,
      kulucu_soyad,
      kulucu_unvan,
      muhasebe_email,
      muhasebe_telefon,
      logo_url
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO sirket_detaylari 
       (sirket_id, musteri_hizmetler_telefon, merkez_adres, merkez_il, merkez_ilce, merkez_posta_kodu, kulucu_ad, kulucu_soyad, kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [sirket_id, musteri_hizmetler_telefon, merkez_adres, merkez_il, merkez_ilce, merkez_posta_kodu, kulucu_ad, kulucu_soyad, kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket detayı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Şirket detayı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayı oluşturulamadı',
      error: error.message
    });
  }
};

// Şirket detayı güncelle
const updateSirketDetayi = async (req, res) => {
  try {
    const { detay_id } = req.params;
    const { 
      musteri_hizmetler_telefon, 
      merkez_adres, 
      merkez_il,
      merkez_ilce,
      merkez_posta_kodu,
      kulucu_ad,
      kulucu_soyad,
      kulucu_unvan,
      muhasebe_email,
      muhasebe_telefon,
      logo_url
    } = req.body;
    
    const result = await pool.query(
      `UPDATE sirket_detaylari 
       SET musteri_hizmetler_telefon = $1, merkez_adres = $2, merkez_il = $3, merkez_ilce = $4, merkez_posta_kodu = $5, kulucu_ad = $6, kulucu_soyad = $7, kulucu_unvan = $8, muhasebe_email = $9, muhasebe_telefon = $10, logo_url = $11, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE sirket_detay_id = $12
       RETURNING *`,
      [musteri_hizmetler_telefon, merkez_adres, merkez_il, merkez_ilce, merkez_posta_kodu, kulucu_ad, kulucu_soyad, kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url, detay_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket detayı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket detayı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şirket detayı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayı güncellenemedi',
      error: error.message
    });
  }
};

// Şirket detayı sil
const deleteSirketDetayi = async (req, res) => {
  try {
    const { detay_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM sirket_detaylari WHERE sirket_detay_id = $1 RETURNING *',
      [detay_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket detayı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Şirket detayı başarıyla silindi'
    });
  } catch (error) {
    console.error('Şirket detayı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayı silinemedi',
      error: error.message
    });
  }
};

// Şirkete göre detayları getir
const getSirketDetaylariBySirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT sd.*
       FROM sirket_detaylari sd
       WHERE sd.sirket_id = $1
       ORDER BY sd.olusturulma_tarihi DESC`,
      [sirket_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket detaylarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayları getirilemedi',
      error: error.message
    });
  }
};

// Şirkete göre tek detay getir (ilkini)
const getSirketDetayiBySirketSingle = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT sd.*
       FROM sirket_detaylari sd
       WHERE sd.sirket_id = $1
       ORDER BY sd.olusturulma_tarihi DESC
       LIMIT 1`,
      [sirket_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket detayı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şirket detayı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket detayı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket detayı getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllSirketDetaylari,
  getSirketDetayiById,
  createSirketDetayi,
  updateSirketDetayi,
  deleteSirketDetayi,
  getSirketDetaylariBySirket,
  getSirketDetayiBySirketSingle
};

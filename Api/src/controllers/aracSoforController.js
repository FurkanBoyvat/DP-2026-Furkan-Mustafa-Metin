const pool = require('../config/database');

// Tüm araç şoförlerini listele
const getAllAracSoforleri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model, a.sirket_id,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.email as sofor_email,
              s.sirket_adi
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       LEFT JOIN sirketler s ON a.sirket_id = s.sirket_id
       ORDER BY aso.atama_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Araç şoförleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Araç şoförlerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoförleri getirilemedi',
      error: error.message
    });
  }
};

// Tek araç şoförü getir
const getAracSoforuById = async (req, res) => {
  try {
    const { atama_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.email as sofor_email,
              s.sirket_adi
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       LEFT JOIN sirketler s ON aso.sirket_id = s.sirket_id
       WHERE aso.sofor_id = $1`,
      [atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Araç şoför ataması başarıyla getirildi'
    });
  } catch (error) {
    console.error('Araç şoför ataması getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoför ataması getirilemedi',
      error: error.message
    });
  }
};

// Araç şoför ataması oluştur
const createAracSoforu = async (req, res) => {
  try {
    const { 
      arac_id, 
      kullanici_id,
      sofor_adi,
      sofor_soyadi,
      ehliyet_numarasi,
      ehliyet_son_validasyon_tarihi,
      telefon
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO arac_soforleri 
       (arac_id, kullanici_id, sofor_adi, sofor_soyadi, ehliyet_numarasi, ehliyet_son_validasyon_tarihi, telefon)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [arac_id, kullanici_id, sofor_adi, sofor_soyadi, ehliyet_numarasi, ehliyet_son_validasyon_tarihi, telefon]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Araç şoför ataması başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Araç şoför ataması oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoför ataması oluşturulamadı',
      error: error.message
    });
  }
};

// Araç şoför ataması güncelle
const updateAracSoforu = async (req, res) => {
  try {
    const { atama_id } = req.params;
    const { sofor_adi, sofor_soyadi, ehliyet_numarasi, ehliyet_son_validasyon_tarihi, telefon, durum } = req.body;
    
    const result = await pool.query(
      `UPDATE arac_soforleri 
       SET sofor_adi = $1, sofor_soyadi = $2, ehliyet_numarasi = $3, ehliyet_son_validasyon_tarihi = $4, telefon = $5, durum = $6
       WHERE sofor_id = $7
       RETURNING *`,
      [sofor_adi, sofor_soyadi, ehliyet_numarasi, ehliyet_son_validasyon_tarihi, telefon, durum, atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Araç şoför ataması başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Araç şoför ataması güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoför ataması güncellenemedi',
      error: error.message
    });
  }
};

// Araç şoför ataması sil
const deleteAracSoforu = async (req, res) => {
  try {
    const { atama_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM arac_soforleri WHERE sofor_id = $1 RETURNING *',
      [atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Araç şoför ataması başarıyla silindi'
    });
  } catch (error) {
    console.error('Araç şoför ataması silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoför ataması silinemedi',
      error: error.message
    });
  }
};

// Araca göre şoför atamalarını getir
const getAracSoforleriByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, k.ad as sofor_ad, k.soyad as sofor_soyad, k.email as sofor_email
       FROM arac_soforleri aso
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       WHERE aso.arac_id = $1
       ORDER BY aso.atama_tarihi DESC`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Araç şoför atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Araç şoför atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç şoför atamaları getirilemedi',
      error: error.message
    });
  }
};

// Şoföre göre araç atamalarını getir
const getAracSoforleriBySofor = async (req, res) => {
  try {
    const { sofor_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       WHERE aso.kullanici_id = $1
       ORDER BY aso.atama_tarihi DESC`,
      [sofor_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoför araç atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoför araç atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför araç atamaları getirilemedi',
      error: error.message
    });
  }
};

// Aktif şoför atamalarını getir
const getAktifAracSoforleri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.email as sofor_email,
              s.sirket_adi
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       LEFT JOIN sirketler s ON a.sirket_id = s.sirket_id
       WHERE aso.durum = true
       ORDER BY aso.atama_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif araç şoför atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif araç şoför atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif araç şoför atamaları getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllAracSoforleri,
  getAracSoforuById,
  createAracSoforu,
  updateAracSoforu,
  deleteAracSoforu,
  getAracSoforleriByArac,
  getAracSoforleriBySofor,
  getAktifAracSoforleri
};

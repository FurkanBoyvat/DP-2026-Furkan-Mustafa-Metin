const pool = require('../config/database');

// Tüm araç şoförlerini listele
const getAllAracSoforleri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.email as sofor_email,
              s.sirket_adi
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.sofor_id = k.kullanici_id
       LEFT JOIN sirketler s ON aso.sirket_id = s.sirket_id
       ORDER BY aso.baslama_tarihi DESC`
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
       LEFT JOIN kullanicilar k ON aso.sofor_id = k.kullanici_id
       LEFT JOIN sirketler s ON aso.sirket_id = s.sirket_id
       WHERE aso.atama_id = $1`,
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
      sofor_id, 
      baslama_tarihi, 
      bitis_tarihi, 
      atama_tipi,
      aciklama,
      sirket_id 
    } = req.body;
    
    const atama_yapan_id = req.user.kullanici_id;
    
    const result = await pool.query(
      `INSERT INTO arac_soforleri 
       (arac_id, sofor_id, baslama_tarihi, bitis_tarihi, atama_tipi, aciklama, sirket_id, atama_yapan_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [arac_id, sofor_id, baslama_tarihi, bitis_tarihi, atama_tipi, aciklama, sirket_id, atama_yapan_id]
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
    const { baslama_tarihi, bitis_tarihi, atama_tipi, aciklama, atama_durumu } = req.body;
    
    const result = await pool.query(
      `UPDATE arac_soforleri 
       SET baslama_tarihi = $1, bitis_tarihi = $2, atama_tipi = $3, aciklama = $4, atama_durumu = $5
       WHERE atama_id = $6
       RETURNING *`,
      [baslama_tarihi, bitis_tarihi, atama_tipi, aciklama, atama_durumu, atama_id]
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
      'DELETE FROM arac_soforleri WHERE atama_id = $1 RETURNING *',
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
       LEFT JOIN kullanicilar k ON aso.sofor_id = k.kullanici_id
       WHERE aso.arac_id = $1
       ORDER BY aso.baslama_tarihi DESC`,
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
       WHERE aso.sofor_id = $1
       ORDER BY aso.baslama_tarihi DESC`,
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
       LEFT JOIN kullanicilar k ON aso.sofor_id = k.kullanici_id
       LEFT JOIN sirketler s ON aso.sirket_id = s.sirket_id
       WHERE aso.atama_durumu = 'aktif'
       ORDER BY aso.baslama_tarihi DESC`
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

const pool = require('../config/database');

// Tüm raporları listele
const getAllRaporlar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, k.ad as olusturan_ad, k.soyad as olusturan_soyad,
              s.sirket_adi
       FROM raporlar r
       LEFT JOIN kullanicilar k ON r.kullanici_id = k.kullanici_id
       LEFT JOIN sirketler s ON r.sirket_id = s.sirket_id
       ORDER BY r.rapor_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Raporlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Raporları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Raporlar getirilemedi',
      error: error.message
    });
  }
};

// Tek rapor getir
const getRaporById = async (req, res) => {
  try {
    const { rapor_id } = req.params;
    
    const result = await pool.query(
      `SELECT r.*, k.ad as olusturan_ad, k.soyad as olusturan_soyad,
              s.sirket_adi
       FROM raporlar r
       LEFT JOIN kullanicilar k ON r.olusturan_id = k.kullanici_id
       LEFT JOIN sirketler s ON r.sirket_id = s.sirket_id
       WHERE r.rapor_id = $1`,
      [rapor_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Rapor başarıyla getirildi'
    });
  } catch (error) {
    console.error('Rapor getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor getirilemedi',
      error: error.message
    });
  }
};

// Rapor oluştur
const createRapor = async (req, res) => {
  try {
    const { 
      rapor_tipi, 
      rapor_adi,
      aciklama,
      baslangic_tarihi, 
      bitis_tarihi,
      bulundu_url,
      sirket_id
    } = req.body;
    
    const kullanici_id = req.user.kullanici_id;
    
    const result = await pool.query(
      `INSERT INTO raporlar 
       (rapor_tipi, rapor_adi, aciklama, baslangic_tarihi, bitis_tarihi, bulundu_url, sirket_id, kullanici_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [rapor_tipi, rapor_adi, aciklama, baslangic_tarihi, bitis_tarihi, bulundu_url, sirket_id, kullanici_id]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Rapor başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Rapor oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor oluşturulamadı',
      error: error.message
    });
  }
};

// Rapor güncelle
const updateRapor = async (req, res) => {
  try {
    const { rapor_id } = req.params;
    const { rapor_tipi, rapor_adi, aciklama, baslangic_tarihi, bitis_tarihi, bulundu_url } = req.body;
    
    const result = await pool.query(
      `UPDATE raporlar 
       SET rapor_tipi = $1, rapor_adi = $2, aciklama = $3, baslangic_tarihi = $4, bitis_tarihi = $5, bulundu_url = $6
       WHERE rapor_id = $7
       RETURNING *`,
      [rapor_tipi, rapor_adi, aciklama, baslangic_tarihi, bitis_tarihi, bulundu_url, rapor_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Rapor başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Rapor güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor güncellenemedi',
      error: error.message
    });
  }
};

// Rapor sil
const deleteRapor = async (req, res) => {
  try {
    const { rapor_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM raporlar WHERE rapor_id = $1 RETURNING *',
      [rapor_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rapor bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Rapor başarıyla silindi'
    });
  } catch (error) {
    console.error('Rapor silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rapor silinemedi',
      error: error.message
    });
  }
};

// Şirkete göre raporları getir
const getRaporlarBySirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT r.*, k.ad as olusturan_ad, k.soyad as olusturan_soyad
       FROM raporlar r
       LEFT JOIN kullanicilar k ON r.kullanici_id = k.kullanici_id
       WHERE r.sirket_id = $1
       ORDER BY r.rapor_tarihi DESC`,
      [sirket_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket raporları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket raporlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket raporları getirilemedi',
      error: error.message
    });
  }
};

// Tarih aralığına göre raporları getir
const getRaporlarByTarihAraligi = async (req, res) => {
  try {
    const { baslangic_tarihi, bitis_tarihi } = req.query;
    
    const result = await pool.query(
      `SELECT r.*, k.ad as olusturan_ad, k.soyad as olusturan_soyad,
              s.sirket_adi
       FROM raporlar r
       LEFT JOIN kullanicilar k ON r.kullanici_id = k.kullanici_id
       LEFT JOIN sirketler s ON r.sirket_id = s.sirket_id
       WHERE r.rapor_tarihi BETWEEN $1 AND $2
       ORDER BY r.rapor_tarihi DESC`,
      [baslangic_tarihi, bitis_tarihi]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Tarih aralığındaki raporlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Tarih aralığı raporlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tarih aralığı raporları getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllRaporlar,
  getRaporById,
  createRapor,
  updateRapor,
  deleteRapor,
  getRaporlarBySirket,
  getRaporlarByTarihAraligi
};

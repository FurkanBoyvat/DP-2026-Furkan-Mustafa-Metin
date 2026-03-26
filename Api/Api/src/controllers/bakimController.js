const pool = require('../config/database');

// Tüm bakım taleplerini listele
const getAllBakimTalepleri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bt.*, a.plaka, a.marka, a.model
       FROM bakim_talepleri bt
       LEFT JOIN araclar a ON bt.arac_id = a.arac_id
       ORDER BY bt.talek_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Bakım talepleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Bakım taleplerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talepleri getirilemedi',
      error: error.message
    });
  }
};

// Tek bakım talebi getir
const getBakimTalebiById = async (req, res) => {
  try {
    const { talek_id } = req.params;
    
    const result = await pool.query(
      `SELECT bt.*, a.plaka, a.marka, a.model
       FROM bakim_talepleri bt
       LEFT JOIN araclar a ON bt.arac_id = a.arac_id
       WHERE bt.talek_id = $1`,
      [talek_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bakım talebi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bakım talebi başarıyla getirildi'
    });
  } catch (error) {
    console.error('Bakım talebi getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talebi getirilemedi',
      error: error.message
    });
  }
};

// Bakım talebi oluştur
const createBakimTalebi = async (req, res) => {
  try {
    const { arac_id, bakim_tipi, aciklama, oncelik } = req.body;
    
    const result = await pool.query(
      `INSERT INTO bakim_talepleri (arac_id, bakim_tipi, aciklama, oncelik, durum)
       VALUES ($1, $2, $3, $4, 'beklemede')
       RETURNING *`,
      [arac_id, bakim_tipi, aciklama, oncelik]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Bakım talebi başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Bakım talebi oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talebi oluşturulamadı',
      error: error.message
    });
  }
};

// Bakım talebi güncelle
const updateBakimTalebi = async (req, res) => {
  try {
    const { talek_id } = req.params;
    const { bakim_tipi, aciklama, oncelik, tamir_aciklamasi, tamir_tarihi } = req.body;
    
    const result = await pool.query(
      `UPDATE bakim_talepleri 
       SET bakim_tipi = $1, aciklama = $2, oncelik = $3, 
           tamir_aciklamasi = $4, tamir_tarihi = $5, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE talek_id = $6
       RETURNING *`,
      [bakim_tipi, aciklama, oncelik, tamir_aciklamasi, tamir_tarihi, talek_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bakım talebi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bakım talebi başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Bakım talebi güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talebi güncellenemedi',
      error: error.message
    });
  }
};

// Bakım talebi sil
const deleteBakimTalebi = async (req, res) => {
  try {
    const { talek_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bakim_talepleri WHERE talek_id = $1 RETURNING *',
      [talek_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bakım talebi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bakım talebi başarıyla silindi'
    });
  } catch (error) {
    console.error('Bakım talebi silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talebi silinemedi',
      error: error.message
    });
  }
};

// Araca göre bakım taleplerini getir
const getBakimTalepleriByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT bt.*
       FROM bakim_talepleri bt
       WHERE bt.arac_id = $1
       ORDER BY bt.talek_tarihi DESC`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aracın bakım talepleri başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aracın bakım taleplerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aracın bakım talepleri getirilemedi',
      error: error.message
    });
  }
};

// Duruma göre bakım taleplerini getir
const getBakimTalepleriByDurum = async (req, res) => {
  try {
    const { durum } = req.params;
    
    const result = await pool.query(
      `SELECT bt.*, a.plaka, a.marka, a.model
       FROM bakim_talepleri bt
       LEFT JOIN araclar a ON bt.arac_id = a.arac_id
       WHERE bt.durum = $1
       ORDER BY bt.talek_tarihi DESC`,
      [durum]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: `Durumu '${durum}' olan bakım talepleri başarıyla getirildi`
    });
  } catch (error) {
    console.error('Duruma göre bakım taleplerini getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım talepleri getirilemedi',
      error: error.message
    });
  }
};

// Bakım talebi durumunu güncelle
const updateBakimDurumu = async (req, res) => {
  try {
    const { talek_id } = req.params;
    const { durum } = req.body;
    
    const result = await pool.query(
      'UPDATE bakim_talepleri SET durum = $1, guncelleme_tarihi = CURRENT_TIMESTAMP WHERE talek_id = $2 RETURNING *',
      [durum, talek_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bakım talebi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bakım talebi durumu başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Bakım durumu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım durumu güncellenemedi',
      error: error.message
    });
  }
};

// Bakım maliyeti ekle
const addBakimMaliyeti = async (req, res) => {
  try {
    const { talek_id } = req.params;
    const { parca_maliyeti, iscilik_maliyeti, toplam_maliyet, tamir_aciklamasi, tamir_tarihi } = req.body;
    
    const result = await pool.query(
      `UPDATE bakim_talepleri 
       SET parca_maliyeti = $1, iscilik_maliyeti = $2, toplam_maliyet = $3, tamir_aciklamasi = $4, tamir_tarihi = $5, durum = 'tamamlandi', guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE talek_id = $6
       RETURNING *`,
      [parca_maliyeti, iscilik_maliyeti, toplam_maliyet, tamir_aciklamasi, tamir_tarihi, talek_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bakım talebi bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bakım maliyeti başarıyla eklendi'
    });
  } catch (error) {
    console.error('Bakım maliyeti ekleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bakım maliyeti eklenemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllBakimTalepleri,
  getBakimTalebiById,
  createBakimTalebi,
  updateBakimTalebi,
  deleteBakimTalebi,
  getBakimTalepleriByArac,
  getBakimTalepleriByDurum,
  updateBakimDurumu,
  addBakimMaliyeti
};

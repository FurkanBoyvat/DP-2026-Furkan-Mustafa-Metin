const pool = require('../config/database');

// Tüm kısıtlı alanları listele
const getAllKisitliAlanlar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       ORDER BY ka.olusturulma_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Kısıtlı alanlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kısıtlı alanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alanlar getirilemedi',
      error: error.message
    });
  }
};

// Tek kısıtlı alan getir
const getKisitliAlanById = async (req, res) => {
  try {
    const { alan_id } = req.params;
    
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       WHERE ka.alan_id = $1`,
      [alan_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kısıtlı alan getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan getirilemedi',
      error: error.message
    });
  }
};

// Kısıtlı alan oluştur
const createKisitliAlan = async (req, res) => {
  try {
    const { 
      alan_adi, 
      aciklama, 
      merkez_enlem, 
      merkez_boylam, 
      yaricap_metre,
      max_hiz_kmh,
      alan_tipi,
      sirket_id 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO kisitli_alanlar 
       (alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, sirket_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, sirket_id]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Kısıtlı alan oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan oluşturulamadı',
      error: error.message
    });
  }
};

// Kısıtlı alan güncelle
const updateKisitliAlan = async (req, res) => {
  try {
    const { alan_id } = req.params;
    const { alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, durum } = req.body;
    
    const result = await pool.query(
      `UPDATE kisitli_alanlar 
       SET alan_adi = $1, aciklama = $2, merkez_enlem = $3, merkez_boylam = $4, 
           yaricap_metre = $5, max_hiz_kmh = $6, alan_tipi = $7, durum = $8, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE alan_id = $9
       RETURNING *`,
      [alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, durum, alan_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Kısıtlı alan güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan güncellenemedi',
      error: error.message
    });
  }
};

// Kısıtlı alan sil
const deleteKisitliAlan = async (req, res) => {
  try {
    const { alan_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM kisitli_alanlar WHERE alan_id = $1 RETURNING *',
      [alan_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Kısıtlı alan başarıyla silindi'
    });
  } catch (error) {
    console.error('Kısıtlı alan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan silinemedi',
      error: error.message
    });
  }
};

// Şirkete göre kısıtlı alanları getir
const getKisitliAlanlarBySirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT ka.*
       FROM kisitli_alanlar ka
       WHERE ka.sirket_id = $1
       ORDER BY ka.olusturulma_tarihi DESC`,
      [sirket_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket kısıtlı alanları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket kısıtlı alanlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket kısıtlı alanları getirilemedi',
      error: error.message
    });
  }
};

// Aktif kısıtlı alanları getir
const getAktifKisitliAlanlar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       WHERE ka.durum = true
       ORDER BY ka.alan_adi`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif kısıtlı alanlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif kısıtlı alanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif kısıtlı alanlar getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllKisitliAlanlar,
  getKisitliAlanById,
  createKisitliAlan,
  updateKisitliAlan,
  deleteKisitliAlan,
  getKisitliAlanlarBySirket,
  getAktifKisitliAlanlar
};

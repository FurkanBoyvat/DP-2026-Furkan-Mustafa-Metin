const pool = require('../config/database');

// Tüm araç-şoför atamalarını listele
const getAllSoforAtamalari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.telefon as sofor_telefon
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       ORDER BY aso.baslama_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoför atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoför atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför atamaları getirilemedi',
      error: error.message
    });
  }
};

// Tek şoför ataması getir
const getSoforAtamasiById = async (req, res) => {
  try {
    const { atama_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.telefon as sofor_telefon
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       WHERE aso.atama_id = $1`,
      [atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför ataması başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoför ataması getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför ataması getirilemedi',
      error: error.message
    });
  }
};

// Araç-şoför ataması oluştur
const createSoforAtamasi = async (req, res) => {
  try {
    const { arac_id, kullanici_id, baslama_tarihi, bitis_tarihi, notlar } = req.body;
    
    // Aynı araç için aktif atama var mı kontrol et
    const existingAssignment = await pool.query(
      `SELECT * FROM arac_soforleri 
       WHERE arac_id = $1 AND (bitis_tarihi IS NULL OR bitis_tarihi > CURRENT_TIMESTAMP)`,
      [arac_id]
    );
    
    if (existingAssignment.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu araç için zaten aktif bir şoför ataması mevcut'
      });
    }
    
    const result = await pool.query(
      `INSERT INTO arac_soforleri (arac_id, kullanici_id, baslama_tarihi, bitis_tarihi, notlar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [arac_id, kullanici_id, baslama_tarihi, bitis_tarihi, notlar]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför ataması başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Şoför ataması oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför ataması oluşturulamadı',
      error: error.message
    });
  }
};

// Şoför atamasını güncelle
const updateSoforAtamasi = async (req, res) => {
  try {
    const { atama_id } = req.params;
    const { baslama_tarihi, bitis_tarihi, notlar } = req.body;
    
    const result = await pool.query(
      `UPDATE arac_soforleri 
       SET baslama_tarihi = $1, bitis_tarihi = $2, notlar = $3, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE atama_id = $4
       RETURNING *`,
      [baslama_tarihi, bitis_tarihi, notlar, atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför ataması başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şoför ataması güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför ataması güncellenemedi',
      error: error.message
    });
  }
};

// Şoför atamasını sil
const deleteSoforAtamasi = async (req, res) => {
  try {
    const { atama_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM arac_soforleri WHERE atama_id = $1 RETURNING *',
      [atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Şoför ataması başarıyla silindi'
    });
  } catch (error) {
    console.error('Şoför ataması silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför ataması silinemedi',
      error: error.message
    });
  }
};

// Araca göre şoför atamalarını getir
const getSoforAtamalariByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, k.ad as sofor_ad, k.soyad as sofor_soyad, k.telefon as sofor_telefon
       FROM arac_soforleri aso
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       WHERE aso.arac_id = $1
       ORDER BY aso.baslama_tarihi DESC`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aracın şoför atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aracın şoför atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aracın şoför atamaları getirilemedi',
      error: error.message
    });
  }
};

// Şoföre göre atamaları getir
const getSoforAtamalariBySofor = async (req, res) => {
  try {
    const { kullanici_id } = req.params;
    
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       WHERE aso.kullanici_id = $1
       ORDER BY aso.baslama_tarihi DESC`,
      [kullanici_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoförün atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoförün atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoförün atamaları getirilemedi',
      error: error.message
    });
  }
};

// Aktif şoför atamalarını getir
const getAktifSoforAtamalari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT aso.*, a.plaka, a.marka, a.model,
              k.ad as sofor_ad, k.soyad as sofor_soyad, k.telefon as sofor_telefon
       FROM arac_soforleri aso
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON aso.kullanici_id = k.kullanici_id
       WHERE aso.bitis_tarihi IS NULL OR aso.bitis_tarihi > CURRENT_TIMESTAMP
       ORDER BY aso.baslama_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif şoför atamaları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif şoför atamalarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif şoför atamaları getirilemedi',
      error: error.message
    });
  }
};

// Şoför atamasını pasif yap
const deactivateSoforAtamasi = async (req, res) => {
  try {
    const { atama_id } = req.params;
    
    const result = await pool.query(
      `UPDATE arac_soforleri 
       SET bitis_tarihi = CURRENT_TIMESTAMP, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE atama_id = $1
       RETURNING *`,
      [atama_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şoför ataması bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför ataması başarıyla pasif hale getirildi'
    });
  } catch (error) {
    console.error('Şoför atamasını pasif yapma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför ataması pasif hale getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllSoforAtamalari,
  getSoforAtamasiById,
  createSoforAtamasi,
  updateSoforAtamasi,
  deleteSoforAtamasi,
  getSoforAtamalariByArac,
  getSoforAtamalariBySofor,
  getAktifSoforAtamalari,
  deactivateSoforAtamasi
};

const pool = require('../config/database');

// Tüm bölge ihlal kayıtlarını listele
const getAllBolgeIhlalleri = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bik.*, a.plaka, ka.alan_adi, 
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM bolge_ihlal_kayitlari bik
       LEFT JOIN araclar a ON bik.arac_id = a.arac_id
       LEFT JOIN kisitli_alanlar ka ON bik.alan_id = ka.alan_id
       LEFT JOIN kullanicilar k ON bik.kayit_eden_id = k.kullanici_id
       ORDER BY bik.ihlal_zamani DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Bölge ihlal kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Bölge ihlal kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bölge ihlal kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Tek bölge ihlal kaydı getir
const getBolgeIhlaliById = async (req, res) => {
  try {
    const { ihlal_id } = req.params;
    
    const result = await pool.query(
      `SELECT bik.*, a.plaka, ka.alan_adi, 
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM bolge_ihlal_kayitlari bik
       LEFT JOIN araclar a ON bik.arac_id = a.arac_id
       LEFT JOIN kisitli_alanlar ka ON bik.alan_id = ka.alan_id
       LEFT JOIN kullanicilar k ON bik.kayit_eden_id = k.kullanici_id
       WHERE bik.ihlal_id = $1`,
      [ihlal_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bölge ihlal kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bölge ihlal kaydı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Bölge ihlal kaydı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bölge ihlal kaydı getirilemedi',
      error: error.message
    });
  }
};

// Bölge ihlal kaydı oluştur
const createBolgeIhlali = async (req, res) => {
  try {
    const { 
      arac_id, 
      alan_id, 
      ihlal_zamani, 
      enlem, 
      boylam, 
      ihlal_tipi,
      aciklama 
    } = req.body;
    
    const kayit_eden_id = req.user.kullanici_id;
    
    const result = await pool.query(
      `INSERT INTO bolge_ihlal_kayitlari 
       (arac_id, alan_id, ihlal_zamani, enlem, boylam, ihlal_tipi, aciklama, kayit_eden_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [arac_id, alan_id, ihlal_zamani, enlem, boylam, ihlal_tipi, aciklama, kayit_eden_id]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Bölge ihlal kaydı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Bölge ihlal kaydı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bölge ihlal kaydı oluşturulamadı',
      error: error.message
    });
  }
};

// Bölge ihlal kaydı güncelle
const updateBolgeIhlali = async (req, res) => {
  try {
    const { ihlal_id } = req.params;
    const { ihlal_tipi, aciklama, cozum_durumu } = req.body;
    
    const result = await pool.query(
      `UPDATE bolge_ihlal_kayitlari 
       SET ihlal_tipi = $1, aciklama = $2, cozum_durumu = $3
       WHERE ihlal_id = $4
       RETURNING *`,
      [ihlal_tipi, aciklama, cozum_durumu, ihlal_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bölge ihlal kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Bölge ihlal kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Bölge ihlal kaydı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bölge ihlal kaydı güncellenemedi',
      error: error.message
    });
  }
};

// Bölge ihlal kaydı sil
const deleteBolgeIhlali = async (req, res) => {
  try {
    const { ihlal_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM bolge_ihlal_kayitlari WHERE ihlal_id = $1 RETURNING *',
      [ihlal_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bölge ihlal kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Bölge ihlal kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Bölge ihlal kaydı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bölge ihlal kaydı silinemedi',
      error: error.message
    });
  }
};

// Araca göre bölge ihlal kayıtlarını getir
const getBolgeIhlalleriByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT bik.*, ka.alan_adi, k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM bolge_ihlal_kayitlari bik
       LEFT JOIN kisitli_alanlar ka ON bik.alan_id = ka.alan_id
       LEFT JOIN kullanicilar k ON bik.kayit_eden_id = k.kullanici_id
       WHERE bik.arac_id = $1
       ORDER BY bik.ihlal_zamani DESC`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Araç bölge ihlal kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Araç bölge ihlal kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç bölge ihlal kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Tarih aralığına göre bölge ihlal kayıtlarını getir
const getBolgeIhlalleriByTarihAraligi = async (req, res) => {
  try {
    const { baslangic_tarihi, bitis_tarihi } = req.query;
    
    const result = await pool.query(
      `SELECT bik.*, a.plaka, ka.alan_adi, 
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM bolge_ihlal_kayitlari bik
       LEFT JOIN araclar a ON bik.arac_id = a.arac_id
       LEFT JOIN kisitli_alanlar ka ON bik.alan_id = ka.alan_id
       LEFT JOIN kullanicilar k ON bik.kayit_eden_id = k.kullanici_id
       WHERE bik.ihlal_zamani BETWEEN $1 AND $2
       ORDER BY bik.ihlal_zamani DESC`,
      [baslangic_tarihi, bitis_tarihi]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Tarih aralığındaki bölge ihlal kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Tarih aralığı bölge ihlal kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Tarih aralığı bölge ihlal kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Çözülmeyen ihlal kayıtlarını getir
const getCozulmemisIhlaller = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bik.*, a.plaka, ka.alan_adi, 
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM bolge_ihlal_kayitlari bik
       LEFT JOIN araclar a ON bik.arac_id = a.arac_id
       LEFT JOIN kisitli_alanlar ka ON bik.alan_id = ka.alan_id
       LEFT JOIN kullanicilar k ON bik.kayit_eden_id = k.kullanici_id
       WHERE bik.cozum_durumu = 'cozulmedi'
       ORDER BY bik.ihlal_zamani DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Çözülmeyen ihlal kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Çözülmeyen ihlal kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Çözülmeyen ihlal kayıtları getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllBolgeIhlalleri,
  getBolgeIhlaliById,
  createBolgeIhlali,
  updateBolgeIhlali,
  deleteBolgeIhlali,
  getBolgeIhlalleriByArac,
  getBolgeIhlalleriByTarihAraligi,
  getCozulmemisIhlaller
};

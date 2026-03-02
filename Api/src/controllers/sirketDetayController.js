const pool = require('../config/database');

// Tüm şirket detaylarını listele
const getAllSirketDetaylari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sd.*, s.sirket_adi,
              k.ad as olusturan_ad, k.soyad as olusturan_soyad
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       LEFT JOIN kullanicilar k ON sd.olusturan_id = k.kullanici_id
       ORDER BY sd.olusturma_tarihi DESC`
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
      `SELECT sd.*, s.sirket_adi,
              k.ad as olusturan_ad, k.soyad as olusturan_soyad
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       LEFT JOIN kullanicilar k ON sd.olusturan_id = k.kullanici_id
       WHERE sd.detay_id = $1`,
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
      detay_tipi, 
      detay_icerigi, 
      etiketler,
      onem_derecesi 
    } = req.body;
    
    const olusturan_id = req.user.kullanici_id;
    
    const result = await pool.query(
      `INSERT INTO sirket_detaylari 
       (sirket_id, detay_tipi, detay_icerigi, etiketler, onem_derecesi, olusturan_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sirket_id, detay_tipi, detay_icerigi, etiketler, onem_derecesi, olusturan_id]
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
    const { detay_tipi, detay_icerigi, etiketler, onem_derecesi, aktif } = req.body;
    
    const result = await pool.query(
      `UPDATE sirket_detaylari 
       SET detay_tipi = $1, detay_icerigi = $2, etiketler = $3, onem_derecesi = $4, aktif = $5
       WHERE detay_id = $6
       RETURNING *`,
      [detay_tipi, detay_icerigi, etiketler, onem_derecesi, aktif, detay_id]
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
      'DELETE FROM sirket_detaylari WHERE detay_id = $1 RETURNING *',
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
      `SELECT sd.*, k.ad as olusturan_ad, k.soyad as olusturan_soyad
       FROM sirket_detaylari sd
       LEFT JOIN kullanicilar k ON sd.olusturan_id = k.kullanici_id
       WHERE sd.sirket_id = $1
       ORDER BY sd.olusturma_tarihi DESC`,
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

// Detay tipine göre getir
const getSirketDetaylariByTip = async (req, res) => {
  try {
    const { detay_tipi } = req.params;
    
    const result = await pool.query(
      `SELECT sd.*, s.sirket_adi,
              k.ad as olusturan_ad, k.soyad as olusturan_soyad
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       LEFT JOIN kullanicilar k ON sd.olusturan_id = k.kullanici_id
       WHERE sd.detay_tipi = $1
       ORDER BY sd.olusturma_tarihi DESC`,
      [detay_tipi]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Detay tipine göre şirket detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Detay tipine göre şirket detaylarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Detay tipine göre şirket detayları getirilemedi',
      error: error.message
    });
  }
};

// Aktif şirket detaylarını getir
const getAktifSirketDetaylari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT sd.*, s.sirket_adi
       FROM sirket_detaylari sd
       LEFT JOIN sirketler s ON sd.sirket_id = s.sirket_id
       WHERE sd.aktif = true
       ORDER BY sd.onem_derecesi DESC, sd.olusturma_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif şirket detayları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif şirket detaylarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif şirket detayları getirilemedi',
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
  getSirketDetaylariByTip,
  getAktifSirketDetaylari
};

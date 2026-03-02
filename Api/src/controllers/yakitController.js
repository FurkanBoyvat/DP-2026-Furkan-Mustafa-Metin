const pool = require('../config/database');

// Tüm yakıt kayıtlarını listele
const getAllYakitKayitlari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ytk.*, a.plaka, a.marka, a.model,
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON ytk.kayit_eden_id = k.kullanici_id
       ORDER BY ytk.kayit_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Yakıt kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Yakıt kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Tek yakıt kaydı getir
const getYakitKaydiById = async (req, res) => {
  try {
    const { kayit_id } = req.params;
    
    const result = await pool.query(
      `SELECT ytk.*, a.plaka, a.marka, a.model,
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON ytk.kayit_eden_id = k.kullanici_id
       WHERE ytk.kayit_id = $1`,
      [kayit_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Yakıt kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Yakıt kaydı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Yakıt kaydı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kaydı getirilemedi',
      error: error.message
    });
  }
};

// Yakıt kaydı oluştur
const createYakitKaydi = async (req, res) => {
  try {
    const { arac_id, litre, birim_fiyat, toplam_tutar, km, kayit_eden_id, istasyon, yakit_tipi } = req.body;
    
    const result = await pool.query(
      `INSERT INTO yakit_tuketim_kayitlari 
       (arac_id, litre, birim_fiyat, toplam_tutar, km, kayit_eden_id, istasyon, yakit_tipi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [arac_id, litre, birim_fiyat, toplam_tutar, km, kayit_eden_id, istasyon, yakit_tipi]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Yakıt kaydı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Yakıt kaydı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kaydı oluşturulamadı',
      error: error.message
    });
  }
};

// Yakıt kaydı güncelle
const updateYakitKaydi = async (req, res) => {
  try {
    const { kayit_id } = req.params;
    const { litre, birim_fiyat, toplam_tutar, km, istasyon, yakit_tipi } = req.body;
    
    const result = await pool.query(
      `UPDATE yakit_tuketim_kayitlari 
       SET litre = $1, birim_fiyat = $2, toplam_tutar = $3, km = $4, 
           istasyon = $5, yakit_tipi = $6, guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE kayit_id = $7
       RETURNING *`,
      [litre, birim_fiyat, toplam_tutar, km, istasyon, yakit_tipi, kayit_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Yakıt kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Yakıt kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Yakıt kaydı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kaydı güncellenemedi',
      error: error.message
    });
  }
};

// Yakıt kaydı sil
const deleteYakitKaydi = async (req, res) => {
  try {
    const { kayit_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM yakit_tuketim_kayitlari WHERE kayit_id = $1 RETURNING *',
      [kayit_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Yakıt kaydı bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Yakıt kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Yakıt kaydı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kaydı silinemedi',
      error: error.message
    });
  }
};

// Araca göre yakıt kayıtlarını getir
const getYakitKayitlariByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT ytk.*, k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN kullanicilar k ON ytk.kayit_eden_id = k.kullanici_id
       WHERE ytk.arac_id = $1
       ORDER BY ytk.kayit_tarihi DESC`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aracın yakıt kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aracın yakıt kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aracın yakıt kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Tarih aralığına göre yakıt kayıtlarını getir
const getYakitKayitlariByTarihAraligi = async (req, res) => {
  try {
    const { baslangic_tarihi, bitis_tarihi } = req.query;
    
    const result = await pool.query(
      `SELECT ytk.*, a.plaka, a.marka, a.model,
              k.ad as kayit_eden_ad, k.soyad as kayit_eden_soyad
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
       LEFT JOIN kullanicilar k ON ytk.kayit_eden_id = k.kullanici_id
       WHERE ytk.kayit_tarihi BETWEEN $1 AND $2
       ORDER BY ytk.kayit_tarihi DESC`,
      [baslangic_tarihi, bitis_tarihi]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Tarih aralığındaki yakıt kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Tarih aralığına göre yakıt kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Yakıt kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Aracın ortalama yakıt tüketimini hesapla
const getOrtalamaYakitTuketimi = async (req, res) => {
  try {
    const { arac_id } = req.params;
    
    const result = await pool.query(
      `SELECT 
         COUNT(*) as yaklama_sayisi,
         SUM(litre) as toplam_litre,
         AVG(litre) as ortalama_litre,
         SUM(toplam_tutar) as toplam_tutar,
         AVG(toplam_tutar) as ortalama_tutar
       FROM yakit_tuketim_kayitlari 
       WHERE arac_id = $1`,
      [arac_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Aracın ortalama yakıt tüketimi başarıyla hesaplandı'
    });
  } catch (error) {
    console.error('Ortalama yakıt tüketimi hesaplama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Ortalama yakıt tüketimi hesaplanamadı',
      error: error.message
    });
  }
};

// Aylık yakıt raporu
const getAylikYakitRaporu = async (req, res) => {
  try {
    const { yil } = req.query;
    const selectedYear = yil || new Date().getFullYear();
    
    const result = await pool.query(
      `SELECT 
         EXTRACT(MONTH FROM kayit_tarihi) as ay,
         COUNT(*) as yaklama_sayisi,
         SUM(litre) as toplam_litre,
         SUM(toplam_tutar) as toplam_tutar,
         AVG(litre) as ortalama_litre
       FROM yakit_tuketim_kayitlari 
       WHERE EXTRACT(YEAR FROM kayit_tarihi) = $1
       GROUP BY EXTRACT(MONTH FROM kayit_tarihi)
       ORDER BY ay`,
      [selectedYear]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: `${selectedYear} yılına ait aylık yakıt raporu başarıyla getirildi`
    });
  } catch (error) {
    console.error('Aylık yakıt raporu getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aylık yakıt raporu getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllYakitKayitlari,
  getYakitKaydiById,
  createYakitKaydi,
  updateYakitKaydi,
  deleteYakitKaydi,
  getYakitKayitlariByArac,
  getYakitKayitlariByTarihAraligi,
  getOrtalamaYakitTuketimi,
  getAylikYakitRaporu
};

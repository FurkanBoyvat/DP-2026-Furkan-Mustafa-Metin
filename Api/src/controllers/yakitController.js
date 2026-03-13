const pool = require('../config/database');

// Tüm yakıt kayıtlarını listele
const getAllYakitKayitlari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ytk.*, a.plaka, a.marka, a.model
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
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
      `SELECT ytk.*, a.plaka, a.marka, a.model
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
       WHERE ytk.yakit_id = $1`,
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
    const { arac_id, yakit_miktari, birim_fiyat, yakit_tutari, istasyon_adi, ikmal_tarihi } = req.body;
    
    const result = await pool.query(
      `INSERT INTO yakit_tuketim_kayitlari 
       (arac_id, yakit_miktari, birim_fiyat, yakit_tutari, istasyon_adi, ikmal_tarihi)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [arac_id, yakit_miktari, birim_fiyat, yakit_tutari, istasyon_adi, ikmal_tarihi]
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
    const { yakit_miktari, birim_fiyat, yakit_tutari, istasyon_adi, ikmal_tarihi } = req.body;
    
    const result = await pool.query(
      `UPDATE yakit_tuketim_kayitlari 
       SET yakit_miktari = $1, birim_fiyat = $2, yakit_tutari = $3, istasyon_adi = $4, ikmal_tarihi = $5
       WHERE yakit_id = $6
       RETURNING *`,
      [yakit_miktari, birim_fiyat, yakit_tutari, istasyon_adi, ikmal_tarihi, kayit_id]
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
      'DELETE FROM yakit_tuketim_kayitlari WHERE yakit_id = $1 RETURNING *',
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
      `SELECT ytk.*
       FROM yakit_tuketim_kayitlari ytk
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
      `SELECT ytk.*, a.plaka, a.marka, a.model
       FROM yakit_tuketim_kayitlari ytk
       LEFT JOIN araclar a ON ytk.arac_id = a.arac_id
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
         SUM(yakit_miktari) as toplam_yakit,
         AVG(yakit_miktari) as ortalama_yakit,
         SUM(yakit_tutari) as toplam_tutar,
         AVG(yakit_tutari) as ortalama_tutar
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
         SUM(yakit_miktari) as toplam_yakit,
         SUM(yakit_tutari) as toplam_tutar,
         AVG(yakit_miktari) as ortalama_yakit
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

// Şoför aylık yakıt kaydı oluştur
const createSoforYakitKaydi = async (req, res) => {
  try {
    const { kullanici_id, ay, yil, aylik_km, aylik_yakit_tutar, notlar } = req.body;
    
    const result = await pool.query(
      `INSERT INTO sofor_yakit_kayitlari 
       (kullanici_id, ay, yil, aylik_km, aylik_yakit_tutar, notlar)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [kullanici_id, ay, yil, aylik_km, aylik_yakit_tutar, notlar]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför yakıt kaydı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Şoför yakıt kaydı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför yakıt kaydı oluşturulamadı',
      error: error.message
    });
  }
};

// Tüm şoför yakıt kayıtlarını listele
const getAllSoforYakitKayitlari = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT syk.*, k.ad, k.soyad, s.sirket_adi, f.filo_adi
       FROM sofor_yakit_kayitlari syk
       JOIN kullanicilar k ON syk.kullanici_id = k.kullanici_id
       LEFT JOIN sirket_yoneticileri sy ON k.kullanici_id = sy.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       LEFT JOIN filolar f ON k.filo_id = f.filo_id
       ORDER BY syk.yil DESC, syk.ay DESC, syk.olusturulma_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoför yakıt kayıtları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoför yakıt kayıtlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför yakıt kayıtları getirilemedi',
      error: error.message
    });
  }
};

// Şoför yakıt kaydı güncelle
const updateSoforYakitKaydi = async (req, res) => {
  try {
    const { kayit_id } = req.params;
    const { ay, yil, aylik_km, aylik_yakit_tutar, notlar } = req.body;
    
    const result = await pool.query(
      `UPDATE sofor_yakit_kayitlari 
       SET ay = $1, yil = $2, aylik_km = $3, aylik_yakit_tutar = $4, notlar = $5
       WHERE kayit_id = $6
       RETURNING *`,
      [ay, yil, aylik_km, aylik_yakit_tutar, notlar, kayit_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Şoför yakıt kaydı başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Şoför yakıt kaydı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför yakıt kaydı güncellenemedi',
      error: error.message
    });
  }
};

// Şoför yakıt kaydı sil
const deleteSoforYakitKaydi = async (req, res) => {
  try {
    const { kayit_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM sofor_yakit_kayitlari WHERE kayit_id = $1 RETURNING *',
      [kayit_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kayıt bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Şoför yakıt kaydı başarıyla silindi'
    });
  } catch (error) {
    console.error('Şoför yakıt kaydı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoför yakıt kaydı silinemedi',
      error: error.message
    });
  }
};

// Şoför başarı sıralaması (Leaderboard)
const getSoforLeaderboard = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
         syk.kullanici_id, 
         k.ad, 
         k.soyad, 
         s.sirket_adi, 
         f.filo_adi,
         SUM(syk.aylik_km) as toplam_km,
         SUM(syk.aylik_yakit_tutar) as toplam_tutar,
         CASE 
           WHEN SUM(syk.aylik_km) > 0 THEN (SUM(syk.aylik_yakit_tutar) / SUM(syk.aylik_km))
           ELSE 0 
         END as birim_maliyet
       FROM sofor_yakit_kayitlari syk
       JOIN kullanicilar k ON syk.kullanici_id = k.kullanici_id
       LEFT JOIN sirket_yoneticileri sy ON k.kullanici_id = sy.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       LEFT JOIN filolar f ON k.filo_id = f.filo_id
       GROUP BY syk.kullanici_id, k.ad, k.soyad, s.sirket_adi, f.filo_adi
       HAVING SUM(syk.aylik_km) > 0
       ORDER BY birim_maliyet ASC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoför başarı sıralaması başarıyla getirildi'
    });
  } catch (error) {
    console.error('Leaderboard getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sıralama getirilemedi',
      error: error.message
    });
  }
};

// Araç tipine göre şoför başarı sıralaması – sadece aracı atanmış şoförler (kamyon-kamyon, otobüs-otobüs vb.)
const getSoforLeaderboardByAracTipi = async (req, res) => {
  try {
    const result = await pool.query(
      `WITH driver_arac AS (
         SELECT DISTINCT ON (kullanici_id) kullanici_id, arac_id
         FROM arac_soforleri
         WHERE durum = true
         ORDER BY kullanici_id, atama_tarihi DESC NULLS LAST
       ),
       ranked AS (
         SELECT 
           a.arac_tipi,
           syk.kullanici_id,
           k.ad,
           k.soyad,
           s.sirket_adi,
           f.filo_adi,
           SUM(syk.aylik_km) AS toplam_km,
           SUM(syk.aylik_yakit_tutar) AS toplam_tutar,
           CASE 
             WHEN SUM(syk.aylik_km) > 0 THEN (SUM(syk.aylik_yakit_tutar) / SUM(syk.aylik_km))
             ELSE 0 
           END AS birim_maliyet
         FROM sofor_yakit_kayitlari syk
         JOIN kullanicilar k ON syk.kullanici_id = k.kullanici_id
         INNER JOIN driver_arac da ON k.kullanici_id = da.kullanici_id
         INNER JOIN araclar a ON da.arac_id = a.arac_id
         LEFT JOIN sirket_yoneticileri sy ON k.kullanici_id = sy.kullanici_id
         LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
         LEFT JOIN filolar f ON k.filo_id = f.filo_id
         GROUP BY syk.kullanici_id, k.ad, k.soyad, s.sirket_adi, f.filo_adi, a.arac_tipi
         HAVING SUM(syk.aylik_km) > 0
       )
       SELECT * FROM ranked ORDER BY arac_tipi, birim_maliyet ASC`
    );

    const byTip = {};
    for (const row of result.rows) {
      const tip = row.arac_tipi;
      if (!byTip[tip]) byTip[tip] = [];
      byTip[tip].push({
        kullanici_id: row.kullanici_id,
        ad: row.ad,
        soyad: row.soyad,
        sirket_adi: row.sirket_adi,
        filo_adi: row.filo_adi,
        toplam_km: row.toplam_km,
        toplam_tutar: row.toplam_tutar,
        birim_maliyet: row.birim_maliyet,
      });
    }

    res.status(200).json({
      success: true,
      data: byTip,
      message: 'Araç tipine göre başarı sıralaması getirildi'
    });
  } catch (error) {
    console.error('Araç tipine göre leaderboard hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Araç tipine göre sıralama getirilemedi',
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
  getAylikYakitRaporu,
  createSoforYakitKaydi,
  getAllSoforYakitKayitlari,
  updateSoforYakitKaydi,
  deleteSoforYakitKaydi,
  getSoforLeaderboard,
  getSoforLeaderboardByAracTipi
};

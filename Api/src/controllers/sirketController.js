const pool = require('../config/database');

// Tüm şirketleri getir
exports.getAllSirketler = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sirketler WHERE durum = true ORDER BY olusturulma_tarihi DESC'
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      sirketler: result.rows
    });
  } catch (error) {
    console.error('Şirket Listesi Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Şirket detaylarını getir
exports.getSirketById = async (req, res) => {
  try {
    const { sirket_id } = req.params;

    const sirketResult = await pool.query(
      'SELECT * FROM sirketler WHERE sirket_id = $1',
      [sirket_id]
    );

    if (sirketResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket bulunamadı',
        code: 'SIRKET_NOT_FOUND'
      });
    }

    const detailResult = await pool.query(
      'SELECT * FROM sirket_detaylari WHERE sirket_id = $1',
      [sirket_id]
    );

    return res.status(200).json({
      success: true,
      sirket: sirketResult.rows[0],
      detaylar: detailResult.rows[0] || null
    });
  } catch (error) {
    console.error('Şirket Detay Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Yeni şirket oluştur
exports.createSirket = async (req, res) => {
  try {
    const { sirket_adi, vergi_no, telefon, email, web_sitesi } = req.body;

    if (!sirket_adi || !vergi_no || !telefon || !email) {
      return res.status(400).json({
        success: false,
        message: 'Tüm gerekli alanlar giriniz',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await pool.query(
      `INSERT INTO sirketler (sirket_adi, vergi_no, telefon, email, web_sitesi)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [sirket_adi, vergi_no, telefon, email, web_sitesi]
    );

    return res.status(201).json({
      success: true,
      message: 'Şirket başarıyla oluşturuldu',
      sirket: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({
        success: false,
        message: 'Bu vergi numarası zaten kayıtlı',
        code: 'DUPLICATE_VERGI_NO'
      });
    }
    console.error('Şirket Oluştur Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Şirket bilgisini güncelle
exports.updateSirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    const { sirket_adi, telefon, email, web_sitesi, durum } = req.body;

    const result = await pool.query(
      `UPDATE sirketler 
       SET sirket_adi = COALESCE($1, sirket_adi),
           telefon = COALESCE($2, telefon),
           email = COALESCE($3, email),
           web_sitesi = COALESCE($4, web_sitesi),
           durum = COALESCE($5, durum)
       WHERE sirket_id = $6
       RETURNING *`,
      [sirket_adi, telefon, email, web_sitesi, durum, sirket_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket bulunamadı',
        code: 'SIRKET_NOT_FOUND'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Şirket başarıyla güncellendi',
      sirket: result.rows[0]
    });
  } catch (error) {
    console.error('Şirket Güncelle Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Şirket sil
exports.deleteSirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;

    const result = await pool.query(
      'DELETE FROM sirketler WHERE sirket_id = $1 RETURNING *',
      [sirket_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Şirket bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Şirket başarıyla silindi'
    });
  } catch (error) {
    console.error('Şirket Sil Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Şirket detaylarını güncelle
exports.updateSirketDetay = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    const {
      musteri_hizmetler_telefon,
      merkez_adres,
      merkez_il,
      merkez_ilce,
      merkez_posta_kodu,
      kulucu_ad,
      kulucu_soyad,
      kulucu_unvan,
      muhasebe_email,
      muhasebe_telefon,
      logo_url
    } = req.body;

    let result = await pool.query(
      'SELECT * FROM sirket_detaylari WHERE sirket_id = $1',
      [sirket_id]
    );

    if (result.rows.length === 0) {
      // Yeni detay oluştur
      result = await pool.query(
        `INSERT INTO sirket_detaylari (
          sirket_id, musteri_hizmetler_telefon, merkez_adres, 
          merkez_il, merkez_ilce, merkez_posta_kodu, kulucu_ad, 
          kulucu_soyad, kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING *`,
        [
          sirket_id, musteri_hizmetler_telefon, merkez_adres,
          merkez_il, merkez_ilce, merkez_posta_kodu, kulucu_ad,
          kulucu_soyad, kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url
        ]
      );
    } else {
      // Var olanı güncelle
      result = await pool.query(
        `UPDATE sirket_detaylari
         SET musteri_hizmetler_telefon = COALESCE($1, musteri_hizmetler_telefon),
             merkez_adres = COALESCE($2, merkez_adres),
             merkez_il = COALESCE($3, merkez_il),
             merkez_ilce = COALESCE($4, merkez_ilce),
             merkez_posta_kodu = COALESCE($5, merkez_posta_kodu),
             kulucu_ad = COALESCE($6, kulucu_ad),
             kulucu_soyad = COALESCE($7, kulucu_soyad),
             kulucu_unvan = COALESCE($8, kulucu_unvan),
             muhasebe_email = COALESCE($9, muhasebe_email),
             muhasebe_telefon = COALESCE($10, muhasebe_telefon),
             logo_url = COALESCE($11, logo_url)
         WHERE sirket_id = $12
         RETURNING *`,
        [
          musteri_hizmetler_telefon, merkez_adres, merkez_il,
          merkez_ilce, merkez_posta_kodu, kulucu_ad, kulucu_soyad,
          kulucu_unvan, muhasebe_email, muhasebe_telefon, logo_url, sirket_id
        ]
      );
    }

    return res.status(200).json({
      success: true,
      message: 'Şirket detayları başarıyla güncellendi',
      detaylar: result.rows[0]
    });
  } catch (error) {
    console.error('Şirket Detay Güncelle Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

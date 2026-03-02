const pool = require('../config/database');

// Tüm filolar
exports.getAllFilolar = async (req, res) => {
  try {
    const { sirket_id } = req.query;
    let query = 'SELECT * FROM filolar WHERE durum = true';
    const params = [];

    if (sirket_id) {
      query += ' AND sirket_id = $1';
      params.push(sirket_id);
    }

    query += ' ORDER BY olusturulma_tarihi DESC';
    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      filolar: result.rows
    });
  } catch (error) {
    console.error('Filo Listesi Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Filo oluştur
exports.createFilo = async (req, res) => {
  try {
    const { sirket_id, filo_adi, aciklama, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon } = req.body;

    if (!sirket_id || !filo_adi) {
      return res.status(400).json({
        success: false,
        message: 'Şirket ve filo adı gerekli',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await pool.query(
      `INSERT INTO filolar (sirket_id, filo_adi, aciklama, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [sirket_id, filo_adi, aciklama, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon]
    );

    return res.status(201).json({
      success: true,
      message: 'Filo başarıyla oluşturuldu',
      filo: result.rows[0]
    });
  } catch (error) {
    console.error('Filo Oluştur Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Filo güncelle
exports.updateFilo = async (req, res) => {
  try {
    const { filo_id } = req.params;
    const { filo_adi, aciklama, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon, durum } = req.body;

    const result = await pool.query(
      `UPDATE filolar
       SET filo_adi = COALESCE($1, filo_adi),
           aciklama = COALESCE($2, aciklama),
           filo_muduru_ad = COALESCE($3, filo_muduru_ad),
           filo_muduru_soyad = COALESCE($4, filo_muduru_soyad),
           filo_muduru_telefon = COALESCE($5, filo_muduru_telefon),
           durum = COALESCE($6, durum)
       WHERE filo_id = $7
       RETURNING *`,
      [filo_adi, aciklama, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon, durum, filo_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Filo bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Filo başarıyla güncellendi',
      filo: result.rows[0]
    });
  } catch (error) {
    console.error('Filo Güncelle Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Filo sil
exports.deleteFilo = async (req, res) => {
  try {
    const { filo_id } = req.params;

    const result = await pool.query(
      'DELETE FROM filolar WHERE filo_id = $1 RETURNING *',
      [filo_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Filo bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Filo başarıyla silindi'
    });
  } catch (error) {
    console.error('Filo Sil Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Filo istatistikleri
exports.getFiloIstatistikleri = async (req, res) => {
  try {
    const { filo_id } = req.params;

    const result = await pool.query(
      `SELECT 
        f.filo_id, f.filo_adi,
        COUNT(a.arac_id) AS toplam_arac,
        SUM(CASE WHEN a.durum = true THEN 1 ELSE 0 END) AS aktif_arac,
        SUM(CASE WHEN a.durum = false THEN 1 ELSE 0 END) AS pasif_arac
       FROM filolar f
       LEFT JOIN araclar a ON f.filo_id = a.filo_id
       WHERE f.filo_id = $1
       GROUP BY f.filo_id, f.filo_adi`,
      [filo_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Filo bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      istatistikler: result.rows[0]
    });
  } catch (error) {
    console.error('Filo İstatistik Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

const pool = require('../config/database');

// Tüm araçlar
exports.getAllAraclar = async (req, res) => {
  try {
    const { sirket_id, filo_id, durum } = req.query;
    let query = 'SELECT * FROM araclar WHERE 1=1';
    const params = [];
    let paramCount = 1;

    if (sirket_id) {
      query += ` AND sirket_id = $${paramCount}`;
      params.push(sirket_id);
      paramCount++;
    }

    if (filo_id) {
      query += ` AND filo_id = $${paramCount}`;
      params.push(filo_id);
      paramCount++;
    }

    if (durum !== undefined) {
      query += ` AND durum = $${paramCount}`;
      params.push(durum === 'true');
      paramCount++;
    }

    query += ' ORDER BY olusturulma_tarihi DESC';
    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      araclar: result.rows
    });
  } catch (error) {
    console.error('Araç Listesi Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç detaylarını getir
exports.getAracById = async (req, res) => {
  try {
    const { arac_id } = req.params;

    const aracResult = await pool.query(
      'SELECT * FROM araclar WHERE arac_id = $1',
      [arac_id]
    );

    if (aracResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    const soforResult = await pool.query(
      'SELECT * FROM arac_soforleri WHERE arac_id = $1',
      [arac_id]
    );

    return res.status(200).json({
      success: true,
      arac: aracResult.rows[0],
      soforler: soforResult.rows
    });
  } catch (error) {
    console.error('Araç Detay Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Yeni araç oluştur
exports.createArac = async (req, res) => {
  try {
    const {
      filo_id, sirket_id, plaka, marka, model, yil, renk, arac_tipi,
      vin_no, motor_no, sarj_no, kapasite_kg, kapasite_m3, yakit_tipi,
      ortalama_yakit_tuketimi, sigorta_numarasi, sigorta_baslangic_tarihi,
      sigorta_bitis_tarihi, teknik_muayene_tarihi, son_bakım_tarihi
    } = req.body;

    if (!filo_id || !sirket_id || !plaka || !marka || !model || !yil) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await pool.query(
      `INSERT INTO araclar (
        filo_id, sirket_id, plaka, marka, model, yil, renk, arac_tipi,
        vin_no, motor_no, sarj_no, kapasite_kg, kapasite_m3, yakit_tipi,
        ortalama_yakit_tuketimi, sigorta_numarasi, sigorta_baslangic_tarihi,
        sigorta_bitis_tarihi, teknik_muayene_tarihi, son_bakım_tarihi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
       RETURNING *`,
      [
        filo_id, sirket_id, plaka, marka, model, yil, renk, arac_tipi,
        vin_no, motor_no, sarj_no, kapasite_kg, kapasite_m3, yakit_tipi,
        ortalama_yakit_tuketimi, sigorta_numarasi, sigorta_baslangic_tarihi,
        sigorta_bitis_tarihi, teknik_muayene_tarihi, son_bakım_tarihi
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Araç başarıyla oluşturuldu',
      arac: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      const field = error.detail.includes('plaka') ? 'Plaka' : 'VIN';
      return res.status(400).json({
        success: false,
        message: `${field} zaten kayıtlı`,
        code: 'DUPLICATE_FIELD'
      });
    }
    console.error('Araç Oluştur Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç bilgisini güncelle
exports.updateArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    const updateData = req.body;

    const fields = [];
    const params = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = $${paramCount}`);
      params.push(updateData[key]);
      paramCount++;
    });

    if (fields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Güncellenecek veri yoktur'
      });
    }

    params.push(arac_id);

    const result = await pool.query(
      `UPDATE araclar SET ${fields.join(', ')} WHERE arac_id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Araç başarıyla güncellendi',
      arac: result.rows[0]
    });
  } catch (error) {
    console.error('Araç Güncelle Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç sil
exports.deleteArac = async (req, res) => {
  try {
    const { arac_id } = req.params;

    const result = await pool.query(
      'DELETE FROM araclar WHERE arac_id = $1 RETURNING *',
      [arac_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Araç başarıyla silindi'
    });
  } catch (error) {
    console.error('Araç Sil Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Plaka ile araç ara
exports.getAracByPlaka = async (req, res) => {
  try {
    const { plaka } = req.params;

    const result = await pool.query(
      'SELECT * FROM araclar WHERE plaka = $1',
      [plaka]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      arac: result.rows[0]
    });
  } catch (error) {
    console.error('Araç Ara Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç sayısı
exports.getAracSayisi = async (req, res) => {
  try {
    const { sirket_id } = req.query;

    let query = 'SELECT COUNT(*) as toplam FROM araclar WHERE durum = true';
    const params = [];

    if (sirket_id) {
      query += ' AND sirket_id = $1';
      params.push(sirket_id);
    }

    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      arac_sayisi: parseInt(result.rows[0].toplam)
    });
  } catch (error) {
    console.error('Araç Sayısı Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

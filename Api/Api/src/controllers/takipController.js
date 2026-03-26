const pool = require('../config/database');

// ============== KONUM TAKIBI ==============

// Araç konumunu güncelle (Gerçek zamanlı)
exports.updateAracKonum = async (req, res) => {
  try {
    const { arac_id, enlem, boylam, hiz, irtifa, uydu_sayisi, gps_dogruluk, motor_durum } = req.body;

    if (!arac_id || enlem === undefined || boylam === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Araç ID, enlem ve boylam gerekli',
        code: 'MISSING_FIELDS'
      });
    }

    // Güncel konum varsa sil, yeni konum ekle
    await pool.query(
      'DELETE FROM arac_konum_takibi WHERE arac_id = $1',
      [arac_id]
    );

    const result = await pool.query(
      `INSERT INTO arac_konum_takibi (arac_id, enlem, boylam, hiz, irtifa, uydu_sayisi, gps_dogruluk, motor_durum)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [arac_id, enlem, boylam, hiz || 0, irtifa, uydu_sayisi, gps_dogruluk, motor_durum]
    );

    return res.status(201).json({
      success: true,
      message: 'Konum başarıyla güncellendi',
      konum: result.rows[0]
    });
  } catch (error) {
    console.error('Konum Güncelle Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç gerçek zamanlı konumunu getir
exports.getAracKonum = async (req, res) => {
  try {
    const { arac_id } = req.params;

    const result = await pool.query(
      `SELECT kkt.*, a.plaka, a.marka, a.model
       FROM arac_konum_takibi kkt
       JOIN araclar a ON kkt.arac_id = a.arac_id
       WHERE kkt.arac_id = $1
       ORDER BY kkt.kayit_tarihi DESC
       LIMIT 1`,
      [arac_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç konumu bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      konum: result.rows[0]
    });
  } catch (error) {
    console.error('Konum Getir Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Tüm araçların konumlarını getir
exports.getAllAraclarKonum = async (req, res) => {
  try {
    const { sirket_id } = req.query;

    let query = `
      SELECT kkt.*, a.arac_id, a.plaka, a.marka, a.model, s.sirket_adi
      FROM arac_konum_takibi kkt
      JOIN araclar a ON kkt.arac_id = a.arac_id
      JOIN sirketler s ON a.sirket_id = s.sirket_id
      WHERE 1=1
    `;
    const params = [];

    if (sirket_id) {
      query += ' AND a.sirket_id = $1';
      params.push(sirket_id);
    }

    query += ' ORDER BY kkt.kayit_tarihi DESC';
    const result = await pool.query(query, params);

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      konumlar: result.rows
    });
  } catch (error) {
    console.error('Konumlar Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// ============== KM TAKIBI ==============

// KM kaydı ekle
exports.addKmKayidi = async (req, res) => {
  try {
    const { arac_id, eski_km, yeni_km, bakım_gerekli, notlar } = req.body;

    if (!arac_id || eski_km === undefined || yeni_km === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Araç ID, eski ve yeni KM gerekli',
        code: 'MISSING_FIELDS'
      });
    }

    if (yeni_km < eski_km) {
      return res.status(400).json({
        success: false,
        message: 'Yeni KM eski KM\'den küçük olamaz',
        code: 'INVALID_KM'
      });
    }

    const result = await pool.query(
      `INSERT INTO arac_km_takibi (arac_id, eski_km, yeni_km, bakım_gerekli, notlar)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [arac_id, eski_km, yeni_km, bakım_gerekli || false, notlar]
    );

    return res.status(201).json({
      success: true,
      message: 'KM kaydı başarıyla eklendi',
      km_kayidi: result.rows[0]
    });
  } catch (error) {
    console.error('KM Kaydı Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç KM geçmişini getir
exports.getAracKmGeçmisi = async (req, res) => {
  try {
    const { arac_id } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM arac_km_takibi
       WHERE arac_id = $1
       ORDER BY kayit_tarihi DESC
       LIMIT $2 OFFSET $3`,
      [arac_id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM arac_km_takibi WHERE arac_id = $1',
      [arac_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].total),
      km_kayitlari: result.rows
    });
  } catch (error) {
    console.error('KM Geçmişi Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// ============== HIZ KAYITLARI ==============

// Hız kaydı ekle
exports.addHizKayidi = async (req, res) => {
  try {
    const {
      arac_id, max_hiz, min_hiz, ortalama_hiz, hiz_ast_numarasi,
      surucü_adı, yol, baslangic_konumu, bitis_konumu,
      baslangic_tarihi, bitis_tarihi
    } = req.body;

    if (!arac_id || max_hiz === undefined || !baslangic_tarihi || !bitis_tarihi) {
      return res.status(400).json({
        success: false,
        message: 'Gerekli alanlar eksik',
        code: 'MISSING_FIELDS'
      });
    }

    const result = await pool.query(
      `INSERT INTO arac_hiz_kayitlari (
        arac_id, max_hiz, min_hiz, ortalama_hiz, hiz_ast_numarasi,
        surucü_adı, yol, baslangic_konumu, bitis_konumu,
        baslangic_tarihi, bitis_tarihi
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        arac_id, max_hiz, min_hiz || 0, ortalama_hiz, hiz_ast_numarasi,
        surucü_adı, yol, baslangic_konumu, bitis_konumu,
        baslangic_tarihi, bitis_tarihi
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Hız kaydı başarıyla eklendi',
      hiz_kayidi: result.rows[0]
    });
  } catch (error) {
    console.error('Hız Kaydı Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç hız geçmişi
exports.getAracHizGeçmisi = async (req, res) => {
  try {
    const { arac_id } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT * FROM arac_hiz_kayitlari
       WHERE arac_id = $1
       ORDER BY baslangic_tarihi DESC
       LIMIT $2 OFFSET $3`,
      [arac_id, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) as total FROM arac_hiz_kayitlari WHERE arac_id = $1',
      [arac_id]
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      total: parseInt(countResult.rows[0].total),
      hiz_kayitlari: result.rows
    });
  } catch (error) {
    console.error('Hız Geçmişi Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Araç hız istatistikleri
exports.getAracHizIstatistikleri = async (req, res) => {
  try {
    const { arac_id } = req.params;

    const result = await pool.query(
      `SELECT 
        arac_id,
        COUNT(*) AS toplam_kayit,
        MAX(max_hiz) AS max_hiz_kmh,
        MIN(max_hiz) AS min_hiz_kmh,
        AVG(max_hiz) AS ortalama_max_hiz,
        AVG(ortalama_hiz) AS ortalama_hiz,
        SUM(sure_saat) AS toplam_sure_saat,
        MAX(baslangic_tarihi) AS son_kayit_tarihi
       FROM arac_hiz_kayitlari
       WHERE arac_id = $1
       GROUP BY arac_id`,
      [arac_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Hız verisi bulunamadı'
      });
    }

    return res.status(200).json({
      success: true,
      istatistikler: result.rows[0]
    });
  } catch (error) {
    console.error('Hız İstatistik Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

// Hız aşımı tespiti (Kısıtlı alanlarda)
exports.detectHizAsimi = async (req, res) => {
  try {
    const { arac_id, max_hiz } = req.body;

    if (!arac_id || max_hiz === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Araç ID ve hız gerekli'
      });
    }

    // Araç konumunu al
    const konumResult = await pool.query(
      'SELECT enlem, boylam FROM arac_konum_takibi WHERE arac_id = $1 ORDER BY kayit_tarihi DESC LIMIT 1',
      [arac_id]
    );

    if (konumResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Araç konumu bulunamadı'
      });
    }

    const { enlem, boylam } = konumResult.rows[0];

    // Kısıtlı alanları kontrol et
    const alanlResult = await pool.query(
      `SELECT * FROM kisitli_alanlar
       WHERE (
        6371 * acos(
          cos(radians($1)) * cos(radians(merkez_enlem)) * cos(radians(merkez_boylam) - radians($2)) +
          sin(radians($1)) * sin(radians(merkez_enlem))
        ) * 1000
       ) <= yaricap_metre`,
      [enlem, boylam]
    );

    const hizAsimlari = [];

    for (const alan of alanlResult.rows) {
      if (max_hiz > alan.max_hiz_kmh) {
        hizAsimlari.push({
          alan_id: alan.alan_id,
          alan_adi: alan.alan_adi,
          max_hiz_izin: alan.max_hiz_kmh,
          alingan_hiz: max_hiz,
          asilma: max_hiz - alan.max_hiz_kmh
        });
      }
    }

    return res.status(200).json({
      success: true,
      hiz_asimi_var: hizAsimlari.length > 0,
      hiz_asimlari: hizAsimlari
    });
  } catch (error) {
    console.error('Hız Aşımı Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Sunucu hatası',
      error: error.message
    });
  }
};

const bcrypt = require('bcryptjs');
const pool = require('../config/database');

// Tüm kullanıcıları listele
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.* 
       FROM kullanicilar k 
       ORDER BY k.olusturulma_tarihi DESC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Kullanıcılar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kullanıcıları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcılar getirilemedi',
      error: error.message
    });
  }
};

// Tek kullanıcı getir
const getUserById = async (req, res) => {
  try {
    const { kullanici_id } = req.params;

    const result = await pool.query(
      `SELECT k.* 
       FROM kullanicilar k 
       WHERE k.kullanici_id = $1`,
      [kullanici_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    // Şifre hariç diğer bilgileri gönder
    const { sifre, ...userWithoutPassword } = result.rows[0];

    res.status(200).json({
      success: true,
      data: userWithoutPassword,
      message: 'Kullanıcı başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kullanıcı getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı getirilemedi',
      error: error.message
    });
  }
};

const createUser = async (req, res) => {
  try {
    const { email, sifre, ad, soyad, telefon, rol, sirket_id, filo_id } = req.body;

    // Zorunlu alan kontrolü
    if (!email || !sifre || !ad || !soyad || !telefon) {
      return res.status(400).json({
        success: false,
        message: 'Email, şifre, ad, soyad ve telefon alanları zorunludur'
      });
    }

    // Email kontrolü
    const existingUser = await pool.query(
      'SELECT * FROM kullanicilar WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Bu email adresi zaten kayıtlı'
      });
    }

    // Şifreyi hash'le
    const hashedSifre = await bcrypt.hash(sifre, 10);

    const result = await pool.query(
      `INSERT INTO kullanicilar (email, sifre, ad, soyad, telefon, rol, filo_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING kullanici_id, email, ad, soyad, telefon, rol, filo_id, olusturulma_tarihi`,
      [email, hashedSifre, ad, soyad, telefon, rol, filo_id || null]
    );

    // Şirket ataması yap
    if (sirket_id) {
      await pool.query(
        `INSERT INTO sirket_yoneticileri (kullanici_id, sirket_id, yetki_seviyesi)
         VALUES ($1, $2, $3)
         ON CONFLICT (sirket_id, kullanici_id) DO NOTHING`,
        [result.rows[0].kullanici_id, sirket_id, 1]
      );
    }

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Kullanıcı başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Kullanıcı oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı oluşturulamadı',
      error: error.message
    });
  }
};

// Kullanıcı güncelle
const updateUser = async (req, res) => {
  try {
    const { kullanici_id } = req.params;
    const { ad, soyad, telefon, email, rol, sifre, sirket_id, filo_id } = req.body;

    // Kullanıcının varlığını kontrol et
    const existingUser = await pool.query(
      'SELECT * FROM kullanicilar WHERE kullanici_id = $1',
      [kullanici_id]
    );

    if (existingUser.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    let updateQuery = `UPDATE kullanicilar SET 
      ad = COALESCE($1, ad), 
      soyad = COALESCE($2, soyad), 
      telefon = COALESCE($3, telefon), 
      email = COALESCE($4, email), 
      rol = COALESCE($5, rol), 
      filo_id = $6,
      guncelleme_tarihi = CURRENT_TIMESTAMP`;

    let queryParams = [ad, soyad, telefon, email, rol, filo_id || null];
    let queryIndex = 7;

    if (sifre) {
      const hashedSifre = await bcrypt.hash(sifre, 10);
      updateQuery += `, sifre = $${queryIndex}`;
      queryParams.push(hashedSifre);
      queryIndex++;
    }

    updateQuery += ` WHERE kullanici_id = $${queryIndex} RETURNING *`;
    queryParams.push(kullanici_id);

    const result = await pool.query(updateQuery, queryParams);

    // Şirket atamasını güncelle veya oluştur
    if (sirket_id) {
      await pool.query(
        `INSERT INTO sirket_yoneticileri (kullanici_id, sirket_id, yetki_seviyesi)
         VALUES ($1, $2, 1)
         ON CONFLICT (sirket_id, kullanici_id) DO UPDATE SET sirket_id = EXCLUDED.sirket_id`,
        [kullanici_id, sirket_id]
      );
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kullanıcı başarıyla güncellendi'
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ success: false, message: 'Bu email adresi başka bir kullanıcı tarafından kullanılıyor' });
    }
    console.error('Kullanıcı güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı güncellenemedi',
      error: error.message
    });
  }
};

// Kullanıcı sil
const deleteUser = async (req, res) => {
  try {
    const { kullanici_id } = req.params;

    const result = await pool.query(
      'DELETE FROM kullanicilar WHERE kullanici_id = $1 RETURNING *',
      [kullanici_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });
  } catch (error) {
    console.error('Kullanıcı silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kullanıcı silinemedi',
      error: error.message
    });
  }
};

// Kullanıcı rolünü güncelle
const updateUserRole = async (req, res) => {
  try {
    const { kullanici_id } = req.params;
    const { rol } = req.body;

    const result = await pool.query(
      'UPDATE kullanicilar SET rol = $1, guncelleme_tarihi = CURRENT_TIMESTAMP WHERE kullanici_id = $2 RETURNING *',
      [rol, kullanici_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kullanıcı bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kullanıcı rolü başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Rol güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Rol güncellenemedi',
      error: error.message
    });
  }
};

// Şirkete göre kullanıcıları getir (sirket_yoneticileri tablosu üzerinden)
const getUsersByCompany = async (req, res) => {
  try {
    const { sirket_id } = req.params;

    const result = await pool.query(
      `SELECT k.kullanici_id, k.email, k.ad, k.soyad, k.telefon, k.rol 
       FROM kullanicilar k
       INNER JOIN sirket_yoneticileri sy ON k.kullanici_id = sy.kullanici_id
       WHERE sy.sirket_id = $1 
       ORDER BY k.ad, k.soyad`,
      [sirket_id]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket kullanıcıları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket kullanıcılarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket kullanıcıları getirilemedi',
      error: error.message
    });
  }
};

// Tüm şoförleri getir
const getAllDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k.kullanici_id, k.ad, k.soyad, k.telefon, k.email, k.rol, k.durum,
              COUNT(DISTINCT a.arac_id) as arac_sayisi,
              s.sirket_adi, s.sirket_id,
              f.filo_adi, f.filo_id
       FROM kullanicilar k
       LEFT JOIN sirket_yoneticileri sy ON k.kullanici_id = sy.kullanici_id
       LEFT JOIN sirketler s ON sy.sirket_id = s.sirket_id
       LEFT JOIN arac_soforleri aso ON k.kullanici_id = aso.kullanici_id
       LEFT JOIN araclar a ON aso.arac_id = a.arac_id
       LEFT JOIN filolar f ON k.filo_id = f.filo_id
       WHERE k.rol = 'surucü'
       GROUP BY k.kullanici_id, k.ad, k.soyad, k.telefon, k.email, k.rol, k.durum,
                s.sirket_adi, s.sirket_id, f.filo_adi, f.filo_id
       ORDER BY k.ad, k.soyad`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şoförler başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şoförleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şoförler getirilemedi',
      error: error.message
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  getUsersByCompany,
  getAllDrivers
};

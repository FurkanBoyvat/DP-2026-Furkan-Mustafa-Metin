const pool = require('../config/database');
const { geocodeAddress } = require('../utils/geocoding');

// Tüm kısıtlı alanları listele
const getAllKisitliAlanlar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       ORDER BY ka.olusturulma_tarihi DESC`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Kısıtlı alanlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kısıtlı alanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alanlar getirilemedi',
      error: error.message
    });
  }
};

// Tek kısıtlı alan getir
const getKisitliAlanById = async (req, res) => {
  try {
    const { alan_id } = req.params;
    
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       WHERE ka.alan_id = $1`,
      [alan_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla getirildi'
    });
  } catch (error) {
    console.error('Kısıtlı alan getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan getirilemedi',
      error: error.message
    });
  }
};

// Kısıtlı alan oluştur
const createKisitliAlan = async (req, res) => {
  try {
    const { 
      alan_adi, 
      aciklama, 
      merkez_enlem, 
      merkez_boylam, 
      yaricap_metre,
      max_hiz_kmh,
      alan_tipi,
      sirket_id,
      geometri_tipi = 'daire',
      koordinatlar = null
    } = req.body;
    
    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: 'Şirket seçimi zorunludur'
      });
    }

    const result = await pool.query(
      `INSERT INTO kisitli_alanlar 
       (alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, sirket_id, geometri_tipi, koordinatlar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        alan_adi, 
        aciklama, 
        merkez_enlem || null, 
        merkez_boylam || null, 
        yaricap_metre || null, 
        max_hiz_kmh || null, 
        alan_tipi, 
        sirket_id, 
        geometri_tipi, 
        koordinatlar ? JSON.stringify(koordinatlar) : null
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla oluşturuldu'
    });
  } catch (error) {
    console.error('Kısıtlı alan oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan oluşturulamadı',
      error: error.message
    });
  }
};

// Adres ile kısıtlı alan oluştur (Geocoding ile)
const createKisitliAlanFromAddress = async (req, res) => {
  try {
    const { 
      alan_adi, 
      aciklama, 
      adres,
      yaricap_metre,
      max_hiz_kmh,
      alan_tipi,
      sirket_id
    } = req.body;

    console.log('createKisitliAlanFromAddress - Request body:', req.body);

    if (!adres || adres.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir adres giriniz (en az 3 karakter)'
      });
    }

    if (!alan_adi || alan_adi.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Alan adı zorunludur'
      });
    }

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: 'Şirket seçimi zorunludur'
      });
    }

    // Adresi koordinatlara çevir
    console.log('Geocoding adres:', adres);
    const geocodeResult = await geocodeAddress(adres);
    console.log('Geocoding sonuç:', geocodeResult);
    
    if (!geocodeResult) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı veya geocoding başarısız. Lütfen daha açık bir adres girin (örn: "Kızılay, Ankara, Türkiye")'
      });
    }

    // Adres tipine göre akıllı yarıçap belirleme
    let finalRadius = yaricap_metre;
    if (!finalRadius || finalRadius <= 0) {
      const addressType = geocodeResult.type || '';
      const addressCategory = geocodeResult.category || '';
      const displayName = geocodeResult.display_name || '';
      
      // Adres içeriğine göre analiz
      const hasCity = /(şehir|city|Ankara|İstanbul|İzmir|Bursa|Antalya)/i.test(displayName);
      const hasDistrict = /(ilçe|district|merkez|keçiören|çankaya)/i.test(displayName);
      const hasNeighborhood = /(mahalle|mah\.|neighbourhood|suburb)/i.test(displayName);
      
      if (addressType === 'administrative' || addressCategory === 'boundary') {
        if (hasCity || displayName.split(',').length <= 2) {
          // Şehir seviyesi - 10km
          finalRadius = 10000;
        } else {
          // İlçe seviyesi - 5km
          finalRadius = 5000;
        }
      } else if (addressType === 'suburb' || addressType === 'neighbourhood' || hasNeighborhood) {
        // Mahalle/semt - 1km
        finalRadius = 1000;
      } else if (addressType === 'residential' || addressType === 'building' || addressType === 'house') {
        // Bina/ev - 150m
        finalRadius = 150;
      } else if (hasDistrict) {
        // İlçe belirtisi var - 3km
        finalRadius = 3000;
      } else {
        // Varsayılan - 500m
        finalRadius = 500;
      }
      
      console.log(`Akıllı yarıçap belirlendi: ${finalRadius}m (tip: ${addressType}, kategori: ${addressCategory})`);
    }

    console.log('Inserting to DB with params:', {
      alan_adi, 
      aciklama: aciklama || `Adres: ${geocodeResult.display_name}`, 
      lat: geocodeResult.lat, 
      lon: geocodeResult.lon, 
      yaricap: finalRadius, 
      max_hiz: max_hiz_kmh, 
      tip: alan_tipi || 'yasaklı_alan', 
      sirket_id
    });

    const result = await pool.query(
      `INSERT INTO kisitli_alanlar 
       (alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, sirket_id, geometri_tipi)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        alan_adi, 
        aciklama || `Adres: ${geocodeResult.display_name}`, 
        geocodeResult.lat, 
        geocodeResult.lon, 
        finalRadius, 
        max_hiz_kmh || null, 
        alan_tipi || 'yasaklı_alan', 
        sirket_id,
        'daire'
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: `Kısıtlı alan başarıyla oluşturuldu. Koordinatlar: ${geocodeResult.lat.toFixed(6)}, ${geocodeResult.lon.toFixed(6)}`
    });
  } catch (error) {
    console.error('Adres ile kısıtlı alan oluşturma hatası:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan oluşturulamadı: ' + error.message,
      error: error.message
    });
  }
};

// Adres ara ve koordinat getir (sadece geocoding)
const searchAddress = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Arama sorgusu en az 3 karakter olmalıdır'
      });
    }

    const geocodeResult = await geocodeAddress(q);
    
    if (!geocodeResult) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: geocodeResult,
      message: 'Adres başarıyla bulundu'
    });
  } catch (error) {
    console.error('Adres arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Adres aranamadı',
      error: error.message
    });
  }
};

// Adres ara - birden fazla sonuç getir (kullanıcı seçimi için)
const searchAddressMultiple = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;

    if (!q || q.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Arama sorgusu en az 3 karakter olmalıdır'
      });
    }

    const { searchAddressMultiple: searchMultiple } = require('../utils/geocoding');
    const results = await searchMultiple(q, parseInt(limit) || 5);
    
    if (!results || results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı'
      });
    }

    res.status(200).json({
      success: true,
      data: results,
      count: results.length,
      message: `${results.length} adres bulundu`
    });
  } catch (error) {
    console.error('Adres arama hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Adres aranamadı',
      error: error.message
    });
  }
};

// Kısıtlı alan güncelle
const updateKisitliAlan = async (req, res) => {
  try {
    const { alan_id } = req.params;
    const { 
      alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, 
      max_hiz_kmh, alan_tipi, durum, geometri_tipi, koordinatlar 
    } = req.body;
    
    const result = await pool.query(
      `UPDATE kisitli_alanlar 
       SET alan_adi = $1, aciklama = $2, merkez_enlem = $3, merkez_boylam = $4, 
           yaricap_metre = $5, max_hiz_kmh = $6, alan_tipi = $7, durum = $8,
           geometri_tipi = $9, koordinatlar = $10,
           guncelleme_tarihi = CURRENT_TIMESTAMP
       WHERE alan_id = $11
       RETURNING *`,
      [
        alan_adi, 
        aciklama, 
        merkez_enlem || null, 
        merkez_boylam || null, 
        yaricap_metre || null, 
        max_hiz_kmh || null, 
        alan_tipi, 
        durum, 
        geometri_tipi || 'daire', 
        koordinatlar ? JSON.stringify(koordinatlar) : null,
        alan_id
      ]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: 'Kısıtlı alan başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Kısıtlı alan güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan güncellenemedi',
      error: error.message
    });
  }
};

// Kısıtlı alan sil
const deleteKisitliAlan = async (req, res) => {
  try {
    const { alan_id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM kisitli_alanlar WHERE alan_id = $1 RETURNING *',
      [alan_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kısıtlı alan bulunamadı'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Kısıtlı alan başarıyla silindi'
    });
  } catch (error) {
    console.error('Kısıtlı alan silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan silinemedi',
      error: error.message
    });
  }
};

// Şirkete göre kısıtlı alanları getir
const getKisitliAlanlarBySirket = async (req, res) => {
  try {
    const { sirket_id } = req.params;
    
    const result = await pool.query(
      `SELECT ka.*
       FROM kisitli_alanlar ka
       WHERE ka.sirket_id = $1
       ORDER BY ka.olusturulma_tarihi DESC`,
      [sirket_id]
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Şirket kısıtlı alanları başarıyla getirildi'
    });
  } catch (error) {
    console.error('Şirket kısıtlı alanlarını getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Şirket kısıtlı alanları getirilemedi',
      error: error.message
    });
  }
};

// Aktif kısıtlı alanları getir
const getAktifKisitliAlanlar = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ka.*, s.sirket_adi
       FROM kisitli_alanlar ka
       LEFT JOIN sirketler s ON ka.sirket_id = s.sirket_id
       WHERE ka.durum = true
       ORDER BY ka.alan_adi`
    );
    
    res.status(200).json({
      success: true,
      data: result.rows,
      message: 'Aktif kısıtlı alanlar başarıyla getirildi'
    });
  } catch (error) {
    console.error('Aktif kısıtlı alanları getirme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Aktif kısıtlı alanlar getirilemedi',
      error: error.message
    });
  }
};

// Adres ile kısıtlı alan oluştur - Sınır/Boundary verisi ile (Profesyonel)
const createKisitliAlanFromAddressWithBoundary = async (req, res) => {
  try {
    const { 
      alan_adi, 
      aciklama, 
      adres,
      max_hiz_kmh,
      alan_tipi,
      sirket_id,
      useBoundary = true // Varsayılan olarak sınır kullan
    } = req.body;

    console.log('createKisitliAlanFromAddressWithBoundary - Request body:', req.body);

    if (!adres || adres.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'Geçerli bir adres giriniz (en az 3 karakter)'
      });
    }

    if (!alan_adi || alan_adi.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Alan adı zorunludur'
      });
    }

    if (!sirket_id) {
      return res.status(400).json({
        success: false,
        message: 'Şirket seçimi zorunludur'
      });
    }

    // Adresi koordinatlara çevir - Boundary verisi ile
    console.log('Geocoding adres (with boundary):', adres);
    const geocodeResult = await geocodeAddress(adres, true); // true = boundary al
    console.log('Geocoding sonuç:', JSON.stringify(geocodeResult, null, 2));
    
    if (!geocodeResult) {
      return res.status(404).json({
        success: false,
        message: 'Adres bulunamadı veya geocoding başarısız. Lütfen daha açık bir adres girin (örn: "Kızılay, Ankara, Türkiye")'
      });
    }

    let geometri_tipi = 'daire';
    let yaricap_metre = 0; // Poligon modunda yarıçap yok
    let koordinatlar = null;
    let merkez_enlem = geocodeResult.lat;
    let merkez_boylam = geocodeResult.lon;

    console.log('Boundary kontrolü:', {
      useBoundary: useBoundary,
      hasBoundary: geocodeResult.hasBoundary,
      boundaryExists: !!geocodeResult.boundary,
      boundaryType: geocodeResult.boundary?.type
    });

    // Eğer boundary verisi varsa ve kullanıcı poligon istiyorsa
    if (useBoundary && geocodeResult.hasBoundary && geocodeResult.boundary) {
      const boundary = geocodeResult.boundary;
      
      console.log('Boundary tipi:', boundary.type, '- Koordinat sayısı:', 
        boundary.type === 'Polygon' ? boundary.coordinates[0]?.length :
        boundary.type === 'MultiPolygon' ? boundary.coordinates.length : 'bilinmiyor'
      );
      
      try {
        // GeoJSON Polygon veya MultiPolygon kontrolü
        if (boundary.type === 'Polygon') {
          geometri_tipi = 'poligon';
          // GeoJSON formatı: [[[lon, lat], [lon, lat], ...]]
          // Leaflet/React-Leaflet için: [[lat, lon], [lat, lon], ...]
          koordinatlar = boundary.coordinates[0].map(coord => [coord[1], coord[0]]);
          console.log('Poligon oluşturuldu, nokta sayısı:', koordinatlar.length);
        } else if (boundary.type === 'MultiPolygon') {
          geometri_tipi = 'poligon';
          // Şehirler MultiPolygon olabilir (adalar, ayrık bölgeler)
          // En büyük dış sınırı bul (en fazla koordinat içeren)
          let largestRing = null;
          let maxPoints = 0;
          
          for (const polygon of boundary.coordinates) {
            for (const ring of polygon) {
              if (ring.length > maxPoints) {
                maxPoints = ring.length;
                largestRing = ring;
              }
            }
          }
          
          if (largestRing && largestRing.length > 3) {
            koordinatlar = largestRing.map(coord => [coord[1], coord[0]]);
            console.log('MultiPolygon - En büyük sınır seçildi:', koordinatlar.length, 'nokta');
          } else {
            console.log('MultiPolygon geçersiz, daireye dönülüyor');
            geometri_tipi = 'daire';
            yaricap_metre = 10000;
          }
        } else {
          console.log('Bilinmeyen boundary tipi:', boundary.type, '- Daire olarak devam ediliyor');
          geometri_tipi = 'daire';
          yaricap_metre = 10000; // Şehir için varsayılan
        }
        
        // Koordinatlar çok azsa veya bozuksa daireye dön
        if (koordinatlar && koordinatlar.length < 3) {
          console.log('Yetersiz koordinat, daireye dönülüyor:', koordinatlar?.length);
          geometri_tipi = 'daire';
          yaricap_metre = 10000;
          koordinatlar = null;
        }
      } catch (error) {
        console.error('Boundary işleme hatası:', error);
        geometri_tipi = 'daire';
        yaricap_metre = 10000;
        koordinatlar = null;
      }
      
      // Poligon merkezini hesapla (centroid)
      if (koordinatlar && koordinatlar.length > 0) {
        let sumLat = 0, sumLon = 0;
        koordinatlar.forEach(coord => {
          sumLat += coord[0];
          sumLon += coord[1];
        });
        merkez_enlem = sumLat / koordinatlar.length;
        merkez_boylam = sumLon / koordinatlar.length;
        
        // Poligon için yarıçap hesapla (sadece bilgi amaçlı, DB'ye yazılmayacak)
        let maxDist = 0;
        koordinatlar.forEach(coord => {
          const dist = Math.sqrt(
            Math.pow(coord[0] - merkez_enlem, 2) + 
            Math.pow(coord[1] - merkez_boylam, 2)
          );
          if (dist > maxDist) maxDist = dist;
        });
        // Yaklaşık metre çevirisi (1 derece ~ 111km)
        yaricap_metre = Math.round(maxDist * 111000);
      }
    } else if (useBoundary) {
      // Kullanıcı boundary istedi ama boundary verisi yok - otomatik yarıçapla devam et
      console.log('Boundary verisi bulunamadı, otomatik yarıçap belirleniyor...');
      
      const addressType = geocodeResult.type || '';
      const addressCategory = geocodeResult.category || '';
      const displayName = geocodeResult.display_name || '';
      
      // Adres içeriğine göre akıllı yarıçap belirleme
      const hasCity = /(Ankara|İstanbul|İzmir|Bursa|Antalya|Adana|Konya|Gaziantep|Şehir|City)/i.test(displayName);
      const hasDistrict = /(ilçe|district|keçiören|çankaya|yenimahalle|merkez)/i.test(displayName);
      
      if (hasCity || displayName.split(',').length <= 2) {
        // Şehir seviyesi - 10km
        yaricap_metre = 10000;
      } else if (addressType === 'administrative' || addressCategory === 'boundary' || hasDistrict) {
        // İlçe seviyesi - 5km
        yaricap_metre = 5000;
      } else if (addressType === 'suburb' || addressType === 'neighbourhood') {
        // Mahalle - 1km
        yaricap_metre = 1000;
      } else {
        // Normal adres - 500m
        yaricap_metre = 500;
      }
      
      geometri_tipi = 'daire';
      console.log('Otomatik yarıçap belirlendi:', yaricap_metre, 'metre');
    } else {
      // Boundary yoksa normal daire oluştur - daha büyük yarıçap
      // Mahalle/semt seviyesi için daha uygun yarıçap
      const addressType = geocodeResult.type || '';
      const addressCategory = geocodeResult.category || '';
      
      if (addressType === 'administrative' || addressCategory === 'boundary') {
        // Büyük bölge (ilçe, şehir) - 5km
        yaricap_metre = 5000;
      } else if (addressType === 'suburb' || addressType === 'neighbourhood') {
        // Mahalle - 1km
        yaricap_metre = 1000;
      } else {
        // Normal adres - 200m
        yaricap_metre = 200;
      }
      console.log('Boundary yok, daire oluşturuldu. Tip:', addressType, 'Yarıçap:', yaricap_metre);
    }

    console.log('Inserting to DB:', {
      alan_adi, 
      geometri_tipi, 
      merkez_enlem, 
      merkez_boylam, 
      yaricap_metre,
      koordinatlarSayisi: koordinatlar ? koordinatlar.length : 0
    });

    const result = await pool.query(
      `INSERT INTO kisitli_alanlar 
       (alan_adi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, alan_tipi, sirket_id, geometri_tipi, koordinatlar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        alan_adi, 
        aciklama || `Adres: ${geocodeResult.display_name}`, 
        merkez_enlem, 
        merkez_boylam, 
        yaricap_metre, 
        max_hiz_kmh || null, 
        alan_tipi || 'yasaklı_alan', 
        sirket_id,
        geometri_tipi,
        koordinatlar ? JSON.stringify(koordinatlar) : null
      ]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: geometri_tipi === 'poligon' 
        ? `Kısıtlı alan poligon olarak oluşturuldu (${koordinatlar?.length || 0} nokta). Koordinatlar: ${merkez_enlem.toFixed(6)}, ${merkez_boylam.toFixed(6)}`
        : `Kısıtlı alan daire olarak oluşturuldu (yarıçap: ${yaricap_metre}m). Koordinatlar: ${merkez_enlem.toFixed(6)}, ${merkez_boylam.toFixed(6)}`
    });
  } catch (error) {
    console.error('Adres ile kısıtlı alan oluşturma hatası:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Kısıtlı alan oluşturulamadı: ' + error.message,
      error: error.message
    });
  }
};

module.exports = {
  getAllKisitliAlanlar,
  getKisitliAlanById,
  createKisitliAlan,
  createKisitliAlanFromAddress,
  createKisitliAlanFromAddressWithBoundary,
  searchAddress,
  searchAddressMultiple,
  updateKisitliAlan,
  deleteKisitliAlan,
  getKisitliAlanlarBySirket,
  getAktifKisitliAlanlar
};

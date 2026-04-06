const axios = require('axios');

/**
 * Adresi enlem/boylam koordinatlarına çevirir (Geocoding)
 * OpenStreetMap Nominatim API kullanır (ücretsiz, API key gerekmez)
 * @param {string} address - Adres metni
 * @param {boolean} fetchBoundary - Sınır/boundary verisi de alınsın mı?
 * @returns {Promise<{lat: number, lon: number, display_name: string, boundary?: number[][]} | null>}
 */
const geocodeAddress = async (address, fetchBoundary = false, limit = 1) => {
  try {
    if (!address || address.trim().length < 3) {
      return null;
    }

    const params = {
      q: address,
      format: 'json',
      limit: limit, // Birden fazla sonuç getir seçim için
      'accept-language': 'tr',
      addressdetails: 1,
      countrycodes: 'tr' // Sadece Türkiye sonuçları
    };

    // Sınır verisi istenirse polygon_geojson ekle
    if (fetchBoundary) {
      params.polygon_geojson = 1;
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params,
      headers: {
        'User-Agent': 'AracTakipSistemi/1.0'
      },
      timeout: 15000
    });

    if (response.data && response.data.length > 0) {
      // Birden fazla sonuç varsa hepsini döndür (limit > 1 ise)
      if (limit > 1) {
        return response.data.map(result => ({
          lat: parseFloat(result.lat),
          lon: parseFloat(result.lon),
          display_name: result.display_name,
          type: result.type,
          category: result.category,
          importance: result.importance,
          address: result.address,
          boundary: fetchBoundary && result.geojson ? result.geojson : undefined,
          hasBoundary: fetchBoundary && !!result.geojson
        }));
      }
      
      const result = response.data[0];
      const data = {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name,
        type: result.type,
        category: result.category
      };

      // Sınır verisi varsa ekle (GeoJSON polygon)
      if (fetchBoundary && result.geojson) {
        data.boundary = result.geojson;
        data.hasBoundary = true;
      };

      return data;
    }

    return null;
  } catch (error) {
    console.error('Geocoding hatası:', error.message);
    return null;
  }
};

/**
 * Adres araması - birden fazla sonuç getir
 * @param {string} address - Adres metni
 * @param {number} limit - Maksimum sonuç sayısı
 * @returns {Promise<Array>} - Sonuç listesi
 */
const searchAddressMultiple = async (address, limit = 5) => {
  try {
    if (!address || address.trim().length < 3) {
      return [];
    }

    const params = {
      q: address,
      format: 'json',
      limit: limit,
      'accept-language': 'tr',
      addressdetails: 1,
      countrycodes: 'tr',
      polygon_geojson: 1 // Boundary verisi için eklendi
    };

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params,
      headers: {
        'User-Agent': 'AracTakipSistemi/1.0'
      },
      timeout: 15000
    });

    if (response.data && response.data.length > 0) {
      return response.data.map(result => ({
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon),
        display_name: result.display_name,
        type: result.type,
        category: result.category,
        importance: result.importance,
        address: result.address,
        geojson: result.geojson
      }));
    }

    return [];
  } catch (error) {
    console.error('Adres arama hatası:', error.message);
    return [];
  }
};

/**
 * Koordinatları adres metnine çevirir (Reverse Geocoding)
 * @param {number} lat - Enlem
 * @param {number} lon - Boylam
 * @returns {Promise<string | null>}
 */
const reverseGeocode = async (lat, lon) => {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lon,
        format: 'json',
        'accept-language': 'tr'
      },
      headers: {
        'User-Agent': 'AracTakipSistemi/1.0'
      },
      timeout: 10000
    });

    if (response.data && response.data.display_name) {
      return response.data.display_name;
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding hatası:', error.message);
    return null;
  }
};

module.exports = {
  geocodeAddress,
  reverseGeocode,
  searchAddressMultiple
};

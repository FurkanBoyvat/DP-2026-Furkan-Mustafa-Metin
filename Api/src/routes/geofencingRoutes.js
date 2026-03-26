const express = require('express');
const router = express.Router();
const geo = require('../controllers/geofencingController');

// Bölge yönetimi
router.post('/region/save', geo.saveAllowedRegion);       // POST: GeoJSON şehir poligonu kaydet
router.get('/region/:arac_id', geo.getRegionByArac);      // GET:  Araç için aktif bölgeyi getir

// Konum + ihlal kontrolü
router.post('/location/check', geo.checkAndLogLocation);  // POST: Konum gönder → ihlal kontrol et

// İhlal kayıtları
router.get('/violations/:arac_id', geo.getViolations);    // GET: Araç ihlal geçmişi
router.get('/violations', geo.getAllViolations);           // GET: Tüm ihlaller

module.exports = router;

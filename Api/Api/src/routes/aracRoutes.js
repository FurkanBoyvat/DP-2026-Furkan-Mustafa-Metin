const express = require('express');
const router = express.Router();
const aracController = require('../controllers/aracController');

// Tüm araçlar
router.get('/', aracController.getAllAraclar);

// Araç sayısı
router.get('/sayisi/toplam', aracController.getAracSayisi);

// Plakaya göre araç ara
router.get('/plaka/:plaka', aracController.getAracByPlaka);

// Araç detaylarını getir
router.get('/:arac_id', aracController.getAracById);

// Yeni araç oluştur
router.post('/', aracController.createArac);

// Araç güncelle
router.put('/:arac_id', aracController.updateArac);

// Araç sil
router.delete('/:arac_id', aracController.deleteArac);

module.exports = router;

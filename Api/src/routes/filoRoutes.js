const express = require('express');
const router = express.Router();
const filoController = require('../controllers/filoController');

// Tüm filolar
router.get('/', filoController.getAllFilolar);

// Filo istatistikleri
router.get('/:filo_id/istatistikler', filoController.getFiloIstatistikleri);

// Filo oluştur
router.post('/', filoController.createFilo);

// Filo güncelle
router.put('/:filo_id', filoController.updateFilo);

// Filo sil
router.delete('/:filo_id', filoController.deleteFilo);

module.exports = router;

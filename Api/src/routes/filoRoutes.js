const express = require('express');
const router = express.Router();
const filoController = require('../controllers/filoController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm filolar
router.get('/', filoController.getAllFilolar);

// Filo istatistikleri
router.get('/:filo_id/istatistikler', filoController.getFiloIstatistikleri);

// Filo oluştur
router.post('/', verifyToken, filoController.createFilo);

// Filo güncelle
router.put('/:filo_id', verifyToken, filoController.updateFilo);

// Filo sil
router.delete('/:filo_id', verifyToken, filoController.deleteFilo);

module.exports = router;

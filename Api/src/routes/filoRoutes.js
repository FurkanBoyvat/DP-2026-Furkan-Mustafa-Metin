const express = require('express');
const router = express.Router();
const filoController = require('../controllers/filoController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm filolar
router.get('/', filoController.getAllFilolar);

// Filo istatistikleri
router.get('/:filo_id/istatistikler', filoController.getFiloIstatistikleri);

// --- Yetki Gerektiren İşlemler ---

// Filo oluştur
router.post('/', verifySirketYoneticisi, filoController.createFilo);

// Filo güncelle
router.put('/:filo_id', verifySirketYoneticisi, filoController.updateFilo);

// Filo sil
router.delete('/:filo_id', verifySirketYoneticisi, filoController.deleteFilo);

module.exports = router;

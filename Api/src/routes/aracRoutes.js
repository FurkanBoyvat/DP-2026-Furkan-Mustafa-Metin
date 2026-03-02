const express = require('express');
const router = express.Router();
const aracController = require('../controllers/aracController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm araçlar
router.get('/', aracController.getAllAraclar);

// Araç sayısı
router.get('/sayisi/toplam', aracController.getAracSayisi);

// Plakaya göre araç ara
router.get('/plaka/:plaka', aracController.getAracByPlaka);

// Araç detaylarını getir
router.get('/:arac_id', aracController.getAracById);

// Yeni araç oluştur
router.post('/', verifyToken, aracController.createArac);

// Araç güncelle
router.put('/:arac_id', verifyToken, aracController.updateArac);

// Araç sil
router.delete('/:arac_id', verifyToken, aracController.deleteArac);

module.exports = router;

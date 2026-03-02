const express = require('express');
const router = express.Router();
const sirketController = require('../controllers/sirketController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm şirketleri getir
router.get('/', sirketController.getAllSirketler);

// Şirket detaylarını getir
router.get('/:sirket_id', sirketController.getSirketById);

// Şirket detaylarını güncelle
router.put('/:sirket_id/detaylar', verifyToken, sirketController.updateSirketDetay);

// Yeni şirket oluştur (Korumalı)
router.post('/', verifyToken, sirketController.createSirket);

// Şirket güncelle (Korumalı)
router.put('/:sirket_id', verifyToken, sirketController.updateSirket);

// Şirket sil (Korumalı)
router.delete('/:sirket_id', verifyToken, sirketController.deleteSirket);

module.exports = router;

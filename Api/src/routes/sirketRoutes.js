const express = require('express');
const router = express.Router();
const sirketController = require('../controllers/sirketController');

// Tüm şirketleri getir
router.get('/', sirketController.getAllSirketler);

// Şirket detaylarını getir
router.get('/:sirket_id', sirketController.getSirketById);

// Şirket detaylarını güncelle
router.put('/:sirket_id/detaylar', sirketController.updateSirketDetay);

// Yeni şirket oluştur
router.post('/', sirketController.createSirket);

// Şirket güncelle
router.put('/:sirket_id', sirketController.updateSirket);

// Şirket sil
router.delete('/:sirket_id', sirketController.deleteSirket);

module.exports = router;

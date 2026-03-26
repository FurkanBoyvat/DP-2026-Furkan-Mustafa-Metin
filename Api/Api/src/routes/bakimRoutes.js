const express = require('express');
const router = express.Router();
const bakimController = require('../controllers/bakimController');

// Tüm bakım taleplerini listele
router.get('/', bakimController.getAllBakimTalepleri);

// Araca göre bakım taleplerini getir
router.get('/arac/:arac_id', bakimController.getBakimTalepleriByArac);

// Duruma göre bakım taleplerini getir
router.get('/durum/:durum', bakimController.getBakimTalepleriByDurum);

// Tek bakım talebi getir
router.get('/:talek_id', bakimController.getBakimTalebiById);

// Bakım talebi oluştur
router.post('/', bakimController.createBakimTalebi);

// Bakım talebi güncelle
router.put('/:talek_id', bakimController.updateBakimTalebi);

// Bakım talebi sil
router.delete('/:talek_id', bakimController.deleteBakimTalebi);

// Bakım talebi durumunu güncelle
router.put('/:talek_id/durum', bakimController.updateBakimDurumu);

// Bakım maliyeti ekle
router.post('/:talek_id/maliyet', bakimController.addBakimMaliyeti);

module.exports = router;

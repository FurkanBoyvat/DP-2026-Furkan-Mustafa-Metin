const express = require('express');
const router = express.Router();
const bakimController = require('../controllers/bakimController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm bakım taleplerini listele
router.get('/', verifyToken, bakimController.getAllBakimTalepleri);

// Tek bakım talebi getir
router.get('/:talep_id', verifyToken, bakimController.getBakimTalebiById);

// Bakım talebi oluştur
router.post('/', verifyToken, bakimController.createBakimTalebi);

// Bakım talebi güncelle
router.put('/:talep_id', verifyToken, bakimController.updateBakimTalebi);

// Bakım talebi sil
router.delete('/:talep_id', verifyToken, bakimController.deleteBakimTalebi);

// Araca göre bakım taleplerini getir
router.get('/arac/:arac_id', verifyToken, bakimController.getBakimTalepleriByArac);

// Duruma göre bakım taleplerini getir
router.get('/durum/:durum', verifyToken, bakimController.getBakimTalepleriByDurum);

// Bakım talebi durumunu güncelle
router.put('/:talep_id/durum', verifyToken, bakimController.updateBakimDurumu);

// Bakım maliyeti ekle
router.post('/:talep_id/maliyet', verifyToken, bakimController.addBakimMaliyeti);

module.exports = router;

const express = require('express');
const router = express.Router();
const bakimController = require('../controllers/bakimController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm bakım taleplerini listele
router.get('/', bakimController.getAllBakimTalepleri);

// Araca göre bakım taleplerini getir
router.get('/arac/:arac_id', bakimController.getBakimTalepleriByArac);

// Duruma göre bakım taleplerini getir
router.get('/durum/:durum', bakimController.getBakimTalepleriByDurum);

// Tek bakım talebi getir
router.get('/:talek_id', bakimController.getBakimTalebiById);

// --- Yetki Gerektiren İşlemler ---

// Bakım talebi oluştur
router.post('/', bakimController.createBakimTalebi);

// Bakım talebi güncelle
router.put('/:talek_id', verifySirketYoneticisi, bakimController.updateBakimTalebi);

// Bakım talebi sil
router.delete('/:talek_id', verifySirketYoneticisi, bakimController.deleteBakimTalebi);

// Bakım talebi durumunu güncelle
router.put('/:talek_id/durum', verifySirketYoneticisi, bakimController.updateBakimDurumu);

// Bakım maliyeti ekle
router.post('/:talek_id/maliyet', verifySirketYoneticisi, bakimController.addBakimMaliyeti);

module.exports = router;

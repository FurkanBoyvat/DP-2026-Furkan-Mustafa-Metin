const express = require('express');
const router = express.Router();
const sirketController = require('../controllers/sirketController');
const { verifyToken, verifyAdmin, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm şirketleri getir
router.get('/', sirketController.getAllSirketler);

// Şirket detaylarını getir
router.get('/:sirket_id', sirketController.getSirketById);

// --- Yetki Gerektiren İşlemler ---

// Şirket detaylarını güncelle
router.put('/:sirket_id/detaylar', verifySirketYoneticisi, sirketController.updateSirketDetay);

// Yeni şirket oluştur
router.post('/', verifyAdmin, sirketController.createSirket);

// Şirket güncelle
router.put('/:sirket_id', verifyAdmin, sirketController.updateSirket);

// Şirket sil
router.delete('/:sirket_id', verifyAdmin, sirketController.deleteSirket);

module.exports = router;

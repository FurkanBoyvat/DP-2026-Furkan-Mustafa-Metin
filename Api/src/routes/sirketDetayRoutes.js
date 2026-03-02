const express = require('express');
const router = express.Router();
const sirketDetayController = require('../controllers/sirketDetayController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm şirket detaylarını listele
router.get('/', verifyToken, sirketDetayController.getAllSirketDetaylari);

// Tek şirket detayı getir
router.get('/:detay_id', verifyToken, sirketDetayController.getSirketDetayiById);

// Şirket detayı oluştur
router.post('/', verifyToken, sirketDetayController.createSirketDetayi);

// Şirket detayı güncelle
router.put('/:detay_id', verifyToken, sirketDetayController.updateSirketDetayi);

// Şirket detayı sil
router.delete('/:detay_id', verifyToken, sirketDetayController.deleteSirketDetayi);

// Şirkete göre detayları getir
router.get('/sirket/:sirket_id', verifyToken, sirketDetayController.getSirketDetaylariBySirket);

// Detay tipine göre getir
router.get('/tip/:detay_tipi', verifyToken, sirketDetayController.getSirketDetaylariByTip);

// Aktif şirket detaylarını getir
router.get('/aktif/all', verifyToken, sirketDetayController.getAktifSirketDetaylari);

module.exports = router;

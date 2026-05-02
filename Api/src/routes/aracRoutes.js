const express = require('express');
const router = express.Router();
const aracController = require('../controllers/aracController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm araçlar
router.get('/', aracController.getAllAraclar);

// Araç sayısı
router.get('/sayisi/toplam', aracController.getAracSayisi);

// Plakaya göre araç ara
router.get('/plaka/:plaka', aracController.getAracByPlaka);

// Araç detaylarını getir
router.get('/:arac_id', aracController.getAracById);

// --- Yetki Gerektiren İşlemler (Admin veya Şirket Yöneticisi) ---

// Yeni araç oluştur
router.post('/', verifySirketYoneticisi, aracController.createArac);

// Araç güncelle
router.put('/:arac_id', verifySirketYoneticisi, aracController.updateArac);

// Araç sil
router.delete('/:arac_id', verifySirketYoneticisi, aracController.deleteArac);

module.exports = router;

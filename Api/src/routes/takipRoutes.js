const express = require('express');
const router = express.Router();
const takipController = require('../controllers/takipController');
const { verifyToken } = require('../middleware/authMiddleware');

// ============== KONUM TAKIBI ==============

// Konum güncelle
router.post('/konum/update', verifyToken, takipController.updateAracKonum);

// Araç konumunu getir
router.get('/konum/:arac_id', takipController.getAracKonum);

// Tüm araçlar konumunu getir
router.get('/konumlar/all', takipController.getAllAraclarKonum);

// ============== KM TAKIBI ==============

// KM kayıtı ekle
router.post('/km/add', verifyToken, takipController.addKmKayidi);

// Araç KM geçmişi
router.get('/km/:arac_id', takipController.getAracKmGeçmisi);

// ============== HIZ KAYITLARI ==============

// Hız kayıtı ekle
router.post('/hiz/add', verifyToken, takipController.addHizKayidi);

// Araç hız geçmişi
router.get('/hiz/:arac_id', takipController.getAracHizGeçmisi);

// Araç hız istatistikleri
router.get('/hiz-stats/:arac_id', takipController.getAracHizIstatistikleri);

// Hız aşımı tespiti
router.post('/hiz/asimi', takipController.detectHizAsimi);

module.exports = router;

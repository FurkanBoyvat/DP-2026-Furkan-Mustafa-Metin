const express = require('express');
const router = express.Router();
const bolgeIhlalController = require('../controllers/bolgeIhlalController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm bölge ihlal kayıtlarını listele
router.get('/', verifyToken, bolgeIhlalController.getAllBolgeIhlalleri);

// Tek bölge ihlal kaydı getir
router.get('/:ihlal_id', verifyToken, bolgeIhlalController.getBolgeIhlaliById);

// Bölge ihlal kaydı oluştur
router.post('/', verifyToken, bolgeIhlalController.createBolgeIhlali);

// Bölge ihlal kaydı güncelle
router.put('/:ihlal_id', verifyToken, bolgeIhlalController.updateBolgeIhlali);

// Bölge ihlal kaydı sil
router.delete('/:ihlal_id', verifyToken, bolgeIhlalController.deleteBolgeIhlali);

// Araca göre bölge ihlal kayıtlarını getir
router.get('/arac/:arac_id', verifyToken, bolgeIhlalController.getBolgeIhlalleriByArac);

// Tarih aralığına göre bölge ihlal kayıtlarını getir
router.get('/tarih/aralik', verifyToken, bolgeIhlalController.getBolgeIhlalleriByTarihAraligi);

// Çözülmeyen ihlal kayıtlarını getir
router.get('/cozulmemis/all', verifyToken, bolgeIhlalController.getCozulmemisIhlaller);

module.exports = router;

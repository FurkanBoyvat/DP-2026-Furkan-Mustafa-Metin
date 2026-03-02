const express = require('express');
const router = express.Router();
const raporController = require('../controllers/raporController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm raporları listele
router.get('/', verifyToken, raporController.getAllRaporlar);

// Tek rapor getir
router.get('/:rapor_id', verifyToken, raporController.getRaporById);

// Rapor oluştur
router.post('/', verifyToken, raporController.createRapor);

// Rapor güncelle
router.put('/:rapor_id', verifyToken, raporController.updateRapor);

// Rapor sil
router.delete('/:rapor_id', verifyToken, raporController.deleteRapor);

// Şirkete göre raporları getir
router.get('/sirket/:sirket_id', verifyToken, raporController.getRaporlarBySirket);

// Tarih aralığına göre raporları getir
router.get('/tarih/aralik', verifyToken, raporController.getRaporlarByTarihAraligi);

module.exports = router;

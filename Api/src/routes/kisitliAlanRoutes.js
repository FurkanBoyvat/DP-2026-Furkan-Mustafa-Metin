const express = require('express');
const router = express.Router();
const kisitliAlanController = require('../controllers/kisitliAlanController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm kısıtlı alanları listele
router.get('/', verifyToken, kisitliAlanController.getAllKisitliAlanlar);

// Tek kısıtlı alan getir
router.get('/:alan_id', verifyToken, kisitliAlanController.getKisitliAlanById);

// Kısıtlı alan oluştur
router.post('/', verifyToken, kisitliAlanController.createKisitliAlan);

// Kısıtlı alan güncelle
router.put('/:alan_id', verifyToken, kisitliAlanController.updateKisitliAlan);

// Kısıtlı alan sil
router.delete('/:alan_id', verifyToken, kisitliAlanController.deleteKisitliAlan);

// Şirkete göre kısıtlı alanları getir
router.get('/sirket/:sirket_id', verifyToken, kisitliAlanController.getKisitliAlanlarBySirket);

// Aktif kısıtlı alanları getir
router.get('/aktif/all', verifyToken, kisitliAlanController.getAktifKisitliAlanlar);

module.exports = router;

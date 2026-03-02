const express = require('express');
const router = express.Router();
const soforController = require('../controllers/soforController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm araç-şoför atamalarını listele
router.get('/', verifyToken, soforController.getAllSoforAtamalari);

// Tek şoför ataması getir
router.get('/:atama_id', verifyToken, soforController.getSoforAtamasiById);

// Araç-şoför ataması oluştur
router.post('/', verifyToken, soforController.createSoforAtamasi);

// Şoför atamasını güncelle
router.put('/:atama_id', verifyToken, soforController.updateSoforAtamasi);

// Şoför atamasını sil
router.delete('/:atama_id', verifyToken, soforController.deleteSoforAtamasi);

// Araca göre şoför atamalarını getir
router.get('/arac/:arac_id', verifyToken, soforController.getSoforAtamalariByArac);

// Şoföre göre atamaları getir
router.get('/sofor/:kullanici_id', verifyToken, soforController.getSoforAtamalariBySofor);

// Aktif şoför atamalarını getir
router.get('/aktif/all', verifyToken, soforController.getAktifSoforAtamalari);

// Şoför atamasını pasif yap
router.put('/:atama_id/pasif', verifyToken, soforController.deactivateSoforAtamasi);

module.exports = router;

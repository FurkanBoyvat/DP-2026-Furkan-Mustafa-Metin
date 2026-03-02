const express = require('express');
const router = express.Router();
const aracSoforController = require('../controllers/aracSoforController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm araç şoförlerini listele
router.get('/', verifyToken, aracSoforController.getAllAracSoforleri);

// Tek araç şoför ataması getir
router.get('/:atama_id', verifyToken, aracSoforController.getAracSoforuById);

// Araç şoför ataması oluştur
router.post('/', verifyToken, aracSoforController.createAracSoforu);

// Araç şoför ataması güncelle
router.put('/:atama_id', verifyToken, aracSoforController.updateAracSoforu);

// Araç şoför ataması sil
router.delete('/:atama_id', verifyToken, aracSoforController.deleteAracSoforu);

// Araca göre şoför atamalarını getir
router.get('/arac/:arac_id', verifyToken, aracSoforController.getAracSoforleriByArac);

// Şoföre göre araç atamalarını getir
router.get('/sofor/:sofor_id', verifyToken, aracSoforController.getAracSoforleriBySofor);

// Aktif şoför atamalarını getir
router.get('/aktif/all', verifyToken, aracSoforController.getAktifAracSoforleri);

module.exports = router;

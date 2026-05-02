const express = require('express');
const router = express.Router();
const aracSoforController = require('../controllers/aracSoforController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm araç şoförlerini listele
router.get('/', aracSoforController.getAllAracSoforleri);

// Aktif şoför atamalarını getir (/:atama_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', aracSoforController.getAktifAracSoforleri);

// Araca göre şoför atamalarını getir (/:atama_id'dan ÖNCE tanımlanmalı!)
router.get('/arac/:arac_id', aracSoforController.getAracSoforleriByArac);

// Şoföre göre araç atamalarını getir (/:atama_id'dan ÖNCE tanımlanmalı!)
router.get('/sofor/:sofor_id', aracSoforController.getAracSoforleriBySofor);

// Tek araç şoför ataması getir
router.get('/:atama_id', aracSoforController.getAracSoforuById);

// Araç şoför ataması oluştur
router.post('/', verifySirketYoneticisi, aracSoforController.createAracSoforu);

// Araç şoför ataması güncelle
router.put('/:atama_id', verifySirketYoneticisi, aracSoforController.updateAracSoforu);

// Araç şoför ataması sil
router.delete('/:atama_id', verifySirketYoneticisi, aracSoforController.deleteAracSoforu);

module.exports = router;

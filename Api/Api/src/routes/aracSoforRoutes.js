const express = require('express');
const router = express.Router();
const aracSoforController = require('../controllers/aracSoforController');

// Tüm araç şoförlerini listele
router.get('/', aracSoforController.getAllAracSoforleri);

// Aktif şoför atamalarını getir (/:sofor_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', aracSoforController.getAktifAracSoforleri);

// Araca göre şoför atamalarını getir (/:sofor_id'dan ÖNCE tanımlanmalı!)
router.get('/arac/:arac_id', aracSoforController.getAracSoforleriByArac);

// Şoföre göre araç atamalarını getir (/:sofor_id'dan ÖNCE tanımlanmalı!)
router.get('/sofor/:sofor_id', aracSoforController.getAracSoforleriBySofor);

// Tek araç şoför ataması getir
router.get('/:sofor_id', aracSoforController.getAracSoforuById);

// Araç şoför ataması oluştur
router.post('/', aracSoforController.createAracSoforu);

// Araç şoför ataması güncelle
router.put('/:sofor_id', aracSoforController.updateAracSoforu);

// Araç şoför ataması sil
router.delete('/:sofor_id', aracSoforController.deleteAracSoforu);

module.exports = router;

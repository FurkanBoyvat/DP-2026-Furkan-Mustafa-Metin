const express = require('express');
const router = express.Router();
const soforController = require('../controllers/soforController');

// Tüm araç-şoför atamalarını listele
router.get('/', soforController.getAllSoforAtamalari);

// Aktif şoför atamalarını getir (/:atama_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', soforController.getAktifSoforAtamalari);

// Tek şoför ataması getir
router.get('/:atama_id', soforController.getSoforAtamasiById);

// Araç-şoför ataması oluştur
router.post('/', soforController.createSoforAtamasi);

// Şoför atamasını güncelle
router.put('/:atama_id', soforController.updateSoforAtamasi);

// Şoför atamasını sil
router.delete('/:atama_id', soforController.deleteSoforAtamasi);

// Araca göre şoför atamalarını getir
router.get('/arac/:arac_id', soforController.getSoforAtamalariByArac);

// Şoföre göre atamaları getir
router.get('/sofor/:kullanici_id', soforController.getSoforAtamalariBySofor);

// Şoför atamasını pasif yap
router.put('/:atama_id/pasif', soforController.deactivateSoforAtamasi);

module.exports = router;

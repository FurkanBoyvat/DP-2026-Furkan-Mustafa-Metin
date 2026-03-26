const express = require('express');
const router = express.Router();
const kisitliAlanController = require('../controllers/kisitliAlanController');

// Tüm kısıtlı alanları listele
router.get('/', kisitliAlanController.getAllKisitliAlanlar);

// Aktif kısıtlı alanları getir (/:alan_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', kisitliAlanController.getAktifKisitliAlanlar);

// Şirkete göre kısıtlı alanları getir
router.get('/sirket/:sirket_id', kisitliAlanController.getKisitliAlanlarBySirket);

// Tek kısıtlı alan getir
router.get('/:alan_id', kisitliAlanController.getKisitliAlanById);

// Kısıtlı alan oluştur
router.post('/', kisitliAlanController.createKisitliAlan);

// Kısıtlı alan güncelle
router.put('/:alan_id', kisitliAlanController.updateKisitliAlan);

// Kısıtlı alan sil
router.delete('/:alan_id', kisitliAlanController.deleteKisitliAlan);

module.exports = router;

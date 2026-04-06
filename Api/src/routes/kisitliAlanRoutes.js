const express = require('express');
const router = express.Router();
const kisitliAlanController = require('../controllers/kisitliAlanController');

// Tüm kısıtlı alanları listele
router.get('/', kisitliAlanController.getAllKisitliAlanlar);

// Aktif kısıtlı alanları getir (/:alan_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', kisitliAlanController.getAktifKisitliAlanlar);

// Şirkete göre kısıtlı alanları getir (/:alan_id'dan ÖNCE tanımlanmalı!)
router.get('/sirket/:sirket_id', kisitliAlanController.getKisitliAlanlarBySirket);

// Adres arama endpoint'i (/:alan_id'dan ÖNCE tanımlanmalı!)
router.get('/geocode/search', kisitliAlanController.searchAddress);

// Adres arama - birden fazla sonuç (/:alan_id'dan ÖNCE tanımlanmalı!)
router.get('/geocode/search-multiple', kisitliAlanController.searchAddressMultiple);

// Adres ile kısıtlı alan oluştur (/:alan_id'dan ÖNCE tanımlanmalı!)
router.post('/from-address', kisitliAlanController.createKisitliAlanFromAddress);

// Adres ile kısıtlı alan oluştur - Sınır/Boundary ile (Profesyonel) (/:alan_id'dan ÖNCE!)
router.post('/from-address/boundary', kisitliAlanController.createKisitliAlanFromAddressWithBoundary);

// Tek kısıtlı alan getir
router.get('/:alan_id', kisitliAlanController.getKisitliAlanById);

// Kısıtlı alan oluştur (manuel koordinat ile)
router.post('/', kisitliAlanController.createKisitliAlan);

// Kısıtlı alan güncelle
router.put('/:alan_id', kisitliAlanController.updateKisitliAlan);

// Kısıtlı alan sil
router.delete('/:alan_id', kisitliAlanController.deleteKisitliAlan);

module.exports = router;

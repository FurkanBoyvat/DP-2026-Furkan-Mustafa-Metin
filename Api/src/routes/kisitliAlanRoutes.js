const express = require('express');
const router = express.Router();
const kisitliAlanController = require('../controllers/kisitliAlanController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

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

// --- Yetki Gerektiren İşlemler ---

// Adres ile kısıtlı alan oluştur
router.post('/from-address', verifySirketYoneticisi, kisitliAlanController.createKisitliAlanFromAddress);

// Adres ile kısıtlı alan oluştur - Sınır/Boundary ile (Profesyonel)
router.post('/from-address/boundary', verifySirketYoneticisi, kisitliAlanController.createKisitliAlanFromAddressWithBoundary);

// Tek kısıtlı alan getir
router.get('/:alan_id', kisitliAlanController.getKisitliAlanById);

// Kısıtlı alan oluştur (manuel koordinat ile)
router.post('/', verifySirketYoneticisi, kisitliAlanController.createKisitliAlan);

// Kısıtlı alan güncelle
router.put('/:alan_id', verifySirketYoneticisi, kisitliAlanController.updateKisitliAlan);

// Kısıtlı alan sil
router.delete('/:alan_id', verifySirketYoneticisi, kisitliAlanController.deleteKisitliAlan);

module.exports = router;

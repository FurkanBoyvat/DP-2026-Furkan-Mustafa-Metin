const express = require('express');
const router = express.Router();
const sirketDetayController = require('../controllers/sirketDetayController');

// Tüm şirket detaylarını listele
router.get('/', sirketDetayController.getAllSirketDetaylari);

// Şirkete göre detayları getir (/:detay_id'dan ÖNCE tanımlanmalı!)
router.get('/sirket/:sirket_id', sirketDetayController.getSirketDetaylariBySirket);

// Şirkete göre tek detay getir
router.get('/sirket/:sirket_id/single', sirketDetayController.getSirketDetayiBySirketSingle);

// Aktif şirket detaylarını getir
router.get('/aktif/all', sirketDetayController.getAllSirketDetaylari);

// Tek şirket detayı getir
router.get('/:detay_id', sirketDetayController.getSirketDetayiById);

// Şirket detayı oluştur
router.post('/', sirketDetayController.createSirketDetayi);

// Şirket detayı güncelle
router.put('/:detay_id', sirketDetayController.updateSirketDetayi);

// Şirket detayı sil
router.delete('/:detay_id', sirketDetayController.deleteSirketDetayi);

module.exports = router;

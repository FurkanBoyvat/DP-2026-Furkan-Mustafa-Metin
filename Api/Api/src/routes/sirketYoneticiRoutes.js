const express = require('express');
const router = express.Router();
const sirketYoneticiController = require('../controllers/sirketYoneticiController');

// Tüm şirket yöneticilerini listele
router.get('/', sirketYoneticiController.getAllSirketYoneticileri);

// Aktif şirket yöneticilerini getir (/:yonetici_id'dan ÖNCE tanımlanmalı!)
router.get('/aktif/all', sirketYoneticiController.getAktifSirketYoneticileri);

// Şirkete göre yöneticileri getir
router.get('/sirket/:sirket_id', sirketYoneticiController.getSirketYoneticileriBySirket);

// Kullanıcıya göre yönetici atamalarını getir
router.get('/kullanici/:kullanici_id', sirketYoneticiController.getSirketYoneticileriByKullanici);

// Tek şirket yöneticisi getir
router.get('/:yonetici_id', sirketYoneticiController.getSirketYoneticisiById);

// Şirket yöneticisi ataması oluştur
router.post('/', sirketYoneticiController.createSirketYoneticisi);

// Şirket yöneticisi güncelle
router.put('/:yonetici_id', sirketYoneticiController.updateSirketYoneticisi);

// Şirket yöneticisi atamasını sil
router.delete('/:yonetici_id', sirketYoneticiController.deleteSirketYoneticisi);

module.exports = router;

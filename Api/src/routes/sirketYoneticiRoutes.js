const express = require('express');
const router = express.Router();
const sirketYoneticiController = require('../controllers/sirketYoneticiController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

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

// --- Sadece Admin Yetkisi Gerektiren İşlemler ---

// Şirket yöneticisi ataması oluştur
router.post('/', verifyAdmin, sirketYoneticiController.createSirketYoneticisi);

// Şirket yöneticisi güncelle
router.put('/:yonetici_id', verifyAdmin, sirketYoneticiController.updateSirketYoneticisi);

// Şirket yöneticisi atamasını sil
router.delete('/:yonetici_id', verifyAdmin, sirketYoneticiController.deleteSirketYoneticisi);

module.exports = router;

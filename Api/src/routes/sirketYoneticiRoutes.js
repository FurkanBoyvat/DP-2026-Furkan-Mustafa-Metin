const express = require('express');
const router = express.Router();
const sirketYoneticiController = require('../controllers/sirketYoneticiController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm şirket yöneticilerini listele
router.get('/', verifyToken, sirketYoneticiController.getAllSirketYoneticileri);

// Tek şirket yöneticisi getir
router.get('/:yonetici_atama_id', verifyToken, sirketYoneticiController.getSirketYoneticisiById);

// Şirket yöneticisi ataması oluştur
router.post('/', verifyToken, sirketYoneticiController.createSirketYoneticisi);

// Şirket yöneticisi güncelle
router.put('/:yonetici_atama_id', verifyToken, sirketYoneticiController.updateSirketYoneticisi);

// Şirket yöneticisi atamasını sil
router.delete('/:yonetici_atama_id', verifyToken, sirketYoneticiController.deleteSirketYoneticisi);

// Şirkete göre yöneticileri getir
router.get('/sirket/:sirket_id', verifyToken, sirketYoneticiController.getSirketYoneticileriBySirket);

// Kullanıcıya göre yönetici atamalarını getir
router.get('/kullanici/:yonetici_id', verifyToken, sirketYoneticiController.getSirketYoneticileriByKullanici);

// Aktif şirket yöneticilerini getir
router.get('/aktif/all', verifyToken, sirketYoneticiController.getAktifSirketYoneticileri);

module.exports = router;

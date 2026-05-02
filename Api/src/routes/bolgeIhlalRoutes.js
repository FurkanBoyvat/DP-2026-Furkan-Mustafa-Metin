const express = require('express');
const router = express.Router();
const bolgeIhlalController = require('../controllers/bolgeIhlalController');
const { verifyToken, verifySirketYoneticisi } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Tüm bölge ihlal kayıtlarını listele
router.get('/', bolgeIhlalController.getAllBolgeIhlalleri);

// Çözülmeyen ihlal kayıtlarını getir (/:ihlal_id'dan ÖNCE tanımlanmalı!)
router.get('/cozulmemis/all', bolgeIhlalController.getCozulmemisIhlaller);

// Araca göre bölge ihlal kayıtlarını getir
router.get('/arac/:arac_id', bolgeIhlalController.getBolgeIhlalleriByArac);

// Tarih aralığına göre bölge ihlal kayıtlarını getir
router.get('/tarih/aralik', bolgeIhlalController.getBolgeIhlalleriByTarihAraligi);

// Tek bölge ihlal kaydı getir
router.get('/:ihlal_id', bolgeIhlalController.getBolgeIhlaliById);

// --- Yetki Gerektiren İşlemler ---

// Bölge ihlal kaydı oluştur
router.post('/', bolgeIhlalController.createBolgeIhlali);

// Bölge ihlal kaydı güncelle
router.put('/:ihlal_id', verifySirketYoneticisi, bolgeIhlalController.updateBolgeIhlali);

// Bölge ihlal kaydı sil
router.delete('/:ihlal_id', verifySirketYoneticisi, bolgeIhlalController.deleteBolgeIhlali);

module.exports = router;

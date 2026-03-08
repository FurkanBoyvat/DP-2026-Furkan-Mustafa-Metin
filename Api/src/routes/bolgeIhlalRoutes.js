const express = require('express');
const router = express.Router();
const bolgeIhlalController = require('../controllers/bolgeIhlalController');

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

// Bölge ihlal kaydı oluştur
router.post('/', bolgeIhlalController.createBolgeIhlali);

// Bölge ihlal kaydı güncelle
router.put('/:ihlal_id', bolgeIhlalController.updateBolgeIhlali);

// Bölge ihlal kaydı sil
router.delete('/:ihlal_id', bolgeIhlalController.deleteBolgeIhlali);

module.exports = router;

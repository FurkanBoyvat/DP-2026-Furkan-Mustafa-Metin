const express = require('express');
const router = express.Router();
const raporController = require('../controllers/raporController');

// Tüm raporları listele
router.get('/', raporController.getAllRaporlar);

// Şirkete göre raporları getir (/:rapor_id'dan ÖNCE tanımlanmalı!)
router.get('/sirket/:sirket_id', raporController.getRaporlarBySirket);

// Tarih aralığına göre raporları getir
router.get('/tarih/aralik', raporController.getRaporlarByTarihAraligi);

// Tek rapor getir
router.get('/:rapor_id', raporController.getRaporById);

// Rapor oluştur
router.post('/', raporController.createRapor);

// Rapor güncelle
router.put('/:rapor_id', raporController.updateRapor);

// Rapor sil
router.delete('/:rapor_id', raporController.deleteRapor);

module.exports = router;

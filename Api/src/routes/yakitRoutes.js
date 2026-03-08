const express = require('express');
const router = express.Router();
const yakitController = require('../controllers/yakitController');

// Tüm yakıt tüketim kayıtlarını listele
router.get('/', yakitController.getAllYakitKayitlari);

// Aylık yakıt raporu (/:kayit_id'dan ÖNCE tanımlanmalı!)
router.get('/rapor/aylik', yakitController.getAylikYakitRaporu);

// Araca göre yakıt kayıtlarını getir
router.get('/arac/:arac_id', yakitController.getYakitKayitlariByArac);

// Aracın ortalama yakıt tüketimini hesapla
router.get('/arac/:arac_id/ortalama', yakitController.getOrtalamaYakitTuketimi);

// Tarih aralığına göre yakıt kayıtlarını getir
router.get('/tarih/aralik', yakitController.getYakitKayitlariByTarihAraligi);

// Tek yakıt kaydı getir
router.get('/:kayit_id', yakitController.getYakitKaydiById);

// Yakıt kaydı oluştur
router.post('/', yakitController.createYakitKaydi);

// Yakıt kaydı güncelle
router.put('/:kayit_id', yakitController.updateYakitKaydi);

// Yakıt kaydı sil
router.delete('/:kayit_id', yakitController.deleteYakitKaydi);

module.exports = router;

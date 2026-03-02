const express = require('express');
const router = express.Router();
const yakitController = require('../controllers/yakitController');
const { verifyToken } = require('../middleware/authMiddleware');

// Tüm yakıt tüketim kayıtlarını listele
router.get('/', verifyToken, yakitController.getAllYakitKayitlari);

// Tek yakıt kaydı getir
router.get('/:kayit_id', verifyToken, yakitController.getYakitKaydiById);

// Yakıt kaydı oluştur
router.post('/', verifyToken, yakitController.createYakitKaydi);

// Yakıt kaydı güncelle
router.put('/:kayit_id', verifyToken, yakitController.updateYakitKaydi);

// Yakıt kaydı sil
router.delete('/:kayit_id', verifyToken, yakitController.deleteYakitKaydi);

// Araca göre yakıt kayıtlarını getir
router.get('/arac/:arac_id', verifyToken, yakitController.getYakitKayitlariByArac);

// Tarih aralığına göre yakıt kayıtlarını getir
router.get('/tarih/aralik', verifyToken, yakitController.getYakitKayitlariByTarihAraligi);

// Aracın ortalama yakıt tüketimini hesapla
router.get('/arac/:arac_id/ortalama', verifyToken, yakitController.getOrtalamaYakitTuketimi);

// Aylık yakıt raporu
router.get('/rapor/aylik', verifyToken, yakitController.getAylikYakitRaporu);

module.exports = router;

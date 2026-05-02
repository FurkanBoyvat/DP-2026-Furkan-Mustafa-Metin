const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Tüm rotalar için token doğrulaması zorunlu
router.use(verifyToken);

// Şoförleri getir (/:kullanici_id'dan ÖNCE tanımlanmalı!)
router.get('/soforler/all', userController.getAllDrivers);
router.get('/soforler/:kullanici_id/istatistikler', userController.getSoforIstatistikleri);

// Kullanıcıları şirkete göre getir (/:kullanici_id'dan ÖNCE tanımlanmalı!)
router.get('/sirket/:sirket_id', userController.getUsersByCompany);

// Tek kullanıcı getir
router.get('/:kullanici_id', userController.getUserById);

// --- Sadece Admin Tarafından Yapılabilecek İşlemler ---

// Tüm kullanıcıları listele
router.get('/', verifyAdmin, userController.getAllUsers);

// Kullanıcı oluştur
router.post('/', verifyAdmin, userController.createUser);

// Kullanıcı güncelle
router.put('/:kullanici_id', userController.updateUser);

// Kullanıcı sil
router.delete('/:kullanici_id', verifyAdmin, userController.deleteUser);

// Kullanıcı rolünü güncelle
router.put('/:kullanici_id/rol', verifyAdmin, userController.updateUserRole);

module.exports = router;

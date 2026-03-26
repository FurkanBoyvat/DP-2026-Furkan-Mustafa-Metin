const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Tüm kullanıcıları listele
router.get('/', userController.getAllUsers);

// Şoförleri getir (/:kullanici_id'dan ÖNCE tanımlanmalı!)
router.get('/soforler/all', userController.getAllDrivers);

// Kullanıcıları şirkete göre getir (/:kullanici_id'dan ÖNCE tanımlanmalı!)
router.get('/sirket/:sirket_id', userController.getUsersByCompany);

// Tek kullanıcı getir
router.get('/:kullanici_id', userController.getUserById);

// Kullanıcı oluştur
router.post('/', userController.createUser);

// Kullanıcı güncelle
router.put('/:kullanici_id', userController.updateUser);

// Kullanıcı sil
router.delete('/:kullanici_id', userController.deleteUser);

// Kullanıcı rolünü güncelle
router.put('/:kullanici_id/rol', userController.updateUserRole);

module.exports = router;

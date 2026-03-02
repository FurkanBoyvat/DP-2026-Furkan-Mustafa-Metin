const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Tüm kullanıcıları listele (Admin)
router.get('/', userController.getAllUsers);

// Tek kullanıcı getir
router.get('/:kullanici_id', verifyToken, userController.getUserById);

// Kullanıcı oluştur (Admin)
router.post('/', verifyToken, verifyAdmin, userController.createUser);

// Kullanıcı güncelle
router.put('/:kullanici_id', verifyToken, userController.updateUser);

// Kullanıcı sil (Admin)
router.delete('/:kullanici_id', verifyToken, verifyAdmin, userController.deleteUser);

// Kullanıcı rolünü güncelle (Admin)
router.put('/:kullanici_id/rol', verifyToken, verifyAdmin, userController.updateUserRole);

// Kullanıcıları şirkete göre getir
router.get('/sirket/:sirket_id', verifyToken, userController.getUsersByCompany);

// Şoförleri getir
router.get('/soforler/all', verifyToken, userController.getAllDrivers);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/profile', authController.profil);
router.put('/profile', authController.updateProfile);
router.put('/change-password', authController.changePassword);

// Şifre Sıfırlama
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;

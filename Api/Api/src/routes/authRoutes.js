const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Giriş
router.post('/login', authController.login);

// Kayıt
router.post('/register', authController.register);

// Profil
router.get('/profile', authController.profil);

module.exports = router;

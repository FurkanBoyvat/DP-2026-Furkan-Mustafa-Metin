const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

// Giriş
router.post('/login', authController.login);

// Kayıt
router.post('/register', authController.register);

// Profil (Korumalı)
router.get('/profile', verifyToken, authController.profil);

module.exports = router;

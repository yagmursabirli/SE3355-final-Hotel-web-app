// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Kayıt rotası
router.post('/register', authController.registerUser);

// Giriş rotası
router.post('/login', authController.loginUser);

module.exports = router;
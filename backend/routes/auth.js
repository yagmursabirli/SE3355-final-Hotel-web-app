// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Kayıt
router.post('/register', authController.registerUser);

// Giriş 
router.post('/login', authController.loginUser);

router.get('/google',
    authController.googleAuth 
);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:8080/login?error=auth_failed' }), 
    authController.googleAuthCallback 
);

router.post('/logout', authController.logout);

module.exports = router;
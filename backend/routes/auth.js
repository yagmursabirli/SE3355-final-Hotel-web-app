// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('passport');

// Kayıt rotası
router.post('/register', authController.registerUser);

// Giriş rotası
router.post('/login', authController.loginUser);

router.get('/google',
    authController.googleAuth // authController'daki passport.authenticate çağrısı
);
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:8080/login?error=auth_failed' }), // Kimlik doğrulama başarısız olursa frontend'deki login sayfasına yönlendir
    authController.googleAuthCallback // Kimlik doğrulama başarılı olursa bu controller'ı çalıştır
);

router.post('/logout', authController.logout);

module.exports = router;
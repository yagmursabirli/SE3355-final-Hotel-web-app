// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Veritabanı bağlantı havuzunuz
const bcrypt = require('bcrypt'); // Şifre hash'leme için
const jwt = require('jsonwebtoken'); // JWT oluşturma ve doğrulama için
require('dotenv').config(); // Ortam değişkenlerini yüklemek için (eğer .env kullanıyorsanız)

// Rota dosyalarını içeri aktar
const authRoutes = require('./routes/auth'); // Auth rotaları (register/login)
const hotelRoutes = require('./routes/hotels'); // Otel rotaları

const app = express();
const port = process.env.PORT || 3000;

// JWT için gizli anahtar. .env dosyasından alınması önerilir.
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; // LÜTFEN GÜVENLİ BİR ANAHTAR KULLANIN!

// Middleware'ler
app.use(cors()); // CORS hatalarını önlemek için
app.use(express.json()); // JSON formatındaki istek gövdelerini parse etmek için

// Hoş Geldiniz Mesajı (API'nin çalıştığını test etmek için)
app.get('/', (req, res) => {
  res.send('Hotel Booking Backend API is running!');
});

// Rotaları kullan
app.use('/api/auth', authRoutes); // Tüm auth rotaları /api/auth altında olacak
app.use('/api/hotels', hotelRoutes); // Tüm otel rotaları /api/hotels altında olacak

// Kullanıcı Kayıt Rotası (Bu kısım artık auth.js içinde)
// app.post('/api/register', async (req, res) => { ... });

// Kullanıcı Giriş Rotası (Bu kısım artık auth.js içinde)
// app.post('/api/login', async (req, res) => { ... });

// Sunucuyu Başlatma
app.listen(port, () => {
  console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor`);
});
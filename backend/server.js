// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db'); // Veritabanı bağlantı havuzunuz
const bcrypt = require('bcrypt'); // Şifre hash'leme için
const jwt = require('jsonwebtoken'); // JWT oluşturma ve doğrulama için
require('dotenv').config(); // Ortam değişkenlerini yüklemek için
const path = require('path'); // Statik dosyalar veya diğer yol işlemleri için (şimdilik auth için direkt kullanılmıyor)

// PASSPORT VE SESSION İÇİN GEREKLİ MODÜLLER
const session = require('express-session');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 3000;

// JWT için gizli anahtar. .env dosyasından alınması önerilir.
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; // LÜTFEN GÜVENLİ BİR ANAHTAR KULLANIN!

// SESSION İÇİN GİZLİ ANAHTAR. .env dosyasından alınması önerilir.
const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_session_key'; // LÜTFEN ÇOK GÜVENLİ BİR ANAHTAR KULLANIN!

// --- MİDDLEWARE'LER ---

// CORS ayarları: Frontend'den gelen isteklerin kabul edilmesi ve çerezlerin gönderilmesi için kritik
app.use(cors({
    origin: 'http://localhost:8080', // Vue frontend'inizin çalıştığı adres
    credentials: true, // Çerezlerin (session ID) frontend'e/backend'e gönderilmesini sağlar
}));

// JSON formatındaki istek gövdelerini parse etmek için
app.use(express.json());

// SESSION MİDDLEWARE'İ (Passport için gerekli)
app.use(session({
    secret: SESSION_SECRET, // Oturum ID'lerini şifrelemek için kullanılan anahtar
    resave: false, // Oturumu her istekte kaydetme (performans için false)
    saveUninitialized: false, // Başlatılmamış oturumları kaydetme
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Üretimde HTTPS gerektirir
        httpOnly: true, // Tarayıcı tarafında JS erişimini engeller (güvenlik)
        maxAge: 24 * 60 * 60 * 1000 // Oturum süresi: 1 gün (milisaniye cinsinden)
    }
}));

// PASSPORT MİDDLEWARE'LERİ
app.use(passport.initialize()); // Passport'ı başlatır
app.use(passport.session());   // Passport'ın oturum yönetimini etkinleştirir

// Passport Kullanıcı Serileştirme/Deserileştirme Ayarları
// Bu ayarlar, kullanıcının oturumda nasıl saklanacağını ve geri alınacağını Passport'a söyler.
passport.serializeUser((user, done) => {
    // Oturumda sadece kullanıcının ID'sini saklarız (küçük boyutlu)
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    // Oturumdaki ID'yi kullanarak veritabanından kullanıcının tam bilgilerini alırız
    try {
        const userResult = await pool.query('SELECT id, first_name, last_name, email, profile_image_base64  FROM users WHERE id = $1', [id]);
        if (userResult.rows.length > 0) {
            // Kullanıcı bulunursa, user objesini Passport'a geri verir
            done(null, userResult.rows[0]);
        } else {
            // Kullanıcı bulunamazsa
            done(null, false);
        }
    } catch (err) {
        // Hata olursa
        done(err, false);
    }
});


// --- ROTA DOSYALARINI İÇERİ AKTAR ---
const authRoutes = require('./routes/auth'); // Auth rotaları (register/login/google-auth)
const hotelRoutes = require('./routes/hotels'); // Otel rotaları

// Hoş Geldiniz Mesajı (API'nin çalıştığını test etmek için)
app.get('/', (req, res) => {
    res.send('Hotel Booking Backend API is running!');
});

// --- ROTLARI KULLAN ---
// /api/auth altında authRoutes'taki tüm rotaları kullan (örn. /api/auth/register, /api/auth/login, /api/auth/google)
app.use('/api/auth', authRoutes);
// /api/hotels altında hotelRoutes'taki tüm rotaları kullan (örn. /api/hotels/)
app.use('/api/hotels', hotelRoutes);


// --- SUNUCUYU BAŞLATMA ---
app.listen(port, () => {
    console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor`);
    console.log('Veritabanı bağlantı denemesi: Başarılı olursa hata görmezsiniz.');
    // İlk bağlantıyı test etmek için hafif bir sorgu gönderebiliriz (isteğe bağlı)
    pool.query('SELECT 1+1 AS solution')
        .then(res => console.log('Veritabanı bağlantı testi başarılı:', res.rows[0].solution))
        .catch(err => console.error('Veritabanı bağlantı testi hatası:', err.message));
});
// api/index.js

// 1. Gerekli tüm modülleri require ile içeri aktarın
//    Bu, backend/server.js dosyanızın başındaki require satırlarının aynısı olmalı.
const express = require('express');
const cors = require('cors');
const pool = require('../backend/db'); // db.js yolunu kontrol edin, api klasöründen 2 seviye yukarı
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// dotenv config'i burada farklı olacak, aşağıdaki 2. maddeye bakın
require('dotenv').config({ path: '../backend/.env' }); // .env dosyasının yolunu api klasörüne göre düzeltin

const session = require('express-session');
const passport = require('passport');

// 2. Express uygulamasını başlatın
const app = express();

// JWT_SECRET ve SESSION_SECRET değişkenlerini process.env'den çekin.
// Artık varsayılan 'your_super_secret_jwt_key_here' ve 'your_secret_session_key' değerlerine ihtiyacınız yok.
const JWT_SECRET = process.env.JWT_SECRET;
const SESSION_SECRET = process.env.SESSION_SECRET;

// 3. Middleware'ları kullanın (app.use ile başlayanlar)
//    CORS ayarını dinamik olarak Vercel'deki frontend URL'ine göre güncelleyin.
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Vercel'e deploy ettikten sonra burayı frontend URL'i ile dolduracaksınız
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

// 4. Passport serialize/deserialize metodlarını ekleyin
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userResult = await pool.query('SELECT id, first_name, last_name, email, profile_image_base64 FROM users WHERE id = $1', [id]);
        if (userResult.rows.length > 0) {
            done(null, userResult.rows[0]);
        } else {
            done(null, false);
        }
    } catch (err) {
        done(err, false);
    }
});

// 5. Rota dosyalarını içeri aktarın ve kullanın.
//    Yol tanımlamalarını (require('./routes/auth')) api klasörüne göre düzeltmeniz gerekiyor.
//    api klasörü, routes klasörünün bir üst dizininin içindeki 'backend' klasörüyle aynı seviyede olduğu için '../backend/routes/' kullanıyoruz.
const authRoutes = require('../backend/routes/auth');
const hotelRoutes = require('../backend/routes/hotels');

// Genel bir API ana rotası (isteğe bağlı, API'nizin çalıştığını görmek için)
app.get('/', (req, res) => {
    res.send('Hotel Booking Backend API is running on Vercel!');
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);

// 6. Express uygulamasını dışa aktarın (bu kısım en önemlisi)
//    Vercel sunucusuz fonksiyonları, Express uygulamanızın dışa aktarılmasını bekler.
//    app.listen() metodunu KULLANMAYIN!
module.exports = app;

// console.log ve pool.query test satırları artık burada olmayacak
// Çünkü app.listen() ile birlikte çalışıyorlardı ve sunucusuz ortamda farklı yönetilirler.
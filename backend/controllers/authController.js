// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport'); // Passport'ı import et
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; // Ortam değişkeninden alınmalı!

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/api/auth/google/callback';


passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
    passReqToCallback: true // req objesini callback'e iletmek için (isteğe bağlı, ama daha esneklik sağlar)
},
async (request, accessToken, refreshToken, profile, done) => {
    try {
        // Google'dan gelen kullanıcı bilgilerini konsola yazdır (debug için)
        console.log('Google Profil Bilgileri:', profile);

        // Kullanıcının e-posta adresini al (e-posta adresi her zaman gelmeyebilir, kontrol et)
        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

        if (!email) {
            console.error('Google kimlik doğrulamasından e-posta alınamadı.');
            return done(new Error('Google hesabından e-posta bilgisi alınamadı.'), false);
        }

        // Veritabanında bu e-posta ile kayıtlı kullanıcı var mı kontrol et
        let userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = userResult.rows[0];

        if (user) {
            // Kullanıcı zaten varsa, mevcut kullanıcıyı döndür
            console.log('Mevcut Google kullanıcısı giriş yaptı:', user.email);
            // İsteğe bağlı: Eğer Google'dan gelen bilgiler farklıysa, kullanıcı bilgilerini güncelle
            await pool.query(
                'UPDATE users SET first_name = $1, last_name = $2 WHERE id = $3',
                [profile.name.givenName, profile.name.familyName, user.id]
            );
            userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            user = userResult.rows[0];

        } else {
            // Kullanıcı yoksa, yeni bir kullanıcı kaydet
            console.log('Yeni Google kullanıcısı kaydediliyor:', email);
            const newUser = await pool.query(
                'INSERT INTO users (first_name, last_name, email, google_id, profile_image_base64) VALUES ($1, $2, $3, $4, NULL) RETURNING id, first_name, last_name, email,  profile_image_base64',
                [profile.name.givenName, profile.name.familyName, email, profile.id]
            );
            user = newUser.rows[0];
        }

        // Passport'a başarılı bir kimlik doğrulama olduğunu bildir
        // Bu user objesi serializeUser'a gönderilecek
        done(null, user);

    } catch (error) {
        console.error('Google kimlik doğrulama hatası:', error);
        done(error, false);
    }
}));

// Kullanıcı Kayıt İşlemi
exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, country, city, profile_image_base64 } = req.body;

    console.log('Register endpointine gelen veri:', req.body); // Debug için

    if (!firstName || !lastName || !email || !password || !country || !city) {
        console.error('Kayıt hatası: Eksik veya boş alanlar tespit edildi!');
        return res.status(400).json({ message: 'Lütfen tüm zorunlu alanları doldurun.' });
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+={}[\]\\|:;"'<>,.?/~`]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ message: 'Şifre en az 8 karakter, 1 sayı ve 1 alfasayısal olmayan karakter içermeli.' });
    }

    try {
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ message: 'Bu e-posta adresi zaten kayıtlı.' });
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        const newUser = await pool.query(
            'INSERT INTO users (first_name, last_name, email, password_hash, country, city, profile_image_base64) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, first_name, email, country, city, profile_image_base64',
            [firstName, lastName, email, passwordHash, country, city, profile_image_base64 || null]
        );

        res.status(201).json({ message: 'Kayıt başarılı!', user: newUser.rows[0] });

    } catch (error) {
        console.error('Kayıt sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' });
    }
};

// Kullanıcı Giriş İşlemi
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    console.log('Login endpointine gelen veri:', req.body); // Debug için

    if (!email || !password) {
        return res.status(400).json({ message: 'Lütfen e-posta ve şifreyi girin.' });
    }

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
        }

        const user = userResult.rows[0];
        if (user.password_hash) {
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
            }
        } else {
            // Eğer password_hash yoksa (örn: Google ile kayıt olmuşsa), bu yolla giriş yapamaz
            return res.status(401).json({ message: 'Bu e-posta adresi Google ile kayıtlı. Lütfen Google ile giriş yapın.' });
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({
            message: 'Giriş başarılı!',
            token,
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                country: user.country,
                city: user.city,
                profile_image_base64: user.profile_image_base64 || null
            }
        });

    } catch (error) {
        console.error('Giriş sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' });
    }
};

// Google Auth'u Başlatma (Auth rotasında kullanılacak)
exports.googleAuth = passport.authenticate('google', { scope: ['profile', 'email'] });

// Google Auth Callback (Auth rotasında kullanılacak)
exports.googleAuthCallback = (req, res) => {
    // Passport tarafından başarıyla kimlik doğrulandıktan sonra buraya geliriz
    // req.user, serializeUser ve deserializeUser tarafından oluşturulan kullanıcı objesidir.

    if (!req.user) {
        // Eğer bir nedenle kullanıcı objesi yoksa (örn: kimlik doğrulama başarısız oldu)
        return res.redirect('/login?error=Google authentication failed'); // Frontend'e hata ile yönlendir
    }

    // Kendi JWT'mizi oluştur ve frontend'e yönlendirerek gönder
    const token = jwt.sign(
        { userId: req.user.id, email: req.user.email, firstName: req.user.first_name, lastName: req.user.last_name },
        JWT_SECRET,
        { expiresIn: '1h' }
    );

    // Başarılı giriş sonrası kullanıcıyı frontend'e JWT ile yönlendir
    // Token'ı URL parametresi olarak gönderiyoruz. Frontend bunu yakalayacak.
    const redirectUrl = `http://localhost:8080/login?token=${token}&firstName=${req.user.first_name}&email=${req.user.email}`;
    res.redirect(redirectUrl);
};

// Kullanıcı çıkışı (Logout) için bir rota
exports.logout = (req, res) => {
    req.logout((err) => { // Passport'ın logout fonksiyonu
        if (err) {
            console.error('Logout hatası:', err);
            return res.status(500).json({ message: 'Çıkış sırasında hata oluştu.' });
        }
        req.session.destroy((err) => { // Oturumu tamamen sonlandır
            if (err) {
                console.error('Oturum sonlandırma hatası:', err);
                return res.status(500).json({ message: 'Oturum sonlandırma sırasında hata oluştu.' });
            }
            res.status(200).json({ message: 'Başarıyla çıkış yapıldı.' });
        });
    });
};
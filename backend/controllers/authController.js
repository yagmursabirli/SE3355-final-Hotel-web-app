// backend/controllers/authController.js
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; // Ortam değişkeninden alınmalı!

// Kullanıcı Kayıt İşlemi
exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, password, country, city } = req.body;

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
            'INSERT INTO users (first_name, last_name, email, password_hash, country, city) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, first_name, email, country, city',
            [firstName, lastName, email, passwordHash, country, city]
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
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Geçersiz e-posta veya şifre.' });
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
            }
        });

    } catch (error) {
        console.error('Giriş sırasında hata oluştu:', error);
        res.status(500).json({ message: 'Sunucu hatası oluştu. Lütfen tekrar deneyin.' });
    }
};
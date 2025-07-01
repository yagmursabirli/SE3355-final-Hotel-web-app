// backend/server.js
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 
require('dotenv').config(); 
const path = require('path'); 


const session = require('express-session');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 3000;


const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_here'; 


const SESSION_SECRET = process.env.SESSION_SECRET || 'your_secret_session_key'; 

app.use(cors({
    origin: process.env.CORS_ORIGIN,
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

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const userResult = await pool.query('SELECT id, first_name, last_name, email, profile_image_base64  FROM users WHERE id = $1', [id]);
        if (userResult.rows.length > 0) {
            done(null, userResult.rows[0]);
        } else {
            done(null, false);
        }
    } catch (err) {
        done(err, false);
    }
});

const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels'); 

app.get('/', (req, res) => {
    res.send('Hotel Booking Backend API is running!');
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);

app.listen(port, () => {
    console.log(`Backend sunucusu http://localhost:${port} adresinde çalışıyor`);
    console.log('Veritabanı bağlantı denemesi: Başarılı olursa hata görmezsiniz.');
    pool.query('SELECT 1+1 AS solution')
        .then(res => console.log('Veritabanı bağlantı testi başarılı:', res.rows[0].solution))
        .catch(err => console.error('Veritabanı bağlantı testi hatası:', err.message));
});
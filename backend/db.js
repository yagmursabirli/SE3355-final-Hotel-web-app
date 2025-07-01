// backend/db.js
require('dotenv').config(); // .env dosyasındaki değişkenleri yükle

const { Pool } = require('pg');


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Sadece connectionString kullanın
  ssl: {
    rejectUnauthorized: false
  }
});

pool.on('connect', () => {
  console.log('Veritabanına başarıyla bağlandı!');
});

pool.on('error', (err) => {
  console.error('Veritabanı bağlantı hatası:', err.message); 
  process.exit(1); 
});

module.exports = pool;
// backend/db.js
require('dotenv').config(); // .env dosyasındaki değişkenleri yükle

const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
  // SSL/TLS bağlantısı için eklenen yapılandırma
  ssl: {
    rejectUnauthorized: false // Render.com gibi bazı hostingler için gerekli olabilir
  }
});

pool.on('connect', () => {
  console.log('Veritabanına başarıyla bağlandı!');
});

pool.on('error', (err) => {
  console.error('Veritabanı bağlantı hatası:', err.message); // Hata mesajını daha anlaşılır yapalım
  process.exit(1); // Hata durumunda uygulamayı kapat
});

module.exports = pool;
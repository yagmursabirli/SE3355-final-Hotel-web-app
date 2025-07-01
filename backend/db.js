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
    connectionString: process.env.DATABASE_URL, 
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
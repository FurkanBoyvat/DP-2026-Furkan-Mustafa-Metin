const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:3803@localhost:5432/arac_takip_sistemi',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL veritabanına bağlantı başarıyla kuruldu!');
});

pool.on('error', (err) => {
  console.error('❌ PostgreSQL Bağlantı Hatası:', err);
  process.exit(-1);
});

module.exports = pool;

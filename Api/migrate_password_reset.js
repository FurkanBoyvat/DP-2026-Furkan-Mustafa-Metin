/**
 * Migration: sifre_sifirlama_tokenleri tablosunu oluştur
 */
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi' });

async function migrate() {
  const client = await pool.connect();
  try {
    const exists = await client.query(`SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema='public' AND table_name='sifre_sifirlama_tokenleri')`);
    if (exists.rows[0].exists) { console.log('⚠️  Tablo zaten mevcut.'); return; }

    await client.query(`
      CREATE TABLE sifre_sifirlama_tokenleri (
        token_id       SERIAL PRIMARY KEY,
        kullanici_id   INTEGER NOT NULL,
        token          VARCHAR(128) NOT NULL UNIQUE,
        son_kullanma   TIMESTAMP NOT NULL,
        kullanildi     BOOLEAN DEFAULT false,
        olusturulma    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id) ON DELETE CASCADE
      );
    `);
    await client.query(`CREATE INDEX idx_sifre_token ON sifre_sifirlama_tokenleri(token);`);
    await client.query(`CREATE INDEX idx_sifre_kullanici ON sifre_sifirlama_tokenleri(kullanici_id);`);
    console.log('✅ sifre_sifirlama_tokenleri tablosu oluşturuldu.');
  } finally {
    client.release();
    await pool.end();
  }
}
migrate().catch(console.error);

const pool = require('./src/config/database');

async function migrate() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS sofor_yakit_kayitlari (
                kayit_id SERIAL PRIMARY KEY,
                kullanici_id INTEGER NOT NULL REFERENCES kullanicilar(kullanici_id) ON DELETE CASCADE,
                ay INTEGER NOT NULL CHECK (ay BETWEEN 1 AND 12),
                yil INTEGER NOT NULL,
                aylik_km DECIMAL(10,2) NOT NULL,
                aylik_yakit_tutar DECIMAL(10,2) NOT NULL,
                notlar TEXT,
                olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(kullanici_id, ay, yil)
            )
        `);
        console.log('✅ sofor_yakit_kayitlari tablosu başarıyla oluşturuldu');
    } catch (error) {
        console.error('❌ Hata:', error.message);
    } finally {
        process.exit();
    }
}

migrate();

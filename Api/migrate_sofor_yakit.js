const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi',
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Migration başlıyor: sofor_yakit_kayitlari tablosu...\n');

    await client.query('BEGIN');

    // Tablo zaten var mı kontrol et
    const checkResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sofor_yakit_kayitlari'
      );
    `);

    if (checkResult.rows[0].exists) {
      console.log('⚠️  sofor_yakit_kayitlari tablosu zaten mevcut. Migration atlandı.');
      await client.query('ROLLBACK');
      return;
    }

    // Tabloyu oluştur
    await client.query(`
      CREATE TABLE sofor_yakit_kayitlari (
        kayit_id        SERIAL PRIMARY KEY,
        kullanici_id    INTEGER NOT NULL,
        ay              INTEGER NOT NULL CHECK (ay BETWEEN 1 AND 12),
        yil             INTEGER NOT NULL,
        aylik_km        DECIMAL(10, 2) DEFAULT 0,
        aylik_yakit_tutar DECIMAL(10, 2) DEFAULT 0,
        notlar          TEXT,
        olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        guncelleme_tarihi  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id) ON DELETE CASCADE,
        UNIQUE (kullanici_id, ay, yil)
      );
    `);
    console.log('✅ sofor_yakit_kayitlari tablosu oluşturuldu.');

    // İndeksler
    await client.query(`
      CREATE INDEX idx_sofor_yakit_kullanici_id ON sofor_yakit_kayitlari(kullanici_id);
    `);
    await client.query(`
      CREATE INDEX idx_sofor_yakit_yil_ay ON sofor_yakit_kayitlari(yil, ay);
    `);
    console.log('✅ İndeksler oluşturuldu.');

    // Otomatik güncelleme trigger'ı
    await client.query(`
      CREATE TRIGGER sofor_yakit_guncelleme 
      BEFORE UPDATE ON sofor_yakit_kayitlari
      FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();
    `);
    console.log('✅ Trigger eklendi.');

    await client.query('COMMIT');
    console.log('\n🎉 Migration başarıyla tamamlandı!');
    console.log('   Tablo: sofor_yakit_kayitlari');
    console.log('   Sütunlar: kayit_id, kullanici_id, ay, yil, aylik_km, aylik_yakit_tutar, notlar, olusturulma_tarihi');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Migration hatası:', err.message);
    console.error(err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

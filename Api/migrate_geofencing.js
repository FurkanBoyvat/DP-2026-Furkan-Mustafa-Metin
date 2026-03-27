/**
 * migrate_geofencing.js
 * Çalıştır: node migrate_geofencing.js
 * PostGIS gerektirmeden geofencing tablolarını oluşturur.
 */
const pool = require('./src/config/database');

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🚀 Geofencing migrasyonu başlıyor (Standart JSONB modu)...');

    // 1. İzin verilen bölgeler (şehir poligonları) tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS allowed_regions (
        region_id   SERIAL PRIMARY KEY,
        region_name VARCHAR(255) NOT NULL,
        region_type VARCHAR(50) DEFAULT 'city',
        arac_id     INTEGER REFERENCES araclar(arac_id) ON DELETE CASCADE,
        geojson     JSONB NOT NULL,                 -- Sınır verisi burada tutulacak
        created_at  TIMESTAMP DEFAULT NOW(),
        updated_at  TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_allowed_regions_arac_id
        ON allowed_regions(arac_id);
    `);
    console.log('✅ allowed_regions tablosu hazır');

    // 2. Jeo-fencing ihlal log tablosu
    await client.query(`
      CREATE TABLE IF NOT EXISTS vehicle_geofence_log (
        log_id       SERIAL PRIMARY KEY,
        arac_id      INTEGER NOT NULL REFERENCES araclar(arac_id) ON DELETE CASCADE,
        region_id    INTEGER REFERENCES allowed_regions(region_id) ON DELETE SET NULL,
        enlem        DECIMAL(10,8) NOT NULL,
        boylam       DECIMAL(11,8) NOT NULL,
        hiz          DECIMAL(5,2) DEFAULT 0,
        is_violation BOOLEAN DEFAULT false,
        violation_msg TEXT,
        kayit_tarihi TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_geofence_log_arac_id
        ON vehicle_geofence_log(arac_id);
      CREATE INDEX IF NOT EXISTS idx_geofence_log_tarihi
        ON vehicle_geofence_log(kayit_tarihi DESC);
    `);
    console.log('✅ vehicle_geofence_log tablosu hazır');

    console.log('\n🎉 Geofencing migrasyonu başarıyla tamamlandı!');
  } catch (err) {
    console.error('❌ Migrasyon hatası:', err.message);
  } finally {
    client.release();
    process.exit(0);
  }
}

migrate();

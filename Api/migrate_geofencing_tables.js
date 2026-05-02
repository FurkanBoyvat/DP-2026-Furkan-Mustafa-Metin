/**
 * KAPSAMLI MİGRATION: Tüm eksik tabloları oluştur
 * Eksik tablolar:
 *   1. allowed_regions       → geofencingController.js
 *   2. vehicle_geofence_log  → geofencingController.js
 */

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi' });

async function tableExists(client, tableName) {
  const res = await client.query(
    `SELECT EXISTS (
       SELECT FROM information_schema.tables 
       WHERE table_schema = 'public' AND table_name = $1
     )`,
    [tableName]
  );
  return res.rows[0].exists;
}

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('🔄 Kapsamlı Migration Başlıyor...\n');

    // ── 1. allowed_regions ────────────────────────────────────────────────────
    if (await tableExists(client, 'allowed_regions')) {
      console.log('⚠️  allowed_regions zaten var. Atlandı.');
    } else {
      await client.query(`
        CREATE TABLE allowed_regions (
          region_id    SERIAL PRIMARY KEY,
          arac_id      INTEGER NOT NULL,
          region_name  VARCHAR(255) NOT NULL,
          region_type  VARCHAR(50)  DEFAULT 'city',
          geojson      JSONB        NOT NULL,
          created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
        );
      `);
      await client.query(`CREATE INDEX idx_allowed_regions_arac_id ON allowed_regions(arac_id);`);
      console.log('✅ allowed_regions tablosu oluşturuldu.');
    }

    // ── 2. vehicle_geofence_log ───────────────────────────────────────────────
    if (await tableExists(client, 'vehicle_geofence_log')) {
      console.log('⚠️  vehicle_geofence_log zaten var. Atlandı.');
    } else {
      await client.query(`
        CREATE TABLE vehicle_geofence_log (
          log_id        SERIAL PRIMARY KEY,
          arac_id       INTEGER NOT NULL,
          region_id     INTEGER,
          enlem         DECIMAL(10, 8) NOT NULL,
          boylam        DECIMAL(11, 8) NOT NULL,
          hiz           DECIMAL(5, 2)  DEFAULT 0,
          is_violation  BOOLEAN        DEFAULT false,
          violation_msg TEXT,
          kayit_tarihi  TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (arac_id)   REFERENCES araclar(arac_id) ON DELETE CASCADE,
          FOREIGN KEY (region_id) REFERENCES allowed_regions(region_id) ON DELETE SET NULL
        );
      `);
      await client.query(`CREATE INDEX idx_geofence_log_arac_id     ON vehicle_geofence_log(arac_id);`);
      await client.query(`CREATE INDEX idx_geofence_log_tarihi       ON vehicle_geofence_log(kayit_tarihi);`);
      await client.query(`CREATE INDEX idx_geofence_log_is_violation ON vehicle_geofence_log(is_violation);`);
      console.log('✅ vehicle_geofence_log tablosu oluşturuldu.');
    }

    // ── Mevcut tüm tabloları listele ─────────────────────────────────────────
    const allTables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`
    );
    console.log('\n📋 Veritabanındaki tüm tablolar:');
    allTables.rows.forEach(r => console.log('   ✔', r.table_name));

    console.log('\n🎉 Tüm migration\'lar başarıyla tamamlandı!');

  } catch (err) {
    console.error('\n❌ Migration hatası:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();

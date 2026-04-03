const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Migrating araclar table...');
    await pool.query(`
      ALTER TABLE araclar 
      ADD COLUMN IF NOT EXISTS alis_km DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS alis_fiyat DECIMAL(12, 2),
      ADD COLUMN IF NOT EXISTS alis_tarihi DATE,
      ADD COLUMN IF NOT EXISTS mevcut_km DECIMAL(10, 2) DEFAULT 0;
    `);
    console.log('✅ Columns added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration error:', err);
    process.exit(1);
  }
}

migrate();

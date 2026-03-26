const pool = require('./src/config/database');

async function migrate() {
  try {
    console.log('Starting migration...');
    const commands = [
      'ALTER TABLE kisitli_alanlar ALTER COLUMN merkez_enlem DROP NOT NULL;',
      'ALTER TABLE kisitli_alanlar ALTER COLUMN merkez_boylam DROP NOT NULL;',
      'ALTER TABLE kisitli_alanlar ALTER COLUMN yaricap_metre DROP NOT NULL;',
      "ALTER TABLE kisitli_alanlar ADD COLUMN IF NOT EXISTS geometri_tipi VARCHAR(50) DEFAULT 'daire';",
      'ALTER TABLE kisitli_alanlar ADD COLUMN IF NOT EXISTS koordinatlar JSONB;',
    ];

    for (const cmd of commands) {
      console.log(`Executing: ${cmd}`);
      await pool.query(cmd);
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();

const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi' });
pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name`)
  .then(r => { 
    console.log('MEVCUT TABLOLAR:'); 
    r.rows.forEach(row => console.log(' -', row.table_name)); 
    pool.end(); 
  }).catch(e => { console.error(e.message); pool.end(); });

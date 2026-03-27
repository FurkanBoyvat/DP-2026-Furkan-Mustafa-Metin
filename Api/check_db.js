const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function ensureTables() {
    try {
        console.log('Testing DB connection...');
        await pool.query('SELECT NOW()');
        console.log('Connected!');

        console.log('Checking arac_konum_takibi table...');
        const res = await pool.query(`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE  table_schema = 'public'
                AND    table_name   = 'arac_konum_takibi'
            );
        `);
        
        if (res.rows[0].exists) {
            console.log('Table arac_konum_takibi already exists. Skip creation.');
        } else {
            console.log('Table NOT found. I will create it from database.sql...');
            const sql = fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8');
            // extract the table creation part or just run the whole structure if it's safe 
            // Better to just run a specific CREATE TABLE statement.
            await pool.query(`
                CREATE TABLE IF NOT EXISTS arac_konum_takibi (
                    konum_id SERIAL PRIMARY KEY,
                    arac_id INTEGER NOT NULL,
                    enlem DECIMAL(10, 8) NOT NULL,
                    boylam DECIMAL(11, 8) NOT NULL,
                    hiz DECIMAL(5, 2) DEFAULT 0,
                    irtifa DECIMAL(10, 2),
                    uydu_sayisi INTEGER,
                    gps_dogruluk DECIMAL(5, 2),
                    motor_durum BOOLEAN,
                    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
                );
                CREATE INDEX idx_arac_konum_takibi_arac_id ON arac_konum_takibi(arac_id);
                CREATE INDEX idx_arac_konum_takibi_kayit_tarihi ON arac_konum_takibi(kayit_tarihi);
            `);
            console.log('Table created!');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

ensureTables();

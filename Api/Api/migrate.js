const pool = require('./src/config/database');

async function migrate() {
    try {
        await pool.query('ALTER TABLE kullanicilar ADD COLUMN filo_id INTEGER REFERENCES filolar(filo_id) ON DELETE SET NULL');
        console.log('Successfully added filo_id to kullanicilar table');
    } catch (error) {
        console.error('Error adding column:', error);
    } finally {
        process.exit();
    }
}

migrate();

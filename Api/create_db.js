const { Client } = require('pg');

async function setup() {
    const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'mustafa3866',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('Connected to postgres default DB');
        
        const res = await client.query("SELECT 1 FROM pg_database WHERE datname='arac_takip_sistemi'");
        if (res.rowCount === 0) {
            console.log('Creating database arac_takip_sistemi...');
            await client.query('CREATE DATABASE arac_takip_sistemi');
            console.log('Database created!');
        } else {
            console.log('Database already exists.');
        }
    } catch (err) {
        console.error('Setup error:', err);
    } finally {
        await client.end();
    }
}

setup();

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setup() {
    // 1. Önce varsayılan 'postgres' veritabanına bağlanıp yeni veritabanını oluşturuyoruz
    const adminClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'postgres',
        password: 'mustafa3866',
        port: 5432,
    });

    try {
        await adminClient.connect();
        console.log('PostgreSQL sunucusuna bağlanıldı.');

        const dbRes = await adminClient.query("SELECT 1 FROM pg_database WHERE datname='arac_takip_sistemi'");
        if (dbRes.rowCount === 0) {
            console.log('arac_takip_sistemi veritabanı oluşturuluyor...');
            await adminClient.query('CREATE DATABASE arac_takip_sistemi');
            console.log('Veritabanı oluşturuldu.');
        } else {
            console.log('Veritabanı zaten mevcut.');
        }
    } catch (err) {
        console.error('Veritabanı oluşturma hatası:', err.message);
        process.exit(1);
    } finally {
        await adminClient.end();
    }

    // 2. Şimdi yeni oluşturulan veritabanına bağlanıp tabloları kuruyoruz
    const dbClient = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'arac_takip_sistemi',
        password: 'mustafa3866',
        port: 5432,
    });

    try {
        await dbClient.connect();
        console.log('arac_takip_sistemi veritabanına bağlanıldı. Tablolar kuruluyor...');

        const sqlPath = path.join(__dirname, 'database.sql');
        let sql = fs.readFileSync(sqlPath, 'utf8');

        // database.sql içindeki CREATE DATABASE ve \c komutlarını temizleyelim çünkü zaten bağlıyız
        sql = sql.replace(/CREATE DATABASE arac_takip_sistemi;/gi, '-- DB Created');
        sql = sql.replace(/\\c arac_takip_sistemi/gi, '-- Connected');

        await dbClient.query(sql);
        console.log('✅ Tüm tablolar ve test verileri başarıyla yüklendi!');

    } catch (err) {
        console.error('Tablo kurulum hatası:', err.message);
    } finally {
        await dbClient.end();
    }
}

setup();

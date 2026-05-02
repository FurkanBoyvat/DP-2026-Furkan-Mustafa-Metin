const pool = require('./src/config/database');

async function repairSchema() {
  console.log('🚀 Veritabanı Şeması Onarımı Başlatılıyor...\n');
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. ARACLAR TABLOSU
    console.log('📦 araclar tablosu güncelleniyor...');
    await client.query(`
      ALTER TABLE araclar 
      ADD COLUMN IF NOT EXISTS motor_no VARCHAR(100),
      ADD COLUMN IF NOT EXISTS sarj_no VARCHAR(100),
      ADD COLUMN IF NOT EXISTS kapasite_m3 DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS ortalama_yakit_tuketimi DECIMAL(5, 2),
      ADD COLUMN IF NOT EXISTS sigorta_numarasi VARCHAR(100),
      ADD COLUMN IF NOT EXISTS sigorta_baslangic_tarihi DATE,
      ADD COLUMN IF NOT EXISTS sigorta_bitis_tarihi DATE,
      ADD COLUMN IF NOT EXISTS teknik_muayene_tarihi DATE,
      ADD COLUMN IF NOT EXISTS son_bakım_tarihi DATE,
      ADD COLUMN IF NOT EXISTS alis_km DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS alis_fiyat DECIMAL(12, 2),
      ADD COLUMN IF NOT EXISTS alis_tarihi DATE,
      ADD COLUMN IF NOT EXISTS mevcut_km DECIMAL(10, 2) DEFAULT 0;
    `);

    // 2. ARAC_KONUM_TAKIBI TABLOSU
    console.log('📍 arac_konum_takibi tablosu güncelleniyor...');
    await client.query(`
      ALTER TABLE arac_konum_takibi 
      ADD COLUMN IF NOT EXISTS irtifa DECIMAL(8, 2),
      ADD COLUMN IF NOT EXISTS uydu_sayisi INTEGER,
      ADD COLUMN IF NOT EXISTS gps_dogruluk DECIMAL(5, 2);
    `);

    // 3. ARAC_SOFORLERI TABLOSU
    console.log('👨‍✈️ arac_soforleri tablosu güncelleniyor...');
    await client.query(`
      ALTER TABLE arac_soforleri 
      ADD COLUMN IF NOT EXISTS bitis_tarihi TIMESTAMP;
    `);

    // 4. BAKIM_TALEPLERI TABLOSU
    console.log('🔧 bakim_talepleri tablosu güncelleniyor...');
    await client.query(`
      ALTER TABLE bakim_talepleri 
      ADD COLUMN IF NOT EXISTS oncelik VARCHAR(20) DEFAULT 'normal',
      ADD COLUMN IF NOT EXISTS tamir_aciklamasi TEXT,
      ADD COLUMN IF NOT EXISTS tamir_tarihi TIMESTAMP,
      ADD COLUMN IF NOT EXISTS parca_maliyeti DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS iscilik_maliyeti DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS toplam_maliyet DECIMAL(10, 2),
      ADD COLUMN IF NOT EXISTS guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    `);

    // 5. KISITLI_ALANLAR TABLOSU
    console.log('🚫 kisitli_alanlar tablosu güncelleniyor...');
    await client.query(`
      ALTER TABLE kisitli_alanlar 
      ADD COLUMN IF NOT EXISTS sirket_id INTEGER REFERENCES sirketler(sirket_id) ON DELETE CASCADE,
      ADD COLUMN IF NOT EXISTS geometri_tipi VARCHAR(50) DEFAULT 'daire',
      ADD COLUMN IF NOT EXISTS koordinatlar JSONB;
    `);

    // 6. BOLGE_IHLAL_KAYITLARI TABLOSU (Yeni)
    console.log('⚠️  bolge_ihlal_kayitlari tablosu kontrol ediliyor...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS bolge_ihlal_kayitlari (
        ihlal_id SERIAL PRIMARY KEY,
        arac_id INTEGER REFERENCES araclar(arac_id) ON DELETE CASCADE,
        alan_id INTEGER REFERENCES kisitli_alanlar(alan_id) ON DELETE CASCADE,
        ihlal_tipi VARCHAR(50), 
        giris_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        cikis_tarihi TIMESTAMP,
        kalis_suresi_dakika INTEGER,
        max_hiz DECIMAL(5, 2),
        surucu_adi VARCHAR(100),
        notlar TEXT,
        onay_durum BOOLEAN DEFAULT false,
        kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. INDEXLER
    console.log('🔍 İndeksler oluşturuluyor...');
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_bik_arac_id ON bolge_ihlal_kayitlari(arac_id);
      CREATE INDEX IF NOT EXISTS idx_bik_alan_id ON bolge_ihlal_kayitlari(alan_id);
      CREATE INDEX IF NOT EXISTS idx_bik_giris_tarihi ON bolge_ihlal_kayitlari(giris_tarihi);
    `);

    // 8. TRIGGERLAR (Eksikse)
    console.log('⚡ Triggerlar kontrol ediliyor...');
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'bakim_talepleri_guncelleme') THEN
          CREATE TRIGGER bakim_talepleri_guncelleme BEFORE UPDATE ON bakim_talepleri
          FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('\n✅ Veritabanı şeması başarıyla onarıldı ve güncellendi!');
    
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n❌ Onarım hatası:', err.message);
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}

repairSchema();

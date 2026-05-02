const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi'
});

async function clearTestData() {
  try {
    console.log('Test verileri temizleniyor...');
    
    // Test alanlarını sil (bu otomatik olarak o alanlara bağlı ihlalleri de CASCADE ile siler)
    await pool.query("DELETE FROM kisitli_alanlar WHERE alan_adi LIKE 'Test %'");
    
    // add_dummy.js'de eklediğimiz ilk test verisini de silelim
    await pool.query("DELETE FROM kisitli_alanlar WHERE alan_adi = 'Merkez Depo Yasaklı Bölge'");
    
    // Her ihtimale karşı tüm ihlalleri sıfırlayalım ki bildirim 0'a insin
    await pool.query("TRUNCATE TABLE bolge_ihlal_kayitlari RESTART IDENTITY CASCADE");

    console.log('✅ Tüm test verileri ve ihlal bildirimleri temizlendi!');
  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await pool.end();
  }
}

clearTestData();

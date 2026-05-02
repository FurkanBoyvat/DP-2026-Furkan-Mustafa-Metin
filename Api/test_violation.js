const axios = require('axios');
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi'
});

async function runTest() {
  try {
    console.log('--- TEST BAŞLIYOR ---');
    
    // 1. Önce test için bir kısıtlı alan oluşturalım
    const alanRes = await pool.query(`
      INSERT INTO kisitli_alanlar (sirket_id, alan_adi, alan_tipi, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh, durum)
      VALUES (1, 'Test Kadıköy Meydanı', 'yasaklı_alan', 40.990, 29.020, 500, 30, true)
      RETURNING alan_id
    `);
    const alanId = alanRes.rows[0].alan_id;
    console.log(`✅ Test Kısıtlı Alanı oluşturuldu (ID: ${alanId}) - Enlem: 40.990, Boylam: 29.020, Max Hız: 30`);

    // 2. Şimdi API'ye bu alanın TAM İÇİNE düşecek bir konum gönderelim ve hızı da 80 yapalım
    console.log('🚗 Araç (ID: 1) konumu güncelleniyor (İhlal bölgesine giriyor ve 80 km/h hız yapıyor)...');
    
    const response = await axios.post('http://localhost:3000/api/takip/konum/update', {
      arac_id: 1,
      enlem: 40.991, // Çok yakın, alanın içinde
      boylam: 29.021,
      hiz: 80, // 30 sınırı vardı, aşması lazım
      motor_durum: true
    });

    console.log('\n--- API YANITI ---');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.ihlaller && response.data.ihlaller.length > 0) {
      console.log('\n🎉 BAŞARILI! Sistem ihlali otomatik tespit etti ve kaydetti.');
    } else {
      console.log('\n❌ BAŞARISIZ! İhlal tespit edilemedi.');
    }

  } catch (error) {
    if (error.response) {
      console.error('API Hatası:', error.response.data);
    } else {
      console.error('Hata:', error.message);
    }
  } finally {
    await pool.end();
  }
}

runTest();

const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi'
});

async function addDummyData() {
  try {
    console.log('Örnek veriler ekleniyor...');
    
    // 1. Önce bir kısıtlı alan ekleyelim
    const alanRes = await pool.query(`
      INSERT INTO kisitli_alanlar (sirket_id, alan_adi, alan_tipi, aciklama, merkez_enlem, merkez_boylam, yaricap_metre, max_hiz_kmh)
      VALUES (1, 'Merkez Depo Yasaklı Bölge', 'yasaklı_alan', 'Giriş yasaktır', 41.0082, 28.9784, 500, 30)
      RETURNING alan_id
    `);
    const alanId = alanRes.rows[0].alan_id;

    // 2. Bir ihlal kaydı ekleyelim
    await pool.query(`
      INSERT INTO bolge_ihlal_kayitlari (arac_id, alan_id, ihlal_tipi, giris_tarihi, cikis_tarihi, kalış_suresi_dakika, max_hiz, surucü_adı, notlar)
      VALUES (1, $1, 'bölgeye_giriş', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', 60, 45.5, 'Ahmet Yılmaz', 'İzinsiz bölge girişi tespit edildi')
    `, [alanId]);

    console.log('✅ Örnek veriler başarıyla eklendi!');
  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await pool.end();
  }
}

addDummyData();

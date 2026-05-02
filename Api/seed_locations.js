const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:mustafa3866@localhost:5432/arac_takip_sistemi'
});

async function seed() {
  try {
    const res = await pool.query('SELECT arac_id, plaka FROM araclar');
    console.log(`${res.rows.length} araç bulundu. Karaya taşınıyorlar...`);

    // Kara üzerindeki koordinatlar (Örn: Beşiktaş, Şişli, Kadıköy çevresi)
    const points = [
        { lat: 41.0422, lng: 29.0067 }, // Beşiktaş
        { lat: 41.0601, lng: 28.9876 }, // Şişli
        { lat: 40.9901, lng: 29.0234 }, // Kadıköy
        { lat: 41.0122, lng: 28.9312 }, // Fatih (Kara kısmı)
    ];

    for (let i = 0; i < res.rows.length; i++) {
      const arac = res.rows[i];
      const point = points[i % points.length];
      
      // Biraz varyasyon ekle (aynı noktada üst üste binmesinler)
      const finalLat = point.lat + (Math.random() * 0.01);
      const finalLng = point.lng + (Math.random() * 0.01);

      await pool.query('DELETE FROM arac_konum_takibi WHERE arac_id = $1', [arac.arac_id]);
      await pool.query(
        'INSERT INTO arac_konum_takibi (arac_id, enlem, boylam, hiz, motor_durum) VALUES ($1, $2, $3, $4, $5)',
        [arac.arac_id, finalLat, finalLng, 45, true]
      );
      console.log(`✅ ${arac.plaka} -> ${finalLat.toFixed(4)}, ${finalLng.toFixed(4)} konumuna (karaya) alındı.`);
    }
    console.log('\n🚀 Araçlar artık karada! Haritayı kontrol edebilirsiniz.');
  } catch (err) {
    console.error('Hata:', err.message);
  } finally {
    await pool.end();
  }
}

seed();

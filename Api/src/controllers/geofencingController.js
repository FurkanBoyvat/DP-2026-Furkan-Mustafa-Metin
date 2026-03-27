const pool = require('../config/database');

// ─── Ray Casting: Nokta Poligon İçinde mi? ─────────────────────────────────
function pointInPolygon(lat, lng, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function extractPolygons(geojson) {
  const geom = geojson.geometry || geojson;
  const polygons = [];
  if (geom.type === 'Polygon') {
    polygons.push(geom.coordinates[0]);
  } else if (geom.type === 'MultiPolygon') {
    for (const poly of geom.coordinates) polygons.push(poly[0]);
  }
  return polygons;
}

function isPointInGeoJSON(lat, lng, geojson) {
  return extractPolygons(geojson).some(poly => pointInPolygon(lat, lng, poly));
}

// ─── Şehir poligonunu kaydet ─────────────────────────────────────────────────
exports.saveAllowedRegion = async (req, res) => {
  try {
    const { arac_id, region_name, region_type = 'city', geojson } = req.body;
    if (!arac_id || !region_name || !geojson)
      return res.status(400).json({ success: false, message: 'arac_id, region_name ve geojson gerekli' });

    await pool.query('DELETE FROM allowed_regions WHERE arac_id = $1', [arac_id]);
    const result = await pool.query(
      `INSERT INTO allowed_regions (arac_id, region_name, region_type, geojson)
       VALUES ($1, $2, $3, $4) RETURNING region_id, region_name, region_type, created_at`,
      [arac_id, region_name, region_type, JSON.stringify(geojson)]
    );
    return res.status(201).json({ success: true, message: `"${region_name}" sınırı kaydedildi`, region: result.rows[0] });
  } catch (err) {
    console.error('saveAllowedRegion:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Araç için aktif bölge ────────────────────────────────────────────────────
exports.getRegionByArac = async (req, res) => {
  try {
    const { arac_id } = req.params;
    const result = await pool.query(
      `SELECT region_id, region_name, region_type, geojson, created_at
       FROM allowed_regions WHERE arac_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [arac_id]
    );
    if (!result.rows.length)
      return res.status(404).json({ success: false, message: 'Bölge bulunamadı' });
    return res.status(200).json({ success: true, region: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── Konum + İhlal Kontrolü (Ray Casting, PostGIS yok) ───────────────────────
exports.checkAndLogLocation = async (req, res) => {
  try {
    const { arac_id, enlem, boylam, hiz = 0 } = req.body;
    if (!arac_id || enlem === undefined || boylam === undefined)
      return res.status(400).json({ success: false, message: 'arac_id, enlem ve boylam gerekli' });

    const regionRes = await pool.query(
      `SELECT region_id, region_name, geojson FROM allowed_regions
       WHERE arac_id = $1 ORDER BY created_at DESC LIMIT 1`, [arac_id]
    );

    let is_violation = false, violation_msg = null, region_id = null, regionName = null;

    if (regionRes.rows.length > 0) {
      const region = regionRes.rows[0];
      region_id = region.region_id;
      regionName = region.region_name;
      const geojson = typeof region.geojson === 'string' ? JSON.parse(region.geojson) : region.geojson;
      if (!isPointInGeoJSON(enlem, boylam, geojson)) {
        is_violation = true;
        violation_msg = `Araç "${regionName}" sınırı dışına çıktı!`;
      }
    }

    const logResult = await pool.query(
      `INSERT INTO vehicle_geofence_log (arac_id, region_id, enlem, boylam, hiz, is_violation, violation_msg)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING log_id, kayit_tarihi`,
      [arac_id, region_id, enlem, boylam, hiz, is_violation, violation_msg]
    );

    await pool.query('DELETE FROM arac_konum_takibi WHERE arac_id=$1', [arac_id]);
    await pool.query('INSERT INTO arac_konum_takibi (arac_id,enlem,boylam,hiz) VALUES($1,$2,$3,$4)', [arac_id, enlem, boylam, hiz]);

    return res.status(200).json({
      success: true, is_violation, violation_msg, region_name: regionName,
      log_id: logResult.rows[0].log_id, timestamp: logResult.rows[0].kayit_tarihi
    });
  } catch (err) {
    console.error('checkAndLogLocation:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── İhlal geçmişi ───────────────────────────────────────────────────────────
exports.getViolations = async (req, res) => {
  try {
    const { arac_id } = req.params;
    const { limit = 20 } = req.query;
    const result = await pool.query(
      `SELECT l.*, a.plaka, a.marka, a.model, r.region_name
       FROM vehicle_geofence_log l
       JOIN araclar a ON l.arac_id = a.arac_id
       LEFT JOIN allowed_regions r ON l.region_id = r.region_id
       WHERE l.arac_id=$1 AND l.is_violation=true
       ORDER BY l.kayit_tarihi DESC LIMIT $2`,
      [arac_id, limit]
    );
    return res.status(200).json({ success: true, count: result.rows.length, violations: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAllViolations = async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const result = await pool.query(
      `SELECT l.*, a.plaka, a.marka, a.model, r.region_name
       FROM vehicle_geofence_log l
       JOIN araclar a ON l.arac_id = a.arac_id
       LEFT JOIN allowed_regions r ON l.region_id = r.region_id
       WHERE l.is_violation=true ORDER BY l.kayit_tarihi DESC LIMIT $1`,
      [limit]
    );
    return res.status(200).json({ success: true, count: result.rows.length, violations: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

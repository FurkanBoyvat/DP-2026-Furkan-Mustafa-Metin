import { useState, useEffect, useCallback, useRef } from 'react';
import { geofencingAPI } from '../services/api';

export interface GeofenceViolation {
  log_id: number;
  arac_id: number;
  plaka: string;
  region_name: string;
  enlem: number;
  boylam: number;
  hiz: number;
  violation_msg: string;
  kayit_tarihi: string;
}

interface UseGeofencingOptions {
  aracId: number | null;
  /** Nominatim'den alınan GeoJSON — null ise kontrol yapılmaz */
  selectedRegionGeoJSON: any | null;
  regionName: string;
  /** Anlık konum */
  latitude: number | null;
  longitude: number | null;
  speed?: number | null;
  /** Her kaç saniyede bir ihlal kontrolü yapılsın (varsayılan 5) */
  checkIntervalSec?: number;
}

export const useGeofencing = ({
  aracId,
  selectedRegionGeoJSON,
  regionName,
  latitude,
  longitude,
  speed = 0,
  checkIntervalSec = 5,
}: UseGeofencingOptions) => {
  const [isViolation, setIsViolation] = useState(false);
  const [violationMsg, setViolationMsg] = useState<string | null>(null);
  const [violations, setViolations] = useState<GeofenceViolation[]>([]);
  const [savingRegion, setSavingRegion] = useState(false);
  const [regionSaved, setRegionSaved] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);
  const lastCheck = useRef<number>(0);

  // Şehir sınırını backend'e kaydet
  const saveRegion = useCallback(async () => {
    if (!aracId || !selectedRegionGeoJSON || !regionName) return;
    setSavingRegion(true);
    try {
      await geofencingAPI.saveRegion({
        arac_id: aracId,
        region_name: regionName,
        region_type: 'city',
        geojson: selectedRegionGeoJSON,
      });
      setRegionSaved(true);
      setIsViolation(false);
      setViolationMsg(null);
    } catch (err) {
      console.error('Bölge kayıt hatası:', err);
    } finally {
      setSavingRegion(false);
    }
  }, [aracId, selectedRegionGeoJSON, regionName]);

  // Yeni bölge seçilince otomatik kaydet
  useEffect(() => {
    setRegionSaved(false);
    if (selectedRegionGeoJSON && aracId) saveRegion();
  }, [selectedRegionGeoJSON, aracId]); // eslint-disable-line

  // Konum değiştikçe throttle ile ihlal kontrolü yap
  useEffect(() => {
    if (!aracId || !latitude || !longitude || !regionSaved) return;
    const now = Date.now();
    if (now - lastCheck.current < checkIntervalSec * 1000) return;
    lastCheck.current = now;

    const check = async () => {
      try {
        const res = await geofencingAPI.checkLocation({
          arac_id: aracId,
          enlem: latitude,
          boylam: longitude,
          hiz: speed ?? 0,
        });

        setIsViolation(res.is_violation);
        setViolationMsg(res.is_violation ? res.violation_msg : null);
        setCheckError(null);

        if (res.is_violation) {
          // İhlal listesini güncelle
          geofencingAPI.getViolations(aracId, 10).then(r => {
            if (r.success) setViolations(r.violations);
          });
        }
      } catch (err) {
        setCheckError('İhlal kontrolü başarısız');
      }
    };

    check();
  }, [latitude, longitude]); // eslint-disable-line

  // Başlangıçta ihlal geçmişini yükle
  useEffect(() => {
    if (!aracId) return;
    geofencingAPI.getViolations(aracId, 10).then(r => {
      if (r.success) setViolations(r.violations);
    }).catch(() => {});
  }, [aracId]);

  return {
    isViolation,
    violationMsg,
    violations,
    savingRegion,
    regionSaved,
    checkError,
    saveRegion,
  };
};

// ─── Nominatim'den şehir GeoJSON çek ────────────────────────────────────────
export const fetchCityGeoJSON = async (cityName: string): Promise<any | null> => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityName)},Turkey&format=geojson&polygon_geojson=1&limit=1`;
    const res = await fetch(url, { headers: { 'Accept-Language': 'tr' } });
    const data = await res.json();
    if (data.features && data.features.length > 0) {
      return data.features[0]; // GeoJSON Feature
    }
    return null;
  } catch (err) {
    console.error('Nominatim hata:', err);
    return null;
  }
};

// Türkiye'nin büyük şehirleri
export const TURKIYE_SEHIRLERI = [
  'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya',
  'Adana', 'Konya', 'Gaziantep', 'Şanlıurfa', 'Mersin',
  'Diyarbakır', 'Kayseri', 'Eskişehir', 'Trabzon', 'Samsun',
  'Kocaeli', 'Malatya', 'Erzurum', 'Van', 'Denizli',
  'Kahramanmaraş', 'Batman', 'Sakarya', 'Manisa', 'Balıkesir',
];

import { useState, useEffect, useCallback } from 'react';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  speed: number | null;           // km/s
  heading: number | null;         // derece (0-360, kuzey=0)
  altitude: number | null;        // metre
  accuracy: number | null;        // metre (GPS doğruluğu)
  altitudeAccuracy: number | null;
  timestamp: number | null;
}

export interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

const INITIAL_STATE: LocationState = {
  latitude: null, longitude: null, speed: null,
  heading: null, altitude: null, accuracy: null,
  altitudeAccuracy: null, timestamp: null
};

export const useLocationTracking = () => {
  const [location, setLocation] = useState<LocationState>(INITIAL_STATE);
  const [history, setHistory] = useState<LocationPoint[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [updateCount, setUpdateCount] = useState<number>(0);
  const [totalDistance, setTotalDistance] = useState<number>(0); // metre

  // Haversine Formülü — iki GPS noktası arasındaki mesafe (metre)
  const haversineDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }, []);

  useEffect(() => {
    let watchId: number;

    if (!navigator.geolocation) {
      setError('Tarayıcınız konum servisini desteklemiyor.');
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, speed, heading, altitude, accuracy, altitudeAccuracy } = position.coords;

      const newLocation: LocationState = {
        latitude,
        longitude,
        speed: speed != null ? Number((speed * 3.6).toFixed(1)) : 0,
        heading: heading != null ? Number(heading.toFixed(1)) : null,
        altitude: altitude != null ? Number(altitude.toFixed(1)) : null,
        accuracy: accuracy != null ? Number(accuracy.toFixed(1)) : null,
        altitudeAccuracy: altitudeAccuracy != null ? Number(altitudeAccuracy.toFixed(1)) : null,
        timestamp: position.timestamp,
      };

      setLocation(prev => {
        // Mesafeyi güncelle
        if (prev.latitude && prev.longitude) {
          const dist = haversineDistance(prev.latitude, prev.longitude, latitude, longitude);
          if (dist > 5) { // 5m'den fazla hareket ettiyse kaydet
            setTotalDistance(d => d + dist);
            setHistory(h => {
              const newPoint = { lat: latitude, lng: longitude, timestamp: position.timestamp };
              return [...h.slice(-200), newPoint]; // Max 200 puan tut
            });
          }
        } else {
          // İlk konum noktasını kaydet
          setHistory([{ lat: latitude, lng: longitude, timestamp: position.timestamp }]);
        }
        return newLocation;
      });

      setUpdateCount(c => c + 1);
      setError(null);
    };

    const handleError = (err: GeolocationPositionError) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Konum erişimi reddedildi. Tarayıcı ayarlarından izin verin.');
          setIsTracking(false);
          break;
        case err.POSITION_UNAVAILABLE:
          setError('GPS sinyali bulunamıyor. Açık alanda veya pencere kenarında deneyin.');
          break;
        case err.TIMEOUT:
          setError('Konum alınırken zaman aşımı. Lütfen tekrar deneyin.');
          break;
        default:
          setError('Bilinmeyen bir konum hatası oluştu.');
          break;
      }
    };

    if (isTracking) {
      watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 1000, // 1 saniyeye kadar önbellekteki konumu kullan
      });
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [isTracking, haversineDistance]);

  const resetTracking = () => {
    setHistory([]);
    setTotalDistance(0);
    setUpdateCount(0);
    setLocation(INITIAL_STATE);
  };

  return { location, history, error, isTracking, setIsTracking, updateCount, totalDistance, resetTracking };
};

import { useEffect, useRef } from 'react';
import { takipAPI } from '../services/api';
import { LocationState } from './useLocationTracking';

export const useLocationUpdater = (location: LocationState, aracId: number | null) => {
  const lastSentLocation = useRef({ lat: 0, lng: 0 });

  useEffect(() => {
    if (!location.latitude || !location.longitude || !aracId) return;

    const isLocationChanged =
      Math.abs(location.latitude - lastSentLocation.current.lat) > 0.0001 ||
      Math.abs(location.longitude - lastSentLocation.current.lng) > 0.0001;

    if (isLocationChanged) {
      const sendLocation = async () => {
        try {
          await takipAPI.updateKonum({
            arac_id: aracId,
            enlem: location.latitude,
            boylam: location.longitude,
            hiz: location.speed ?? 0,
            irtifa: location.altitude ?? 0,
            uydu_sayisi: location.accuracy ? Math.max(0, Math.round(10 - location.accuracy / 10)) : 0,
            gps_dogruluk: location.accuracy ?? 0,
            motor_durum: true
          });
          lastSentLocation.current = { lat: location.latitude!, lng: location.longitude! };
        } catch (err) {
          console.error('Konum gönderilirken API hatası:', err);
        }
      };
      sendLocation();
    }
  }, [location.latitude, location.longitude, location.speed, aracId]);
};

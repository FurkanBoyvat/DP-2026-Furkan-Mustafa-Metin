import { useState, useEffect, useRef, useCallback } from 'react';
import { takipAPI } from '../services/api';

export interface VehiclePosition {
  arac_id: number;
  plaka: string;
  marka: string;
  model: string;
  enlem: number;
  boylam: number;
  hiz: number;
  motor_durum: boolean | null;
  kayit_tarihi: string;
  lastUpdated: number; // Date.now()
}

const POLL_INTERVAL = 4000; // 4 saniyede bir güncelle

export const useMultiVehicleTracker = (selectedIds: number[]) => {
  const [positions, setPositions] = useState<Map<number, VehiclePosition>>(new Map());
  const [loading, setLoading] = useState<Set<number>>(new Set());
  const [errors, setErrors] = useState<Map<number, string>>(new Map());
  const intervalsRef = useRef<Map<number, NodeJS.Timer>>(new Map());

  const fetchPosition = useCallback(async (aracId: number) => {
    try {
      const res = await takipAPI.getKonum(aracId);
      if (res.success && res.konum) {
        const k = res.konum;
        setPositions(prev => {
          const next = new Map(prev);
          next.set(aracId, {
            arac_id: aracId,
            plaka: k.plaka || `Araç ${aracId}`,
            marka: k.marka || '',
            model: k.model || '',
            enlem: parseFloat(k.enlem),
            boylam: parseFloat(k.boylam),
            hiz: parseFloat(k.hiz) || 0,
            motor_durum: k.motor_durum,
            kayit_tarihi: k.kayit_tarihi || k.guncelleme_tarihi,
            lastUpdated: Date.now(),
          });
          return next;
        });
        // Hata varsa temizle
        setErrors(prev => { const n = new Map(prev); n.delete(aracId); return n; });
      }
    } catch (err: any) {
      setErrors(prev => {
        const n = new Map(prev);
        n.set(aracId, 'Konum alınamadı');
        return n;
      });
    } finally {
      setLoading(prev => { const n = new Set(prev); n.delete(aracId); return n; });
    }
  }, []);

  useEffect(() => {
    const current = intervalsRef.current;

    // Kaldırılan araçlar için interval'leri temizle
    for (const [id, timer] of current.entries()) {
      if (!selectedIds.includes(id)) {
        clearInterval(timer as any);
        current.delete(id);
        setPositions(prev => { const n = new Map(prev); n.delete(id); return n; });
      }
    }

    // Yeni seçilen araçlar için interval başlat
    for (const id of selectedIds) {
      if (!current.has(id)) {
        // İlk anlık veriyi hemen çek
        setLoading(prev => new Set([...prev, id]));
        fetchPosition(id);
        // Sonra periyodik polling
        const timer = setInterval(() => fetchPosition(id), POLL_INTERVAL);
        current.set(id, timer);
      }
    }

    return () => {
      // Tüm interval'leri temizle (unmount)
      for (const timer of current.values()) {
        clearInterval(timer as any);
      }
    };
  }, [selectedIds, fetchPosition]);

  return { positions, loading, errors };
};

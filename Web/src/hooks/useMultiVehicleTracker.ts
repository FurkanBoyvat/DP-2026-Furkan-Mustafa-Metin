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

const POLL_INTERVAL_FAST = 4000;   // Konum olan araçlar: 4 saniye
const POLL_INTERVAL_SLOW = 30000;  // Konum olmayan araçlar: 30 saniye (backoff)
const NULL_THRESHOLD     = 5;      // Kaç ardışık null'da yavaş moda geç

export const useMultiVehicleTracker = (selectedIds: number[]) => {
  const [positions, setPositions] = useState<Map<number, VehiclePosition>>(new Map());
  const [loading, setLoading]     = useState<Set<number>>(new Set());
  const [errors, setErrors]       = useState<Map<number, string>>(new Map());
  const intervalsRef  = useRef<Map<number, NodeJS.Timer>>(new Map());
  const nullCountRef  = useRef<Map<number, number>>(new Map());   // ardışık null sayacı
  const slowModeRef   = useRef<Set<number>>(new Set());          // yavaş modda olan araçlar

  const schedulePoll = useCallback((aracId: number, fetchFn: () => Promise<void>) => {
    const intervals = intervalsRef.current;
    if (intervals.has(aracId)) {
      clearInterval(intervals.get(aracId) as any);
    }
    const isSlow    = slowModeRef.current.has(aracId);
    const interval  = isSlow ? POLL_INTERVAL_SLOW : POLL_INTERVAL_FAST;
    const timer     = setInterval(fetchFn, interval);
    intervals.set(aracId, timer);
  }, []);

  const fetchPosition = useCallback(async (aracId: number) => {
    try {
      const res = await takipAPI.getKonum(aracId);
      if (res.success && res.konum) {
        // ── Konum var: hızlı moda geç, sayacı sıfırla ──────────────────
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
        setErrors(prev => { const n = new Map(prev); n.delete(aracId); return n; });

        // Eğer yavaş modda idiyse hızlı moda geri dön
        if (slowModeRef.current.has(aracId)) {
          slowModeRef.current.delete(aracId);
          nullCountRef.current.set(aracId, 0);
          // Interval'i yeniden kur (hızlı)
          schedulePoll(aracId, () => fetchPosition(aracId));
        } else {
          nullCountRef.current.set(aracId, 0);
        }

      } else if (res.success && res.konum === null) {
        // ── Konum yok: backoff sayacını artır ──────────────────────────
        setPositions(prev => { const n = new Map(prev); n.delete(aracId); return n; });
        setErrors(prev => { const n = new Map(prev); n.delete(aracId); return n; });

        const nullCount = (nullCountRef.current.get(aracId) || 0) + 1;
        nullCountRef.current.set(aracId, nullCount);

        // Eşiği aştıysa yavaş moda geç
        if (nullCount >= NULL_THRESHOLD && !slowModeRef.current.has(aracId)) {
          slowModeRef.current.add(aracId);
          schedulePoll(aracId, () => fetchPosition(aracId));
        }
      }
    } catch (err: any) {
      // Gerçek network/sunucu hatası
      setErrors(prev => {
        const n = new Map(prev);
        n.set(aracId, 'Bağlantı hatası');
        return n;
      });
    } finally {
      setLoading(prev => { const n = new Set(prev); n.delete(aracId); return n; });
    }
  }, [schedulePoll]);

  useEffect(() => {
    const current = intervalsRef.current;

    // Kaldırılan araçlar için temizle
    for (const [id, timer] of current.entries()) {
      if (!selectedIds.includes(id)) {
        clearInterval(timer as any);
        current.delete(id);
        nullCountRef.current.delete(id);
        slowModeRef.current.delete(id);
        setPositions(prev => { const n = new Map(prev); n.delete(id); return n; });
      }
    }

    // Yeni seçilen araçlar için polling başlat
    for (const id of selectedIds) {
      if (!current.has(id)) {
        setLoading(prev => new Set([...prev, id]));
        fetchPosition(id); // ilk anlık istek
        schedulePoll(id, () => fetchPosition(id));
      }
    }

    return () => {
      for (const timer of current.values()) clearInterval(timer as any);
    };
  }, [selectedIds, fetchPosition, schedulePoll]);

  return { positions, loading, errors };
};

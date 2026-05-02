import React, { useState, useEffect, useRef } from 'react';
import { aracAPI, kisitliAlanAPI } from '../services/api';
import { useMultiVehicleTracker, VehiclePosition } from '../hooks/useMultiVehicleTracker';
import { MultiVehicleMap } from '../components/MultiVehicleMap';
import { GeofencingPanel } from '../components/GeofencingPanel';
import { Search, CheckSquare, Square, Layers, AlertTriangle, Loader2, ShieldAlert, Map as MapIcon, Radio, Activity, Target, Zap, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { useSearchParams } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const VEHICLE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

const StatusBadge = ({ hiz, lastUpdated }: { hiz: number; lastUpdated?: number }) => {
  const isStale = lastUpdated ? Date.now() - lastUpdated > 15000 : false;
  if (isStale) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full">
      <AlertTriangle className="w-2.5 h-2.5" />Sinyal Yok
    </span>
  );
  if (hiz > 0) return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Hareket
    </span>
  );
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />Beklemede
    </span>
  );
};

export default function CanliTakip() {
  const [searchParams] = useSearchParams();
  const initialAracId = searchParams.get('id');
  
  const [araclar, setAraclar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [trailHistory, setTrailHistory] = useState<Map<number, [number, number][]>>(new Map());
  const [activeTab, setActiveTab] = useState<'tracking' | 'geofencing'>('tracking');
  const [geoAracId, setGeoAracId] = useState<number | null>(null);
  const [geoPlaka, setGeoPlaka] = useState<string>('Araç');
  const [kisitliAlanlar, setKisitliAlanlar] = useState<any[]>([]);
  const prevPositions = useRef<Map<number, VehiclePosition>>(new Map());

  const { positions, loading: pollingLoading, errors } = useMultiVehicleTracker(selectedIds);

  useEffect(() => {
    // URL'den gelen araç ID'sini otomatik seç
    if (initialAracId) {
      const id = parseInt(initialAracId);
      if (!isNaN(id)) {
        setSelectedIds([id]);
      }
    }
    aracAPI.getAll().then(res => {
      setAraclar(res.data || res.araclar || []);
      setLoading(false);
    });

    // Kısıtlı alanları yükle
    kisitliAlanAPI.getAktif().then(res => {
      console.log('Kısıtlı alanlar API yanıtı:', res);
      if (res.success && res.data) {
        console.log('Kısıtlı alanlar veri:', res.data);
        console.log('İlk alan örneği:', res.data[0]);
        setKisitliAlanlar(res.data);
      }
    }).catch(err => console.error('Kısıtlı alanlar yüklenirken hata:', err));
  }, []);

  useEffect(() => {
    setTrailHistory(prev => {
      const next = new Map(prev);
      for (const [id, vehicle] of positions) {
        const prevVehicle = prevPositions.current.get(id);
        const point: [number, number] = [vehicle.enlem, vehicle.boylam];
        if (!prevVehicle || prevVehicle.enlem !== vehicle.enlem || prevVehicle.boylam !== vehicle.boylam) {
          const existing = next.get(id) || [];
          next.set(id, [...existing.slice(-150), point]);
        }
      }
      prevPositions.current = new Map(positions);
      return next;
    });
  }, [positions]);

  const filtered = araclar.filter(a =>
    `${a.plaka} ${a.marka} ${a.model}`.toLowerCase().includes(search.toLowerCase())
  );

  const toggleVehicle = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
    if (selectedIds.includes(id)) {
      setTrailHistory(prev => { const n = new Map(prev); n.delete(id); return n; });
    }
  };

  const selectAll = () => setSelectedIds(filtered.map(a => a.arac_id));
  const clearAll = () => { setSelectedIds([]); setTrailHistory(new Map()); };

  // --- GERÇEK GPS ENTEGRASYONU ---
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [myPos, setMyPos] = useState<{ lat: number; lng: number; speed: number } | null>(null);
  const watchId = useRef<number | null>(null);

  const startGpsBroadcast = () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız GPS desteği sunmuyor');
      return;
    }

    setIsGpsActive(true);
    toast.success('Canlı GPS Yayını Başlatıldı');

    watchId.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, speed } = pos.coords;
        setMyPos({ lat: latitude, lng: longitude, speed: speed || 0 });

        try {
            // Eğer seçili araç varsa, yayını o araç için yap
            const targetId = selectedIds.length > 0 ? selectedIds[0] : 1;
            
            await fetch('http://localhost:3000/api/takip/konum/update', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                arac_id: targetId, 
                enlem: latitude,
                boylam: longitude,
                hiz: (speed || 0) * 3.6, 
                motor_durum: true
              })
            });
            
            // Eğer seçili değilse tracking modunda otomatik seç
            if (!selectedIds.includes(targetId)) {
               setSelectedIds(prev => [...prev, targetId]);
            }
        } catch (e) {
           console.error('GPS update failed');
        }
      },
      (err) => {
        toast.error('GPS Bağlantı Hatası: ' + err.message);
        setIsGpsActive(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  const stopGpsBroadcast = () => {
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
    setIsGpsActive(false);
    toast.info('GPS Yayını Durduruldu');
  };

  useEffect(() => {
    return () => { if (watchId.current) navigator.geolocation.clearWatch(watchId.current); };
  }, []);
  // ---------------------------------

  const activeVehicles = Array.from(positions.values());
  const totalSpeed = activeVehicles.reduce((s, v) => s + v.hiz, 0);
  const movingCount = activeVehicles.filter(v => v.hiz > 0).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a] overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* --- PREMIUM COMMAND HEADER --- */}
      <div className="flex items-center gap-6 px-8 py-5 bg-[#0a0f1a]/80 backdrop-blur-3xl border-b border-white/5 relative z-30 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse group-hover:bg-blue-400/30 transition-all" />
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-lg border border-white/10 ring-4 ring-blue-500/5">
              <Radio className="w-6 h-6 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight uppercase flex items-center gap-2">
              SKYNET <span className="text-blue-500 text-[10px] tracking-[0.4em] font-black bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 ml-1">TR-01</span>
            </h1>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-ping" />
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">Gerçek Zamanlı Varlık İstihbaratı</p>
            </div>
          </div>
        </div>

        <div className="h-12 w-[1px] bg-gradient-to-b from-transparent via-white/10 to-transparent mx-2" />

        {/* Telemetry Ticker */}
        <div className="hidden xl:flex flex-1 items-center gap-8 px-6 bg-white/[0.02] border border-white/[0.05] rounded-3xl h-14 overflow-hidden relative group">
           <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0a0f1a] to-transparent z-10" />
           <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0a0f1a] to-transparent z-10" />
           <div className="flex items-center gap-12 animate-scroll-text whitespace-nowrap">
              {activeVehicles.length > 0 ? activeVehicles.map(v => (
                <div key={v.arac_id} className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase">{v.plaka}</span>
                   <span className="text-xs font-mono text-emerald-400 font-bold">{v.hiz} KM/S</span>
                   <div className="w-1 h-1 rounded-full bg-white/20" />
                </div>
              )) : (
                <div className="flex items-center gap-3">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest animate-pulse">Sinyal Bekleniyor...</span>
                   <Activity className="w-3 h-3 text-blue-500 animate-spin-slow" />
                </div>
              )}
           </div>
        </div>

        <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 rounded-[22px] p-1.5 shadow-inner">
          <button
            onClick={() => setActiveTab('tracking')}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
              activeTab === 'tracking' ? "bg-blue-600 text-white shadow-xl shadow-blue-600/40 translate-y-[-1px]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <MapIcon className="w-4 h-4" /> Taktik Harita
          </button>
          <button
            onClick={() => setActiveTab('geofencing')}
            className={cn(
              "flex items-center gap-2.5 px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
              activeTab === 'geofencing' ? "bg-red-600 text-white shadow-xl shadow-red-600/40 translate-y-[-1px]" : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
            )}
          >
            <ShieldAlert className="w-4 h-4" /> Güvenli Bölge
          </button>
        </div>

        {/* GPS Power Toggle */}
        <button
          onClick={isGpsActive ? stopGpsBroadcast : startGpsBroadcast}
          className={cn(
            "flex items-center gap-3 px-6 py-3 rounded-[22px] border transition-all duration-700 relative overflow-hidden group",
            isGpsActive 
              ? "bg-emerald-500 border-emerald-400 text-white shadow-[0_0_25px_rgba(16,185,129,0.4)]" 
              : "bg-white/[0.03] border-white/10 text-slate-400 hover:border-blue-500/50 hover:bg-blue-500/5"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:animate-shimmer" />
          <Zap className={cn("w-4 h-4 relative z-10", isGpsActive ? "fill-white animate-pulse" : "fill-none")} />
          <span className="text-[10px] font-black uppercase tracking-widest relative z-10">
            {isGpsActive ? 'Canlı GPS Yayını' : 'GPS Yayını Başlat'}
          </span>
        </button>
      </div>

      {/* Ana içerik */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* SOL PANEL */}
        <div className={`shrink-0 bg-[#0f172a] border-r border-white/[0.06] flex flex-col overflow-hidden transition-all duration-300 ${
          activeTab === 'geofencing' ? 'w-56' : 'w-72'
        }`}>

          <div className="p-3 border-b border-white/[0.06] space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Plaka veya model..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-8 pr-3 py-2 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
              />
            </div>
            {activeTab === 'tracking' && (
              <div className="flex gap-2">
                <button onClick={selectAll} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-[11px] font-semibold border border-blue-500/20 transition-colors">
                  <CheckSquare className="w-3.5 h-3.5" />Tümünü Seç
                </button>
                <button onClick={clearAll} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-[11px] font-semibold border border-white/10 transition-colors">
                  <Square className="w-3.5 h-3.5" />Temizle
                </button>
              </div>
            )}
            {activeTab === 'geofencing' && (
              <p className="text-slate-600 text-[10px] text-center">Sınır izlemek için araç seçin</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2 custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-slate-500 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /><span className="text-xs">Yükleniyor...</span>
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-slate-600 text-xs py-10">Araç bulunamadı.</p>
            ) : filtered.map((arac) => {
              const id = arac.arac_id;
              const isTracking = activeTab === 'tracking';
              const isSelected = isTracking ? selectedIds.includes(id) : geoAracId === id;
              const vPos = positions.get(id);
              const isPolling = pollingLoading.has(id);

              return (
                <div
                  key={id}
                  onClick={() => isTracking ? toggleVehicle(id) : (setGeoAracId(id), setGeoPlaka(arac.plaka))}
                  className={cn(
                    "relative group mx-1 my-1 p-4 rounded-2xl cursor-pointer transition-all duration-500 border overflow-hidden",
                    isSelected 
                      ? "bg-blue-600/10 border-blue-500/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)] scale-[0.98]" 
                      : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                  )}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500 shadow-lg",
                        isSelected ? "bg-blue-600 shadow-blue-600/40" : "bg-slate-800/80 shadow-black/20"
                      )}>
                         <Truck className={cn("w-6 h-6", isSelected ? "text-white" : "text-slate-400")} />
                      </div>
                      {isSelected && (
                         <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center animate-bounce-slow">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                         </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                         <h4 className={cn("font-black text-sm uppercase tracking-tighter", isSelected ? "text-blue-400" : "text-white")}>{arac.plaka}</h4>
                         {isPolling && <Loader2 className="w-3 h-3 text-blue-500/50 animate-spin" />}
                      </div>
                      <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5 truncate">{arac.marka} · {arac.model}</p>
                    </div>
                  </div>

                  {isTracking && isSelected && vPos && (
                    <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-500">
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Hız</p>
                        <p className="text-xs font-mono text-emerald-400 font-bold">{vPos.hiz} <span className="text-[8px] text-slate-600">KM/H</span></p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-xl border border-white/5 text-right">
                        <p className="text-[8px] font-black text-slate-500 uppercase">Durum</p>
                        <StatusBadge hiz={vPos.hiz} lastUpdated={vPos.lastUpdated} />
                      </div>
                    </div>
                  )}

                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-4 border-t border-white/[0.06] bg-black/20">
            <div className="flex items-center justify-between mb-2">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sinyal Kalitesi</span>
               <div className="flex gap-0.5">
                  {[1,2,3,4].map(i => <div key={i} className={cn("w-1 h-3 rounded-full", i <= 3 ? "bg-emerald-500" : "bg-white/10")} />)}
               </div>
            </div>
            <p className="text-slate-600 text-[10px] text-center font-bold">
              {activeTab === 'tracking'
                ? `SİSTEMİ ÇEVRİMİÇİ · ${araclar.length} VARLIK`
                : `COĞRAFİ SINIR MODU AKTİF`}
            </p>
          </div>
        </div>

        {/* SAĞ: İçerik */}
        <div className="flex-1 min-w-0 p-3 overflow-hidden flex flex-col gap-3">

          {/* ── ÇOKLU TAKİP ── */}
          {activeTab === 'tracking' && (
            <>
              {selectedIds.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center">
                      <Layers className="w-10 h-10 text-slate-600" />
                    </div>
                    <h3 className="text-white text-lg font-bold mb-2">Araç Seçin</h3>
                    <p className="text-slate-500 text-sm max-w-xs">Sol panelden araçları işaretleyin.<br />Birden fazla araç seçebilirsiniz.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative flex-1 rounded-3xl overflow-hidden border border-white/[0.06] shadow-[0_0_50px_rgba(0,0,0,0.5)] min-h-[400px]">
                     {/* Floating Telemetry Box */}
                     <div className="absolute top-6 left-6 z-[40] pointer-events-none space-y-3">
                        <div className="bg-[#0f172a]/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-left-4 duration-500">
                           <div className="flex items-center gap-3 mb-3">
                              <Target className="w-4 h-4 text-blue-500 animate-spin-slow" />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">Telemetri Verisi</span>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[8px] font-black text-slate-500 uppercase">Enlem</p>
                                 <p className="text-xs font-mono text-blue-400 font-bold">{myPos?.lat.toFixed(6) || '---'}</p>
                              </div>
                              <div>
                                 <p className="text-[8px] font-black text-slate-500 uppercase">Boylam</p>
                                 <p className="text-xs font-mono text-blue-400 font-bold">{myPos?.lng.toFixed(6) || '---'}</p>
                              </div>
                           </div>
                        </div>

                        {activeVehicles.length > 0 && (
                          <div className="bg-black/80 backdrop-blur-md border border-emerald-500/20 p-4 rounded-2xl shadow-2xl animate-in slide-in-from-left-8 duration-700">
                             <div className="flex items-center gap-3 mb-2">
                                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Canlı Akış</span>
                             </div>
                             <div className="flex items-baseline gap-1">
                                <span className="text-2xl font-black text-white tracking-tighter">{activeVehicles[0].hiz}</span>
                                <span className="text-[10px] font-bold text-slate-500">KM/S</span>
                             </div>
                          </div>
                        )}
                     </div>

                     <MultiVehicleMap positions={positions} trailHistory={trailHistory} errors={errors} kisitliAlanlar={kisitliAlanlar} />
                  </div>
                </>
              )}
            </>
          )}

          {/* ── SINIR İZLEME ── */}
          {activeTab === 'geofencing' && (
            geoAracId ? (
              <GeofencingPanel aracId={geoAracId} plaka={geoPlaka} />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-red-500/5 border border-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-10 h-10 text-red-500/50" />
                  </div>
                  <h3 className="text-white text-lg font-bold mb-2">Araç Seçin</h3>
                  <p className="text-slate-500 text-sm max-w-xs">
                    Sol panelden bir araç seçin, ardından şehir sınırı belirleyerek sınır ihlali takibini başlatın.
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
      `}</style>
    </div>
  );
}

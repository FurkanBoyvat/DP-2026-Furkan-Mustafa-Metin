import React, { useState, useEffect, useRef } from 'react';
import { aracAPI } from '../services/api';
import { useMultiVehicleTracker, VehiclePosition } from '../hooks/useMultiVehicleTracker';
import { MultiVehicleMap } from '../components/MultiVehicleMap';
import { GeofencingPanel } from '../components/GeofencingPanel';
import {
  Navigation, Search, CheckSquare, Square, Layers,
  AlertTriangle, Loader2, Gauge, X, ShieldAlert, Map as MapIcon
} from 'lucide-react';

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
  const [araclar, setAraclar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [trailHistory, setTrailHistory] = useState<Map<number, [number, number][]>>(new Map());
  const [activeTab, setActiveTab] = useState<'tracking' | 'geofencing'>('tracking');
  const [geoAracId, setGeoAracId] = useState<number | null>(null);
  const [geoPlaka, setGeoPlaka] = useState<string>('Araç');
  const prevPositions = useRef<Map<number, VehiclePosition>>(new Map());

  const { positions, loading: pollingLoading, errors } = useMultiVehicleTracker(selectedIds);

  useEffect(() => {
    aracAPI.getAll().then(res => {
      setAraclar(res.data || res.araclar || []);
      setLoading(false);
    });
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

  const activeVehicles = Array.from(positions.values());
  const totalSpeed = activeVehicles.reduce((s, v) => s + v.hiz, 0);
  const movingCount = activeVehicles.filter(v => v.hiz > 0).length;

  return (
    <div className="flex flex-col h-full bg-[#0a0f1a] overflow-hidden" style={{ minHeight: 'calc(100vh - 64px)' }}>

      {/* Üst başlık */}
      <div className="flex items-center gap-3 px-5 py-3 bg-[#0f172a] border-b border-white/[0.06] shrink-0 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-500/20">
            <Navigation className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-[15px] leading-none">Canlı Araç Takibi</h1>
            <p className="text-slate-500 text-[11px] mt-0.5">Gerçek zamanlı filo izleme</p>
          </div>
        </div>

        {/* Sekmeler */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 ml-2">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'tracking'
                ? 'bg-blue-500/30 text-blue-300 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />Çoklu Takip
          </button>
          <button
            onClick={() => setActiveTab('geofencing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'geofencing'
                ? 'bg-red-500/30 text-red-300 shadow'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />Sınır İzleme
          </button>
        </div>

        {/* Özet — sadece tracking modunda */}
        {activeTab === 'tracking' && (
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-white/10">
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">İzlenen</p>
              <p className="text-white font-bold text-sm">{selectedIds.length}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Hareket</p>
              <p className="text-emerald-400 font-bold text-sm">{movingCount}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Ort. Hız</p>
              <p className="text-blue-400 font-bold text-sm">
                {activeVehicles.length ? (totalSpeed / activeVehicles.length).toFixed(0) : 0} km/s
              </p>
            </div>
          </div>
        )}

        {selectedIds.length > 0 && activeTab === 'tracking' && (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-400 text-xs font-semibold">Canlı</span>
            </div>
            <button onClick={clearAll} className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
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
              const colorIdx = selectedIds.indexOf(id);
              const color = colorIdx >= 0 ? VEHICLE_COLORS[colorIdx % VEHICLE_COLORS.length] : '#8b5cf6';
              const vPos = positions.get(id);
              const isPolling = pollingLoading.has(id);
              const hasError = errors.has(id);

              const handleClick = () => {
                if (isTracking) {
                  toggleVehicle(id);
                } else {
                  setGeoAracId(id);
                  setGeoPlaka(arac.plaka);
                }
              };

              return (
                <div
                  key={id}
                  onClick={handleClick}
                  className={`relative flex items-start gap-3 p-3 rounded-xl cursor-pointer select-none transition-all duration-200 border ${
                    isSelected ? 'bg-white/[0.06] border-white/[0.12]' : 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]'
                  }`}
                >
                  <div className="mt-0.5 shrink-0">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: color }}>
                        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-md bg-white/10 border border-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-white font-bold text-[13px] truncate">{arac.plaka}</span>
                      {isPolling && isTracking && <Loader2 className="w-2.5 h-2.5 text-blue-400 animate-spin shrink-0" />}
                    </div>
                    <p className="text-slate-400 text-[11px] truncate mt-0.5">{arac.marka} {arac.model}</p>
                    {isTracking && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {isSelected && vPos && (
                          <>
                            <StatusBadge hiz={vPos.hiz} lastUpdated={vPos.lastUpdated} />
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5">
                              <Gauge className="w-2.5 h-2.5" />{vPos.hiz} km/s
                            </span>
                          </>
                        )}
                        {isSelected && !vPos && isPolling && <span className="text-[10px] text-blue-400">Alınıyor...</span>}
                        {isSelected && !vPos && !isPolling && hasError && (
                          <span className="text-[10px] text-red-400 flex items-center gap-0.5"><AlertTriangle className="w-2.5 h-2.5" />Veri yok</span>
                        )}
                      </div>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ background: color }} />
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-3 border-t border-white/[0.06]">
            <p className="text-slate-600 text-[10px] text-center">
              {activeTab === 'tracking'
                ? `${araclar.length} araç · ${selectedIds.length} izleniyor · 4s`
                : `${araclar.length} araç · sınır seçin`}
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
                  <div className="flex gap-2 flex-wrap shrink-0">
                    {Array.from(positions.values()).map((v, idx) => {
                      const color = VEHICLE_COLORS[idx % VEHICLE_COLORS.length];
                      return (
                        <div key={v.arac_id} className="flex items-center gap-2 bg-[#0f172a] rounded-xl px-3 py-1.5 border border-white/[0.08]">
                          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
                          <span className="text-white text-[12px] font-semibold">{v.plaka}</span>
                          <span className="text-slate-400 text-[11px]">{v.hiz} km/s</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex-1 rounded-2xl overflow-hidden border border-white/[0.06] shadow-2xl min-h-[400px]">
                    <MultiVehicleMap positions={positions} trailHistory={trailHistory} errors={errors} />
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

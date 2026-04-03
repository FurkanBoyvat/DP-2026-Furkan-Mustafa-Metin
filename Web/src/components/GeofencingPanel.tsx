import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import {
  ShieldAlert, ShieldCheck, MapPin, Loader2,
  AlertTriangle, CheckCircle2, Search, History, X, Map as MapIcon, Globe, Moon, Layers, Plus, Minus
} from 'lucide-react';
import { clsx } from 'clsx';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useGeofencing, fetchCityGeoJSON, TURKIYE_SEHIRLERI, GeofenceViolation } from '../hooks/useGeofencing';

// Leaflet icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Araç ikonu (kırmızı ihlal durumunda değişir)
const createLocIcon = (violation: boolean) => L.divIcon({
  html: `<div style="
    width:28px;height:28px;border-radius:50%;
    background:${violation ? '#ef4444' : '#3b82f6'};
    border:3px solid white;
    box-shadow:0 0 0 3px ${violation ? 'rgba(239,68,68,0.35)' : 'rgba(59,130,246,0.35)'};
    display:flex;align-items:center;justify-content:center;
    ${violation ? 'animation:geo_pulse 1s ease-in-out infinite;' : ''}
  ">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="white">
      <circle cx="12" cy="12" r="5"/>
    </svg>
  </div>
  <style>@keyframes geo_pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}</style>`,
  className: '',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Haritayı konuma kaydır
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [lat, lng, map]);
  return null;
};

// GeoJSON stil fonksiyonu
const geoJsonStyle = (violation: boolean) => ({
  color: violation ? '#ef4444' : '#22c55e',
  weight: 2.5,
  fillColor: violation ? '#ef4444' : '#22c55e',
  fillOpacity: 0.12,
  dashArray: '6 4',
});

// Harita katmanları (TILES)
const TILES: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

// Zaman formatlama
const formatTime = (s: string) => new Date(s).toLocaleString('tr-TR', {
  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
});

// Harita kontrollerini ayarla
const MapControls = ({ onZoomIn, onZoomOut }: { onZoomIn: React.MutableRefObject<() => void>, onZoomOut: React.MutableRefObject<() => void> }) => {
  const map = useMap();
  useEffect(() => {
    onZoomIn.current = () => map.setZoom(map.getZoom() + 1);
    onZoomOut.current = () => map.setZoom(map.getZoom() - 1);
  }, [map, onZoomIn, onZoomOut]);
  return null;
};

interface GeofencingPanelProps {
  aracId: number | null;
  plaka?: string;
}

export const GeofencingPanel: React.FC<GeofencingPanelProps> = ({ aracId, plaka = 'Araç' }) => {
  const [selectedCity, setSelectedCity] = useState('');
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [geojsonFeature, setGeojsonFeature] = useState<any>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [mapMode, setMapMode] = useState<'dark' | 'satellite' | 'standard'>('satellite');
  const [showLayers, setShowLayers] = useState(false);
  
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});

  const { location, isTracking, setIsTracking } = useLocationTracking();

  const {
    isViolation,
    violationMsg,
    violations,
    savingRegion,
    regionSaved,
    checkError,
  } = useGeofencing({
    aracId,
    selectedRegionGeoJSON: geojsonFeature,
    regionName: selectedCity,
    latitude: location.latitude,
    longitude: location.longitude,
    speed: location.speed,
  });

  // Şehir GeoJSON'ını Nominatim'den çek
  const handleCitySelect = useCallback(async (city: string) => {
    if (!city) return;
    setSelectedCity(city);
    setLoadingGeo(true);
    setGeoError(null);
    setGeojsonFeature(null);

    const feature = await fetchCityGeoJSON(city);
    if (feature) {
      setGeojsonFeature(feature);
    } else {
      setGeoError(`"${city}" için harita verisi bulunamadı.`);
    }
    setLoadingGeo(false);
  }, []);

  const position: [number, number] = location.latitude && location.longitude
    ? [location.latitude, location.longitude]
    : [39.925054, 32.836944];

  return (
    <div className="flex flex-col gap-4 h-full min-h-[500px]">

      {/* Üst Kontrol Paneli */}
      <div className={`rounded-2xl border shadow-xl overflow-hidden transition-all duration-500 ${
        isViolation
          ? 'bg-red-950/80 border-red-500/40'
          : 'bg-[#0f172a] border-white/[0.07]'
      }`}>

        {/* İhlal / Güvenli Durum Başlığı */}
        {isTracking && location.latitude && (
          <div className={`px-5 py-3 flex items-center gap-3 border-b ${
            isViolation
              ? 'bg-red-500/20 border-red-500/30'
              : regionSaved
                ? 'bg-emerald-500/10 border-emerald-500/20'
                : 'bg-slate-800/50 border-white/5'
          }`}>
            {isViolation ? (
              <>
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse shrink-0" />
                <div>
                  <p className="text-red-300 font-bold text-sm">⚠️ SINIR İHLALİ</p>
                  <p className="text-red-400/80 text-xs">{violationMsg}</p>
                </div>
              </>
            ) : regionSaved ? (
              <>
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-emerald-300 font-bold text-sm">✓ Güvenli Bölgede</p>
                  <p className="text-emerald-500/70 text-xs">{plaka} — {selectedCity} sınırları içinde</p>
                </div>
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
                <p className="text-slate-400 text-sm">Şehir seçin ve takibi başlatın</p>
              </>
            )}

            {violations.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="ml-auto flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-white/10 text-slate-300 hover:bg-white/20 transition-colors"
              >
                <History className="w-3.5 h-3.5" />
                {violations.length} İhlal
              </button>
            )}
          </div>
        )}

        {/* Şehir Seçimi + Kontroller */}
        <div className="flex flex-wrap items-center gap-3 p-4">
          {/* Şehir dropdown */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedCity}
              onChange={e => handleCitySelect(e.target.value)}
              disabled={loadingGeo || savingRegion}
              className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 disabled:opacity-50"
            >
              <option value="">— Şehir Seçin —</option>
              {TURKIYE_SEHIRLERI.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Durum/Yükleme */}
          <div className="shrink-0">
            {loadingGeo && (
              <span className="flex items-center gap-1.5 text-xs text-blue-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />Harita yükleniyor...
              </span>
            )}
            {savingRegion && (
              <span className="flex items-center gap-1.5 text-xs text-violet-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />Sınır kaydediliyor...
              </span>
            )}
            {regionSaved && !loadingGeo && !savingRegion && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />{selectedCity} sınırı aktif
              </span>
            )}
            {geoError && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <AlertTriangle className="w-3.5 h-3.5" />{geoError}
              </span>
            )}
          </div>

          {/* Takip Butonu */}
          <button
            onClick={() => setIsTracking(!isTracking)}
            disabled={!aracId}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm border flex items-center gap-2 transition-all active:scale-95 ml-auto
              ${!aracId
                ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                : isTracking
                  ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30'
              }`}
          >
            {isTracking ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Durdur</>
            ) : (
              <><MapPin className="w-3.5 h-3.5" />Takibi Başlat</>
            )}
          </button>
        </div>
      </div>

      {/* İhlal Geçmişi Drawer */}
      {showHistory && violations.length > 0 && (
        <div className="bg-[#0f172a] rounded-2xl border border-red-500/20 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-red-400" />Son İhlaller ({violations.length})
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {violations.map((v: GeofenceViolation) => (
              <div key={v.log_id} className="flex items-start gap-3 px-4 py-3 border-b border-white/[0.04] last:border-0">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-red-300 text-xs font-medium truncate">{v.violation_msg}</p>
                  <p className="text-slate-500 text-[11px] mt-0.5">
                    {formatTime(v.kayit_tarihi)} · {v.hiz} km/s
                  </p>
                </div>
                <span className="text-slate-600 text-[10px] font-mono shrink-0">
                  {Number(v.enlem).toFixed(3)}, {Number(v.boylam).toFixed(3)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`flex-1 rounded-2xl overflow-hidden shadow-2xl border min-h-[400px] relative group transition-all duration-500
        ${isViolation ? 'border-red-500/50 shadow-red-900/30' : 'border-white/[0.07]'}`
      }>
        <MapContainer
          center={position}
          zoom={location.latitude ? 13 : 6}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <MapControls onZoomIn={zoomInRef} onZoomOut={zoomOutRef} />
          
          <TileLayer
            url={TILES[mapMode]}
            attribution={mapMode === 'satellite' ? 'Esri' : '&copy; CartoDB'}
          />

          {isTracking && location.latitude && location.longitude && (
            <RecenterMap lat={location.latitude} lng={location.longitude} />
          )}

          {/* Şehir sınırı (GeoJSON) */}
          {geojsonFeature && (
            <GeoJSON
              key={`${selectedCity}-${isViolation}`}
              data={geojsonFeature}
              style={geoJsonStyle(isViolation)}
            />
          )}

          {/* Araç konumu */}
          {location.latitude && location.longitude && (
            <Marker position={[location.latitude, location.longitude]} icon={createLocIcon(isViolation)}>
              <Popup>
                <div className="font-sans min-w-[160px]">
                  <div className={`font-bold text-sm mb-1 ${isViolation ? 'text-red-600' : 'text-slate-800'}`}>
                    {isViolation ? '⚠️ İhlal Tespit Edildi' : '✅ Güvenli Bölge'}
                  </div>
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <div>{plaka} · {location.speed || 0} km/s</div>
                    {regionSaved && <div className="text-emerald-600">Bölge: {selectedCity}</div>}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Harita Kontrolleri — Sağ Üst */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-[500] pointer-events-auto group-hover:opacity-100 opacity-90 transition-opacity">
          <div className="bg-[#0f172a] rounded-xl shadow-xl border border-white/[0.08] overflow-hidden">
            <button 
              onClick={() => setShowLayers(!showLayers)} 
              className={`p-2.5 hover:bg-white/[0.05] transition-colors flex items-center justify-center ${showLayers ? 'text-blue-400 bg-white/[0.05]' : 'text-slate-400'}`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
          
          <div className="bg-[#0f172a] rounded-xl shadow-xl border border-white/[0.08] overflow-hidden">
            <button onClick={() => zoomInRef.current()} className="p-2.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.05] flex items-center justify-center text-slate-400">
              <Plus className="w-4 h-4" />
            </button>
            <button onClick={() => zoomOutRef.current()} className="p-2.5 hover:bg-white/[0.05] transition-colors flex items-center justify-center text-slate-400">
              <Minus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Katman Menüsü — Sağ Üst Yan */}
        {showLayers && (
          <div className="absolute top-4 right-16 z-[500] bg-[#0f172a] rounded-xl shadow-2xl border border-white/[0.1] p-2 w-48 pointer-events-auto animate-in fade-in slide-in-from-right-2 duration-200">
            <div className="text-[10px] font-bold text-slate-500 mb-2 px-2 uppercase tracking-widest">Harita Tipi</div>
            <div className="space-y-1">
              {(['dark', 'satellite', 'standard'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setMapMode(mode); setShowLayers(false); }}
                  className={clsx(
                    "w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between",
                    mapMode === mode 
                      ? "bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/20 shadow-sm" 
                      : "hover:bg-white/[0.05] text-slate-400 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {mode === 'dark' ? <Moon className="w-3.5 h-3.5" /> : mode === 'satellite' ? <Globe className="w-3.5 h-3.5" /> : <MapIcon className="w-3.5 h-3.5" />}
                    {mode === 'dark' ? 'Karanlık Mod' : mode === 'satellite' ? 'Uydu Görüntüsü' : 'Standart'}
                  </div>
                  {mapMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GeofencingPanel;

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Circle, Tooltip, Polygon } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { VehiclePosition } from '../hooks/useMultiVehicleTracker';
import { Clock, Gauge, Wifi, WifiOff, Layers, Globe, Moon, Map as MapIcon, Plus, Minus, Navigation, Search, MapPin, ArrowRight, Ban } from 'lucide-react';
import { clsx } from 'clsx';

// Kısıtlı alan tipi renkleri
const ZONE_COLORS: Record<string, { stroke: string; fill: string }> = {
  'yasaklı_alan': { stroke: '#ef4444', fill: 'rgba(239, 68, 68, 0.2)' },
  'düşük_hız_bölgesi': { stroke: '#f59e0b', fill: 'rgba(245, 158, 11, 0.2)' },
  'yüksek_hız_bölgesi': { stroke: '#3b82f6', fill: 'rgba(59, 130, 246, 0.2)' },
  'tehlikeli_bölge': { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.2)' },
};

// Leaflet default icon fix
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Harika üst görünüm araç SVG ikonu
const createVehicleIcon = (color: string, plaka: string, isMoving: boolean) => {
  const pulse = isMoving ? `
    <circle cx="20" cy="20" r="18" fill="${color}" opacity="0.15">
      <animate attributeName="r" from="16" to="26" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.3" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>` : '';

  return L.divIcon({
    html: `
      <div style="position:relative; width:40px; height:40px;">
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          ${pulse}
          <!-- Araç gövdesi -->
          <rect x="12" y="8" width="16" height="24" rx="4" fill="${color}" stroke="white" stroke-width="2"/>
          <!-- Ön cam -->
          <rect x="14" y="11" width="12" height="6" rx="2" fill="rgba(255,255,255,0.4)"/>
          <!-- Arka cam -->
          <rect x="14" y="23" width="12" height="5" rx="1.5" fill="rgba(255,255,255,0.25)"/>
          <!-- Sol tekerlekler -->
          <rect x="8" y="11" width="5" height="7" rx="2" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
          <rect x="8" y="22" width="5" height="7" rx="2" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
          <!-- Sağ tekerlekler -->
          <rect x="27" y="11" width="5" height="7" rx="2" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
          <rect x="27" y="22" width="5" height="7" rx="2" fill="#1e293b" stroke="${color}" stroke-width="1.5"/>
          <!-- Ön farlar -->
          <ellipse cx="15" cy="9" rx="2" ry="1.2" fill="#fde68a"/>
          <ellipse cx="25" cy="9" rx="2" ry="1.2" fill="#fde68a"/>
          <!-- Stop lambaları -->
          <ellipse cx="15" cy="31" rx="2" ry="1.2" fill="#fca5a5"/>
          <ellipse cx="25" cy="31" rx="2" ry="1.2" fill="#fca5a5"/>
        </svg>
        <div style="
          position:absolute; bottom:-18px; left:50%; transform:translateX(-50%);
          background:${color}; color:white; font-size:8px; font-weight:700;
          padding:1px 5px; border-radius:4px; white-space:nowrap;
          box-shadow:0 1px 4px rgba(0,0,0,0.4); font-family:sans-serif;
          letter-spacing:0.03em; border: 1px solid rgba(255,255,255,0.3);
        ">${plaka}</div>
      </div>`,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -25],
  });
};

// Araç renk paleti
const VEHICLE_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#ec4899',
];

// Harita katmanları (TILES)
const TILES: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

// Saniyeye çevir
const timeAgo = (dateStr: string): string => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 10) return 'Az önce';
  if (diff < 60) return `${diff}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  return `${Math.floor(diff / 3600)}s önce`;
};

// Harita kontrollerini ayarla (zoom butonu vs için yardımcı)
const MapControls = ({ onZoomIn, onZoomOut, onFlyTo }: { onZoomIn: React.MutableRefObject<() => void>, onZoomOut: React.MutableRefObject<() => void>, onFlyTo: React.MutableRefObject<(lat: number, lon: number) => void> }) => {
  const map = useMap();
  useEffect(() => {
    onZoomIn.current = () => map.setZoom(map.getZoom() + 1);
    onZoomOut.current = () => map.setZoom(map.getZoom() - 1);
    onFlyTo.current = (lat: number, lon: number) => {
      map.flyTo([lat, lon], 15, { duration: 1.5 });
    };
  }, [map, onZoomIn, onZoomOut, onFlyTo]);
  return null;
};

// Tüm araçları haritaya sığdır
const FitBounds = ({ positions }: { positions: [number, number][] }) => {
  const map = useMap();
  const prevLen = useRef(0);
  useEffect(() => {
    if (positions.length > 0 && prevLen.current !== positions.length) {
      const bounds = L.latLngBounds(positions.map(p => L.latLng(p[0], p[1])));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 17, animate: true });
      }
      prevLen.current = positions.length;
    }
  }, [positions.length, map]);
  return null;
};

// Araç konumunu haritada canlı güncelle (yeniden mount etmeden)
const AnimatedMarker = ({
  position,
  icon,
  children,
}: {
  position: [number, number];
  icon: L.DivIcon;
  children: React.ReactNode;
}) => {
  const markerRef = useRef<L.Marker>(null);
  useEffect(() => {
    markerRef.current?.setLatLng(position);
  }, [position]);
  return (
    <Marker ref={markerRef} position={position} icon={icon}>
      {children}
    </Marker>
  );
};

interface KisitliAlan {
  alan_id: number;
  alan_adi: string;
  alan_tipi: string;
  aciklama?: string;
  merkez_enlem: number;
  merkez_boylam: number;
  yaricap_metre: number;
  max_hiz_kmh?: number;
  durum: boolean;
  geometri_tipi?: string; // 'daire' | 'poligon'
  koordinatlar?: [number, number][]; // Poligon için koordinat dizisi
}

interface MultiVehicleMapProps {
  positions: Map<number, VehiclePosition>;
  trailHistory: Map<number, [number, number][]>;
  errors: Map<number, string>;
  kisitliAlanlar?: KisitliAlan[];
}

export const MultiVehicleMap: React.FC<MultiVehicleMapProps> = ({
  positions, trailHistory, errors, kisitliAlanlar = []
}) => {
  const [mapMode, setMapMode] = React.useState<'dark' | 'satellite' | 'standard'>('satellite');
  const [showLayers, setShowLayers] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResult, setSearchResult] = React.useState<{lat: number, lon: number, display_name: string} | null>(null);
  
  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});
  const mapFlyToRef = useRef<(lat: number, lon: number) => void>(() => {});

  const allPositions: [number, number][] = Array.from(positions.values()).map(
    v => [v.enlem, v.boylam]
  );

  // Adres arama fonksiyonu
  const handleSearch = async () => {
    if (!searchQuery || searchQuery.trim().length < 3) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`http://localhost:3000/api/kisitli-alanlar/geocode/search?q=${encodeURIComponent(searchQuery)}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        setSearchResult(result.data);
        // Haritaya git
        mapFlyToRef.current(result.data.lat, result.data.lon);
      } else {
        alert('Adres bulunamadı. Lütfen daha açık bir adres girin.');
      }
    } catch (error) {
      console.error('Adres arama hatası:', error);
      alert('Adres arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative group" style={{ minHeight: 450 }}>
      <MapContainer
        center={[39.0, 35.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <MapControls onZoomIn={zoomInRef} onZoomOut={zoomOutRef} onFlyTo={mapFlyToRef} />
        
        <TileLayer
          url={TILES[mapMode]}
          attribution={mapMode === 'satellite' ? 'Esri' : '&copy; CartoDB'}
        />

        <FitBounds positions={allPositions} />

        {Array.from(positions.values()).map((vehicle, idx) => {
          const color = VEHICLE_COLORS[idx % VEHICLE_COLORS.length];
          const pos: [number, number] = [vehicle.enlem, vehicle.boylam];
          const trail = trailHistory.get(vehicle.arac_id) || [];
          const isMoving = vehicle.hiz > 0;
          const icon = createVehicleIcon(color, vehicle.plaka, isMoving);
          const ageMs = Date.now() - vehicle.lastUpdated;
          const isStale = ageMs > 15000; // 15s'den eski

          return (
            <React.Fragment key={vehicle.arac_id}>
              {/* Güzergah çizgisi */}
              {trail.length > 1 && (
                <Polyline
                  positions={trail}
                  pathOptions={{ color, weight: 2.5, opacity: 0.6, lineCap: 'round', lineJoin: 'round' }}
                />
              )}

              {/* Araç marker */}
              <AnimatedMarker position={pos} icon={icon}>
                <Popup>
                  <div className="font-sans p-0.5 min-w-[200px]">
                    {/* Başlık */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                      <div>
                        <span className="font-bold text-slate-800 text-sm">{vehicle.plaka}</span>
                        <span className="text-slate-400 text-xs ml-2">{vehicle.marka} {vehicle.model}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500"><Gauge className="w-3 h-3"/>Hız</span>
                        <span className="font-semibold text-slate-700">{vehicle.hiz} km/s</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500">
                          {vehicle.motor_durum ? <Wifi className="w-3 h-3 text-emerald-500"/> : <WifiOff className="w-3 h-3 text-red-400"/>}
                          Durum
                        </span>
                        <span className={`font-semibold ${vehicle.motor_durum ? 'text-emerald-600' : 'text-red-500'}`}>
                          {vehicle.motor_durum ? 'Aktif' : 'Kapalı'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3"/>Güncelleme</span>
                        <span className={`font-semibold ${isStale ? 'text-orange-500' : 'text-slate-700'}`}>
                          {timeAgo(vehicle.kayit_tarihi)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Koordinat</span>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {vehicle.enlem.toFixed(4)}, {vehicle.boylam.toFixed(4)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </AnimatedMarker>
            </React.Fragment>
          );
        })}

        {/* Kısıtlı Alanlar (Yasaklı Bölgeler) */}
        {(() => {
          console.log('=== KISITLI ALANLAR DEBUG ===');
          console.log('Toplam alan sayısı:', kisitliAlanlar.length);
          kisitliAlanlar.forEach((alan, i) => {
            console.log(`Alan ${i}:`, {
              id: alan.alan_id,
              adi: alan.alan_adi,
              tipi: alan.geometri_tipi,
              enlem: alan.merkez_enlem,
              boylam: alan.merkez_boylam,
              yaricap: alan.yaricap_metre,
              koordinatSayisi: alan.koordinatlar?.length || 0,
              koordinatlarVarmi: !!alan.koordinatlar,
              koordinatlarTipi: alan.koordinatlar ? typeof alan.koordinatlar : 'yok',
              durum: alan.durum
            });
          });
          return null;
        })()}
        {kisitliAlanlar
          .filter(alan => {
            // Geçerli koordinat kontrolü
            const validCoords = alan.merkez_enlem != null && 
                               alan.merkez_boylam != null &&
                               !isNaN(alan.merkez_enlem) && 
                               !isNaN(alan.merkez_boylam) &&
                               alan.merkez_enlem !== 0 && 
                               alan.merkez_boylam !== 0;
            return alan.durum && validCoords;
          })
          .map((alan) => {
          // Parse koordinatlar if string
          let koordinatlar: [number, number][] | undefined = alan.koordinatlar;
          if (typeof koordinatlar === 'string') {
            try {
              koordinatlar = JSON.parse(koordinatlar);
            } catch (e) {
              console.error('Koordinatlar parse hatası:', e);
              koordinatlar = undefined;
            }
          }
          
          const colors = ZONE_COLORS[alan.alan_tipi] || ZONE_COLORS['yasaklı_alan'];
          const isPolygon = alan.geometri_tipi === 'poligon' && koordinatlar && koordinatlar.length > 2;
          
          // Tooltip içeriği
          const tooltipContent = (
            <Tooltip direction="top" offset={[0, -10]}>
              <div className="p-2 min-w-[150px]">
                <div className="flex items-center gap-2 mb-1">
                  <Ban className="w-4 h-4" style={{ color: colors.stroke }} />
                  <span className="font-bold text-sm">{alan.alan_adi}</span>
                </div>
                <p className="text-xs text-slate-600 mb-1">{alan.aciklama}</p>
                <div className="text-[10px] text-slate-500">
                  {isPolygon ? (
                    <span><span className="font-semibold">Tip:</span> Poligon ({alan.koordinatlar?.length} nokta)</span>
                  ) : (
                    <span><span className="font-semibold">Yarıçap:</span> {alan.yaricap_metre}m</span>
                  )}
                  {alan.max_hiz_kmh && (
                    <span className="ml-2">| <span className="font-semibold">Max Hız:</span> {alan.max_hiz_kmh} km/s</span>
                  )}
                </div>
              </div>
            </Tooltip>
          );
          
          if (isPolygon) {
            // Poligon gösterimi (hassas sınır)
            return (
              <Polygon
                key={`zone-${alan.alan_id}`}
                positions={alan.koordinatlar!}
                pathOptions={{
                  color: colors.stroke,
                  fillColor: colors.fill,
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              >
                {tooltipContent}
              </Polygon>
            );
          }
          
          // Daire gösterimi (varsayılan)
          const center: [number, number] = [alan.merkez_enlem, alan.merkez_boylam];
          return (
            <Circle
              key={`zone-${alan.alan_id}`}
              center={center}
              radius={alan.yaricap_metre || 100}
              pathOptions={{
                color: colors.stroke,
                fillColor: colors.fill,
                fillOpacity: 0.3,
                weight: 2,
                dashArray: '5, 5',
              }}
            >
              {tooltipContent}
            </Circle>
          );
        })}
      </MapContainer>

      {/* Adres Arama — Sol Üst */}
      <div className="absolute top-4 left-4 z-[500] pointer-events-auto">
        <div className="bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-2xl border border-white/[0.1] p-2 flex items-center gap-2 min-w-[320px]">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Adres ara... (örn: Kızılay, Ankara)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-3 py-2.5 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || searchQuery.trim().length < 3}
            className="p-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors"
            title="Ara"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => searchResult && mapFlyToRef.current(searchResult.lat, searchResult.lon)}
            disabled={!searchResult}
            className="p-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-white transition-colors"
            title="Adrese Git"
          >
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        {/* Arama Sonucu */}
        {searchResult && (
          <div className="mt-2 bg-[#0f172a]/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/[0.1] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start gap-2">
              <Navigation className="w-4 h-4 text-emerald-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-300 truncate" title={searchResult.display_name}>
                  {searchResult.display_name}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 font-mono">
                  {searchResult.lat.toFixed(6)}, {searchResult.lon.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Harita Kontrolleri — Sağ Üst */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[500] pointer-events-auto group-hover:opacity-100 opacity-90 transition-opacity">
        <div className="bg-[#0f172a] rounded-xl shadow-xl border border-white/[0.08] overflow-hidden">
          <button 
            onClick={() => setShowLayers(!showLayers)} 
            className={`p-2.5 hover:bg-white/[0.05] transition-colors flex items-center justify-center ${showLayers ? 'text-blue-400 bg-white/[0.05]' : 'text-slate-400'}`}
          >
            <Layers className="w-4.5 h-4.5" />
          </button>
        </div>
        
        <div className="bg-[#0f172a] rounded-xl shadow-xl border border-white/[0.08] overflow-hidden">
          <button onClick={() => zoomInRef.current()} className="p-2.5 hover:bg-white/[0.05] transition-colors border-b border-white/[0.05] flex items-center justify-center text-slate-400">
            <Plus className="w-4.5 h-4.5" />
          </button>
          <button onClick={() => zoomOutRef.current()} className="p-2.5 hover:bg-white/[0.05] transition-colors flex items-center justify-center text-slate-400">
            <Minus className="w-4.5 h-4.5" />
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
  );
};

export default MultiVehicleMap;

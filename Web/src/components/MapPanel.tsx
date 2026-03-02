import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Plus, 
  Minus,
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Maximize,
  Compass,
  Settings,
  Navigation,
  Thermometer,
  Droplets,
  Gauge,
  Eye,
  EyeOff
} from 'lucide-react';
import { clsx } from 'clsx';

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Ankara demo coordinates
const CENTER_POS: L.LatLngExpression = [39.925054, 32.836944];
const GEOFENCE_COORDS: L.LatLngExpression[] = [
  [39.928, 32.835],
  [39.928, 32.845],
  [39.922, 32.845],
  [39.922, 32.835],
];
const ROUTE_PATH: [number, number][] = [
  [39.932, 32.830],
  [39.930, 32.832],
  [39.928, 32.835],
  [39.926, 32.840],
  [39.924, 32.845],
  [39.922, 32.850],
];

const TILES: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

const getPositionAtProgress = (path: [number, number][], progress: number): [number, number] => {
  const totalLength = path.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    const prev = path[i - 1];
    return acc + Math.sqrt((curr[0] - prev[0]) ** 2 + (curr[1] - prev[1]) ** 2);
  }, 0);
  const targetDist = totalLength * (progress / 100);
  let currentDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segDist = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
    if (currentDist + segDist >= targetDist) {
      const t = segDist === 0 ? 0 : (targetDist - currentDist) / segDist;
      return [p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t];
    }
    currentDist += segDist;
  }
  return path[path.length - 1];
};

// Calculate bearing between two points (degrees, 0 = north, clockwise)
const getBearing = (from: [number, number], to: [number, number]): number => {
  const dLon = ((to[1] - from[1]) * Math.PI) / 180;
  const lat1 = (from[0] * Math.PI) / 180;
  const lat2 = (to[0] * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
};

const getBearingAtProgress = (path: [number, number][], progress: number): number => {
  const totalLength = path.reduce((acc, curr, i) => {
    if (i === 0) return 0;
    const prev = path[i - 1];
    return acc + Math.sqrt((curr[0] - prev[0]) ** 2 + (curr[1] - prev[1]) ** 2);
  }, 0);
  const targetDist = totalLength * (progress / 100);
  let currentDist = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const segDist = Math.sqrt((p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2);
    if (currentDist + segDist >= targetDist) {
      return getBearing(p1, p2);
    }
    currentDist += segDist;
  }
  return getBearing(path[path.length - 2], path[path.length - 1]);
};

// Realistic top-down car SVG
const createCarIconHtml = (rotation: number) => `
  <div style="position:relative;width:56px;height:56px;display:flex;align-items:center;justify-content:center;">
    <!-- Radar ping -->
    <div style="position:absolute;inset:4px;border-radius:50%;border:2px solid #3b82f6;animation:ping 2s cubic-bezier(0,0,.2,1) infinite;opacity:.4;"></div>
    <div style="position:absolute;inset:8px;border-radius:50%;border:1.5px solid #60a5fa;animation:ping 2s cubic-bezier(0,0,.2,1) infinite;animation-delay:.5s;opacity:.25;"></div>
    <!-- Car container with rotation -->
    <div style="transform:rotate(${rotation}deg);transition:transform 0.6s ease;width:36px;height:36px;position:relative;z-index:10;filter:drop-shadow(0 4px 8px rgba(0,0,0,.5));">
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" width="36" height="36">
        <!-- Shadow -->
        <ellipse cx="50" cy="52" rx="22" ry="38" fill="rgba(0,0,0,0.2)" />
        <!-- Car body -->
        <rect x="30" y="12" width="40" height="76" rx="18" ry="18" fill="#1e3a5f" stroke="#0ea5e9" stroke-width="1.5"/>
        <!-- Roof / cabin -->
        <rect x="35" y="30" width="30" height="32" rx="8" ry="6" fill="#0c4a6e" stroke="#38bdf8" stroke-width="0.8" opacity="0.9"/>
        <!-- Windshield (front) -->
        <path d="M37 32 Q50 22 63 32 L60 38 Q50 34 40 38 Z" fill="#7dd3fc" opacity="0.7"/>
        <!-- Rear window -->
        <path d="M40 56 Q50 60 60 56 L63 62 Q50 68 37 62 Z" fill="#7dd3fc" opacity="0.5"/>
        <!-- Headlights -->
        <rect x="34" y="13" width="8" height="4" rx="2" fill="#facc15" opacity="0.95">
          <animate attributeName="opacity" values="0.95;0.6;0.95" dur="1.5s" repeatCount="indefinite"/>
        </rect>
        <rect x="58" y="13" width="8" height="4" rx="2" fill="#facc15" opacity="0.95">
          <animate attributeName="opacity" values="0.95;0.6;0.95" dur="1.5s" repeatCount="indefinite"/>
        </rect>
        <!-- Headlight beams -->
        <path d="M36 13 L32 4 L42 4 Z" fill="#fef08a" opacity="0.3"/>
        <path d="M60 13 L58 4 L68 4 Z" fill="#fef08a" opacity="0.3"/>
        <!-- Taillights -->
        <rect x="34" y="83" width="8" height="3" rx="1.5" fill="#ef4444" opacity="0.9"/>
        <rect x="58" y="83" width="8" height="3" rx="1.5" fill="#ef4444" opacity="0.9"/>
        <!-- Side mirrors -->
        <ellipse cx="28" cy="34" rx="3" ry="2.5" fill="#1e3a5f" stroke="#0ea5e9" stroke-width="0.8"/>
        <ellipse cx="72" cy="34" rx="3" ry="2.5" fill="#1e3a5f" stroke="#0ea5e9" stroke-width="0.8"/>
        <!-- Wheels -->
        <rect x="26" y="22" width="5" height="12" rx="2.5" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
        <rect x="69" y="22" width="5" height="12" rx="2.5" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
        <rect x="26" y="64" width="5" height="12" rx="2.5" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
        <rect x="69" y="64" width="5" height="12" rx="2.5" fill="#1e293b" stroke="#475569" stroke-width="0.5"/>
        <!-- Direction arrow (subtle) -->
        <polygon points="50,2 44,9 56,9" fill="#0ea5e9" opacity="0.8"/>
      </svg>
    </div>
    <!-- Glow ring -->
    <div style="position:absolute;inset:10px;border-radius:50%;box-shadow:0 0 12px 3px rgba(14,165,233,0.35);pointer-events:none;"></div>
  </div>`;

const startIconHtml = `<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>`;

const endIconHtml = `
  <div style="position:relative;">
    <div style="position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:#dc2626;color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:4px;box-shadow:0 2px 6px rgba(0,0,0,.3);white-space:nowrap;">VARIŞ</div>
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" stroke="#dc2626" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  </div>`;

export function MapPanel() {
  const mapRef = useRef<L.Map | null>(null);
  const tileRef = useRef<L.TileLayer | null>(null);
  const carMarkerRef = useRef<L.Marker | null>(null);
  const mapElRef = useRef<HTMLDivElement>(null);
  const currentBearingRef = useRef(0);

  const [mapMode, setMapMode] = useState<'standard' | 'dark' | 'satellite'>('dark');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showLayers, setShowLayers] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(true);
  const [carPosition, setCarPosition] = useState<[number, number]>(ROUTE_PATH[0]);

  // Initialise Leaflet map once
  useEffect(() => {
    if (!mapElRef.current || mapRef.current) return;

    const map = L.map(mapElRef.current, {
      center: CENTER_POS,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    const tile = L.tileLayer(TILES.dark).addTo(map);
    tileRef.current = tile;

    // Geofence
    L.polygon(GEOFENCE_COORDS as L.LatLngExpression[], {
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.1,
      dashArray: '8,4',
      weight: 2,
    }).addTo(map);

    // Route background
    L.polyline(ROUTE_PATH, { color: '#334155', weight: 6, opacity: 0.5, lineCap: 'round' }).addTo(map);
    // Route active
    L.polyline(ROUTE_PATH, { color: '#22c55e', weight: 3, opacity: 0.8, lineCap: 'round', dashArray: '10 10' }).addTo(map);

    // Start marker
    L.marker(ROUTE_PATH[0], {
      icon: L.divIcon({ html: startIconHtml, className: '', iconSize: [14, 14], iconAnchor: [7, 7] }),
    }).addTo(map);

    // End marker
    L.marker(ROUTE_PATH[ROUTE_PATH.length - 1], {
      icon: L.divIcon({ html: endIconHtml, className: '', iconSize: [32, 32], iconAnchor: [16, 32] }),
    }).addTo(map);

    // Car marker
    const initialBearing = getBearing(ROUTE_PATH[0], ROUTE_PATH[1]);
    currentBearingRef.current = initialBearing;
    const carMarker = L.marker(ROUTE_PATH[0], {
      icon: L.divIcon({ html: createCarIconHtml(initialBearing), className: '', iconSize: [56, 56], iconAnchor: [28, 28] }),
    }).addTo(map);
    carMarker.bindPopup(`<div style="font-size:12px;font-family:sans-serif;"><b>34 ABC 123</b><br/><span style="color:#6b7280;">Hız: 72 km/s</span></div>`);
    carMarkerRef.current = carMarker;

    mapRef.current = map;

    // Ensure tiles render correctly after mount
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update tile layer on mode change
  useEffect(() => {
    if (!mapRef.current || !tileRef.current) return;
    tileRef.current.setUrl(TILES[mapMode]);
  }, [mapMode]);

  // Playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return p + 0.5;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Move car marker on progress change
  useEffect(() => {
    const pos = getPositionAtProgress(ROUTE_PATH, progress);
    const bearing = getBearingAtProgress(ROUTE_PATH, progress);
    setCarPosition(pos);
    currentBearingRef.current = bearing;
    if (carMarkerRef.current) {
      carMarkerRef.current.setLatLng(pos);
      carMarkerRef.current.setIcon(
        L.divIcon({ html: createCarIconHtml(bearing), className: '', iconSize: [56, 56], iconAnchor: [28, 28] })
      );
    }
  }, [progress]);

  const handleZoomIn = useCallback(() => mapRef.current?.zoomIn(), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut(), []);

  return (
    <div className="relative flex-1 bg-gray-900 overflow-hidden rounded-xl border border-gray-700 shadow-2xl m-4 min-h-[500px] h-[600px] group flex flex-col">

      {/* Leaflet mounts here */}
      <div ref={mapElRef} className="flex-1 z-0" />

      {/* Ping keyframe for car icon */}
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}`}</style>

      {/* ---- OVERLAYS ---- */}

      {/* Top Bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-[500] pointer-events-none">
        {/* Live Status */}
        <div className="pointer-events-auto bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-3">
          <div className="relative">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
            <div className="w-3 h-3 bg-red-500 rounded-full relative" />
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-bold tracking-wider">DURUM</div>
            <div className="text-xs font-bold">CANLI İZLEME</div>
          </div>
          <div className="h-6 w-px bg-gray-700 mx-1" />
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono">{carPosition[0].toFixed(4)}° N, {carPosition[1].toFixed(4)}° E</span>
          </div>
        </div>

        {/* Controls */}
        <div className="pointer-events-auto flex flex-col gap-2">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden text-gray-700">
            <button onClick={() => setShowLayers(v => !v)} className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </button>
            <button onClick={() => setShowTelemetry(v => !v)} className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
              {showTelemetry ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
            </button>
            <button className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </button>
            <button className="p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center">
              <Maximize className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mt-2 text-gray-700">
            <button onClick={handleZoomIn} className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
            <button onClick={handleZoomOut} className="p-2.5 hover:bg-gray-50 transition-colors flex items-center justify-center">
              <Minus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Layer Menu */}
      {showLayers && (
        <div className="absolute top-4 right-16 z-[500] bg-white rounded-lg shadow-xl border border-gray-200 p-2 w-48 pointer-events-auto">
          <div className="text-xs font-bold text-gray-400 mb-2 px-2">HARİTA TİPİ</div>
          {(['standard', 'satellite', 'dark'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setMapMode(mode)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-md text-sm mb-1 flex items-center justify-between",
                mapMode === mode ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700"
              )}
            >
              {mode === 'standard' ? 'Standart' : mode === 'satellite' ? 'Uydu' : 'Karanlık Mod'}
              {mapMode === mode && <div className="w-2 h-2 rounded-full bg-blue-500" />}
            </button>
          ))}
        </div>
      )}

      {/* Telemetry */}
      {showTelemetry && (
        <div className="absolute top-24 left-4 z-[500] bg-slate-900/90 backdrop-blur-md border border-slate-700 text-white p-4 rounded-xl shadow-2xl w-64 pointer-events-none select-none">
          <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-2 pointer-events-auto">
            <h3 className="font-bold text-sm">ARAÇ TELEMETRİ</h3>
            <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-white" />
          </div>
          <div className="space-y-4 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Gauge className="w-4 h-4" /><span>Motor Devri</span></div>
              <span className="font-mono font-bold text-blue-400">2400 RPM</span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }} />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Thermometer className="w-4 h-4" /><span>Motor Sıcaklığı</span></div>
              <span className="font-mono font-bold text-green-400">90°C</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-xs"><Droplets className="w-4 h-4" /><span>Yakıt Seviyesi</span></div>
              <span className="font-mono font-bold text-yellow-400">%42</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Playback */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-[500] flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-2">
          <button onClick={() => { setProgress(0); setIsPlaying(false); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <SkipBack className="w-4 h-4" />
          </button>
          <button
            onClick={() => { if (progress >= 100) setProgress(0); setIsPlaying(v => !v); }}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>
          <button onClick={() => { setProgress(100); setIsPlaying(false); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase mb-1">
            <span>09:00</span>
            <span>Canlı</span>
          </div>
          <div
            className="relative w-full h-2 bg-gray-200 rounded-full cursor-pointer group"
            onClick={e => {
              const rect = e.currentTarget.getBoundingClientRect();
              setProgress(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)));
            }}
          >
            <div className="absolute left-0 top-0 bottom-0 bg-blue-500 rounded-full transition-all duration-100" style={{ width: `${progress}%` }} />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md transition-all duration-100 group-hover:scale-125"
              style={{ left: `${progress}%`, marginLeft: '-8px' }}
            />
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 border-l border-gray-200">
          <div className="text-right">
            <div className="text-[10px] text-gray-500 uppercase">Hız</div>
            <div className="text-sm font-bold font-mono">1x</div>
          </div>
        </div>
      </div>
    </div>
  );
}
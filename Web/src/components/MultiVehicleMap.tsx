import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { VehiclePosition } from '../hooks/useMultiVehicleTracker';
import { Clock, Gauge, Wifi, WifiOff } from 'lucide-react';

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

// Saniyeye çevir
const timeAgo = (dateStr: string): string => {
  if (!dateStr) return '—';
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 10) return 'Az önce';
  if (diff < 60) return `${diff}s önce`;
  if (diff < 3600) return `${Math.floor(diff / 60)}dk önce`;
  return `${Math.floor(diff / 3600)}s önce`;
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

interface MultiVehicleMapProps {
  positions: Map<number, VehiclePosition>;
  trailHistory: Map<number, [number, number][]>;
  errors: Map<number, string>;
}

export const MultiVehicleMap: React.FC<MultiVehicleMapProps> = ({
  positions, trailHistory, errors
}) => {
  const allPositions: [number, number][] = Array.from(positions.values()).map(
    v => [v.enlem, v.boylam]
  );

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden" style={{ minHeight: 450 }}>
      <MapContainer
        center={[39.0, 35.0]}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com">CartoDB</a>'
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
      </MapContainer>
    </div>
  );
};

export default MultiVehicleMap;

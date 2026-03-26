import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { useLocationUpdater } from '../hooks/useLocationUpdater';
import {
  Car, AlertCircle, Navigation, Gauge, Mountain,
  Target, Radio, RotateCcw, TrendingUp
} from 'lucide-react';

// Marker icon fix (Vite/ESM - CDN)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Özel araç ikonu (yönlendirilebilir)
const createCarIcon = (heading: number | null) => {
  const rotation = heading ?? 0;
  return L.divIcon({
    html: `
      <div style="
        transform: rotate(${rotation}deg);
        width: 32px; height: 32px;
        background: linear-gradient(135deg, #3b82f6, #8b5cf6);
        border-radius: 50% 50% 50% 0;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59,130,246,0.6);
        display: flex; align-items: center; justify-content: center;
        transition: transform 0.5s ease;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L8 10H4l8 12 8-12h-4L12 2z"/>
        </svg>
      </div>`,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

// GPS Sinyal kalitesi hesapla
const getSignalQuality = (accuracy: number | null) => {
  if (!accuracy) return { label: 'Bilinmiyor', color: '#94a3b8', bars: 0 };
  if (accuracy <= 5) return { label: 'Mükemmel', color: '#22c55e', bars: 5 };
  if (accuracy <= 10) return { label: 'Çok İyi', color: '#84cc16', bars: 4 };
  if (accuracy <= 25) return { label: 'İyi', color: '#eab308', bars: 3 };
  if (accuracy <= 50) return { label: 'Orta', color: '#f97316', bars: 2 };
  return { label: 'Zayıf', color: '#ef4444', bars: 1 };
};

// Yön adını hesapla
const getHeadingLabel = (heading: number | null): string => {
  if (heading === null) return '—';
  const dirs = ['K', 'KD', 'D', 'GD', 'G', 'GB', 'B', 'KB'];
  return dirs[Math.round(heading / 45) % 8];
};

// Mesafe formatı
const formatDistance = (metres: number): string => {
  if (metres < 1000) return `${metres.toFixed(0)} m`;
  return `${(metres / 1000).toFixed(2)} km`;
};

// Haritayı konuma göre kaydır
const RecenterMap = ({ lat, lng }: { lat: number; lng: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lng) map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

interface LiveTrackerMapProps {
  aracId: number | null;
  plaka?: string;
}

const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/10">
    <div className={`p-1.5 rounded-lg`} style={{ background: `${color}22` }}>
      <Icon className="w-3.5 h-3.5" style={{ color }} />
    </div>
    <div>
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-none mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-white leading-none">{value}</p>
    </div>
  </div>
);

export const LiveTrackerMap: React.FC<LiveTrackerMapProps> = ({ aracId, plaka = 'Araç' }) => {
  const { location, history, error, isTracking, setIsTracking, updateCount, totalDistance, resetTracking } = useLocationTracking();
  useLocationUpdater(location, aracId);

  const signal = getSignalQuality(location.accuracy);
  const defaultCenter: [number, number] = [39.0, 35.0];
  const position: [number, number] = location.latitude && location.longitude
    ? [location.latitude, location.longitude] : defaultCenter;

  const trailPoints: [number, number][] = history.map(p => [p.lat, p.lng]);

  return (
    <div className="flex flex-col gap-4 h-full min-h-[550px]">

      {/* Üst Kontrol Paneli */}
      <div className="bg-[#0f172a] rounded-2xl border border-white/[0.07] shadow-2xl overflow-hidden">

        {/* Başlık satırı */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0">
              <Car className="w-5 h-5 text-white" />
              {isTracking && location.latitude && (
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#0f172a] animate-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-white font-bold text-[15px] tracking-tight leading-none">{plaka}</h2>
              <div className="flex items-center gap-2 mt-1">
                {isTracking && location.latitude ? (
                  <span className="text-emerald-400 text-[11px] font-semibold">● CANLI</span>
                ) : (
                  <span className="text-slate-500 text-[11px]">Takip Bekleniyor</span>
                )}
                {updateCount > 0 && (
                  <span className="text-slate-600 text-[10px]">· {updateCount} güncelleme</span>
                )}
              </div>
            </div>
          </div>

          {/* GPS Sinyal Göstergesi */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">GPS Sinyal</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: signal.color }}>{signal.label}</p>
            </div>
            <div className="flex items-end gap-0.5 h-5">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className="w-1.5 rounded-sm transition-all duration-300"
                  style={{
                    height: `${i * 20}%`,
                    background: i <= signal.bars ? signal.color : '#334155',
                    opacity: i <= signal.bars ? 1 : 0.4
                  }}
                />
              ))}
            </div>

            {/* Aksiyon Butonları */}
            <div className="flex gap-2 ml-3">
              {isTracking && (
                <button
                  onClick={resetTracking}
                  title="Rotayı Sıfırla"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/10 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsTracking(!isTracking)}
                disabled={!aracId}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 border ${
                  !aracId
                    ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
                    : isTracking
                      ? 'bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30 active:scale-95'
                      : 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30 active:scale-95'
                }`}
              >
                {isTracking ? (
                  <><span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />Durdur</>
                ) : (
                  <><Navigation className="w-3.5 h-3.5" />Başlat</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="flex items-center gap-2 px-5 py-3 bg-red-500/10 border-b border-red-500/20">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-4">
          <StatCard
            icon={Gauge}
            label="Hız"
            value={`${location.speed ?? 0} km/s`}
            color="#3b82f6"
          />
          <StatCard
            icon={Navigation}
            label="Yön"
            value={location.heading !== null
              ? `${location.heading}° ${getHeadingLabel(location.heading)}`
              : '—'}
            color="#8b5cf6"
          />
          <StatCard
            icon={Mountain}
            label="İrtifa"
            value={location.altitude !== null ? `${location.altitude} m` : '—'}
            color="#22c55e"
          />
          <StatCard
            icon={Target}
            label="GPS Doğruluğu"
            value={location.accuracy !== null ? `±${location.accuracy} m` : '—'}
            color="#f59e0b"
          />
          <StatCard
            icon={TrendingUp}
            label="Toplam Mesafe"
            value={formatDistance(totalDistance)}
            color="#06b6d4"
          />
          <StatCard
            icon={Radio}
            label="Koordinatlar"
            value={location.latitude ? `${location.latitude.toFixed(4)}, ${location.longitude!.toFixed(4)}` : '—'}
            color="#ec4899"
          />
          <StatCard
            icon={Navigation}
            label="İzlenen Nokta"
            value={`${history.length} / 200`}
            color="#a78bfa"
          />
          <StatCard
            icon={Target}
            label="İrt. Doğruluğu"
            value={location.altitudeAccuracy !== null ? `±${location.altitudeAccuracy} m` : '—'}
            color="#fb923c"
          />
        </div>
      </div>

      {/* Harita */}
      <div className="flex-1 w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50 min-h-[400px] relative z-0">

        {!aracId && (
          <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center">
            <div className="bg-[#1E293B] p-8 rounded-2xl shadow-2xl text-center max-w-xs border border-white/10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-700 flex items-center justify-center">
                <Car className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-white text-lg font-bold mb-2">Araç Seçilmedi</h3>
              <p className="text-slate-400 text-sm">Takibi başlatmak için lütfen araç seçin.</p>
            </div>
          </div>
        )}

        <MapContainer
          center={position}
          zoom={location.latitude ? 16 : 6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {location.latitude && location.longitude && (
            <>
              {isTracking && <RecenterMap lat={location.latitude} lng={location.longitude} />}

              {/* GPS Doğruluk Halkası */}
              {location.accuracy && (
                <Circle
                  center={position}
                  radius={location.accuracy}
                  pathOptions={{
                    color: signal.color,
                    fillColor: signal.color,
                    fillOpacity: 0.08,
                    weight: 1.5,
                    dashArray: '4 4'
                  }}
                />
              )}

              {/* Hareket Rotası (Polyline trail) */}
              {trailPoints.length > 1 && (
                <Polyline
                  positions={trailPoints}
                  pathOptions={{
                    color: '#3b82f6',
                    weight: 3,
                    opacity: 0.7,
                    dashArray: undefined,
                    lineCap: 'round',
                    lineJoin: 'round',
                  }}
                />
              )}

              {/* Araç Markeri (yönlendirilebilir ok) */}
              <Marker position={position} icon={createCarIcon(location.heading)}>
                <Popup className="rounded-xl">
                  <div className="font-sans p-1 min-w-[180px]">
                    <div className="font-bold text-slate-800 text-sm border-b pb-1.5 mb-2">{plaka}</div>
                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span>Hız:</span>
                        <span className="font-semibold text-blue-600">{location.speed ?? 0} km/s</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yön:</span>
                        <span className="font-semibold">{location.heading !== null ? `${location.heading}° ${getHeadingLabel(location.heading)}` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>İrtifa:</span>
                        <span className="font-semibold">{location.altitude !== null ? `${location.altitude} m` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GPS ±:</span>
                        <span className="font-semibold" style={{ color: signal.color }}>{location.accuracy !== null ? `${location.accuracy} m` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Mesafe:</span>
                        <span className="font-semibold text-cyan-600">{formatDistance(totalDistance)}</span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default LiveTrackerMap;

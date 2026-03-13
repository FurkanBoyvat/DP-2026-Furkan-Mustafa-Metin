import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { MapContainer, TileLayer, Polygon, Circle, useMap, FeatureGroup, Popup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { 
  Plus, 
  Minus,
  Layers,
  Maximize,
  Compass,
  X,
  Save
} from 'lucide-react';
import { clsx } from 'clsx';
import { kisitliAlanAPI, sirketAPI } from '../services/api';

// Fix default Leaflet icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Fix Leaflet Draw ReferenceError: type is not defined
// This happens because internal tooltips sometimes expect L.drawLocal to be fully initialized.
(L as any).drawLocal = {
  draw: {
    toolbar: {
      actions: { title: 'İptal', text: 'İptal' },
      finish: { title: 'Bitir', text: 'Bitir' },
      undo: { title: 'Geri Al', text: 'Son noktayı sil' },
      buttons: {
        polyline: 'Çizgi çiz',
        polygon: 'Bölge (çokgen) çiz',
        rectangle: 'Dikdörtgen çiz',
        circle: 'Daire çiz',
        marker: 'İşaretleyici koy',
        circlemarker: 'Dairesel işaretleyici koy'
      }
    },
    handlers: {
      circle: { tooltip: { start: 'Daire çizmek için tıklayın ve sürükleyin.' }, radius: 'Yarıçap' },
      circlemarker: { tooltip: { start: 'İşaretleyici koymak için tıklayın.' } },
      marker: { tooltip: { start: 'İşaretleyici koymak için tıklayın.' } },
      polygon: {
        tooltip: {
          start: 'Bölge çizmeye başlamak için tıklayın.',
          cont: 'Çizime devam etmek için tıklayın.',
          end: 'Çizimi bitirmek için ilk noktaya tıklayın.'
        }
      },
      polyline: {
        error: '<strong>Hata:</strong> şekil kenarları kesişemez!',
        tooltip: {
          start: 'Çizgi çizmeye başlamak için tıklayın.',
          cont: 'Çizmeye devam etmek için tıklayın.',
          end: 'Çizimi bitirmek için son noktaya tıklayın.'
        }
      },
      rectangle: { tooltip: { start: 'Dikdörtgen çizmek için tıklayın ve sürükleyin.' } },
      simpleshape: { tooltip: { end: 'Çizimi bitirmek için fareyi bırakın.' } }
    }
  },
  edit: {
    toolbar: {
      actions: { save: { title: 'Kaydet', text: 'Kaydet' }, cancel: { title: 'İptal', text: 'İptal' }, clearAll: { title: 'Temizle', text: 'Hepsini Sil' } },
      buttons: { edit: 'Düzenle', editDisabled: 'Düzenlenecek öğe yok', remove: 'Sil', removeDisabled: 'Silinecek öğe yok' }
    },
    handlers: {
      edit: { tooltip: { text: 'Noktaları sürükleyerek düzenleyin.', subtext: 'İptal etmek için iptal butonuna basın.' } },
      remove: { tooltip: { text: 'Silmek istediğiniz öğeye tıklayın.' } }
    }
  }
};

// Ankara demo coordinates
const CENTER_POS: L.LatLngExpression = [39.925054, 32.836944];

// Giant world-bounding shell for inverted (outside) polygons
const WORLD_BOUNDS: [number, number][] = [
  [-90, -180], [-90, 180], [90, 180], [90, -180]
];

// Approximate a circle as a polygon with N sides
function circleToPolygon(lat: number, lng: number, radiusMetres: number, sides = 64): [number, number][] {
  const pts: [number, number][] = [];
  const earthR = 6378137;
  const dLat = (radiusMetres / earthR) * (180 / Math.PI);
  const dLng = dLat / Math.cos((lat * Math.PI) / 180);
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides;
    pts.push([lat + dLat * Math.sin(angle), lng + dLng * Math.cos(angle)]);
  }
  return pts;
}

const TILES: Record<string, string> = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  standard: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

// Set up MapControls as a child of MapContainer
function MapControls({ onZoomIn, onZoomOut }: { onZoomIn: React.MutableRefObject<() => void>, onZoomOut: React.MutableRefObject<() => void> }) {
  const map = useMap();
  useEffect(() => {
    onZoomIn.current = () => map.zoomIn();
    onZoomOut.current = () => map.zoomOut();
  }, [map, onZoomIn, onZoomOut]);
  return null;
}

export function MapPanel() {
  const [mapMode, setMapMode] = useState<'standard' | 'dark' | 'satellite'>('dark');
  const [showLayers, setShowLayers] = useState(false);
  
  const [kisitliAlanlar, setKisitliAlanlar] = useState<any[]>([]);
  const [sirketler, setSirketler] = useState<any[]>([]);
  
  // Modal state for drawn shapes
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingShape, setPendingShape] = useState<any>(null);
  const [formData, setFormData] = useState({
    alan_adi: '',
    sirket_id: '',
    alan_tipi: 'yasaklı_alan',
    aciklama: '',
    disKisitli: false   // true = OUTSIDE the drawn shape is restricted
  });

  const zoomInRef = useRef<() => void>(() => {});
  const zoomOutRef = useRef<() => void>(() => {});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [alanRes, sirketRes] = await Promise.all([
        kisitliAlanAPI.getAktif(),
        sirketAPI.getAll(),
      ]);
      setKisitliAlanlar(alanRes.data || alanRes.kisitli_alanlar || []);
      const loadedSirketler = sirketRes.data || sirketRes.sirketler || [];
      setSirketler(loadedSirketler);
      if (loadedSirketler.length > 0) {
        setFormData(f => ({ ...f, sirket_id: String(loadedSirketler[0].sirket_id) }));
      }
    } catch (e) {
      console.error("Harita verileri yüklenirken hata oluştu:", e);
    }
  };

  const handleCreated = (e: any) => {
    const { layerType, layer } = e;
    let geometri_tipi = 'daire';
    let koordinatlar = null;
    let merkez_enlem = null;
    let merkez_boylam = null;
    let yaricap_metre = null;

    if (layerType === 'polygon' || layerType === 'rectangle') {
      geometri_tipi = layerType === 'rectangle' ? 'dikdortgen' : 'cokgen';
      const latlngs = layer.getLatLngs()[0]; 
      koordinatlar = latlngs.map((ll: any) => [ll.lat, ll.lng]);
    } else if (layerType === 'circle') {
      geometri_tipi = 'daire';
      const latlng = layer.getLatLng();
      merkez_enlem = latlng.lat;
      merkez_boylam = latlng.lng;
      yaricap_metre = layer.getRadius();
    } else {
      layer.remove();
      return;
    }

    setPendingShape({
      layer,
      geometri_tipi,
      koordinatlar,
      merkez_enlem,
      merkez_boylam,
      yaricap_metre
    });
    setIsModalOpen(true);
  };

  const handleSaveShape = async () => {
    if (!formData.alan_adi || !formData.sirket_id) return;
    
    const geoTipi = formData.disKisitli ? `ters_${pendingShape.geometri_tipi}` : pendingShape.geometri_tipi;
    const koords = pendingShape.geometri_tipi === 'daire'
      ? circleToPolygon(pendingShape.merkez_enlem, pendingShape.merkez_boylam, pendingShape.yaricap_metre)
      : pendingShape.koordinatlar;

    const newZone = {
      alan_adi: formData.alan_adi,
      aciklama: formData.aciklama,
      sirket_id: parseInt(formData.sirket_id),
      alan_tipi: formData.alan_tipi,
      geometri_tipi: geoTipi,
      koordinatlar: koords,
      merkez_enlem: pendingShape.merkez_enlem,
      merkez_boylam: pendingShape.merkez_boylam,
      yaricap_metre: pendingShape.yaricap_metre,
      durum: true
    };

    // 1) Immediately add to local state so it renders on map instantly
    const tempId = Date.now();
    setKisitliAlanlar(prev => [...prev, { ...newZone, alan_id: tempId }]);

    // 2) Close the modal & clean up drawn layer
    setIsModalOpen(false);
    if (pendingShape && pendingShape.layer) pendingShape.layer.remove();
    setPendingShape(null);
    setFormData(f => ({ ...f, alan_adi: '', aciklama: '', disKisitli: false }));

    // 3) Save to database and then refresh from DB to get real IDs
    try {
      await kisitliAlanAPI.create(newZone);
      await loadData();
    } catch(e) {
      console.error("Şekil kaydedilirken hata oluştu:", e);
      // Zone is already visible via local state, it'll sync next time loadData succeeds
    }
  };

  const cancelShape = () => {
    if (pendingShape && pendingShape.layer) {
       pendingShape.layer.remove();
    }
    setPendingShape(null);
    setIsModalOpen(false);
  };

  const handleDeleteZone = async (alan_id: number) => {
    if (!window.confirm('Bu kısıtlı alanı silmek istediğinize emin misiniz?')) return;
    try {
      await kisitliAlanAPI.delete(alan_id);
      loadData();
    } catch(e) {
      console.error('Silme hatası:', e);
    }
  };

  const getPathOptions = (tipi: string) => {
    switch (tipi) {
      case 'yasaklı_alan': return { color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 2 };
      case 'düşük_hız_bölgesi': return { color: '#eab308', fillColor: '#eab308', fillOpacity: 0.2, weight: 2 };
      case 'yüksek_hız_bölgesi': return { color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.2, weight: 2 };
      case 'tehlikeli_bölge': return { color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, weight: 2 };
      default: return { color: '#6b7280', fillColor: '#6b7280', fillOpacity: 0.2, weight: 2 };
    }
  };

  const handleZoomIn = () => zoomInRef.current();
  const handleZoomOut = () => zoomOutRef.current();

  return (
    <div className="relative flex-1 bg-gray-900 overflow-hidden rounded-xl border border-gray-700 shadow-2xl m-4 min-h-[500px] h-[600px] group flex flex-col">

      {/* Leaflet mounts here */}
      <div className="flex-1 z-0 absolute inset-0">
        <MapContainer 
          center={CENTER_POS} 
          zoom={14} 
          zoomControl={false} 
          attributionControl={false} 
          className="w-full h-full"
        >
          <MapControls onZoomIn={zoomInRef} onZoomOut={zoomOutRef} />
          
          <TileLayer
            url={TILES[mapMode]}
          />

          <FeatureGroup>
            <EditControl
              position="topleft"
              onCreated={handleCreated}
              draw={{
                polyline: false,
                marker: false,
                circlemarker: false,
                circle: true,
                rectangle: true,
                polygon: true,
              }}
              edit={{ edit: false, remove: false }} // View only for existing DB shapes, edit in panel
            />
          </FeatureGroup>

          {/* Render Active Zones from DB */}
          {kisitliAlanlar.map((alan) => {
            const options = getPathOptions(alan.alan_tipi);
            const tipi: string = alan.geometri_tipi || 'daire';
            const isInverted = tipi.startsWith('ters_');

            const popupContent = (
              <div style={{ minWidth: 180, fontFamily: 'sans-serif' }}>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, color: '#1e293b' }}>{alan.alan_adi}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginBottom: 2 }}>Tip: {alan.alan_tipi?.replace(/_/g, ' ')}</div>
                {alan.aciklama && <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{alan.aciklama}</div>}
                <button
                  onClick={() => handleDeleteZone(alan.alan_id)}
                  style={{
                    marginTop: 6, width: '100%', background: '#ef4444', color: '#fff',
                    border: 'none', borderRadius: 6, padding: '6px 12px',
                    cursor: 'pointer', fontWeight: 600, fontSize: 13
                  }}
                >
                  🗑 Sil
                </button>
              </div>
            );

            // Normal circle
            if (tipi === 'daire' && alan.merkez_enlem && alan.merkez_boylam && alan.yaricap_metre) {
              return (
                <Circle 
                  key={alan.alan_id} 
                  center={[alan.merkez_enlem, alan.merkez_boylam]} 
                  radius={alan.yaricap_metre}
                  pathOptions={options}
                >
                  <Popup>{popupContent}</Popup>
                </Circle>
              );
            }

            // Normal polygon / rectangle
            if ((tipi === 'cokgen' || tipi === 'dikdortgen') && alan.koordinatlar) {
              const coords = typeof alan.koordinatlar === 'string' ? JSON.parse(alan.koordinatlar) : alan.koordinatlar;
              return (
                <Polygon 
                  key={alan.alan_id} 
                  positions={coords} 
                  pathOptions={options}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>
              );
            }

            // Inverted (outside restricted) shapes — world hull with inner hole
            if (isInverted && alan.koordinatlar) {
              const rawCoords = typeof alan.koordinatlar === 'string' ? JSON.parse(alan.koordinatlar) : alan.koordinatlar;
              return (
                <Polygon
                  key={alan.alan_id}
                  positions={[WORLD_BOUNDS, rawCoords]}
                  pathOptions={{ ...options, fillOpacity: 0.35 }}
                >
                  <Popup>{popupContent}</Popup>
                </Polygon>
              );
            }

            return null;
          })}

        </MapContainer>
      </div>

      {/* Modal for saving drawn shapes */}
      {isModalOpen && (
        <div className="absolute inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Kısıtlı Alan Kaydet</h3>
              <button onClick={cancelShape} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alan Adı *</label>
                <input 
                  type="text" 
                  value={formData.alan_adi}
                  onChange={e => setFormData({...formData, alan_adi: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-slate-900" 
                  placeholder="Örn: Merkez Depo Girişi"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şirket *</label>
                <select 
                  value={formData.sirket_id}
                  onChange={e => setFormData({...formData, sirket_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm text-slate-900"
                >
                  {sirketler.map(s => (
                    <option key={s.sirket_id} value={s.sirket_id}>{s.sirket_adi}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alan Tipi *</label>
                <select 
                  value={formData.alan_tipi}
                  onChange={e => setFormData({...formData, alan_tipi: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm text-slate-900"
                >
                  <option value="yasaklı_alan">Yasaklı Alan (Kırmızı)</option>
                  <option value="düşük_hız_bölgesi">Düşük Hız Bölgesi (Sarı)</option>
                  <option value="yüksek_hız_bölgesi">Yüksek Hız Bölgesi (Mavi)</option>
                  <option value="tehlikeli_bölge">Tehlikeli Bölge (Turuncu)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
                <textarea 
                  value={formData.aciklama}
                  onChange={e => setFormData({...formData, aciklama: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-slate-900 h-20" 
                  placeholder="Kısa bir açıklama..."
                />
              </div>

              {/* Inside / Outside toggle */}
              <div className="rounded-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, disKisitli: false }))}
                  className={clsx(
                    'w-full px-4 py-2.5 text-sm font-medium text-left flex items-center gap-2 transition-colors',
                    !formData.disKisitli ? 'bg-red-50 text-red-700 border-b border-red-100' : 'hover:bg-gray-50 text-gray-600 border-b border-gray-100'
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500 inline-block flex-shrink-0" />
                  İçerisi Yasaklı (standart)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(f => ({ ...f, disKisitli: true }))}
                  className={clsx(
                    'w-full px-4 py-2.5 text-sm font-medium text-left flex items-center gap-2 transition-colors',
                    formData.disKisitli ? 'bg-orange-50 text-orange-700' : 'hover:bg-gray-50 text-gray-600'
                  )}
                >
                  <span className="w-3 h-3 rounded-full bg-orange-500 inline-block flex-shrink-0" />
                  Dışarısı Yasaklı (şehir sınırı)
                </button>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button 
                  onClick={cancelShape}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  İptal
                </button>
                <button 
                  onClick={handleSaveShape}
                  disabled={!formData.alan_adi || !formData.sirket_id}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4" />
                  Kaydet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[500] pointer-events-auto">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden text-gray-700">
          <button onClick={() => setShowLayers(v => !v)} className="p-2.5 hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center justify-center">
            <Layers className="w-5 h-5" />
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
    </div>
  );
}
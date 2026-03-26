import React from 'react';
import { 
  Zap, 
  MapPin, 
  Map, 
  Battery, 
  Activity, 
  ChevronDown
} from 'lucide-react';

export function StatPanel() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white shadow-sm border-b border-gray-100 z-10 relative">
      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-2 bg-red-50 rounded-lg">
          <Activity className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Hız</p>
          <p className="font-bold text-gray-800">72 km/s</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-2 bg-green-50 rounded-lg">
          <MapPin className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Konum</p>
          <p className="font-bold text-gray-800 truncate max-w-[150px]">Ankara, Kızılay</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-2 bg-yellow-50 rounded-lg">
          <Map className="w-5 h-5 text-yellow-600" />
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase">Mesafe</p>
          <p className="font-bold text-gray-800">15.4 km</p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="p-2 bg-slate-50 rounded-lg">
          <Battery className="w-5 h-5 text-slate-600" />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <p className="text-xs text-gray-500 font-semibold uppercase">Batarya</p>
            <p className="font-bold text-green-600 text-sm">%78</p>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </div>

      <div className="absolute right-4 top-4 hidden xl:block">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-colors flex items-center gap-2">
          CANLI TAKİP
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

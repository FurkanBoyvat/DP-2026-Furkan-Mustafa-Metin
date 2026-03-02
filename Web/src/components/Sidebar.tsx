import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  Settings, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  History,
  Activity,
  LogOut,
  User
} from 'lucide-react';
import { clsx } from 'clsx';

interface Vehicle {
  id: string;
  plate: string;
  model: string;
  status: 'active' | 'parked' | 'driving';
  driver: string;
}

const vehicles: Vehicle[] = [
  { id: '1', plate: '34 ABC 123', model: 'Ford Transit', status: 'active', driver: 'Can Ahmet' },
  { id: '2', plate: '06 DEF 456', model: 'Fiat Doblo', status: 'parked', driver: 'Ali Veli' },
  { id: '3', plate: '35 XYZ 789', model: 'Renault Clio', status: 'driving', driver: 'Ayşe Yılmaz' },
];

export function Sidebar() {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="w-80 bg-[#1e293b] text-white flex flex-col h-full border-r border-gray-700 shadow-xl">
      {/* Header */}
      <div className="p-6 bg-[#26354f] flex items-center gap-3 border-b border-gray-700">
        <div className="bg-red-500 p-2 rounded-lg">
          <Car className="w-6 h-6 text-white" />
        </div>
        <h1 className="font-bold text-lg tracking-wide">ARAÇ TAKİP SİSTEMİ</h1>
      </div>

      {/* Vehicle List Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          ARAÇ LİSTESİ
        </div>
        
        <div className="space-y-1 px-3">
          {vehicles.map((vehicle) => (
            <div 
              key={vehicle.id}
              className={clsx(
                "p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                vehicle.status === 'active' ? "bg-white text-slate-800 shadow-lg" : "hover:bg-slate-700/50 text-gray-300"
              )}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  {vehicle.status === 'active' && (
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  )}
                  <Car className="w-4 h-4" />
                  <span className="font-bold">{vehicle.plate}</span>
                </div>
                <span className={clsx(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase",
                  vehicle.status === 'active' ? "bg-green-500 text-white" : 
                  vehicle.status === 'parked' ? "bg-blue-500 text-white" : 
                  "bg-red-500 text-white"
                )}>
                  {vehicle.status === 'active' ? 'Aktif' : vehicle.status === 'parked' ? 'Park Halinde' : 'Sürüşte'}
                </span>
              </div>
              <div className="text-xs opacity-80 flex justify-between">
                <span>{vehicle.model}</span>
                <span>{vehicle.driver}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Menu Items */}
        <div className="mt-8 space-y-1 px-3">
          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors group">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span>Geofence Alarm</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
          
          <div className="mx-3 my-1 p-3 bg-slate-700/30 rounded-lg border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-semibold">Sanayi Bölgesi İhlali</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors group">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span>Hız Uyarısı</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <div className="mx-3 my-1 bg-red-500/90 text-white p-3 rounded-lg shadow-lg animate-pulse">
            <div className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-5 h-5" />
              <span>84 km/s Limit Aşıldı!</span>
            </div>
          </div>

          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors group">
            <div className="flex items-center gap-3">
              <History className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span>Rota Geçmişi</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>

          <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-700/50 text-gray-300 transition-colors group">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400 group-hover:text-white" />
              <span>Raporlar</span>
            </div>
          </button>
        </div>
      </div>
      
      {/* Footer Settings */}
      <div className="p-4 border-t border-gray-700 space-y-2">
        <button 
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors w-full"
        >
          <User className="w-5 h-5" />
          <span>Profilim</span>
        </button>
        
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
}

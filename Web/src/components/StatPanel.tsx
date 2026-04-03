import React from 'react';
import { 
  Truck, 
  Zap, 
  Activity, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface StatPanelProps {
  activeMoving?: number;
  totalFleet?: number;
}

export function StatPanel({ activeMoving = 0, totalFleet = 0 }: StatPanelProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Decorative background pulse */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 animate-pulse" />
      
      <div className="group relative flex items-center gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/[0.05] hover:border-blue-500/30 transition-all duration-300">
        <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
          <Truck className="w-6 h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Toplam Filo</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-white tracking-tight">{totalFleet}</p>
            <p className="text-xs font-bold text-slate-500">ARAÇ</p>
          </div>
        </div>
      </div>

      <div className="group relative flex items-center gap-4 bg-emerald-500/10 backdrop-blur-md p-4 rounded-2xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all duration-300">
        <div className="p-3 bg-emerald-500/20 rounded-xl group-hover:scale-110 transition-transform relative">
          <Activity className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
          <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] text-emerald-500/70 font-black uppercase tracking-widest mb-0.5">Aktif Hareketli</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-white tracking-tight">{activeMoving}</p>
            <p className="text-xs font-bold text-emerald-500/50">CANLI</p>
          </div>
        </div>
      </div>

      <div className="group relative flex items-center gap-4 bg-slate-900/40 backdrop-blur-md p-4 rounded-2xl border border-white/[0.05] hover:border-orange-500/30 transition-all duration-300">
        <div className="p-3 bg-orange-500/10 rounded-xl group-hover:scale-110 transition-transform">
          <Zap className="w-6 h-6 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
        </div>
        <div>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-0.5">Rölanti / Duruş</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-white tracking-tight">{Math.max(0, totalFleet - activeMoving)}</p>
            <p className="text-xs font-bold text-slate-500">ARAÇ</p>
          </div>
        </div>
      </div>

      <div className="group relative flex items-center gap-4 bg-red-500/5 backdrop-blur-md p-4 rounded-2xl border border-red-500/10 hover:border-red-500/30 transition-all duration-300">
        <div className="p-3 bg-red-500/10 rounded-xl group-hover:scale-110 transition-transform">
          <AlertTriangle className="w-6 h-6 text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        </div>
        <div>
          <p className="text-[10px] text-red-500/60 font-black uppercase tracking-widest mb-0.5">Kritik Uyarılar</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-black text-white tracking-tight">2</p>
            <p className="text-xs font-bold text-red-400/50">İHLAL</p>
          </div>
        </div>
      </div>

      <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden xl:block">
        <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-[10px] font-black text-emerald-400 uppercase tracking-widest">
           <ShieldCheck className="w-4 h-4" />
           Filo Güvenlik: %98.4
        </div>
      </div>
    </div>
  );
}

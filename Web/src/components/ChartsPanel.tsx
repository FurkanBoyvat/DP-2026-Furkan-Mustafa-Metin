import React from 'react';
import { 
  Clock, 
  Gauge, 
  TrendingUp 
} from 'lucide-react';

export function ChartsPanel() {
  return (
    <div className="p-8 bg-[#0f172a] border-t border-white/5">
      {/* Performance Stats HUD */}
      <div className="bg-slate-900/80 backdrop-blur-2xl rounded-[32px] border border-white/[0.05] p-10 grid grid-cols-1 md:grid-cols-3 gap-12 relative overflow-hidden shadow-2xl">
        {/* Subtle Glow background effect */}
        <div className="absolute inset-0 bg-blue-500/[0.02] pointer-events-none" />
        
        <div className="flex items-center gap-6 relative group">
          <div className="p-5 bg-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/20 transition-all duration-500">
            <TrendingUp className="w-7 h-7 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Toplam Mesafe</p>
            <p className="text-3xl font-black text-white tracking-tight">52.8 <span className="text-xs text-slate-600 uppercase">KM</span></p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative group">
          <div className="p-5 bg-blue-500/10 rounded-2xl group-hover:bg-blue-500/20 transition-all duration-500">
            <Clock className="w-7 h-7 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.4)]" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Aktif Hizmet</p>
            <p className="text-3xl font-black text-white tracking-tight">1s 12d</p>
          </div>
        </div>

        <div className="flex items-center gap-6 relative group">
          <div className="p-5 bg-red-500/10 rounded-2xl group-hover:bg-red-500/20 transition-all duration-500">
            <Gauge className="w-7 h-7 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.4)]" />
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-center pr-4">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Max Hız</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tight">98 <span className="text-[10px] text-slate-600">KM/S</span></p>
                </div>
                <div className="h-10 w-px bg-white/5 hidden md:block"></div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1.5">Ortalama</p>
                  <p className="text-2xl font-black text-white uppercase tracking-tight">54 <span className="text-[10px] text-slate-600">KM/S</span></p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

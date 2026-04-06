import React, { useState, useEffect } from 'react';
import { StatPanel } from './StatPanel';
import { MultiVehicleMap } from './MultiVehicleMap';
import { ChartsPanel } from './ChartsPanel';
import { aracAPI, kisitliAlanAPI } from '../services/api';
import { useMultiVehicleTracker } from '../hooks/useMultiVehicleTracker';

export default function Dashboard() {
  const [allAracIds, setAllAracIds] = useState<number[]>([]);
  const [kisitliAlanlar, setKisitliAlanlar] = useState<any[]>([]);
  const { positions, errors, loading } = useMultiVehicleTracker(allAracIds);

  useEffect(() => {
    const loadAllAracs = async () => {
      try {
        const res = await aracAPI.getAll();
        if (res.success && res.araclar) {
          setAllAracIds(res.araclar.map((a: any) => a.arac_id));
        }
      } catch (err) {
        console.error('Filo yüklenirken hata:', err);
      }
    };

    const loadKisitliAlanlar = async () => {
      try {
        const res = await kisitliAlanAPI.getAktif();
        if (res.success && res.data) {
          setKisitliAlanlar(res.data);
        }
      } catch (err) {
        console.error('Kısıtlı alanlar yüklenirken hata:', err);
      }
    };

    loadAllAracs();
    loadKisitliAlanlar();
  }, []);

  // Aggregated Stats derived from live positions
  const posArray = Array.from(positions.values());
  const movingCount = posArray.filter(p => p.hiz > 0).length;
  const totalCount = allAracIds.length || 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0f172a]">
      {/* Immersive Dashboard Header */}
      <div className="px-6 pt-6 pb-2">
         <div className="flex justify-between items-end">
            <div>
               <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Operasyon Merkezi</h1>
               <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Sistem Durumu: Çevrimiçi / Veri Akışı Stabil</p>
            </div>
            <div className="flex gap-2 text-[10px] font-black text-blue-400 uppercase">
               <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/> {totalCount} Aktif ARAÇ</span>
               <span className="text-slate-700">/</span>
               <span className="text-slate-500">v2.4.0-Tactical</span>
            </div>
         </div>
      </div>

      <StatPanel activeMoving={movingCount} totalFleet={totalCount} />

      <div className="flex-1 min-h-[500px] p-6 flex flex-col">
        <div className="flex-1 bg-slate-900 border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            <MultiVehicleMap 
              positions={positions} 
              trailHistory={new Map()} 
              errors={errors}
              kisitliAlanlar={kisitliAlanlar}
            />
        </div>
      </div>

      <ChartsPanel />
    </div>
  );
}


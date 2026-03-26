import React from 'react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Clock, MapPin, Zap } from 'lucide-react';

const routeData = [
  { name: '10:00', uv: 40 }, { name: '10:05', uv: 30 }, { name: '10:10', uv: 20 },
  { name: '10:15', uv: 27 }, { name: '10:20', uv: 18 }, { name: '10:25', uv: 23 },
  { name: '10:30', uv: 34 }, { name: '10:35', uv: 40 }, { name: '10:40', uv: 30 },
  { name: '10:45', uv: 20 }, { name: '10:50', uv: 27 }, { name: '10:55', uv: 18 },
  { name: '11:00', uv: 23 }, { name: '11:05', uv: 34 }, { name: '11:10', uv: 44 },
  { name: '11:15', uv: 35 }, { name: '11:20', uv: 50 }, { name: '11:25', uv: 45 },
];

const speedData = [
  { name: '10:00', speed: 42 },
  { name: '10:05', speed: 48 },
  { name: '10:10', speed: 55 },
  { name: '10:15', speed: 49 },
  { name: '10:20', speed: 60 },
  { name: '10:25', speed: 58 },
  { name: '10:30', speed: 72 }, // Spike
  { name: '10:35', speed: 65 },
  { name: '10:40', speed: 48 },
  { name: '10:45', speed: 52 },
  { name: '10:50', speed: 68 },
  { name: '10:55', speed: 62 },
  { name: '11:00', speed: 45 },
];

export function Charts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Route History Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-700 font-bold text-sm">Rota Geçmişi</h3>
          <button className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-200 transition-colors">
            <Calendar className="w-3.5 h-3.5" />
            22 Nisan 2024
          </button>
        </div>
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={routeData}>
              <defs>
                <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1 }}
              />
              <Area 
                type="monotone" 
                dataKey="uv" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorUv)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed Graph */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col">
        <h3 className="text-slate-700 font-bold text-sm mb-4">Hız Grafiği</h3>
        <div className="flex-1 min-h-[150px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={speedData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fill: '#64748b' }} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                cursor={{ stroke: '#3b82f6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#3b82f6" 
                strokeWidth={3} 
                dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#3b82f6' }} 
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Stats Footer */}
      <div className="col-span-1 lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
        <div className="flex items-center gap-2">
            <div className="p-1 rounded-full border-2 border-green-500">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
            </div>
            <span className="font-medium">Toplam Mesafe:</span>
            <span className="font-bold text-slate-800">52.8 km</span>
        </div>

        <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2">
             <Clock className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Yolculuk Süresi:</span>
            <span className="font-bold text-slate-800">1s 12d</span>
        </div>

         <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2">
            <div className="p-1 rounded-full border-2 border-red-500/50">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
            </div>
            <span className="font-medium">En Yüksek Hız:</span>
            <span className="font-bold text-slate-800">98 km/s</span>
        </div>

         <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>

        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-slate-400" />
            <span className="font-medium">Ortalama Hız:</span>
            <span className="font-bold text-slate-800">45 km/s</span>
        </div>
      </div>
    </div>
  );
}

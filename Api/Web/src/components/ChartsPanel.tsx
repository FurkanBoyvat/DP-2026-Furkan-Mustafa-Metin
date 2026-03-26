import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Calendar, 
  ChevronDown, 
  Clock, 
  Gauge, 
  TrendingUp 
} from 'lucide-react';

const routeHistoryData = [
  { time: '09:00', elevation: 100 },
  { time: '09:10', elevation: 120 },
  { time: '09:20', elevation: 110 },
  { time: '09:30', elevation: 150 },
  { time: '09:40', elevation: 160 },
  { time: '09:50', elevation: 140 },
  { time: '10:00', elevation: 180 },
  { time: '10:10', elevation: 170 },
  { time: '10:20', elevation: 190 },
  { time: '10:30', elevation: 160 },
  { time: '10:40', elevation: 150 },
  { time: '10:50', elevation: 200 },
];

const speedData = [
  { time: '10:00', speed: 45 },
  { time: '10:05', speed: 55 },
  { time: '10:10', speed: 48 },
  { time: '10:15', speed: 62 },
  { time: '10:20', speed: 60 },
  { time: '10:25', speed: 75 },
  { time: '10:30', speed: 68 },
  { time: '10:35', speed: 48 },
  { time: '10:40', speed: 52 },
  { time: '10:45', speed: 65 },
  { time: '10:50', speed: 60 },
  { time: '10:55', speed: 42 },
];

export function ChartsPanel() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-slate-50 border-t border-gray-200">
      
      {/* Route History Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-700">Rota Geçmişi</h3>
          <div className="flex items-center gap-2 bg-slate-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-600 cursor-pointer hover:bg-slate-100">
            <Calendar className="w-4 h-4" />
            <span>22 Nisan 2024</span>
            <ChevronDown className="w-4 h-4 ml-2" />
          </div>
        </div>
        
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={180} minWidth={0}>
            <AreaChart data={routeHistoryData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorElevation" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                labelStyle={{ color: '#64748b' }}
              />
              <Area 
                type="monotone" 
                dataKey="elevation" 
                stroke="#82ca9d" 
                fillOpacity={1} 
                fill="url(#colorElevation)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Speed Graph */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col min-w-0">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-gray-700">Hız Grafiği</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">Hız (km/s)</p>
        
        <div className="w-full overflow-hidden">
          <ResponsiveContainer width="100%" height={180} minWidth={0}>
            <LineChart data={speedData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="time" 
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
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} 
                activeDot={{ r: 6 }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer Stats - Spanning full width in lg */}
      <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-4 grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
        <div className="flex items-center gap-4 py-2 md:py-0 justify-center md:justify-start">
          <div className="p-2 bg-green-50 rounded-full">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Toplam Mesafe</p>
            <p className="font-bold text-gray-800">52.8 km</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 md:py-0 justify-center md:justify-start pl-0 md:pl-6">
          <div className="p-2 bg-blue-50 rounded-full">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium">Yolculuk Süresi</p>
            <p className="font-bold text-gray-800">1s 12d</p>
          </div>
        </div>

        <div className="flex items-center gap-4 py-2 md:py-0 justify-center md:justify-start pl-0 md:pl-6">
          <div className="p-2 bg-red-50 rounded-full">
            <Gauge className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="flex items-center gap-4">
               <div>
                <p className="text-xs text-gray-400 font-medium">En Yüksek Hız</p>
                <p className="font-bold text-gray-800">98 km/s</p>
               </div>
               <div className="h-8 w-px bg-gray-200"></div>
               <div>
                <p className="text-xs text-gray-400 font-medium">Ortalama Hız</p>
                <p className="font-bold text-gray-800">54 km/s</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

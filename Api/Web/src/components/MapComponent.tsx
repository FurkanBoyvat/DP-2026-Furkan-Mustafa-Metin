import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

export function MapComponent() {
  return (
    <div className="relative w-full h-full bg-slate-200 overflow-hidden rounded-xl shadow-lg border border-slate-300">
      {/* Background Map Image */}
      <img 
        src="https://images.unsplash.com/photo-1612043743114-d19a560b70eb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b3AlMjBkb3duJTIwYWVyaWFsJTIwdmlldyUyMG1pbmltYWwlMjBtYXAlMjBjaXR5JTIwc3RyZWV0JTIwcGxhbiUyMGxpZ2h0JTIwY29sb3JzfGVufDF8fHx8MTc3MTM2NjM2M3ww&ixlib=rb-4.1.0&q=80&w=1080" 
        alt="Map Background" 
        className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply pointer-events-none"
      />
      
      {/* Map Content Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* SVG Layer for Route and Geofence */}
        <svg className="w-full h-full" viewBox="0 0 800 600" preserveAspectRatio="none">
          {/* Geofence Polygon (Red Area) */}
          <polygon 
            points="100,400 250,350 300,500 150,550" 
            fill="rgba(239, 68, 68, 0.3)" 
            stroke="rgba(239, 68, 68, 0.8)" 
            strokeWidth="2"
          />
          
          {/* Route Path (Green Line) */}
          <path 
            d="M 200,450 L 350,400 L 450,380 L 500,350 L 600,330 L 700,250" 
            fill="none" 
            stroke="#22c55e" 
            strokeWidth="6" 
            strokeLinecap="round"
            strokeDasharray="10 0"
            className="drop-shadow-md"
          />
           <path 
            d="M 200,450 L 350,400 L 450,380 L 500,350 L 600,330 L 700,250" 
            fill="none" 
            stroke="rgba(255,255,255,0.4)" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>

        {/* Labels & Markers */}
        
        {/* Geofence Label */}
        <div className="absolute left-[120px] top-[430px] bg-red-500 text-white text-xs font-bold px-2 py-1 rounded shadow-md transform -translate-y-1/2">
          Geofence: Sanayi Bölgesi
        </div>

        {/* Start Marker (Green) */}
        <div className="absolute left-[200px] top-[450px] transform -translate-x-1/2 -translate-y-full">
           <div className="relative">
              <div className="w-8 h-8 bg-green-500 rounded-full border-2 border-white flex items-center justify-center shadow-lg animate-bounce">
                <MapPin className="w-5 h-5 text-white fill-current" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-500 rotate-45 -mt-1"></div>
           </div>
        </div>

        {/* Car Icon (Moving along path) */}
        <div className="absolute left-[450px] top-[380px] transform -translate-x-1/2 -translate-y-1/2 rotate-[-15deg]">
           <div className="bg-orange-500 p-1.5 rounded-full shadow-xl border-2 border-white z-20">
             <Navigation className="w-5 h-5 text-white fill-current transform rotate-45" />
           </div>
           {/* Pulse effect */}
           <div className="absolute inset-0 rounded-full bg-orange-500 opacity-30 animate-ping"></div>
        </div>

        {/* End Marker (Red) */}
        <div className="absolute left-[700px] top-[250px] transform -translate-x-1/2 -translate-y-full z-10">
           <div className="relative group cursor-pointer pointer-events-auto">
              <div className="bg-red-600 text-white px-3 py-1 rounded shadow-lg text-sm font-bold whitespace-nowrap mb-1">
                GÖZTEPE MH
              </div>
              <div className="w-10 h-10 bg-red-600 rounded-full border-4 border-white flex items-center justify-center shadow-xl mx-auto">
                <MapPin className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-600 rotate-45 -mt-6 z-[-1]"></div>
           </div>
        </div>

        {/* Map Controls */}
        <div className="absolute right-4 top-4 flex flex-col gap-2 pointer-events-auto">
          <button className="bg-white hover:bg-slate-50 text-slate-700 w-10 h-10 rounded shadow-md flex items-center justify-center font-bold text-xl transition-colors">+</button>
          <button className="bg-white hover:bg-slate-50 text-slate-700 w-10 h-10 rounded shadow-md flex items-center justify-center font-bold text-xl transition-colors">-</button>
        </div>

        {/* Floating Labels (Simulated) */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-slate-600 text-xs font-semibold shadow-sm">
            Antikabir
        </div>
        <div className="absolute bottom-1/3 right-1/4 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-slate-600 text-xs font-semibold shadow-sm">
            Ankara Üniversitesi
        </div>
      </div>
    </div>
  );
}

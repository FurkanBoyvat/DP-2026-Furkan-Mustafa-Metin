import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  LayoutDashboard,
  Users, 
  FileText, 
  ChevronRight, 
  ChevronLeft,
  Fuel,
  Wrench,
  Building2,
  Truck,
  LogOut,
  User,
  ShieldAlert,
  Bell,
  Navigation
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
  color?: string;
  glow?: string;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'ANA MENÜ',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', color: 'bg-[#3b82f6]', glow: 'rgba(59,130,246,0.3)' },
      { id: 'araclar', label: 'Araçlar', icon: Car, path: '/araclar', color: 'bg-[#6366f1]', glow: 'rgba(99,102,241,0.3)' },
      { id: 'soforler', label: 'Şoförler', icon: Users, path: '/soforler', color: 'bg-[#8b5cf6]', glow: 'rgba(139,92,246,0.3)' },
      { id: 'filolar', label: 'Filolar', icon: Truck, path: '/filolar', color: 'bg-[#10b981]', glow: 'rgba(16,185,129,0.3)' },
      { id: 'sirketler', label: 'Şirketler', icon: Building2, path: '/sirketler', color: 'bg-[#06b6d4]', glow: 'rgba(6,182,212,0.3)' },
    ]
  },
  {
    title: 'OPERASYON',
    items: [
      { id: 'canli-takip', label: 'Canlı Takip', icon: Navigation, path: '/canli-takip', color: 'bg-[#0ea5e9]', glow: 'rgba(14,165,233,0.3)' },
      { id: 'yakit', label: 'Yakıt Takibi', icon: Fuel, path: '/yakit', color: 'bg-[#f59e0b]', glow: 'rgba(245,158,11,0.3)' },
      { id: 'bakim', label: 'Bakım Yönetimi', icon: Wrench, path: '/bakim', color: 'bg-[#ef4444]', glow: 'rgba(239,68,68,0.3)' },
      { id: 'kisitli-alanlar', label: 'Kısıtlı Alanlar', icon: MapPin, path: '/kisitli-alanlar', color: 'bg-[#8b5cf6]', glow: 'rgba(139,92,246,0.3)' },
      { id: 'bolge-ihlalleri', label: 'Bölge İhlalleri', icon: ShieldAlert, path: '/bolge-ihlalleri', badge: 3, color: 'bg-[#ef4444]', glow: 'rgba(239,68,68,0.3)' },
    ]
  },
  {
    title: 'RAPORLAMA',
    items: [
      { id: 'raporlar', label: 'Raporlar', icon: FileText, path: '/raporlar', color: 'bg-[#14b8a6]', glow: 'rgba(20,184,166,0.3)' },
      { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users, path: '/kullanicilar', color: 'bg-[#ec4899]', glow: 'rgba(236,72,153,0.3)' },
    ]
  }
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-[#0B1120] text-white relative transition-all duration-500 ease-[cubic-bezier(0.25,0.1,0.25,1)] border-r border-white/[0.02] shadow-2xl",
        isCollapsed ? "w-[88px]" : "w-[288px]"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 w-6 h-6 rounded-full transition-all duration-300 z-50",
          "bg-[#1e293b] border border-white/10",
          "text-slate-400 hover:text-white hover:bg-[#283548]",
          "flex items-center justify-center cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]",
          "hover:scale-110 active:scale-95"
        )}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Header section */}
      <div className={cn("relative p-6 border-b border-white/[0.04]", isCollapsed && "p-[22px] flex justify-center")}>
        <div className={cn("flex items-center gap-4 transition-all duration-500", isCollapsed && "justify-center")}>
          <div 
            className="group relative w-[44px] h-[44px] rounded-[14px] bg-gradient-to-br from-[#3b82f6] to-[#8b5cf6] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95"
            style={{ animation: 'logo-pulse 3s ease-in-out infinite' }}
            onClick={() => navigate('/')}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/30 to-white/0 -translate-x-[100%] group-hover:animate-[shine_1.5s_ease-in-out]" />
            <Car className="w-[22px] h-[22px] text-white relative z-10" style={{ animation: 'float 3s ease-in-out infinite' }} />
          </div>
          
          <div className={cn(
            "flex flex-col min-w-0 transition-all duration-500 origin-left",
            isCollapsed ? "opacity-0 scale-x-0 w-0 absolute" : "opacity-100 scale-x-100 w-auto relative"
          )}>
            <h1 className="font-bold text-[17px] tracking-tight text-white whitespace-nowrap">
              Araç Takip
            </h1>
            <p className="text-[11px] font-[500] text-blue-400/80 tracking-wide whitespace-nowrap">
              Yönetim Sistemi
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 pt-5 custom-scrollbar">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 4px; transition: background 0.2s; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.1); }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
          }
          @keyframes logo-pulse {
            0%, 100% { box-shadow: 0 0 15px rgba(59,130,246,0.2); }
            50% { box-shadow: 0 0 25px rgba(139,92,246,0.4); }
          }
          @keyframes shine {
            100% { transform: translateX(100%); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-15px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes pinger {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(2.5); opacity: 0; }
          }
        `}</style>
        
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={cn("mb-6", groupIndex !== 0 && "mt-6")}>
            <div className={cn(
              "px-2 mb-3 transition-opacity duration-300",
              isCollapsed ? "opacity-0 h-0 overflow-hidden mb-0" : "opacity-100"
            )}>
              <span className="text-[10px] font-bold text-slate-500/70 uppercase tracking-widest transition-all">
                {group.title}
              </span>
            </div>
            
            <div className="space-y-1">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isHovered = hoveredItem === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    onMouseEnter={() => setHoveredItem(item.id)}
                    onMouseLeave={() => setHoveredItem(null)}
                    className={cn(
                      "w-full flex items-center gap-3 p-[6px] rounded-[14px] transition-all duration-300 group relative overflow-hidden",
                      active 
                        ? "bg-white/[0.08]" 
                        : "hover:bg-white/[0.04] active:scale-[0.98]",
                      isCollapsed && "justify-center"
                    )}
                    style={{ 
                      animation: `slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${groupIndex * 0.1 + itemIndex * 0.04}s both`
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {/* Active highlight background sweep */}
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    )}
                    
                    <div 
                      className={cn(
                        "relative flex items-center justify-center w-[38px] h-[38px] rounded-[10px] transition-all duration-300 shrink-0",
                        active ? item.color : "bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.06] group-hover:border-white/[0.08]"
                      )}
                      style={{
                        boxShadow: active && item.glow ? `0 0 20px ${item.glow}` : 'none'
                      }}
                    >
                      <Icon className={cn(
                        "w-[18px] h-[18px] transition-all duration-300",
                        active ? "text-white" : "text-slate-400 group-hover:text-slate-200",
                        isHovered && !active && "scale-110 -translate-y-[1px]",
                        active && "animate-[float_3s_ease-in-out_infinite]"
                      )} />
                      
                      {item.badge && (
                        <span className="absolute -top-[4px] -right-[4px] min-w-[18px] h-[18px] px-1 bg-[#EF4444] rounded-full flex items-center justify-center text-[10px] font-bold text-white ring-2 ring-[#0B1120] z-10 transition-transform duration-300 hover:scale-110">
                          {item.badge}
                          {/* Ping effect for badge */}
                          <span className="absolute inset-0 rounded-full bg-[#EF4444] animate-[pinger_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
                        </span>
                      )}
                    </div>

                    <div className={cn(
                      "flex items-center flex-1 transition-all duration-300",
                      isCollapsed ? "opacity-0 w-0 absolute left-14" : "opacity-100 w-auto relative left-0"
                    )}>
                      <span className={cn(
                        "flex-1 text-left font-medium text-[13.5px] transition-colors truncate tracking-wide", 
                        active ? "text-white" : "text-slate-300 group-hover:text-white"
                      )}>
                        {item.label}
                      </span>
                      
                      {item.badge && !active && (
                        <span className="min-w-[20px] h-[20px] px-1 bg-[#EF4444] rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 mr-1 shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:bg-red-500">
                          {item.badge}
                        </span>
                      )}
                      
                      {!active && !item.badge && (
                        <ChevronRight className={cn(
                          "w-[14px] h-[14px] transition-all duration-300 shrink-0 mr-1", 
                          "text-slate-600/80 group-hover:text-slate-400 group-hover:translate-x-1",
                        )} />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 mt-auto border-t border-white/[0.04]">
        <div className="flex flex-col gap-1">
          {/* Profile & Notifications row */}
          <button 
            onClick={() => navigate('/profile')}
            className={cn(
              "w-full flex items-center gap-3 p-[6px] rounded-[14px] transition-all duration-300 group relative",
              location.pathname === '/profile' ? "bg-white/[0.08]" : "hover:bg-white/[0.04] active:scale-[0.98]",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Profilim" : undefined}
          >
            <div className={cn(
              "relative flex items-center justify-center w-[38px] h-[38px] rounded-[10px] transition-all duration-300 shrink-0",
              location.pathname === '/profile' ? "bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-white/[0.02] border border-white/[0.04] group-hover:bg-white/[0.06] group-hover:border-white/[0.08]"
            )}>
              <User className={cn(
                "w-[18px] h-[18px] transition-all duration-300",
                location.pathname === '/profile' ? "text-white" : "text-slate-400 group-hover:text-white group-hover:scale-110 group-hover:-translate-y-[1px]"
              )} />
            </div>
            
            <div className={cn(
              "flex items-center flex-1 transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto relative"
            )}>
              <span className={cn(
                "flex-1 text-left font-medium text-[13.5px] truncate tracking-wide transition-colors duration-200",
                location.pathname === '/profile' ? "text-white" : "text-slate-300 group-hover:text-white"
              )}>
                Profilim
              </span>
              
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/bildirimler');
                }}
                className="relative flex items-center justify-center w-[32px] h-[32px] rounded-lg hover:bg-white/[0.08] transition-all duration-300 mr-1 shrink-0 hover:scale-110 active:scale-95 group/bell"
                title="Bildirimler"
              >
                <Bell className="w-[18px] h-[18px] text-slate-400 group-hover/bell:text-slate-200 transition-colors" />
                <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-[#EF4444] rounded-full ring-2 ring-[#0B1120] animate-[pinger_2s_cubic-bezier(0,0,0.2,1)_infinite_reverse]" />
                <span className="absolute top-[6px] right-[6px] w-[6px] h-[6px] bg-[#EF4444] rounded-full ring-2 ring-[#0B1120]" />
              </div>
            </div>
          </button>

          {/* Logout button */}
          <button 
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 p-[6px] rounded-[14px] transition-all duration-300 group relative",
              "hover:bg-red-500/10 active:scale-[0.98]",
              isCollapsed && "justify-center"
            )}
            title={isCollapsed ? "Çıkış Yap" : undefined}
          >
            <div className="relative flex items-center justify-center w-[38px] h-[38px] rounded-[10px] transition-all duration-300 shrink-0 bg-transparent group-hover:bg-red-500/20 group-hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]">
              <LogOut className="w-[18px] h-[18px] text-slate-400 group-hover:text-red-400 transition-all duration-300 group-hover:-translate-x-1" />
            </div>
            
            <div className={cn(
              "flex items-center flex-1 transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 absolute" : "opacity-100 w-auto relative"
            )}>
              <span className="flex-1 text-left font-medium text-[13.5px] truncate tracking-wide text-slate-400 group-hover:text-red-400 transition-colors duration-200">
                Çıkış Yap
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

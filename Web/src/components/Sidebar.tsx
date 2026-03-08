import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Car, 
  MapPin, 
  LayoutDashboard,
  Users, 
  FileText, 
  AlertTriangle, 
  ChevronRight, 
  ChevronLeft,
  Fuel,
  Wrench,
  Building2,
  Truck,
  LogOut,
  User,
  ShieldAlert,
  Settings,
  Bell
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';

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
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Ana Menü',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', color: 'bg-blue-500' },
      { id: 'araclar', label: 'Araçlar', icon: Car, path: '/araclar', color: 'bg-emerald-500' },
      { id: 'soforler', label: 'Şoförler', icon: Users, path: '/soforler', color: 'bg-violet-500' },
      { id: 'filolar', label: 'Filolar', icon: Truck, path: '/filolar', color: 'bg-amber-500' },
      { id: 'sirketler', label: 'Şirketler', icon: Building2, path: '/sirketler', color: 'bg-cyan-500' },
    ]
  },
  {
    title: 'Operasyon',
    items: [
      { id: 'yakit', label: 'Yakıt Takibi', icon: Fuel, path: '/yakit', color: 'bg-orange-500' },
      { id: 'bakim', label: 'Bakım Yönetimi', icon: Wrench, path: '/bakim', color: 'bg-rose-500' },
      { id: 'kisitli-alanlar', label: 'Kısıtlı Alanlar', icon: MapPin, path: '/kisitli-alanlar', color: 'bg-indigo-500' },
      { id: 'bolge-ihlalleri', label: 'Bölge İhlalleri', icon: ShieldAlert, path: '/bolge-ihlalleri', badge: 3, color: 'bg-red-500' },
    ]
  },
  {
    title: 'Raporlama',
    items: [
      { id: 'raporlar', label: 'Raporlar', icon: FileText, path: '/raporlar', color: 'bg-teal-500' },
      { id: 'kullanicilar', label: 'Kullanıcılar', icon: Users, path: '/kullanicilar', color: 'bg-pink-500' },
    ]
  }
];

const quickActions = [
  {
    id: 'notifications',
    label: 'Bildirimler',
    icon: Bell,
    color: 'from-blue-500 to-purple-500',
    badge: 5,
    description: 'Yeni bildirimleriniz var'
  },
  {
    id: 'alerts',
    label: 'Acil İhlaller',
    icon: ShieldAlert,
    color: 'from-red-500 to-rose-500',
    badge: 3,
    description: '3 acil ihlal bildirimi'
  },
  {
    id: 'maintenance',
    label: 'Bekleyen Bakım',
    icon: Wrench,
    color: 'from-amber-500 to-orange-500',
    badge: 2,
    description: '2 araç bakım gerekiyor'
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
        "flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white relative transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-3 top-20 w-7 h-7 rounded-full transition-all duration-200 z-50",
          "bg-gradient-to-r from-slate-700 to-slate-600 border border-slate-500",
          "text-slate-300 hover:text-white hover:scale-110",
          "shadow-lg hover:shadow-xl hover:shadow-slate-500/25",
          "flex items-center justify-center"
        )}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      <div className={cn("relative p-6 border-b border-white/10", isCollapsed && "p-4")}>
        <div className={cn("flex items-center gap-4 transition-all duration-300", isCollapsed && "justify-center")}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Car className="w-6 h-6 text-white" />
          </div>
          
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
                Araç Takip
              </h1>
              <p className="text-xs text-white/50 font-medium">Yönetim Sistemi</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            transition: background 0.2s;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.2);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:active {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
        {menuGroups.map((group, groupIndex) => (
          <div key={group.title} className={cn("mb-6", groupIndex !== 0 && "mt-6")}>
            {!isCollapsed && (
              <div className="px-6 mb-3">
                <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                  {group.title}
                </span>
              </div>
            )}
            
            <div className={cn("space-y-1", isCollapsed ? "px-2" : "px-3")}>
              {group.items.map((item) => {
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
                      "relative w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                      active 
                        ? "bg-white/10 text-white shadow-lg shadow-black/20" 
                        : "text-white/60 hover:text-white hover:bg-white/5",
                      isCollapsed && "justify-center px-2 py-3"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    {active && (
                      <div className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-gradient-to-b from-blue-400 to-purple-400",
                        isCollapsed && "left-1/2"
                      )} />
                    )}
                    
                    <div className={cn(
                      "relative flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-200",
                      active ? cn(item.color, "shadow-lg") : "bg-white/5 group-hover:bg-white/10",
                      isCollapsed && "w-8 h-8 mx-auto"
                    )}>
                      <Icon className={cn(
                        "w-5 h-5 transition-transform duration-200",
                        active ? "text-white" : "text-white/70",
                        isHovered && !active && "scale-110",
                        isCollapsed && "w-4 h-4"
                      )} />
                      
                      {item.badge && (
                        <span className={cn(
                          "absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white animate-pulse",
                          isCollapsed && "-top-0.5 -right-0.5 w-4 h-4 text-[9px]"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </div>

                    {!isCollapsed && (
                      <div className="flex-1 text-left flex items-center gap-2">
                        <span className={cn("font-medium text-sm transition-colors", active ? "text-white" : "text-white/80")}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-red-500/90 rounded-full text-[10px] font-bold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {!isCollapsed && !active && (
                      <ChevronRight className={cn("w-4 h-4 text-white/30 transition-all duration-200", isHovered && "translate-x-1 text-white/60")} />
                    )}
                    
                    {active && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl -z-10" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="relative p-4 border-t border-white/10 space-y-3">
        <div className={cn("flex gap-2", isCollapsed && "flex-col items-center")}>
          <button 
            onClick={() => navigate('/profile')}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all duration-200 flex-1",
              location.pathname === '/profile' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
              isCollapsed && "justify-center w-10 h-10 flex-none"
            )}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">Profilim</span>}
          </button>
          
          <button 
            onClick={() => navigate('/bildirimler')}
            className={cn(
              "flex items-center gap-2 p-2 rounded-lg transition-all duration-200 relative",
              location.pathname === '/bildirimler' ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5",
              isCollapsed && "justify-center w-10 h-10"
            )}
          >
            <div className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            {!isCollapsed && <span className="text-sm font-medium">Bildirimler</span>}
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className={cn(
            "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200",
            "bg-gradient-to-r from-red-500/10 to-rose-500/10",
            "text-red-300 hover:text-red-200 hover:from-red-500/20 hover:to-rose-500/20",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
            <LogOut className="w-4 h-4" />
          </div>
          {!isCollapsed && <span className="text-sm font-medium">Çıkış Yap</span>}
        </button>
      </div>
    </div>
  );
}

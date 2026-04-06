import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  ShieldAlert, 
  Wrench, 
  Check,
  X,
  Search,
  Clock,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { toast } from 'sonner';
import { bolgeIhlalAPI, bakimAPI, aracAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Notification {
  id: string;
  type: 'alert' | 'warning' | 'info' | 'success' | 'maintenance';
  title: string;
  message: string;
  time: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  action?: {
    label: string;
    path: string;
  };
}

const typeIcons = {
  alert: ShieldAlert,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
  maintenance: Wrench
};

const typeColors = {
  alert: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  success: 'bg-emerald-500',
  maintenance: 'bg-violet-500'
};

const typeBgColors = {
  alert: 'bg-red-50 border-red-200',
  warning: 'bg-amber-50 border-amber-200',
  info: 'bg-blue-50 border-info-200',
  success: 'bg-emerald-50 border-emerald-200',
  maintenance: 'bg-violet-50 border-violet-200'
};

const priorityColors = {
  high: 'text-red-600 bg-red-100',
  medium: 'text-amber-600 bg-amber-100',
  low: 'text-slate-600 bg-slate-100'
};

export default function Bildirimler() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread' | 'high'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [notificationsList, setNotificationsList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // loading state kullanımı
  useEffect(() => {
    if (!loading) {
      toast.success('Bildirimler yüklendi');
    }
  }, [loading]);

  // Gerçek verileri çek
  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [ihlalRes, bakimRes, aracRes] = await Promise.all([
        bolgeIhlalAPI.getAll().catch(() => ({ data: [] })),
        bakimAPI.getAll().catch(() => ({ data: [] })),
        aracAPI.getAll().catch(() => ({ araclar: [] }))
      ]);

      const ihlaller = ihlalRes.data || [];
      const bakimlar = (bakimRes.data || []).filter((b: any) => b.durum === 'bekleniyor');
      const araclar = aracRes.araclar || aracRes.data || [];

      const generatedNotifications: Notification[] = [];

      // Bölge ihlallerinden bildirimler oluştur
      ihlaller.slice(0, 10).forEach((ihlal: any, idx: number) => {
        const arac = araclar.find((a: any) => a.arac_id === ihlal.arac_id);
        generatedNotifications.push({
          id: `ihlal-${ihlal.ihlal_id || idx}`,
          type: 'alert',
          title: 'Bölge İhlali',
          message: `${arac?.plaka || 'Bilinmeyen plaka'} - ${ihlal.ihlal_tipi || 'Kısıtlı bölgeye giriş'}`,
          time: ihlal.giris_tarihi ? new Date(ihlal.giris_tarihi).toLocaleString('tr-TR') : 'Bilinmiyor',
          read: ihlal.cozulme_durumu || false,
          priority: 'high',
          action: {
            label: 'Canlı Takip',
            path: '/canli-takip'
          }
        });
      });

      // Bekleyen bakım taleplerinden bildirimler oluştur
      bakimlar.forEach((bakim: any, idx: number) => {
        const arac = araclar.find((a: any) => a.arac_id === bakim.arac_id);
        generatedNotifications.push({
          id: `bakim-${bakim.talek_id || idx}`,
          type: 'maintenance',
          title: 'Bekleyen Bakım',
          message: `${arac?.plaka || 'Araç'} - ${bakim.bakim_tipi || 'Bakım'}`,
          time: bakim.talek_tarihi ? new Date(bakim.talek_tarihi).toLocaleString('tr-TR') : 'Bilinmiyor',
          read: false,
          priority: 'medium',
          action: {
            label: 'Bakımlar',
            path: '/bakim'
          }
        });
      });

      // Yaklaşan sigorta/muayene kontrolü (örnek)
      const today = new Date();
      araclar.forEach((arac: any) => {
        if (arac.sigorta_bitis_tarihi) {
          const sigortaBitis = new Date(arac.sigorta_bitis_tarihi);
          const gunFarki = Math.ceil((sigortaBitis.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (gunFarki <= 30 && gunFarki > 0) {
            generatedNotifications.push({
              id: `sigorta-${arac.arac_id}`,
              type: 'warning',
              title: 'Sigorta Süresi Doluyor',
              message: `${arac.plaka} - ${gunFarki} gün kaldı`,
              time: today.toLocaleString('tr-TR'),
              read: false,
              priority: gunFarki <= 7 ? 'high' : 'medium',
              action: {
                label: 'Araçlar',
                path: '/araclar'
              }
            });
          }
        }
      });

      setNotificationsList(generatedNotifications);
    } catch (error) {
      console.error('Bildirimler yüklenirken hata:', error);
      toast.error('Bildirimler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const filteredNotifications = notificationsList.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === 'unread') {
      return matchesSearch && !notification.read;
    }
    if (selectedFilter === 'high') {
      return matchesSearch && notification.priority === 'high';
    }
    return matchesSearch;
  });

  const unreadCount = notificationsList.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotificationsList(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    toast.success('Bildirim okundu olarak işaretlendi.');
  };

  const markAllAsRead = () => {
    setNotificationsList(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    toast.success('Tüm bildirimler okundu olarak işaretlendi.');
  };

  const deleteNotification = (id: string) => {
    setNotificationsList(prev => prev.filter(n => n.id !== id));
    toast.success('Bildirim silindi.');
  };

  const clearAll = () => {
    setNotificationsList([]);
    toast.success('Tüm bildirimler temizlendi.');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800">Bildirimler</h1>
              <p className="text-slate-500 mt-1">Sistem bildirimlerini ve uyarıları yönetin</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                Tümünü Oku
              </button>
            )}
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Temizle
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Toplam Bildirim</p>
                <p className="text-2xl font-bold text-slate-800">{notificationsList.length}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-slate-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Okunmamış</p>
                <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Yüksek Öncelik</p>
                <p className="text-2xl font-bold text-amber-600">
                  {notificationsList.filter(n => n.priority === 'high').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Bakım Uyarıları</p>
                <p className="text-2xl font-bold text-violet-600">
                  {notificationsList.filter(n => n.type === 'maintenance').length}
                </p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Bildirimlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                selectedFilter === 'all' 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedFilter('unread')}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                selectedFilter === 'unread' 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              Okunmamış
              {unreadCount > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSelectedFilter('high')}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                selectedFilter === 'high' 
                  ? "bg-blue-500 text-white" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              Yüksek Öncelik
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Bildirim bulunamadı</h3>
            <p className="text-slate-400">Seçilen filtrelere uygun bildirim bulunmamaktadır.</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const Icon = typeIcons[notification.type];
            
            return (
              <div
                key={notification.id}
                className={cn(
                  "bg-white rounded-xl p-4 border transition-all hover:shadow-md",
                  typeBgColors[notification.type],
                  !notification.read && "border-l-4 border-l-blue-500"
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                    typeColors[notification.type]
                  )}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={cn(
                            "font-semibold text-slate-800",
                            !notification.read && "font-bold"
                          )}>
                            {notification.title}
                          </h3>
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-medium rounded-full",
                            priorityColors[notification.priority]
                          )}>
                            {notification.priority === 'high' ? 'Yüksek' : 
                             notification.priority === 'medium' ? 'Orta' : 'Düşük'}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </div>
                        <p className="text-slate-600 text-sm mb-2">{notification.message}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {notification.time}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {notification.action && (
                          <button
                            onClick={() => navigate(notification.action!.path)}
                            className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            {notification.action.label}
                          </button>
                        )}
                        
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Okundu işaretle"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Sil"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

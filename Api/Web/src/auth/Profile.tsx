import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  LogOut, 
  Edit3, 
  Key,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Truck,
  Settings,
  Bell,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface UserProfile {
  kullanici_id: number;
  email: string;
  ad: string;
  soyad: string;
  telefon: string;
  rol: string;
  durum: boolean;
  olusturulma_tarihi: string;
  son_giris_tarih: string;
}

const rolLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  admin: { 
    label: 'Sistem Yöneticisi', 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: <Shield className="w-4 h-4" />
  },
  sirket_yoneticisi: { 
    label: 'Şirket Yöneticisi', 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <Building2 className="w-4 h-4" />
  },
  surucu: { 
    label: 'Sürücü', 
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Truck className="w-4 h-4" />
  },
  muhasebe: { 
    label: 'Muhasebe', 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <FileText className="w-4 h-4" />
  },
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.kullanici);
        } else {
          setError(data.message || 'Profil bilgileri alınamadı');
          if (data.code === 'INVALID_TOKEN') {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Sunucu ile bağlantı kurulamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Başarıyla çıkış yapıldı');
    navigate('/login');
  };

  const getInitials = (ad: string, soyad: string) => {
    return `${ad.charAt(0)}${soyad.charAt(0)}`.toUpperCase();
  };

  const getRolBadge = (rol: string) => {
    const rolInfo = rolLabels[rol] || { 
      label: rol, 
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      icon: <User className="w-4 h-4" />
    };
    
    return (
      <Badge variant="outline" className={`${rolInfo.color} font-medium px-3 py-1`}>
        <span className="mr-1">{rolInfo.icon}</span>
        {rolInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Profil yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Hata Oluştu</h3>
            <p className="text-slate-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Profilim</h1>
            <p className="text-slate-500 mt-1">Hesap bilgilerinizi ve ayarlarınızı yönetin</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('Bu özellik yakında gelecek')}>
              <Settings className="w-4 h-4 mr-2" />
              Ayarlar
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>

        {/* Main Profile Card */}
        <Card className="border-none shadow-xl bg-white/80 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              {/* Avatar Section */}
              <div className="flex flex-col items-center gap-4">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={`https://ui-avatars.com/api/?name=${profile.ad}+${profile.soyad}&background=random&color=fff&size=128`} />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-primary to-primary/80 text-white">
                    {getInitials(profile.ad, profile.soyad)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-800">{profile.ad} {profile.soyad}</h2>
                  <p className="text-slate-500 text-sm">{profile.email}</p>
                </div>
                <div className="flex gap-2">
                  {getRolBadge(profile.rol)}
                  <Badge variant={profile.durum ? "default" : "secondary"} className={profile.durum ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                    {profile.durum ? (
                      <><CheckCircle2 className="w-3 h-3 mr-1" /> Aktif</>
                    ) : (
                      <><XCircle className="w-3 h-3 mr-1" /> Pasif</>
                    )}
                  </Badge>
                </div>
              </div>

              <Separator orientation="vertical" className="hidden md:block h-48" />

              {/* Info Grid */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <Card className="bg-slate-50/50 border-slate-100">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Email</p>
                      <p className="text-sm font-semibold text-slate-700">{profile.email}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50/50 border-slate-100">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Telefon</p>
                      <p className="text-sm font-semibold text-slate-700">{profile.telefon}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50/50 border-slate-100">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Rol</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {rolLabels[profile.rol]?.label || profile.rol}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-50/50 border-slate-100">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">Kayıt Tarihi</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(profile.olusturulma_tarihi).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User ID Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Kullanıcı ID</p>
                  <p className="text-2xl font-bold text-slate-800">#{profile.kullanici_id}</p>
                </div>
                <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Last Login */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Son Giriş</p>
                  <p className="text-lg font-bold text-slate-800">
                    {profile.son_giris_tarih 
                      ? new Date(profile.son_giris_tarih).toLocaleDateString('tr-TR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Bilgi yok'
                    }
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500 font-medium">Hesap Durumu</p>
                  <p className={`text-lg font-bold ${profile.durum ? 'text-green-700' : 'text-red-700'}`}>
                    {profile.durum ? 'Aktif' : 'Pasif'}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${profile.durum ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {profile.durum ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Hızlı İşlemler
            </CardTitle>
            <CardDescription>Hesap ayarlarınızı yönetin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-primary hover:bg-primary/5" onClick={() => toast.info('Bu özellik yakında gelecek')}>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Edit3 className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium">Profili Düzenle</span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-primary hover:bg-primary/5" onClick={() => toast.info('Bu özellik yakında gelecek')}>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Key className="w-5 h-5 text-amber-600" />
                </div>
                <span className="text-sm font-medium">Şifre Değiştir</span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-primary hover:bg-primary/5" onClick={() => toast.info('Bu özellik yakında gelecek')}>
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm font-medium">Bildirimler</span>
              </Button>

              <Button variant="outline" className="h-auto py-4 flex flex-col items-center gap-2 border-slate-200 hover:border-primary hover:bg-primary/5" onClick={() => toast.info('Bu özellik yakında gelecek')}>
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-rose-600" />
                </div>
                <span className="text-sm font-medium">Gizlilik</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

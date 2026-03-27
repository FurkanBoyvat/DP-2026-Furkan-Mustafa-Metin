import React, { useState, useEffect } from 'react';
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
  FileText,
  Save,
  ChevronRight,
  UserCircle,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { toast } from 'sonner';
import { authAPI } from '../services/api';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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

const rolLabels: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { 
    label: 'Sistem Yöneticisi', 
    color: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    icon: Shield
  },
  sirket_yoneticisi: { 
    label: 'Şirket Yöneticisi', 
    color: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    icon: Building2
  },
  surucü: { 
    label: 'Sürücü', 
    color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    icon: Truck
  },
  muhasebe: { 
    label: 'Muhasebe', 
    color: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    icon: FileText
  },
};

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'security'>('overview');
  
  // Edit Profile State
  const [editForm, setEditForm] = useState({ ad: '', soyad: '', telefon: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Security State
  const [passwordForm, setPasswordForm] = useState({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await authAPI.getProfile();
      if (data.success) {
        setProfile(data.kullanici);
        setEditForm({
          ad: data.kullanici.ad,
          soyad: data.kullanici.soyad,
          telefon: data.kullanici.telefon
        });
      }
    } catch (err: any) {
      toast.error(err.message || 'Profil bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUpdating(true);
      const data = await authAPI.updateProfile(editForm);
      if (data.success) {
        toast.success('Profil başarıyla güncellendi');
        setProfile({ ...profile!, ...editForm });
        setActiveTab('overview');
      }
    } catch (err: any) {
      toast.error(err.message || 'Güncelleme başarısız');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.yeniSifre !== passwordForm.yeniSifreTekrar) {
      toast.error('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      setIsChangingPass(true);
      const data = await authAPI.changePassword({
        mevcutSifre: passwordForm.mevcutSifre,
        yeniSifre: passwordForm.yeniSifre
      });
      if (data.success) {
        toast.success('Şifre başarıyla değiştirildi');
        setPasswordForm({ mevcutSifre: '', yeniSifre: '', yeniSifreTekrar: '' });
        setActiveTab('overview');
      }
    } catch (err: any) {
      toast.error(err.message || 'Şifre değiştirme başarısız');
    } finally {
      setIsChangingPass(false);
    }
  };

  const getInitials = (ad: string, soyad: string) => {
    return `${ad?.charAt(0) || ''}${soyad?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-80px)] items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-[#0B1120] p-6 lg:p-10 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header with Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Kullanıcı Profili</h1>
          <p className="text-slate-400 mt-2 text-lg">Hesap ayarlarınızı ve kişisel bilgilerinizi buradan yönetebilirsiniz.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 text-sm font-semibold flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Sistem Aktif
          </Badge>
          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all" onClick={fetchProfile}>
            <Clock className="w-4 h-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar - Navigation */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-[#111827]/50 border-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6 flex flex-col items-center border-b border-white/5">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur opacity-40 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                  <Avatar className="w-24 h-24 border-2 border-white/10 relative">
                    <AvatarImage src={`https://ui-avatars.com/api/?name=${profile.ad}+${profile.soyad}&background=0D8ABC&color=fff&size=128`} />
                    <AvatarFallback className="bg-slate-800 text-2xl text-white">
                      {getInitials(profile.ad, profile.soyad)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full border-2 border-[#111827] flex items-center justify-center text-white hover:bg-blue-500 transition-colors shadow-lg">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white">{profile.ad} {profile.soyad}</h3>
                <p className="text-sm text-slate-400 truncate w-full text-center">{profile.email}</p>
                
                <div className="mt-4 w-full">
                  {(() => {
                    const RolIcon = rolLabels[profile.rol]?.icon || User;
                    return (
                      <Badge variant="outline" className={cn("w-full justify-center py-2 border font-bold", rolLabels[profile.rol]?.color)}>
                        <RolIcon className="w-4 h-4 mr-2" />
                        {rolLabels[profile.rol]?.label || profile.rol}
                      </Badge>
                    );
                  })()}
                </div>
              </div>

              <div className="p-2">
                {[
                  { id: 'overview', label: 'Genel Bakış', icon: UserCircle },
                  { id: 'edit', label: 'Profili Düzenle', icon: Edit3 },
                  { id: 'security', label: 'Güvenlik Ayarları', icon: Key }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id as any)}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                        activeTab === item.id 
                          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20" 
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border-white/5">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Katılım Tarihi</p>
                <p className="text-sm font-bold text-white">
                  {new Date(profile.olusturulma_tarihi).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Account Overview Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-[#1e293b]/40 border-white/10 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-widest">İletişim Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20 group-hover:bg-blue-500/20 transition-all">
                        <Mail className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-0.5">E-posta Adresi</p>
                        <p className="text-base font-bold text-white truncate">{profile.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
                        <Phone className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-0.5">Telefon Numarası</p>
                        <p className="text-base font-bold text-white">{profile.telefon}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-[#1e293b]/40 border-white/10 backdrop-blur-xl shadow-xl">
                  <CardHeader className="pb-2 border-b border-white/5">
                    <CardTitle className="text-sm font-bold text-blue-400 uppercase tracking-widest">Hesap Durumu</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-6">
                    <div className="flex items-center gap-4 group">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                        profile.durum ? "bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500/20" : "bg-red-500/10 border-red-500/20 group-hover:bg-red-500/20"
                      )}>
                        {profile.durum ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <XCircle className="w-6 h-6 text-red-400" />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-0.5">Mevcut Durum</p>
                        <p className={cn("text-base font-bold", profile.durum ? "text-emerald-400" : "text-red-400")}>
                          {profile.durum ? 'Sistem Aktif / Yayında' : 'Hesap Devre Dışı'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                        <Clock className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-tight mb-0.5">Son Giriş Tarihi</p>
                        <p className="text-base font-bold text-white">
                          {profile.son_giris_tarih 
                            ? new Date(profile.son_giris_tarih).toLocaleString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : 'Henüz giriş yapılmadı'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Card */}
              <Card className="bg-[#1e293b]/40 border-white/10 backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-white">Son Etkinlikler</CardTitle>
                      <CardDescription className="text-slate-400 font-medium">Hesabınızdaki son işlemler ve aktiviteler</CardDescription>
                    </div>
                    <Button variant="ghost" className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 font-bold">Tümünü Gör</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 font-medium">
                    {[
                      { action: 'Profil Güncelleme', time: 'Az önce', icon: Edit3, color: 'text-blue-400', bg: 'bg-blue-400/10' },
                      { action: 'Sisteme Giriş Yapıldı', time: '2 saat önce', icon: LogOut, flip: true, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                      {action: 'Şifre Değiştirildi', time: 'Dün', icon: Key, color: 'text-orange-400', bg: 'bg-orange-400/10' }
                    ].map((activity, idx) => (
                      <div key={idx} className="flex items-center gap-4 group cursor-default">
                        <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform group-hover:scale-110", activity.bg)}>
                          <activity.icon className={cn("w-5 h-5", activity.color, activity.flip && "rotate-180")} />
                        </div>
                        <div className="flex-1 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                          <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors capitalize">{activity.action}</p>
                          <p className="text-xs text-slate-500 mt-0.5 tracking-wide">{activity.time}</p>
                        </div>
                        <Badge variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 px-3 cursor-pointer hover:bg-white/5">Detay</Badge>
                      </div>
                    ))}
                  </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'edit' && (
            <Card className="bg-[#1e293b]/40 border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-2xl font-bold text-white">Profil Bilgilerini Düzenle</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Adınız, soyadınız ve iletişim bilgileriniz.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Ad</label>
                      <input 
                        type="text" 
                        value={editForm.ad}
                        onChange={(e) => setEditForm({...editForm, ad: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Soyad</label>
                      <input 
                        type="text" 
                        value={editForm.soyad}
                        onChange={(e) => setEditForm({...editForm, soyad: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                        required
                      />
                    </div>
                    <div className="space-y-2 lg:col-span-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Telefon Numarası</label>
                      <input 
                        type="tel" 
                        value={editForm.telefon}
                        onChange={(e) => setEditForm({...editForm, telefon: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                        placeholder="05XX XXX XX XX"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <Button type="button" variant="ghost" className="text-slate-400 hover:text-white font-bold" onClick={() => setActiveTab('overview')}>Vazgeç</Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-blue-600/20" disabled={isUpdating}>
                      {isUpdating ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Güncelleniyor...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Save className="w-5 h-5" />
                          Değişiklikleri Kaydet
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card className="bg-[#1e293b]/40 border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-500 shadow-2xl">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-2xl font-bold text-white">Şifre Değiştir</CardTitle>
                <CardDescription className="text-slate-400 font-medium">Hesap güvenliğiniz için güncel bir şifre kullanın.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Mevcut Şifre</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                          type="password" 
                          value={passwordForm.mevcutSifre}
                          onChange={(e) => setPasswordForm({...passwordForm, mevcutSifre: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>
                    <Separator className="bg-white/5 my-8" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Yeni Şifre</label>
                        <input 
                          type="password" 
                          value={passwordForm.yeniSifre}
                          onChange={(e) => setPasswordForm({...passwordForm, yeniSifre: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-300 uppercase tracking-wide">Yeni Şifre (Tekrar)</label>
                        <input 
                          type="password" 
                          value={passwordForm.yeniSifreTekrar}
                          onChange={(e) => setPasswordForm({...passwordForm, yeniSifreTekrar: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-semibold"
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
                    <Button type="button" variant="ghost" className="text-slate-400 hover:text-white font-bold" onClick={() => setActiveTab('overview')}>Vazgeç</Button>
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-10 h-12 font-bold shadow-lg shadow-emerald-600/20" disabled={isChangingPass}>
                      {isChangingPass ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Değiştiriliyor...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5" />
                          Şifreyi Güncelle
                        </span>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

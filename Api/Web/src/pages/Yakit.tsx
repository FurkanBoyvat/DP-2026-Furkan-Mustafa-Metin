import React, { useState, useEffect } from 'react';
import { yakitAPI, soforAPI, sirketAPI, filoAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, Edit2, Trash2, Search, Fuel, AlertCircle, 
  TrendingUp, DollarSign, Trophy, Medal, MapPin, 
  Calendar, User, Building2, Landmark
} from 'lucide-react';
import { toast } from 'sonner';

interface SoforYakitKayit {
  kayit_id: number;
  kullanici_id: number;
  ad: string;
  soyad: string;
  sirket_adi?: string;
  filo_adi?: string;
  ay: number;
  yil: number;
  aylik_km: number;
  aylik_yakit_tutar: number;
  notlar?: string;
  olusturulma_tarihi: string;
}

interface LeaderboardItem {
  kullanici_id: number;
  ad: string;
  soyad: string;
  sirket_adi?: string;
  filo_adi?: string;
  toplam_km: number;
  toplam_tutar: number;
  birim_maliyet: number;
}

type LeaderboardByAracTipi = Record<string, LeaderboardItem[]>;

const ARAC_TIPI_LABELS: Record<string, string> = {
  kamyon: 'Kamyon',
  otobüs: 'Otobüs',
  minibüs: 'Minibüs',
  araç: 'Araç',
  traktör: 'Traktör',
  taksi: 'Taksi',
  diğer: 'Diğer',
};

interface Sofor {
  kullanici_id: number;
  ad: string;
  soyad: string;
  sirket_adi?: string;
  filo_adi?: string;
}

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

export default function YakitPage() {
  const [kayitlar, setKayitlar] = useState<SoforYakitKayit[]>([]);
  const [soforler, setSoforler] = useState<Sofor[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [leaderboardByAracTipi, setLeaderboardByAracTipi] = useState<LeaderboardByAracTipi>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<SoforYakitKayit | null>(null);

  const [formData, setFormData] = useState({
    kullanici_id: '',
    ay: new Date().getMonth() + 1,
    yil: new Date().getFullYear(),
    aylik_km: '',
    aylik_yakit_tutar: '',
    notlar: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kayitRes, soforRes, leaderboardRes, byAracTipiRes] = await Promise.all([
        yakitAPI.getSoforKayitlari(),
        soforAPI.getAll(),
        yakitAPI.getLeaderboard(),
        yakitAPI.getLeaderboardByAracTipi(),
      ]);
      setKayitlar(kayitRes.data || []);
      setSoforler(soforRes.data || []);
      setLeaderboard(leaderboardRes.data || []);
      setLeaderboardByAracTipi(byAracTipiRes.data || {});
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        kullanici_id: parseInt(formData.kullanici_id),
        ay: formData.ay,
        yil: formData.yil,
        aylik_km: parseFloat(formData.aylik_km),
        aylik_yakit_tutar: parseFloat(formData.aylik_yakit_tutar),
        notlar: formData.notlar,
      };

      if (editingKayit) {
        await yakitAPI.updateSoforKayit(editingKayit.kayit_id, data);
        toast.success('Kayıt güncellendi');
      } else {
        await yakitAPI.createSoforKayit(data);
        toast.success('Kayıt oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (kayit_id: number) => {
    if (!confirm('Bu kaydı silmek istediğinize emin misiniz?')) return;
    try {
      await yakitAPI.deleteSoforKayit(kayit_id);
      toast.success('Kayıt silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (kayit: SoforYakitKayit) => {
    setEditingKayit(kayit);
    setFormData({
      kullanici_id: String(kayit.kullanici_id),
      ay: kayit.ay,
      yil: kayit.yil,
      aylik_km: String(kayit.aylik_km),
      aylik_yakit_tutar: String(kayit.aylik_yakit_tutar),
      notlar: kayit.notlar || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingKayit(null);
    setFormData({
      kullanici_id: '',
      ay: new Date().getMonth() + 1,
      yil: new Date().getFullYear(),
      aylik_km: '',
      aylik_yakit_tutar: '',
      notlar: '',
    });
  };

  const filteredKayitlar = kayitlar.filter(kayit =>
    `${kayit.ad} ${kayit.soyad}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kayit.sirket_adi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kayit.filo_adi || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <div className="bg-red-500 p-2 rounded-lg">
              <Fuel className="w-8 h-8 text-white" />
            </div>
            Yakıt ve Performans Takibi
          </h1>
          <p className="text-slate-500 mt-1">Şoför bazlı aylık yakıt tüketimi ve verimlilik analizi</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-600 hover:bg-red-700 shadow-lg">
          <Plus className="w-4 h-4 mr-2" />
          Yeni Veri Girişi
        </Button>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList className="bg-white p-1 border shadow-sm">
          <TabsTrigger value="leaderboard" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <Trophy className="w-4 h-4 mr-2" />
            Başarı Sıralaması
          </TabsTrigger>
          <TabsTrigger value="kayitlar" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
            <Calendar className="w-4 h-4 mr-2" />
            Aylık Kayıtlar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {leaderboard.slice(0, 3).map((item, index) => (
              <Card key={item.kullanici_id} className={`relative overflow-hidden border-none shadow-md ${
                index === 0 ? 'bg-gradient-to-br from-yellow-50 to-yellow-100 ring-2 ring-yellow-400' :
                index === 1 ? 'bg-gradient-to-br from-slate-50 to-slate-100 ring-2 ring-slate-300' :
                'bg-gradient-to-br from-orange-50 to-orange-100 ring-2 ring-orange-300'
              }`}>
                <div className="absolute top-2 right-2 opacity-10">
                  <Trophy className="w-24 h-24" />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${
                      index === 0 ? 'bg-yellow-400' :
                      index === 1 ? 'bg-slate-300' :
                      'bg-orange-400'
                    }`}>
                      <Medal className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="outline" className="bg-white/50 border-none font-bold">
                      {index + 1}. Sıra
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">{item.ad} {item.soyad}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {item.sirket_adi || 'Şirket Yok'}
                    </p>
                    <p className="text-sm text-slate-600 flex items-center gap-1">
                      <Landmark className="w-3 h-3" /> {item.filo_adi || 'Filo Yok'}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-black/5 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Verimlilik</p>
                      <p className="text-lg font-black text-slate-800">{Number(item.birim_maliyet).toFixed(2)} TL/km</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold text-slate-500">Toplam KM</p>
                      <p className="text-lg font-black text-slate-800">{Number(item.toplam_km).toLocaleString()} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="bg-white border-b">
              <CardTitle>Genel Verimlilik Sıralaması</CardTitle>
              <CardDescription>Şoförlerin km başına yakıt maliyeti (Düşük olan daha başarılı)</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-16 text-center">Sıra</TableHead>
                    <TableHead>Şoför</TableHead>
                    <TableHead>Şirket / Filo</TableHead>
                    <TableHead className="text-right">Toplam KM</TableHead>
                    <TableHead className="text-right">Toplam Yakıt</TableHead>
                    <TableHead className="text-right font-bold">Birim Maliyet (TL/km)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((item, index) => (
                    <TableRow key={item.kullanici_id} className="hover:bg-slate-50 group">
                      <TableCell className="text-center font-bold text-slate-400 group-hover:text-slate-900">
                        #{index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {item.ad[0]}{item.soyad[0]}
                          </div>
                          <span className="font-medium text-slate-700">{item.ad} {item.soyad}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <p className="text-slate-600 font-medium">{item.sirket_adi}</p>
                          <p className="text-slate-400">{item.filo_adi}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-slate-600 font-medium">
                        {Number(item.toplam_km).toLocaleString()} km
                      </TableCell>
                      <TableCell className="text-right text-slate-600">
                        {Number(item.toplam_tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant={index < 3 ? "default" : "outline"} className={
                          index === 0 ? 'bg-yellow-500 hover:bg-yellow-600 border-none' :
                          index === 1 ? 'bg-slate-400 hover:bg-slate-500 border-none' :
                          index === 2 ? 'bg-orange-500 hover:bg-orange-600 border-none' :
                          'text-slate-700 bg-slate-100 hover:bg-slate-200 border-none'
                        }>
                          {Number(item.birim_maliyet).toFixed(2)} TL/km
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {leaderboard.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-20 text-slate-400">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        Henüz veri girişi yapılmamış
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Araç tipine göre başarı sıralaması – sadece gerçek araç tipleri (atama_yok gösterme) */}
          {(() => {
            const aracTipiGruplari = Object.entries(leaderboardByAracTipi).filter(
              ([tip]) => tip !== 'atama_yok' && tip != null && tip !== ''
            );
            return (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-red-500" />
                  Araç Tipine Göre Başarı Sıralaması
                </h2>
                {aracTipiGruplari.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {aracTipiGruplari.map(([aracTipi, items]) => (
                      <Card key={aracTipi} className="border-none shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b py-4">
                          <CardTitle className="text-base flex items-center justify-between">
                            <span>{ARAC_TIPI_LABELS[aracTipi] ?? aracTipi}</span>
                            <Badge variant="secondary" className="font-normal">
                              {items.length} şoför
                            </Badge>
                          </CardTitle>
                          <CardDescription>Bu araç tipinde km başına yakıt maliyetine göre sıralama (düşük = daha verimli)</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <Table>
                            <TableHeader className="bg-slate-50">
                              <TableRow>
                                <TableHead className="w-16 text-center">Sıra</TableHead>
                                <TableHead>Şoför</TableHead>
                                <TableHead>Şirket / Filo</TableHead>
                                <TableHead className="text-right">Toplam KM</TableHead>
                                <TableHead className="text-right">Toplam Yakıt</TableHead>
                                <TableHead className="text-right font-bold">Birim Maliyet (TL/km)</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {items.map((item, index) => (
                                <TableRow key={`${aracTipi}-${item.kullanici_id}`} className="hover:bg-slate-50 group">
                                  <TableCell className="text-center font-bold text-slate-400 group-hover:text-slate-900">
                                    #{index + 1}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                        {item.ad[0]}{item.soyad[0]}
                                      </div>
                                      <span className="font-medium text-slate-700">{item.ad} {item.soyad}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="text-xs space-y-0.5">
                                      <p className="text-slate-600 font-medium">{item.sirket_adi}</p>
                                      <p className="text-slate-400">{item.filo_adi}</p>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right text-slate-600 font-medium">
                                    {Number(item.toplam_km).toLocaleString()} km
                                  </TableCell>
                                  <TableCell className="text-right text-slate-600">
                                    {Number(item.toplam_tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Badge variant={index < 3 ? "default" : "outline"} className={
                                      index === 0 ? 'bg-yellow-500 hover:bg-yellow-600 border-none' :
                                      index === 1 ? 'bg-slate-400 hover:bg-slate-500 border-none' :
                                      index === 2 ? 'bg-orange-500 hover:bg-orange-600 border-none' :
                                      'text-slate-700 bg-slate-100 hover:bg-slate-200 border-none'
                                    }>
                                      {Number(item.birim_maliyet).toFixed(2)} TL/km
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-none shadow-sm bg-amber-50/50 border border-amber-200">
                    <CardContent className="py-8 text-center">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-600 opacity-80" />
                      <p className="font-medium text-slate-700 mb-1">Araç tipine göre sıralama için araç ataması gerekli</p>
                      <p className="text-sm text-slate-500 max-w-md mx-auto">
                        Sadece aracı atanmış şoförler burada listelenir (kamyon, otobüs vb. kendi içinde sıralanır).
                        Lütfen <strong>Araçlar</strong> veya ilgili sayfadan şoför-araç ataması yaptığınızdan emin olun.
                        Değişiklikleri görmek için API sunucusunu yeniden başlatın.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            );
          })()}
        </TabsContent>

        <TabsContent value="kayitlar" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border shadow-sm">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Şoför, şirket veya filo ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-200"
              />
            </div>
          </div>

          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-900">
                  <TableRow>
                    <TableHead className="text-slate-300">Şoför</TableHead>
                    <TableHead className="text-slate-300">Şirket / Filo</TableHead>
                    <TableHead className="text-slate-300 text-center">Dönem</TableHead>
                    <TableHead className="text-slate-300 text-right">Mesafe (KM)</TableHead>
                    <TableHead className="text-slate-300 text-right">Harcanan Tutar</TableHead>
                    <TableHead className="text-slate-300 text-right">Maliyet (TL/km)</TableHead>
                    <TableHead className="text-slate-300 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKayitlar.map((kayit) => (
                    <TableRow key={kayit.kayit_id} className="hover:bg-slate-50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">{kayit.ad} {kayit.soyad}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs space-y-0.5">
                          <p className="text-slate-600 font-medium">{kayit.sirket_adi}</p>
                          <p className="text-slate-400 italic">{kayit.filo_adi}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 uppercase text-[10px]">
                          {AYLAR[kayit.ay - 1]} {kayit.yil}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-600">
                        {Number(kayit.aylik_km).toLocaleString()} km
                      </TableCell>
                      <TableCell className="text-right font-bold text-slate-800">
                        {Number(kayit.aylik_yakit_tutar).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-red-600">
                          {(kayit.aylik_yakit_tutar / kayit.aylik_km).toFixed(2)} TL/km
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(kayit)} className="hover:bg-blue-50 hover:text-blue-600 h-8 w-8 p-0">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(kayit.kayit_id)} className="hover:bg-red-50 hover:text-red-600 h-8 w-8 p-0">
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredKayitlar.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-20 text-slate-400 bg-white">
                        <Search className="w-12 h-12 mx-auto mb-2 opacity-10" />
                        Arama kriterlerine uygun kayıt bulunamadı
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Giriş Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-white p-0 overflow-hidden">
          <DialogHeader className="p-6 bg-slate-900 text-white">
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Fuel className="w-6 h-6 text-red-500" />
              {editingKayit ? 'Kaydı Güncelle' : 'Yeni Aylık Veri'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold">Şoför Seçimi</Label>
                <Select
                  value={formData.kullanici_id}
                  onValueChange={(v) => setFormData({...formData, kullanici_id: v})}
                  disabled={!!editingKayit}
                >
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Veri girilecek şoförü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {soforler.map((s) => (
                      <SelectItem key={s.kullanici_id} value={String(s.kullanici_id)}>
                        {s.ad} {s.soyad} ({s.filo_adi || 'Filo Yok'})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">Ay</Label>
                  <Select value={String(formData.ay)} onValueChange={(v) => setFormData({...formData, ay: parseInt(v)})}>
                    <SelectTrigger className="border-slate-300">
                      <SelectValue placeholder="Ay" />
                    </SelectTrigger>
                    <SelectContent>
                      {AYLAR.map((ay, idx) => (
                        <SelectItem key={idx + 1} value={String(idx + 1)}>{ay}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold">Yıl</Label>
                  <Input 
                    type="number" 
                    className="border-slate-300"
                    value={formData.yil}
                    onChange={(e) => setFormData({...formData, yil: parseInt(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" /> Aylık Toplam Mesafe (KM)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Örn: 2450.5"
                    className="text-lg font-bold border-slate-300"
                    value={formData.aylik_km}
                    onChange={(e) => setFormData({...formData, aylik_km: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-600 font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" /> Aylık Yakıt Harcaması (TL)
                  </Label>
                  <Input
                    type="number"
                    placeholder="Örn: 12500"
                    className="text-lg font-bold border-slate-300 text-green-700"
                    value={formData.aylik_yakit_tutar}
                    onChange={(e) => setFormData({...formData, aylik_yakit_tutar: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t gap-2 sm:gap-0">
              <DialogClose asChild>
                <Button type="button" variant="ghost" className="text-slate-500">İptal</Button>
              </DialogClose>
              <Button type="submit" className="bg-red-600 hover:bg-red-700 px-8 shadow-md">
                {editingKayit ? 'Güncelle' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

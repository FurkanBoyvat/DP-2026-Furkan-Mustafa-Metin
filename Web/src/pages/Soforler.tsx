import React, { useState, useEffect } from 'react';
import { soforAPI, aracAPI, aracSoforAPI, sirketAPI, filoAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, UserCircle, AlertCircle, BarChart3, Building2, Truck, Phone, Mail, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Sofor {
  kullanici_id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: string;
  durum: boolean;
  sirket_adi?: string;
  sirket_id?: number;
  filo_adi?: string;
  filo_id?: number;
  arac_sayisi?: number;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

interface Filo {
  filo_id: number;
  filo_adi: string;
  sirket_id: number;
}

interface AracSofor {
  sofor_id: number;
  arac_id: number;
  kullanici_id: number;
  sofor_adi: string;
  sofor_soyadi: string;
  ehliyet_numarasi: string;
  ehliyet_son_validasyon_tarihi: string;
  telefon: string;
  atama_tarihi: string;
  durum: boolean;
}

interface Arac {
  arac_id: number;
  plaka: string;
  marka: string;
  model: string;
}

const rolOptions = [
  { value: 'surucü', label: 'Sürücü' },
  { value: 'admin', label: 'Admin' },
  { value: 'sirket_yoneticisi', label: 'Şirket Yöneticisi' },
  { value: 'muhasebe', label: 'Muhasebe' },
];

export default function SoforlerPage() {
  const [soforler, setSoforler] = useState<Sofor[]>([]);
  const [aracSoforler, setAracSoforler] = useState<AracSofor[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [filolar, setFilolar] = useState<Filo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAtamaDialogOpen, setIsAtamaDialogOpen] = useState(false);
  const [isIstatistikOpen, setIsIstatistikOpen] = useState(false);
  const [selectedSofor, setSelectedSofor] = useState<Sofor | null>(null);
  const [istatistikler, setIstatistikler] = useState<Record<number, any>>({});
  const [editingSofor, setEditingSofor] = useState<Sofor | null>(null);
  const [editingAtama, setEditingAtama] = useState<AracSofor | null>(null);
  const [activeTab, setActiveTab] = useState<'soforler' | 'atamalar'>('soforler');

  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    rol: 'surucü',
    sifre: '',
    sirket_id: '',
    filo_id: '',
  });

  const [atamaFormData, setAtamaFormData] = useState({
    arac_id: '',
    kullanici_id: '',
    sofor_adi: '',
    sofor_soyadi: '',
    ehliyet_numarasi: '',
    ehliyet_son_validasyon_tarihi: '',
    telefon: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [soforRes, aracSoforRes, aracRes, sirketRes, filoRes] = await Promise.all([
        soforAPI.getAll(),
        aracSoforAPI.getAll(),
        aracAPI.getAll(),
        sirketAPI.getAll(),
        filoAPI.getAll(),
      ]);
      setSoforler(soforRes.data || []);
      setAracSoforler(aracSoforRes.data || []);
      setAraclar(aracRes.araclar || []);
      setSirketler(sirketRes.sirketler || []);
      setFilolar(filoRes.filolar || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu: ' + (error.message || ''));
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFilolar = formData.sirket_id
    ? filolar.filter(f => f.sirket_id === parseInt(formData.sirket_id))
    : filolar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        ...(formData.sirket_id && { sirket_id: parseInt(formData.sirket_id) }),
        ...(formData.filo_id && { filo_id: parseInt(formData.filo_id) }),
      };
      if (editingSofor) {
        const { sifre, sirket_id, ...updateData } = submitData;
        await soforAPI.update(editingSofor.kullanici_id, sifre ? { ...updateData, sifre } : updateData);
        toast.success('Şoför başarıyla güncellendi');
      } else {
        await soforAPI.create(submitData);
        toast.success('Şoför başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleAtamaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...atamaFormData,
        arac_id: parseInt(atamaFormData.arac_id),
        kullanici_id: parseInt(atamaFormData.kullanici_id),
      };

      if (editingAtama) {
        await aracSoforAPI.update(editingAtama.sofor_id, data);
        toast.success('Atama başarıyla güncellendi');
      } else {
        await aracSoforAPI.create(data);
        toast.success('Atama başarıyla oluşturuldu');
      }
      setIsAtamaDialogOpen(false);
      resetAtamaForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (kullanici_id: number) => {
    if (!confirm('Bu şoförü silmek istediğinize emin misiniz?')) return;
    try {
      await soforAPI.delete(kullanici_id);
      toast.success('Şoför başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleAtamaDelete = async (sofor_id: number) => {
    if (!confirm('Bu atamayı silmek istediğinize emin misiniz?')) return;
    try {
      await aracSoforAPI.delete(sofor_id);
      toast.success('Atama başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (sofor: Sofor) => {
    setEditingSofor(sofor);
    setFormData({
      ad: sofor.ad,
      soyad: sofor.soyad,
      email: sofor.email,
      telefon: sofor.telefon,
      rol: sofor.rol,
      sifre: '',
      sirket_id: sofor.sirket_id ? String(sofor.sirket_id) : '',
      filo_id: sofor.filo_id ? String(sofor.filo_id) : '',
    });
    setIsDialogOpen(true);
  };

  const handleAtamaEdit = (atama: AracSofor) => {
    setEditingAtama(atama);
    setAtamaFormData({
      arac_id: String(atama.arac_id),
      kullanici_id: String(atama.kullanici_id),
      sofor_adi: atama.sofor_adi,
      sofor_soyadi: atama.sofor_soyadi,
      ehliyet_numarasi: atama.ehliyet_numarasi,
      ehliyet_son_validasyon_tarihi: atama.ehliyet_son_validasyon_tarihi?.split('T')[0] || '',
      telefon: atama.telefon,
    });
    setIsAtamaDialogOpen(true);
  };
  const handleShowIstatistik = async (sofor: Sofor) => {
    setSelectedSofor(sofor);
    setIsIstatistikOpen(true);
    try {
      const res = await soforAPI.getIstatistikler(sofor.kullanici_id);
      if (res.success) {
        setIstatistikler(prev => ({ ...prev, [sofor.kullanici_id]: res.istatistikler }));
      } else {
        setIstatistikler(prev => ({ ...prev, [sofor.kullanici_id]: { error: true } }));
      }
    } catch (error) {
      console.error('İstatistikler yüklenemedi');
      setIstatistikler(prev => ({ ...prev, [sofor.kullanici_id]: { error: true } }));
    }
  };
  const resetForm = () => {
    setEditingSofor(null);
    setFormData({
      ad: '',
      soyad: '',
      email: '',
      telefon: '',
      rol: 'surucü',
      sifre: '',
      sirket_id: '',
      filo_id: '',
    });
  };

  const resetAtamaForm = () => {
    setEditingAtama(null);
    setAtamaFormData({
      arac_id: '',
      kullanici_id: '',
      sofor_adi: '',
      sofor_soyadi: '',
      ehliyet_numarasi: '',
      ehliyet_son_validasyon_tarihi: '',
      telefon: '',
    });
  };

  const getAracPlaka = (arac_id: number) => {
    const arac = araclar.find(a => a.arac_id === arac_id);
    return arac?.plaka || 'Bilinmiyor';
  };

  const getSoforAdi = (kullanici_id: number) => {
    const sofor = soforler.find(s => s.kullanici_id === kullanici_id);
    return sofor ? `${sofor.ad} ${sofor.soyad}` : 'Bilinmiyor';
  };

  const filteredSoforler = soforler.filter(sofor =>
    (sofor.ad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sofor.soyad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sofor.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAtamalar = aracSoforler.filter(atama =>
    (atama.sofor_adi || (atama as any).sofor_adı || (atama as any).sofor_ad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (atama.sofor_soyadi || (atama as any).sofor_soyad || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (getAracPlaka(atama.arac_id) || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-red-500" />
            Şoför Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Şoförleri ve araç atamalarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAtamaDialogOpen} onOpenChange={setIsAtamaDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetAtamaForm(); setIsAtamaDialogOpen(true); }} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Araç Atama
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingAtama ? 'Atama Düzenle' : 'Yeni Araç Atama'}</DialogTitle>
                <DialogDescription>Araç-şoför ataması bilgilerini girin</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAtamaSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="atama_arac">Araç *</Label>
                    <Select
                      value={atamaFormData.arac_id}
                      onValueChange={(value) => setAtamaFormData({ ...atamaFormData, arac_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Araç seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {araclar.map((arac) => (
                          <SelectItem key={arac.arac_id} value={String(arac.arac_id)}>
                            {arac.plaka} - {arac.marka} {arac.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="atama_kullanici">Şoför (Kullanıcı) *</Label>
                    <Select
                      value={atamaFormData.kullanici_id}
                      onValueChange={(value) => {
                        const sofor = soforler.find(s => s.kullanici_id === parseInt(value));
                        setAtamaFormData({
                          ...atamaFormData,
                          kullanici_id: value,
                          sofor_adi: sofor?.ad || '',
                          sofor_soyadi: sofor?.soyad || '',
                          telefon: sofor?.telefon || '',
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şoför seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {soforler.map((sofor) => (
                          <SelectItem key={sofor.kullanici_id} value={String(sofor.kullanici_id)}>
                            {sofor.ad} {sofor.soyad}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ehliyet_no">Ehliyet No *</Label>
                    <Input
                      id="ehliyet_no"
                      value={atamaFormData.ehliyet_numarasi}
                      onChange={(e) => setAtamaFormData({ ...atamaFormData, ehliyet_numarasi: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ehliyet_tarih">Ehliyet Son Geçerlilik *</Label>
                    <Input
                      id="ehliyet_tarih"
                      type="date"
                      value={atamaFormData.ehliyet_son_validasyon_tarihi}
                      onChange={(e) => setAtamaFormData({ ...atamaFormData, ehliyet_son_validasyon_tarihi: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    {editingAtama ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Şoför
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSofor ? 'Şoför Düzenle' : 'Yeni Şoför Ekle'}</DialogTitle>
                <DialogDescription>Şoför bilgilerini girin</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ad">Ad *</Label>
                    <Input
                      id="ad"
                      value={formData.ad}
                      onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="soyad">Soyad *</Label>
                    <Input
                      id="soyad"
                      value={formData.soyad}
                      onChange={(e) => setFormData({ ...formData, soyad: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefon">Telefon *</Label>
                    <Input
                      id="telefon"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      placeholder="0555 123 4567"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rol">Rol</Label>
                    <Select
                      value={formData.rol}
                      onValueChange={(value) => setFormData({ ...formData, rol: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Rol seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {rolOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sifre">
                      {editingSofor ? 'Şifre (boş bırakırsanız değişmez)' : 'Şifre *'}
                    </Label>
                    <Input
                      id="sifre"
                      type="password"
                      value={formData.sifre}
                      onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                      required={!editingSofor}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sirket">Şirket</Label>
                    <Select
                      value={formData.sirket_id}
                      onValueChange={(value) => setFormData({ ...formData, sirket_id: value, filo_id: '' })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Şirket seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {sirketler.map((sirket) => (
                          <SelectItem key={sirket.sirket_id} value={String(sirket.sirket_id)}>
                            {sirket.sirket_adi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="filo">Filo</Label>
                    <Select
                      value={formData.filo_id}
                      disabled={!formData.sirket_id}
                      onValueChange={(value) => setFormData({ ...formData, filo_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={formData.sirket_id ? "Filo seçin" : "Önce şirket seçin"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredFilolar.map((filo) => (
                          <SelectItem key={filo.filo_id} value={String(filo.filo_id)}>
                            {filo.filo_adi}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    {editingSofor ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'soforler' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('soforler')}
        >
          Şoförler
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'atamalar' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('atamalar')}
        >
          Araç Atamaları
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              {activeTab === 'soforler' ? 'Şoför Listesi' : 'Araç Atama Listesi'}
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'soforler' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Filo</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSoforler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Şoför bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSoforler.map((sofor) => (
                      <TableRow key={sofor.kullanici_id}>
                        <TableCell className="font-medium">{sofor.ad} {sofor.soyad}</TableCell>
                        <TableCell>{sofor.email}</TableCell>
                        <TableCell>{sofor.telefon}</TableCell>
                        <TableCell>
                          {sofor.sirket_adi ? (
                            <Badge variant="outline">{sofor.sirket_adi}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Atanmamış</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {sofor.filo_adi ? (
                            <Badge variant="outline">{sofor.filo_adi}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">Atanmamış</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={sofor.durum ? 'bg-green-500' : 'bg-gray-500'}>
                            {sofor.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowIstatistik(sofor)}
                            >
                              <BarChart3 className="w-4 h-4 text-blue-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sofor)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(sofor.kullanici_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şoför</TableHead>
                    <TableHead>Araç</TableHead>
                    <TableHead>Ehliyet No</TableHead>
                    <TableHead>Ehliyet Bitiş</TableHead>
                    <TableHead>Atama Tarihi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAtamalar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Atama bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAtamalar.map((atama) => (
                      <TableRow key={atama.sofor_id}>
                        <TableCell className="font-medium">
                          {atama.sofor_adi} {atama.sofor_soyadi}
                        </TableCell>
                        <TableCell>{getAracPlaka(atama.arac_id)}</TableCell>
                        <TableCell>{atama.ehliyet_numarasi}</TableCell>
                        <TableCell>
                          {new Date(atama.ehliyet_son_validasyon_tarihi).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          {new Date(atama.atama_tarihi).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <Badge className={atama.durum ? 'bg-green-500' : 'bg-gray-500'}>
                            {atama.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleAtamaEdit(atama)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleAtamaDelete(atama.sofor_id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Şoför İstatistik Dialog */}
      <Dialog open={isIstatistikOpen} onOpenChange={setIsIstatistikOpen}>
        <DialogContent className="max-w-2xl border-0 shadow-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-red-600/10 to-red-600/5 p-6 border-b border-red-500/10">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
                <div className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30">
                   <UserCircle className="w-6 h-6" />
                </div>
                {selectedSofor?.ad} {selectedSofor?.soyad} - Sürücü Karnesi
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {selectedSofor && (
              <div className="flex items-center justify-between px-1">
                 <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Kurumsal Üyelik</span>
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600 border border-slate-200">
                          <Building2 className="w-3.5 h-3.5" />
                          {selectedSofor.sirket_adi || 'Bireysel Şoför'}
                       </div>
                       {selectedSofor.filo_adi && (
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-lg text-xs font-bold text-red-600 border border-red-100 shadow-sm">
                            <Truck className="w-3.5 h-3.5" />
                            {selectedSofor.filo_adi}
                         </div>
                       )}
                    </div>
                 </div>
                 <Badge className={cn("px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-tighter shadow-sm border-0", selectedSofor.durum ? "bg-emerald-500 text-white" : "bg-slate-400 text-white")}>
                    {selectedSofor.durum ? 'GÖREVDE / AKTİF' : 'BOŞTA / PASİF'}
                 </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {selectedSofor && istatistikler[selectedSofor.kullanici_id] ? (
                 istatistikler[selectedSofor.kullanici_id].error ? (
                    <div className="col-span-2 py-8 text-center bg-red-50 rounded-2xl border border-red-100 italic text-red-500 text-xs font-bold">
                       Sürücü verileri şu an analiz edilemiyor. Lütfen sistem yöneticinizle iletişime geçin.
                    </div>
                 ) : (
                 <>
                   <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/20">
                      <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:scale-150 transition-transform duration-700">
                        <Truck className="w-20 h-20 text-white" />
                      </div>
                      <CardContent className="p-5 relative z-10 flex flex-col justify-between h-36">
                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                           <MapPin className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Toplam Sürüş Deneyimi</p>
                          <div className="flex items-baseline gap-1">
                             <h4 className="text-4xl font-black text-white tracking-tighter">
                                {Number(istatistikler[selectedSofor.kullanici_id].toplam_kat_edilen_yol || 0).toLocaleString('tr-TR')}
                             </h4>
                             <span className="text-xs font-bold text-white/60">KM</span>
                          </div>
                        </div>
                      </CardContent>
                   </Card>

                   <Card className="relative overflow-hidden group border-0 bg-gradient-to-br from-purple-500 to-purple-600 shadow-xl shadow-purple-500/20">
                      <div className="absolute top-0 right-0 p-1 opacity-10 group-hover:scale-150 transition-transform duration-700">
                        <Truck className="w-20 h-20 text-white" />
                      </div>
                      <CardContent className="p-5 relative z-10 flex flex-col justify-between h-36">
                        <div className="bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-md border border-white/30">
                           <Truck className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Şu Anki Araç Ataması</p>
                          <h4 className="text-3xl font-black text-white tracking-tighter uppercase truncate">
                             {istatistikler[selectedSofor.kullanici_id].aktif_arac_plaka || 'ARAÇ YOK'}
                          </h4>
                        </div>
                      </CardContent>
                   </Card>

                   <div className="group bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                              <Truck className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Toplam Araç Pakı Geçmişi</span>
                        </div>
                        <p className="text-2xl font-black text-slate-900 ml-11">{istatistikler[selectedSofor.kullanici_id].toplam_arac_parki} Farklı Araç</p>
                    </div>

                    <div className="group bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 transition-all duration-300">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                              <Phone className="w-4 h-4" />
                           </div>
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">İletişim Hattı</span>
                        </div>
                        <p className="text-xl font-black text-slate-900 ml-11">{selectedSofor.telefon}</p>
                    </div>
                 </>
               )
               ) : (
                 <div className="col-span-2 py-12 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Sürücü Verileri Analiz Ediliyor...</span>
                 </div>
               )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
            <DialogClose asChild>
              <Button className="bg-slate-900 text-white hover:bg-black font-black uppercase tracking-widest text-[10px] px-8 h-10 shadow-lg shadow-slate-900/20">Kapat</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

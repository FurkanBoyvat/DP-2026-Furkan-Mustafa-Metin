import React, { useState, useEffect } from 'react';
import { aracAPI, filoAPI, sirketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, Car, AlertCircle, Wrench, ShieldCheck, FileText, Calendar, TrendingUp, History, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Arac {
  arac_id: number;
  filo_id: number;
  sirket_id: number;
  plaka: string;
  marka: string;
  model: string;
  yil: number;
  renk?: string;
  arac_tipi?: string;
  vin_no?: string;
  motor_no?: string;
  yakit_tipi?: string;
  alis_km?: number;
  alis_fiyat?: number;
  alis_tarihi?: string;
  mevcut_km?: number;
  durum: boolean;
  olusturulma_tarihi: string;
  sigorta_numarasi?: string;
  sigorta_baslangic_tarihi?: string;
  sigorta_bitis_tarihi?: string;
  teknik_muayene_tarihi?: string;
  son_bakım_tarihi?: string;
}

interface Filo {
  filo_id: number;
  filo_adi: string;
  sirket_id: number;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

const aracTipiOptions = [
  { value: 'kamyon', label: 'Kamyon' },
  { value: 'otobüs', label: 'Otobüs' },
  { value: 'minibüs', label: 'Minibüs' },
  { value: 'araç', label: 'Araç' },
  { value: 'traktör', label: 'Traktör' },
  { value: 'taksi', label: 'Taksi' },
  { value: 'diğer', label: 'Diğer' },
];

const yakitTipiOptions = [
  { value: 'benzin', label: 'Benzin' },
  { value: 'dizel', label: 'Dizel' },
  { value: 'lpg', label: 'LPG' },
  { value: 'elektrik', label: 'Elektrik' },
  { value: 'hibrit', label: 'Hibrit' },
];

export default function AraclarPage() {
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [filolar, setFilolar] = useState<Filo[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArac, setEditingArac] = useState<Arac | null>(null);
  const [formData, setFormData] = useState({
    filo_id: '',
    sirket_id: '',
    plaka: '',
    marka: '',
    model: '',
    yil: new Date().getFullYear(),
    renk: '',
    arac_tipi: '',
    vin_no: '',
    motor_no: '',
    yakit_tipi: '',
    alis_km: 0,
    alis_fiyat: 0,
    alis_tarihi: new Date().toISOString().split('T')[0],
    sigorta_numarasi: '',
    sigorta_baslangic_tarihi: '',
    sigorta_bitis_tarihi: '',
    teknik_muayene_tarihi: '',
    son_bakım_tarihi: '',
  });

  const [selectedAracDetay, setSelectedAracDetay] = useState<Arac | null>(null);
  const [isDetayOpen, setIsDetayOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aracRes, filoRes, sirketRes] = await Promise.all([
        aracAPI.getAll(),
        filoAPI.getAll(),
        sirketAPI.getAll(),
      ]);
      setAraclar(aracRes.araclar || []);
      setFilolar(filoRes.filolar || []);
      setSirketler(sirketRes.sirketler || []);
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
        ...formData,
        filo_id: parseInt(formData.filo_id),
        sirket_id: parseInt(formData.sirket_id),
        yil: parseInt(String(formData.yil)),
        alis_km: parseFloat(String(formData.alis_km)),
        alis_fiyat: parseFloat(String(formData.alis_fiyat)),
      };

      if (editingArac) {
        await aracAPI.update(editingArac.arac_id, data);
        toast.success('Araç başarıyla güncellendi');
      } else {
        await aracAPI.create(data);
        toast.success('Araç başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (arac_id: number) => {
    if (!confirm('Bu aracı silmek istediğinize emin misiniz?')) return;
    try {
      await aracAPI.delete(arac_id);
      toast.success('Araç başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (arac: Arac) => {
    setEditingArac(arac);
    setFormData({
      filo_id: String(arac.filo_id),
      sirket_id: String(arac.sirket_id),
      plaka: arac.plaka,
      marka: arac.marka,
      model: arac.model,
      yil: arac.yil,
      renk: arac.renk || '',
      arac_tipi: arac.arac_tipi || '',
      vin_no: arac.vin_no || '',
      motor_no: arac.motor_no || '',
      yakit_tipi: arac.yakit_tipi || '',
      alis_km: arac.alis_km || 0,
      alis_fiyat: arac.alis_fiyat || 0,
      alis_tarihi: arac.alis_tarihi?.split('T')[0] || new Date().toISOString().split('T')[0],
      sigorta_numarasi: arac.sigorta_numarasi || '',
      sigorta_baslangic_tarihi: arac.sigorta_baslangic_tarihi?.split('T')[0] || '',
      sigorta_bitis_tarihi: arac.sigorta_bitis_tarihi?.split('T')[0] || '',
      teknik_muayene_tarihi: arac.teknik_muayene_tarihi?.split('T')[0] || '',
      son_bakım_tarihi: arac.son_bakım_tarihi?.split('T')[0] || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingArac(null);
    setFormData({
      filo_id: '',
      sirket_id: '',
      plaka: '',
      marka: '',
      model: '',
      yil: new Date().getFullYear(),
      renk: '',
      arac_tipi: '',
      vin_no: '',
      motor_no: '',
      yakit_tipi: '',
      alis_km: 0,
      alis_fiyat: 0,
      alis_tarihi: new Date().toISOString().split('T')[0],
      sigorta_numarasi: '',
      sigorta_baslangic_tarihi: '',
      sigorta_bitis_tarihi: '',
      teknik_muayene_tarihi: '',
      son_bakım_tarihi: '',
    });
  };

  const getFiloAdi = (filo_id: number) => {
    const filo = filolar.find(f => f.filo_id === filo_id);
    return filo?.filo_adi || 'Bilinmiyor';
  };

  const getSirketAdi = (sirket_id: number) => {
    const sirket = sirketler.find(s => s.sirket_id === sirket_id);
    return sirket?.sirket_adi || 'Bilinmiyor';
  };

  const filteredAraclar = araclar.filter(arac =>
    arac.plaka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arac.marka.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arac.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Car className="w-8 h-8 text-red-500" />
            Araç Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Tüm araçları görüntüleyin, ekleyin ve yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Araç Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingArac ? 'Araç Düzenle' : 'Yeni Araç Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sirket_id">Şirket *</Label>
                  <Select
                    value={formData.sirket_id}
                    onValueChange={(value) => setFormData({ ...formData, sirket_id: value })}
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
                  <Label htmlFor="filo_id">Filo *</Label>
                  <Select
                    value={formData.filo_id}
                    onValueChange={(value) => setFormData({ ...formData, filo_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filo seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {filolar.map((filo) => (
                        <SelectItem key={filo.filo_id} value={String(filo.filo_id)}>
                          {filo.filo_adi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plaka">Plaka *</Label>
                  <Input
                    id="plaka"
                    value={formData.plaka}
                    onChange={(e) => setFormData({ ...formData, plaka: e.target.value })}
                    placeholder="34-ABC-123"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marka">Marka *</Label>
                  <Input
                    id="marka"
                    value={formData.marka}
                    onChange={(e) => setFormData({ ...formData, marka: e.target.value })}
                    placeholder="Volvo"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="FH16"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yil">Yıl *</Label>
                  <Input
                    id="yil"
                    type="number"
                    value={formData.yil}
                    onChange={(e) => setFormData({ ...formData, yil: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="renk">Renk</Label>
                  <Input
                    id="renk"
                    value={formData.renk}
                    onChange={(e) => setFormData({ ...formData, renk: e.target.value })}
                    placeholder="Beyaz"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="arac_tipi">Araç Tipi</Label>
                  <Select
                    value={formData.arac_tipi}
                    onValueChange={(value) => setFormData({ ...formData, arac_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Araç tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {aracTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yakit_tipi">Yakıt Tipi</Label>
                  <Select
                    value={formData.yakit_tipi}
                    onValueChange={(value) => setFormData({ ...formData, yakit_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Yakıt tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {yakitTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vin_no">VIN No</Label>
                  <Input
                    id="vin_no"
                    value={formData.vin_no}
                    onChange={(e) => setFormData({ ...formData, vin_no: e.target.value })}
                    placeholder="VVVWZZZ88Z123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="motor_no">Motor No</Label>
                  <Input
                    id="motor_no"
                    value={formData.motor_no}
                    onChange={(e) => setFormData({ ...formData, motor_no: e.target.value })}
                    placeholder="Motor numarası"
                  />
                </div>
                
                <div className="border-t pt-4 sm:col-span-2">
                  <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Satın Alma Bilgileri</h4>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alis_km">Alış Kilometresi (KM)</Label>
                  <Input
                    id="alis_km"
                    type="number"
                    value={formData.alis_km}
                    onChange={(e) => setFormData({ ...formData, alis_km: parseFloat(e.target.value) })}
                    placeholder="Örn: 10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alis_fiyat">Alış Fiyatı (₺)</Label>
                  <Input
                    id="alis_fiyat"
                    type="number"
                    value={formData.alis_fiyat}
                    onChange={(e) => setFormData({ ...formData, alis_fiyat: parseFloat(e.target.value) })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alis_tarihi">Alış Tarihi</Label>
                  <Input
                    id="alis_tarihi"
                    type="date"
                    value={formData.alis_tarihi}
                    onChange={(e) => setFormData({ ...formData, alis_tarihi: e.target.value })}
                  />
                </div>

                <div className="border-t pt-4 sm:col-span-2">
                  <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider">Muayene & Sigorta Bilgileri</h4>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="teknik_muayene_tarihi">Muayene Bitiş Tarihi (TÜVTÜRK)</Label>
                  <Input
                    id="teknik_muayene_tarihi"
                    type="date"
                    value={formData.teknik_muayene_tarihi}
                    onChange={(e) => setFormData({ ...formData, teknik_muayene_tarihi: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="son_bakım_tarihi">Son Bakım Tarihi</Label>
                  <Input
                    id="son_bakım_tarihi"
                    type="date"
                    value={formData.son_bakım_tarihi}
                    onChange={(e) => setFormData({ ...formData, son_bakım_tarihi: e.target.value })}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                   <Label htmlFor="sigorta_numarasi">Sigorta / Kasko Poliçe No</Label>
                   <Input
                     id="sigorta_numarasi"
                     value={formData.sigorta_numarasi}
                     onChange={(e) => setFormData({ ...formData, sigorta_numarasi: e.target.value })}
                     placeholder="POL-12345678"
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="sigorta_baslangic_tarihi">Sigorta Başlangıç</Label>
                   <Input
                     id="sigorta_baslangic_tarihi"
                     type="date"
                     value={formData.sigorta_baslangic_tarihi}
                     onChange={(e) => setFormData({ ...formData, sigorta_baslangic_tarihi: e.target.value })}
                   />
                </div>

                <div className="space-y-2">
                   <Label htmlFor="sigorta_bitis_tarihi">Sigorta Bitiş</Label>
                   <Input
                     id="sigorta_bitis_tarihi"
                     type="date"
                     value={formData.sigorta_bitis_tarihi}
                     onChange={(e) => setFormData({ ...formData, sigorta_bitis_tarihi: e.target.value })}
                   />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingArac ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Araç Listesi</CardTitle>
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plaka</TableHead>
                    <TableHead>Marka/Model</TableHead>
                    <TableHead>Kilometre (Gelişim)</TableHead>
                    <TableHead>Araç Tipi</TableHead>
                    <TableHead>Filo/Şirket</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAraclar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Araç bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAraclar.map((arac) => (
                      <TableRow key={arac.arac_id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="text-slate-900 font-bold">{arac.plaka}</span>
                            <span className="text-xs text-slate-500">{arac.vin_no || 'VIN Yok'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold">{arac.marka} {arac.model}</span>
                            <span className="text-xs text-slate-500">{arac.yil} model</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1.5 w-48">
                            <div className="flex justify-between text-xs font-bold">
                              <span className="text-slate-400">Başlangıç: {arac.alis_km?.toLocaleString() || 0}</span>
                              <span className="text-red-500">Güncel: {arac.mevcut_km?.toLocaleString() || 0}</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                              <div 
                                className="h-full bg-gradient-to-r from-red-400 to-red-600 transition-all duration-1000" 
                                style={{ width: `${Math.min(100, Math.max(5, ((arac.mevcut_km || 0) / (arac.mevcut_km || 1)) * 100))}%` }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                              Toplam Kat Edilen: {( (arac.mevcut_km || 0) - (arac.alis_km || 0) ).toLocaleString()} KM
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-slate-50">
                            {aracTipiOptions.find(o => o.value === arac.arac_tipi)?.label || arac.arac_tipi || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold">{getFiloAdi(arac.filo_id)}</span>
                            <span className="text-[10px] text-slate-500 uppercase font-bold">{getSirketAdi(arac.sirket_id)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn("font-bold px-3 py-1", arac.durum ? 'bg-emerald-500' : 'bg-slate-500')}>
                            {arac.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                              onClick={() => { setSelectedAracDetay(arac); setIsDetayOpen(true); }}
                              title="Detaylar"
                            >
                              <Car className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(arac)}
                              className="hover:bg-slate-100"
                            >
                              <Edit2 className="w-4 h-4 text-slate-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(arac.arac_id)}
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

      {/* Araç Detay Dialog */}
      <Dialog open={isDetayOpen} onOpenChange={setIsDetayOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl font-black">
              <Car className="w-8 h-8 text-red-500" />
              {selectedAracDetay?.plaka} - Araç Kartı
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Card className="bg-slate-50 border-slate-200">
              <CardContent className="p-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-l-2 border-red-500 pl-3">Künye Bilgileri</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Marka / Model</p>
                    <p className="font-bold text-slate-900">{selectedAracDetay?.marka} {selectedAracDetay?.model}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Model Yılı</p>
                    <p className="font-bold text-slate-900">{selectedAracDetay?.yil}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Araç Tipi</p>
                    <p className="font-bold text-slate-900 capitalize">{selectedAracDetay?.arac_tipi}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Yakıt Tipi</p>
                    <p className="font-bold text-slate-900 capitalize">{selectedAracDetay?.yakit_tipi}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800 text-white">
              <CardContent className="p-6 space-y-6">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-l-2 border-red-500 pl-3">Kilometre Gelişimi</h4>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="text-center bg-white/5 rounded-lg p-3 flex-1 mr-2">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Satın Alma KM</p>
                      <p className="text-xl font-black text-white">{selectedAracDetay?.alis_km?.toLocaleString()}</p>
                    </div>
                    <div className="text-center bg-red-500 rounded-lg p-3 flex-1 ml-2">
                      <p className="text-[9px] font-bold text-white/70 uppercase">Güncel KM</p>
                      <p className="text-xl font-black text-white">{selectedAracDetay?.mevcut_km?.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>KULLANIM ORANI</span>
                      <span className="text-red-400">{(( (selectedAracDetay?.mevcut_km || 0) - (selectedAracDetay?.alis_km || 0) ) / (selectedAracDetay?.mevcut_km || 1) * 100).toFixed(1)}%</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/5">
                      <div 
                        className="h-full bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)] transition-all duration-1000" 
                        style={{ width: `${Math.min(100, Math.max(5, (( (selectedAracDetay?.mevcut_km || 0) - (selectedAracDetay?.alis_km || 0) ) / (selectedAracDetay?.mevcut_km || 1) * 100)))}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 text-center font-medium">Toplam <span className="text-white font-bold">{( (selectedAracDetay?.mevcut_km || 0) - (selectedAracDetay?.alis_km || 0) ).toLocaleString()} KM</span> yol kat edildi.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white border-slate-200 overflow-hidden">
               <div className="bg-slate-900 px-6 py-3 flex justify-between items-center text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                  <span>Teknik Operasyon Paketi</span>
                  <div className="flex gap-4">
                     <span className="text-emerald-500">Sistem Aktif</span>
                     <span className="text-blue-500">Belgeler Onaylı</span>
                  </div>
               </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                   {/* Maintenance HUD */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Wrench className="w-4 h-4 text-orange-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Bakım Tahmini</h4>
                      </div>
                      <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 text-center">
                         <p className="text-[9px] font-black text-orange-600 uppercase mb-1">Sonraki Periyodik Bakım</p>
                         <p className="text-2xl font-black text-orange-950">
                            {Math.ceil((selectedAracDetay?.mevcut_km || 0) / 10000) * 10000} <span className="text-xs text-orange-800">KM</span>
                         </p>
                         <div className="mt-3 h-1.5 w-full bg-orange-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-orange-500" 
                              style={{ width: `${((selectedAracDetay?.mevcut_km || 0) % 10000) / 100}%` }}
                            />
                         </div>
                         <p className="text-[10px] font-bold text-orange-700/70 mt-2">
                            Kritik Seviyeye {(10000 - ((selectedAracDetay?.mevcut_km || 0) % 10000)).toLocaleString()} KM Kaldı
                         </p>
                      </div>
                   </div>

                   {/* Documents HUD */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldCheck className="w-4 h-4 text-blue-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Resmi Belgeler</h4>
                      </div>
                      <div className="space-y-3">
                         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                               <FileText className="w-3.5 h-3.5 text-slate-400" />
                               <span className="text-[10px] font-bold text-slate-600">TÜVTÜRK Muayene</span>
                            </div>
                            <Badge className="bg-emerald-500 text-[9px]">142 GÜN</Badge>
                         </div>
                         <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center gap-2">
                               <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                               <span className="text-[10px] font-bold text-slate-600">Kasko / Sigorta</span>
                            </div>
                            <Badge className="bg-emerald-500 text-[9px]">215 GÜN</Badge>
                         </div>
                      </div>
                   </div>

                   {/* Cost/Usage Stats */}
                   <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-4 h-4 text-red-500" />
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest">Kullanım Verimliliği</h4>
                      </div>
                      <div className="space-y-4">
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-slate-400">AMORTİSMAN</span>
                            <span className="text-sm font-black text-slate-900">%24.5</span>
                         </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-slate-400">GÜNLÜK ORT. KM</span>
                            <span className="text-sm font-black text-slate-900">142.8 KM</span>
                         </div>
                         <div className="flex justify-between items-baseline">
                            <span className="text-[10px] font-bold text-slate-400">VARLIK DEĞERİ</span>
                            <span className="text-sm font-black text-emerald-600">{(selectedAracDetay?.alis_fiyat || 0).toLocaleString()} ₺</span>
                         </div>
                      </div>
                   </div>
                </div>
              </CardContent>

              {/* Bottom footer for dialog cards */}
              <div className="bg-slate-50 p-6 flex items-center justify-between border-t border-slate-100">
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-400" />
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Satın Alma</p>
                          <p className="text-xs font-bold text-slate-800">{selectedAracDetay?.alis_tarihi ? new Date(selectedAracDetay.alis_tarihi).toLocaleDateString() : '-'}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <History className="w-4 h-4 text-slate-400" />
                       <div>
                          <p className="text-[8px] font-black text-slate-500 uppercase">Sisteme Giriş</p>
                          <p className="text-xs font-bold text-slate-800">{selectedAracDetay?.olusturulma_tarihi ? new Date(selectedAracDetay.olusturulma_tarihi).toLocaleDateString() : '-'}</p>
                       </div>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sistem Senkronize</span>
                 </div>
              </div>
            </Card>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button className="bg-slate-900 text-white hover:bg-black font-bold uppercase tracking-widest text-xs px-10 h-12">Kapat</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

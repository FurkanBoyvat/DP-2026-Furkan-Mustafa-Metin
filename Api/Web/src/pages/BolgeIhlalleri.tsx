import React, { useState, useEffect } from 'react';
import { bolgeIhlalAPI, aracAPI, kisitliAlanAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Edit2, Trash2, Search, AlertTriangle, AlertCircle, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface BolgeIhlali {
  ihlal_id: number;
  arac_id: number;
  alan_id: number;
  ihlal_tipi: string;
  giris_tarihi: string;
  cikis_tarihi?: string;
  kalis_suresi_dakika?: number;
  max_hiz?: number;
  surucu_adi?: string;
  onay_durum: boolean;
  notlar?: string;
  kayit_tarihi: string;
}

interface Arac {
  arac_id: number;
  plaka: string;
  marka: string;
  model: string;
}

interface Alan {
  alan_id: number;
  alan_adi: string;
  alan_tipi: string;
}

const ihlalTipiOptions = [
  { value: 'bölgeye_giriş', label: 'Bölgeye Giriş', color: 'bg-red-500' },
  { value: 'hız_aşımı', label: 'Hız Aşımı', color: 'bg-orange-500' },
  { value: 'kalış', label: 'Yasaklı Alanda Kalış', color: 'bg-purple-500' },
];

export default function BolgeIhlalleriPage() {
  const [ihlaller, setIhlaller] = useState<BolgeIhlali[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [alanlar, setAlanlar] = useState<Alan[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipFilter, setTipFilter] = useState<string>('all');
  const [cozulmemisFilter, setCozulmemisFilter] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIhlal, setEditingIhlal] = useState<BolgeIhlali | null>(null);
  
  const [formData, setFormData] = useState({
    arac_id: '',
    alan_id: '',
    ihlal_tipi: '',
    giris_tarihi: new Date().toISOString().slice(0, 16),
    cikis_tarihi: '',
    max_hiz: '',
    surucu_adi: '',
    notlar: '',
    onay_durum: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [ihlalRes, aracRes, alanRes] = await Promise.all([
        bolgeIhlalAPI.getAll(),
        aracAPI.getAll(),
        kisitliAlanAPI.getAll(),
      ]);
      setIhlaller(ihlalRes.bolge_ihlalleri || []);
      setAraclar(aracRes.araclar || []);
      setAlanlar(alanRes.kisitli_alanlar || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data: any = {
        arac_id: parseInt(formData.arac_id),
        alan_id: parseInt(formData.alan_id),
        ihlal_tipi: formData.ihlal_tipi,
        giris_tarihi: formData.giris_tarihi,
        surucu_adi: formData.surucu_adi,
        notlar: formData.notlar,
        onay_durum: formData.onay_durum,
      };

      if (formData.cikis_tarihi) {
        data.cikis_tarihi = formData.cikis_tarihi;
      }
      if (formData.max_hiz) {
        data.max_hiz = parseFloat(formData.max_hiz);
      }

      if (editingIhlal) {
        await bolgeIhlalAPI.update(editingIhlal.ihlal_id, data);
        toast.success('İhlal kaydı güncellendi');
      } else {
        await bolgeIhlalAPI.create(data);
        toast.success('İhlal kaydı oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (ihlal_id: number) => {
    if (!confirm('Bu ihlal kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await bolgeIhlalAPI.delete(ihlal_id);
      toast.success('İhlal kaydı silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (ihlal: BolgeIhlali) => {
    setEditingIhlal(ihlal);
    setFormData({
      arac_id: String(ihlal.arac_id),
      alan_id: String(ihlal.alan_id),
      ihlal_tipi: ihlal.ihlal_tipi,
      giris_tarihi: ihlal.giris_tarihi?.slice(0, 16) || '',
      cikis_tarihi: ihlal.cikis_tarihi?.slice(0, 16) || '',
      max_hiz: ihlal.max_hiz ? String(ihlal.max_hiz) : '',
      surucu_adi: ihlal.surucu_adi || '',
      notlar: ihlal.notlar || '',
      onay_durum: ihlal.onay_durum,
    });
    setIsDialogOpen(true);
  };

  const handleOnayToggle = async (ihlal: BolgeIhlali) => {
    try {
      await bolgeIhlalAPI.update(ihlal.ihlal_id, { onay_durum: !ihlal.onay_durum });
      toast.success('Onay durumu güncellendi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Onay durumu güncellenemedi');
    }
  };

  const resetForm = () => {
    setEditingIhlal(null);
    setFormData({
      arac_id: '',
      alan_id: '',
      ihlal_tipi: '',
      giris_tarihi: new Date().toISOString().slice(0, 16),
      cikis_tarihi: '',
      max_hiz: '',
      surucu_adi: '',
      notlar: '',
      onay_durum: false,
    });
  };

  const getIhlalTipiInfo = (tipi: string) => {
    return ihlalTipiOptions.find(o => o.value === tipi) || ihlalTipiOptions[0];
  };

  const getAracInfo = (arac_id: number) => {
    const arac = araclar.find(a => a.arac_id === arac_id);
    return arac ? `${arac.plaka} - ${arac.marka} ${arac.model}` : 'Bilinmiyor';
  };

  const getAlanAdi = (alan_id: number) => {
    const alan = alanlar.find(a => a.alan_id === alan_id);
    return alan?.alan_adi || 'Bilinmiyor';
  };

  const getStats = () => {
    const total = ihlaller.length;
    const cozulmemis = ihlaller.filter(i => !i.onay_durum).length;
    const hizAsimi = ihlaller.filter(i => i.ihlal_tipi === 'hız_aşımı').length;
    const bolgeGiris = ihlaller.filter(i => i.ihlal_tipi === 'bölgeye_giriş').length;
    return { total, cozulmemis, hizAsimi, bolgeGiris };
  };

  const filteredIhlaller = ihlaller.filter(ihlal => {
    const matchesSearch = getAracInfo(ihlal.arac_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getAlanAdi(ihlal.alan_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (ihlal.surucu_adi?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTip = tipFilter === 'all' || ihlal.ihlal_tipi === tipFilter;
    const matchesCozulmemis = !cozulmemisFilter || !ihlal.onay_durum;
    return matchesSearch && matchesTip && matchesCozulmemis;
  });

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            Bölge İhlalleri
          </h1>
          <p className="text-slate-500 mt-1">Coğrafi kısıtlama ihlallerini takip edin ve yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni İhlal Kaydı
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingIhlal ? 'İhlal Kaydı Düzenle' : 'Yeni İhlal Kaydı'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="arac_id">Araç *</Label>
                  <Select
                    value={formData.arac_id}
                    onValueChange={(value) => setFormData({ ...formData, arac_id: value })}
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="alan_id">Kısıtlı Alan *</Label>
                  <Select
                    value={formData.alan_id}
                    onValueChange={(value) => setFormData({ ...formData, alan_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alan seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {alanlar.map((alan) => (
                        <SelectItem key={alan.alan_id} value={String(alan.alan_id)}>
                          {alan.alan_adi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="ihlal_tipi">İhlal Tipi *</Label>
                  <Select
                    value={formData.ihlal_tipi}
                    onValueChange={(value) => setFormData({ ...formData, ihlal_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="İhlal tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {ihlalTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="giris_tarihi">Giriş Tarihi *</Label>
                  <Input
                    id="giris_tarihi"
                    type="datetime-local"
                    value={formData.giris_tarihi}
                    onChange={(e) => setFormData({ ...formData, giris_tarihi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cikis_tarihi">Çıkış Tarihi</Label>
                  <Input
                    id="cikis_tarihi"
                    type="datetime-local"
                    value={formData.cikis_tarihi}
                    onChange={(e) => setFormData({ ...formData, cikis_tarihi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_hiz">Max Hız (km/s)</Label>
                  <Input
                    id="max_hiz"
                    type="number"
                    step="0.1"
                    value={formData.max_hiz}
                    onChange={(e) => setFormData({ ...formData, max_hiz: e.target.value })}
                    placeholder="Örn: 120"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surucu_adi">Sürücü Adı</Label>
                  <Input
                    id="surucu_adi"
                    value={formData.surucu_adi}
                    onChange={(e) => setFormData({ ...formData, surucu_adi: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notlar">Notlar</Label>
                  <Textarea
                    id="notlar"
                    value={formData.notlar}
                    onChange={(e) => setFormData({ ...formData, notlar: e.target.value })}
                    placeholder="İhlal detayları..."
                    rows={2}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingIhlal ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 font-medium">Toplam İhlal</p>
            <p className="text-2xl font-bold text-red-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className={stats.cozulmemis > 0 ? 'bg-orange-50' : 'bg-gray-50'}>
          <CardContent className="p-4">
            <p className={`text-sm font-medium ${stats.cozulmemis > 0 ? 'text-orange-600' : 'text-gray-600'}`}>Çözülmemiş</p>
            <p className={`text-2xl font-bold ${stats.cozulmemis > 0 ? 'text-orange-800' : 'text-gray-800'}`}>{stats.cozulmemis}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 font-medium">Hız Aşımı</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.hizAsimi}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 font-medium">Bölge Girişi</p>
            <p className="text-2xl font-bold text-purple-800">{stats.bolgeGiris}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>İhlal Kayıtları</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="cozulmemis"
                  checked={cozulmemisFilter}
                  onChange={(e) => setCozulmemisFilter(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="cozulmemis" className="text-sm cursor-pointer">Sadece çözülmemiş</Label>
              </div>
              <Select value={tipFilter} onValueChange={setTipFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tip filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {ihlalTipiOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                    <TableHead>Araç</TableHead>
                    <TableHead>Alan</TableHead>
                    <TableHead>İhlal Tipi</TableHead>
                    <TableHead>Giriş</TableHead>
                    <TableHead>Çıkış</TableHead>
                    <TableHead>Max Hız</TableHead>
                    <TableHead>Onay</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIhlaller.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>İhlal kaydı bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredIhlaller.map((ihlal) => {
                      const tipInfo = getIhlalTipiInfo(ihlal.ihlal_tipi);
                      return (
                        <TableRow key={ihlal.ihlal_id} className={!ihlal.onay_durum ? 'bg-red-50/50' : ''}>
                          <TableCell className="font-medium">{getAracInfo(ihlal.arac_id)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-gray-400" />
                              {getAlanAdi(ihlal.alan_id)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={tipInfo.color}>
                              {tipInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {new Date(ihlal.giris_tarihi).toLocaleString('tr-TR')}
                            </div>
                          </TableCell>
                          <TableCell>
                            {ihlal.cikis_tarihi 
                              ? new Date(ihlal.cikis_tarihi).toLocaleString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell>{ihlal.max_hiz ? `${ihlal.max_hiz} km/s` : '-'}</TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleOnayToggle(ihlal)}
                              className="flex items-center gap-1"
                            >
                              {ihlal.onay_durum ? (
                                <>
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-xs text-green-600">Onaylı</span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="w-5 h-5 text-red-500" />
                                  <span className="text-xs text-red-600">Bekliyor</span>
                                </>
                              )}
                            </button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(ihlal)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(ihlal.ihlal_id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

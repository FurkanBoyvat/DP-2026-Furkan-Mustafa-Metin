import React, { useState, useEffect } from 'react';
import { kisitliAlanAPI, sirketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Switch } from '../components/ui/switch';
import { Plus, Edit2, Trash2, Search, MapPin, AlertCircle, AlertTriangle, Gauge, Ban } from 'lucide-react';
import { toast } from 'sonner';

interface KisitliAlan {
  alan_id: number;
  sirket_id: number;
  alan_adi: string;
  alan_tipi: string;
  aciklama?: string;
  merkez_enlem?: number;
  merkez_boylam?: number;
  yaricap_metre?: number;
  max_hiz_kmh?: number;
  durum: boolean;
  olusturulma_tarihi: string;
  geometri_tipi?: string;
  koordinatlar?: any;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

const alanTipiOptions = [
  { value: 'yasaklı_alan', label: 'Yasaklı Alan', color: 'bg-red-500', icon: Ban },
  { value: 'düşük_hız_bölgesi', label: 'Düşük Hız Bölgesi', color: 'bg-yellow-500', icon: Gauge },
  { value: 'yüksek_hız_bölgesi', label: 'Yüksek Hız Bölgesi', color: 'bg-blue-500', icon: Gauge },
  { value: 'tehlikeli_bölge', label: 'Tehlikeli Bölge', color: 'bg-orange-500', icon: AlertTriangle },
];

export default function KisitliAlanlarPage() {
  const [alanlar, setAlanlar] = useState<KisitliAlan[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipFilter, setTipFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAlan, setEditingAlan] = useState<KisitliAlan | null>(null);
  
  const [formData, setFormData] = useState({
    sirket_id: '',
    alan_adi: '',
    alan_tipi: '',
    aciklama: '',
    merkez_enlem: '',
    merkez_boylam: '',
    yaricap_metre: '100',
    max_hiz_kmh: '',
    durum: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [alanRes, sirketRes] = await Promise.all([
        kisitliAlanAPI.getAll(),
        sirketAPI.getAll(),
      ]);
      setAlanlar(alanRes.kisitli_alanlar || []);
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
        sirket_id: parseInt(formData.sirket_id),
        merkez_enlem: parseFloat(formData.merkez_enlem),
        merkez_boylam: parseFloat(formData.merkez_boylam),
        yaricap_metre: parseFloat(formData.yaricap_metre),
        max_hiz_kmh: formData.max_hiz_kmh ? parseFloat(formData.max_hiz_kmh) : undefined,
      };

      if (editingAlan) {
        await kisitliAlanAPI.update(editingAlan.alan_id, data);
        toast.success('Kısıtlı alan güncellendi');
      } else {
        await kisitliAlanAPI.create(data);
        toast.success('Kısıtlı alan oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (alan_id: number) => {
    if (!confirm('Bu kısıtlı alanı silmek istediğinize emin misiniz?')) return;
    try {
      await kisitliAlanAPI.delete(alan_id);
      toast.success('Kısıtlı alan silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (alan: KisitliAlan) => {
    setEditingAlan(alan);
    setFormData({
      sirket_id: String(alan.sirket_id),
      alan_adi: alan.alan_adi,
      alan_tipi: alan.alan_tipi,
      aciklama: alan.aciklama || '',
      merkez_enlem: String(alan.merkez_enlem),
      merkez_boylam: String(alan.merkez_boylam),
      yaricap_metre: String(alan.yaricap_metre),
      max_hiz_kmh: alan.max_hiz_kmh ? String(alan.max_hiz_kmh) : '',
      durum: alan.durum,
    });
    setIsDialogOpen(true);
  };

  const handleDurumToggle = async (alan: KisitliAlan) => {
    try {
      await kisitliAlanAPI.update(alan.alan_id, { durum: !alan.durum });
      toast.success('Durum güncellendi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setEditingAlan(null);
    setFormData({
      sirket_id: '',
      alan_adi: '',
      alan_tipi: '',
      aciklama: '',
      merkez_enlem: '',
      merkez_boylam: '',
      yaricap_metre: '100',
      max_hiz_kmh: '',
      durum: true,
    });
  };

  const getAlanTipiInfo = (tipi: string) => {
    return alanTipiOptions.find(o => o.value === tipi) || alanTipiOptions[0];
  };

  const getSirketAdi = (sirket_id: number) => {
    const sirket = sirketler.find(s => s.sirket_id === sirket_id);
    return sirket?.sirket_adi || 'Bilinmiyor';
  };

  const getStats = () => {
    const total = alanlar.length;
    const aktif = alanlar.filter(a => a.durum).length;
    const yasakli = alanlar.filter(a => a.alan_tipi === 'yasaklı_alan').length;
    const hizLimitli = alanlar.filter(a => a.alan_tipi === 'düşük_hız_bölgesi' || a.alan_tipi === 'yüksek_hız_bölgesi').length;
    return { total, aktif, yasakli, hizLimitli };
  };

  const filteredAlanlar = alanlar.filter(alan => {
    const matchesSearch = alan.alan_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getSirketAdi(alan.sirket_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (alan.aciklama?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesTip = tipFilter === 'all' || alan.alan_tipi === tipFilter;
    return matchesSearch && matchesTip;
  });

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-red-500" />
            Kısıtlı Alanlar
          </h1>
          <p className="text-slate-500 mt-1">Coğrafi kısıtlama alanlarını yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Alan Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAlan ? 'Alan Düzenle' : 'Yeni Kısıtlı Alan Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="alan_adi">Alan Adı *</Label>
                  <Input
                    id="alan_adi"
                    value={formData.alan_adi}
                    onChange={(e) => setFormData({ ...formData, alan_adi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="alan_tipi">Alan Tipi *</Label>
                  <Select
                    value={formData.alan_tipi}
                    onValueChange={(value) => setFormData({ ...formData, alan_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Alan tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {alanTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="w-4 h-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merkez_enlem">Merkez Enlem *</Label>
                  <Input
                    id="merkez_enlem"
                    type="number"
                    step="0.000001"
                    value={formData.merkez_enlem}
                    onChange={(e) => setFormData({ ...formData, merkez_enlem: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="merkez_boylam">Merkez Boylam *</Label>
                  <Input
                    id="merkez_boylam"
                    type="number"
                    step="0.000001"
                    value={formData.merkez_boylam}
                    onChange={(e) => setFormData({ ...formData, merkez_boylam: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yaricap_metre">Yarıçap (metre) *</Label>
                  <Input
                    id="yaricap_metre"
                    type="number"
                    value={formData.yaricap_metre}
                    onChange={(e) => setFormData({ ...formData, yaricap_metre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_hiz_kmh">Max Hız (km/s)</Label>
                  <Input
                    id="max_hiz_kmh"
                    type="number"
                    value={formData.max_hiz_kmh}
                    onChange={(e) => setFormData({ ...formData, max_hiz_kmh: e.target.value })}
                    placeholder="Hız limiti varsa"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Input
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    placeholder="Alan açıklaması..."
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Switch
                    checked={formData.durum}
                    onCheckedChange={(checked) => setFormData({ ...formData, durum: checked })}
                  />
                  <Label>Aktif</Label>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingAlan ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 font-medium">Toplam Alan</p>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 font-medium">Aktif</p>
            <p className="text-2xl font-bold text-green-800">{stats.aktif}</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm text-red-600 font-medium">Yasaklı Alan</p>
            <p className="text-2xl font-bold text-red-800">{stats.yasakli}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 font-medium">Hız Limitli</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.hizLimitli}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Kısıtlı Alan Listesi</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={tipFilter} onValueChange={setTipFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tip filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {alanTipiOptions.map((option) => (
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
                    <TableHead>Alan Adı</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Koordinatlar</TableHead>
                    <TableHead>Yarıçap</TableHead>
                    <TableHead>Max Hız</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlanlar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Kısıtlı alan bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAlanlar.map((alan) => {
                      const tipInfo = getAlanTipiInfo(alan.alan_tipi);
                      const TipIcon = tipInfo.icon;
                      return (
                        <TableRow key={alan.alan_id}>
                          <TableCell className="font-medium">{alan.alan_adi}</TableCell>
                          <TableCell>
                            <Badge className={`${tipInfo.color} flex items-center gap-1`}>
                              <TipIcon className="w-3 h-3" />
                              {tipInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>{getSirketAdi(alan.sirket_id)}</TableCell>
                          <TableCell>
                            <div className="text-xs font-mono">
                              {alan.geometri_tipi === 'cokgen' || alan.geometri_tipi === 'dikdortgen' 
                                ? 'Özel Çizim' 
                                : `${alan.merkez_enlem?.toFixed(6)}, ${alan.merkez_boylam?.toFixed(6)}`}
                            </div>
                          </TableCell>
                          <TableCell>{alan.geometri_tipi === 'cokgen' || alan.geometri_tipi === 'dikdortgen' ? '-' : `${alan.yaricap_metre} m`}</TableCell>
                          <TableCell>{alan.max_hiz_kmh ? `${alan.max_hiz_kmh} km/s` : '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={alan.durum}
                                onCheckedChange={() => handleDurumToggle(alan)}
                              />
                              <Badge className={alan.durum ? 'bg-green-500' : 'bg-gray-500'}>
                                {alan.durum ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(alan)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(alan.alan_id)}
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

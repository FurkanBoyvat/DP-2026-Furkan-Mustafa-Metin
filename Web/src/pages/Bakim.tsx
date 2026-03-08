import React, { useState, useEffect } from 'react';
import { bakimAPI, aracAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Plus, Edit2, Trash2, Search, Wrench, AlertCircle, CheckCircle, Clock, XCircle, Loader } from 'lucide-react';
import { toast } from 'sonner';

interface BakimTalebi {
  talek_id: number;
  arac_id: number;
  bakim_tipi: string;
  talek_tarihi: string;
  durum: string;
  tahmini_bitis_tarihi?: string;
  gercek_bitis_tarihi?: string;
  tahmini_maliyet?: number;
  gercek_maliyet?: number;
  aciklama?: string;
}

interface Arac {
  arac_id: number;
  plaka: string;
  marka: string;
  model: string;
}

const bakimTipiOptions = [
  { value: 'rutin_bakim', label: 'Rutin Bakım', color: 'bg-blue-500' },
  { value: 'acil_bakim', label: 'Acil Bakım', color: 'bg-red-500' },
  { value: 'ozel_bakim', label: 'Özel Bakım', color: 'bg-purple-500' },
  { value: 'ayakkabi', label: 'Ayakkabı (Fren)', color: 'bg-yellow-500' },
  { value: 'yag_degisim', label: 'Yağ Değişimi', color: 'bg-green-500' },
];

const durumOptions = [
  { value: 'bekleniyor', label: 'Bekleniyor', color: 'bg-yellow-500', icon: Clock },
  { value: 'devam_ediyor', label: 'Devam Ediyor', color: 'bg-blue-500', icon: Loader },
  { value: 'tamamlandi', label: 'Tamamlandı', color: 'bg-green-500', icon: CheckCircle },
  { value: 'iptal', label: 'İptal', color: 'bg-gray-500', icon: XCircle },
];

export default function BakimPage() {
  const [bakimTalepleri, setBakimTalepleri] = useState<BakimTalebi[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [durumFilter, setDurumFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTalep, setEditingTalep] = useState<BakimTalebi | null>(null);
  
  const [formData, setFormData] = useState({
    arac_id: '',
    bakim_tipi: '',
    tahmini_bitis_tarihi: '',
    tahmini_maliyet: '',
    aciklama: '',
    durum: 'bekleniyor',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bakimRes, aracRes] = await Promise.all([
        bakimAPI.getAll(),
        aracAPI.getAll(),
      ]);
      setBakimTalepleri(bakimRes.bakim_talepleri || []);
      setAraclar(aracRes.araclar || []);
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
        bakim_tipi: formData.bakim_tipi,
        aciklama: formData.aciklama,
        durum: formData.durum,
      };

      if (formData.tahmini_bitis_tarihi) {
        data.tahmini_bitis_tarihi = formData.tahmini_bitis_tarihi;
      }
      if (formData.tahmini_maliyet) {
        data.tahmini_maliyet = parseFloat(formData.tahmini_maliyet);
      }

      if (editingTalep) {
        await bakimAPI.update(editingTalep.talek_id, data);
        toast.success('Bakım talebi güncellendi');
      } else {
        await bakimAPI.create(data);
        toast.success('Bakım talebi oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (talek_id: number) => {
    if (!confirm('Bu bakım talebini silmek istediğinize emin misiniz?')) return;
    try {
      await bakimAPI.delete(talek_id);
      toast.success('Bakım talebi silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (talep: BakimTalebi) => {
    setEditingTalep(talep);
    setFormData({
      arac_id: String(talep.arac_id),
      bakim_tipi: talep.bakim_tipi,
      tahmini_bitis_tarihi: talep.tahmini_bitis_tarihi || '',
      tahmini_maliyet: talep.tahmini_maliyet ? String(talep.tahmini_maliyet) : '',
      aciklama: talep.aciklama || '',
      durum: talep.durum,
    });
    setIsDialogOpen(true);
  };

  const handleDurumChange = async (talek_id: number, yeniDurum: string) => {
    try {
      await bakimAPI.update(talek_id, { durum: yeniDurum });
      toast.success('Durum güncellendi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setEditingTalep(null);
    setFormData({
      arac_id: '',
      bakim_tipi: '',
      tahmini_bitis_tarihi: '',
      tahmini_maliyet: '',
      aciklama: '',
      durum: 'bekleniyor',
    });
  };

  const getAracInfo = (arac_id: number) => {
    const arac = araclar.find(a => a.arac_id === arac_id);
    return arac ? `${arac.plaka} - ${arac.marka} ${arac.model}` : 'Bilinmiyor';
  };

  const getBakimTipiLabel = (tipi: string) => {
    const option = bakimTipiOptions.find(o => o.value === tipi);
    return option || { label: tipi, color: 'bg-gray-500' };
  };

  const getDurumInfo = (durum: string) => {
    return durumOptions.find(o => o.value === durum) || durumOptions[0];
  };

  const getStats = () => {
    const total = bakimTalepleri.length;
    const bekleniyor = bakimTalepleri.filter(t => t.durum === 'bekleniyor').length;
    const devamEdiyor = bakimTalepleri.filter(t => t.durum === 'devam_ediyor').length;
    const tamamlandi = bakimTalepleri.filter(t => t.durum === 'tamamlandi').length;
    const acil = bakimTalepleri.filter(t => t.bakim_tipi === 'acil_bakim' && t.durum !== 'tamamlandi').length;
    return { total, bekleniyor, devamEdiyor, tamamlandi, acil };
  };

  const filteredTalepler = bakimTalepleri.filter(talep => {
    const matchesSearch = getAracInfo(talep.arac_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
                          talep.aciklama?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDurum = durumFilter === 'all' || talep.durum === durumFilter;
    return matchesSearch && matchesDurum;
  });

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Wrench className="w-8 h-8 text-red-500" />
            Bakım Talepleri
          </h1>
          <p className="text-slate-500 mt-1">Araç bakım taleplerini ve durumlarını yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Bakım Talebi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingTalep ? 'Bakım Talebi Düzenle' : 'Yeni Bakım Talebi'}</DialogTitle>
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
                <div className="space-y-2">
                  <Label htmlFor="bakim_tipi">Bakım Tipi *</Label>
                  <Select
                    value={formData.bakim_tipi}
                    onValueChange={(value) => setFormData({ ...formData, bakim_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Bakım tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {bakimTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durum">Durum</Label>
                  <Select
                    value={formData.durum}
                    onValueChange={(value) => setFormData({ ...formData, durum: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Durum seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {durumOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahmini_bitis_tarihi">Tahmini Bitiş Tarihi</Label>
                  <Input
                    id="tahmini_bitis_tarihi"
                    type="date"
                    value={formData.tahmini_bitis_tarihi}
                    onChange={(e) => setFormData({ ...formData, tahmini_bitis_tarihi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tahmini_maliyet">Tahmini Maliyet (TL)</Label>
                  <Input
                    id="tahmini_maliyet"
                    type="number"
                    step="0.01"
                    value={formData.tahmini_maliyet}
                    onChange={(e) => setFormData({ ...formData, tahmini_maliyet: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Textarea
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    placeholder="Bakım detayları..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingTalep ? 'Güncelle' : 'Kaydet'}
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
            <p className="text-sm text-blue-600 font-medium">Toplam Talep</p>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50">
          <CardContent className="p-4">
            <p className="text-sm text-yellow-600 font-medium">Bekleyen</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.bekleniyor}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 font-medium">Tamamlanan</p>
            <p className="text-2xl font-bold text-green-800">{stats.tamamlandi}</p>
          </CardContent>
        </Card>
        <Card className={stats.acil > 0 ? 'bg-red-50' : 'bg-gray-50'}>
          <CardContent className="p-4">
            <p className={`text-sm font-medium ${stats.acil > 0 ? 'text-red-600' : 'text-gray-600'}`}>Acil Bakım</p>
            <p className={`text-2xl font-bold ${stats.acil > 0 ? 'text-red-800' : 'text-gray-800'}`}>{stats.acil}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Bakım Talep Listesi</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={durumFilter} onValueChange={setDurumFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Durum filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {durumOptions.map((option) => (
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
                    <TableHead>Bakım Tipi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Talep Tarihi</TableHead>
                    <TableHead>Tahmini Bitiş</TableHead>
                    <TableHead>Maliyet</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTalepler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Bakım talebi bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTalepler.map((talep) => {
                      const durumInfo = getDurumInfo(talep.durum);
                      const DurumIcon = durumInfo.icon;
                      return (
                        <TableRow key={talep.talek_id}>
                          <TableCell className="font-medium">{getAracInfo(talep.arac_id)}</TableCell>
                          <TableCell>
                            <Badge className={getBakimTipiLabel(talep.bakim_tipi).color}>
                              {getBakimTipiLabel(talep.bakim_tipi).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <DurumIcon className={`w-4 h-4 ${durumInfo.color.replace('bg-', 'text-')}`} />
                              <Select
                                value={talep.durum}
                                onValueChange={(value) => handleDurumChange(talep.talek_id, value)}
                              >
                                <SelectTrigger className="w-32 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {durumOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(talep.talek_tarihi).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell>
                            {talep.tahmini_bitis_tarihi 
                              ? new Date(talep.tahmini_bitis_tarihi).toLocaleDateString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {talep.tahmini_maliyet 
                              ? `${talep.tahmini_maliyet.toLocaleString('tr-TR')} TL`
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(talep)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(talep.talek_id)}
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

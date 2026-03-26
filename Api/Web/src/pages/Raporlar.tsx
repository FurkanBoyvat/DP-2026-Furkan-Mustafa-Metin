import React, { useState, useEffect } from 'react';
import { raporAPI, sirketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, FileText, AlertCircle, Download, Calendar, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Rapor {
  rapor_id: number;
  sirket_id: number;
  kullanici_id: number;
  rapor_tipi: string;
  rapor_adi: string;
  rapor_tarihi: string;
  baslangic_tarihi?: string;
  bitis_tarihi?: string;
  bulundu_url?: string;
  aciklama?: string;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

const raporTipiOptions = [
  { value: 'gunluk', label: 'Günlük', color: 'bg-blue-500' },
  { value: 'haftalik', label: 'Haftalık', color: 'bg-green-500' },
  { value: 'aylik', label: 'Aylık', color: 'bg-purple-500' },
  { value: 'yillik', label: 'Yıllık', color: 'bg-orange-500' },
  { value: 'ozel', label: 'Özel', color: 'bg-pink-500' },
];

export default function RaporlarPage() {
  const [raporlar, setRaporlar] = useState<Rapor[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tipFilter, setTipFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRapor, setEditingRapor] = useState<Rapor | null>(null);
  
  const [formData, setFormData] = useState({
    sirket_id: '',
    rapor_tipi: '',
    rapor_adi: '',
    baslangic_tarihi: '',
    bitis_tarihi: '',
    aciklama: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [raporRes, sirketRes] = await Promise.all([
        raporAPI.getAll(),
        sirketAPI.getAll(),
      ]);
      setRaporlar(raporRes.raporlar || []);
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
      };

      if (editingRapor) {
        await raporAPI.update(editingRapor.rapor_id, data);
        toast.success('Rapor başarıyla güncellendi');
      } else {
        await raporAPI.create(data);
        toast.success('Rapor başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (rapor_id: number) => {
    if (!confirm('Bu raporu silmek istediğinize emin misiniz?')) return;
    try {
      await raporAPI.delete(rapor_id);
      toast.success('Rapor başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (rapor: Rapor) => {
    setEditingRapor(rapor);
    setFormData({
      sirket_id: String(rapor.sirket_id),
      rapor_tipi: rapor.rapor_tipi,
      rapor_adi: rapor.rapor_adi,
      baslangic_tarihi: rapor.baslangic_tarihi || '',
      bitis_tarihi: rapor.bitis_tarihi || '',
      aciklama: rapor.aciklama || '',
    });
    setIsDialogOpen(true);
  };

  const handleDownload = (rapor: Rapor) => {
    if (rapor.bulundu_url) {
      window.open(rapor.bulundu_url, '_blank');
    } else {
      toast.error('Rapor dosyası bulunamadı');
    }
  };

  const resetForm = () => {
    setEditingRapor(null);
    setFormData({
      sirket_id: '',
      rapor_tipi: '',
      rapor_adi: '',
      baslangic_tarihi: '',
      bitis_tarihi: '',
      aciklama: '',
    });
  };

  const getRaporTipiLabel = (tipi: string) => {
    return raporTipiOptions.find(o => o.value === tipi) || { label: tipi, color: 'bg-gray-500' };
  };

  const getSirketAdi = (sirket_id: number) => {
    const sirket = sirketler.find(s => s.sirket_id === sirket_id);
    return sirket?.sirket_adi || 'Bilinmiyor';
  };

  const getStats = () => {
    const total = raporlar.length;
    const gunluk = raporlar.filter(r => r.rapor_tipi === 'gunluk').length;
    const aylik = raporlar.filter(r => r.rapor_tipi === 'aylik').length;
    const yillik = raporlar.filter(r => r.rapor_tipi === 'yillik').length;
    return { total, gunluk, aylik, yillik };
  };

  const filteredRaporlar = raporlar.filter(rapor => {
    const matchesSearch = rapor.rapor_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          getSirketAdi(rapor.sirket_id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTip = tipFilter === 'all' || rapor.rapor_tipi === tipFilter;
    return matchesSearch && matchesTip;
  });

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <FileText className="w-8 h-8 text-red-500" />
            Raporlar
          </h1>
          <p className="text-slate-500 mt-1">Raporları oluşturun, yönetin ve indirin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Rapor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRapor ? 'Rapor Düzenle' : 'Yeni Rapor Oluştur'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="rapor_adi">Rapor Adı *</Label>
                  <Input
                    id="rapor_adi"
                    value={formData.rapor_adi}
                    onChange={(e) => setFormData({ ...formData, rapor_adi: e.target.value })}
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
                  <Label htmlFor="rapor_tipi">Rapor Tipi *</Label>
                  <Select
                    value={formData.rapor_tipi}
                    onValueChange={(value) => setFormData({ ...formData, rapor_tipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Rapor tipi seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {raporTipiOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="baslangic_tarihi">Başlangıç Tarihi</Label>
                  <Input
                    id="baslangic_tarihi"
                    type="date"
                    value={formData.baslangic_tarihi}
                    onChange={(e) => setFormData({ ...formData, baslangic_tarihi: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bitis_tarihi">Bitiş Tarihi</Label>
                  <Input
                    id="bitis_tarihi"
                    type="date"
                    value={formData.bitis_tarihi}
                    onChange={(e) => setFormData({ ...formData, bitis_tarihi: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Input
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    placeholder="Rapor açıklaması..."
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingRapor ? 'Güncelle' : 'Kaydet'}
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
            <p className="text-sm text-blue-600 font-medium">Toplam Rapor</p>
            <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <p className="text-sm text-green-600 font-medium">Günlük</p>
            <p className="text-2xl font-bold text-green-800">{stats.gunluk}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 font-medium">Aylık</p>
            <p className="text-2xl font-bold text-purple-800">{stats.aylik}</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4">
            <p className="text-sm text-orange-600 font-medium">Yıllık</p>
            <p className="text-2xl font-bold text-orange-800">{stats.yillik}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Rapor Listesi</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Select value={tipFilter} onValueChange={setTipFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Tip filtresi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {raporTipiOptions.map((option) => (
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
                    <TableHead>Rapor Adı</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Tarih Aralığı</TableHead>
                    <TableHead>Oluşturulma</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRaporlar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Rapor bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRaporlar.map((rapor) => (
                      <TableRow key={rapor.rapor_id}>
                        <TableCell className="font-medium">{rapor.rapor_adi}</TableCell>
                        <TableCell>
                          <Badge className={getRaporTipiLabel(rapor.rapor_tipi).color}>
                            {getRaporTipiLabel(rapor.rapor_tipi).label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {getSirketAdi(rapor.sirket_id)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {rapor.baslangic_tarihi && rapor.bitis_tarihi ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              {new Date(rapor.baslangic_tarihi).toLocaleDateString('tr-TR')} -
                              {new Date(rapor.bitis_tarihi).toLocaleDateString('tr-TR')}
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{new Date(rapor.rapor_tarihi).toLocaleDateString('tr-TR')}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownload(rapor)}
                              title="İndir"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(rapor)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(rapor.rapor_id)}
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
    </div>
  );
}

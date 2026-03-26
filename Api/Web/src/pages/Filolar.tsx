import React, { useState, useEffect } from 'react';
import { filoAPI, sirketAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, Truck, AlertCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

interface Filo {
  filo_id: number;
  sirket_id: number;
  filo_adi: string;
  aciklama?: string;
  filo_muduru_ad?: string;
  filo_muduru_soyad?: string;
  filo_muduru_telefon?: string;
  durum: boolean;
  olusturulma_tarihi: string;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

interface FiloIstatistik {
  filo_id: number;
  toplam_arac: number;
  aktif_arac: number;
  pasif_arac: number;
  toplam_km: number;
  ortalama_yakit_tuketimi: number;
}

export default function FilolarPage() {
  const [filolar, setFilolar] = useState<Filo[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [istatistikler, setIstatistikler] = useState<Record<number, FiloIstatistik>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isIstatistikOpen, setIsIstatistikOpen] = useState(false);
  const [selectedFilo, setSelectedFilo] = useState<Filo | null>(null);
  const [editingFilo, setEditingFilo] = useState<Filo | null>(null);
  
  const [formData, setFormData] = useState({
    sirket_id: '',
    filo_adi: '',
    aciklama: '',
    filo_muduru_ad: '',
    filo_muduru_soyad: '',
    filo_muduru_telefon: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [filoRes, sirketRes] = await Promise.all([
        filoAPI.getAll(),
        sirketAPI.getAll(),
      ]);
      setFilolar(filoRes.filolar || []);
      setSirketler(sirketRes.sirketler || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const loadIstatistikler = async (filo_id: number) => {
    try {
      const res = await filoAPI.getIstatistikler(filo_id);
      setIstatistikler(prev => ({
        ...prev,
        [filo_id]: res.istatistikler
      }));
    } catch (error: any) {
      console.error('İstatistik yükleme hatası:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        sirket_id: parseInt(formData.sirket_id),
      };

      if (editingFilo) {
        await filoAPI.update(editingFilo.filo_id, data);
        toast.success('Filo başarıyla güncellendi');
      } else {
        await filoAPI.create(data);
        toast.success('Filo başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (filo_id: number) => {
    if (!confirm('Bu filoyu silmek istediğinize emin misiniz?')) return;
    try {
      await filoAPI.delete(filo_id);
      toast.success('Filo başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (filo: Filo) => {
    setEditingFilo(filo);
    setFormData({
      sirket_id: String(filo.sirket_id),
      filo_adi: filo.filo_adi,
      aciklama: filo.aciklama || '',
      filo_muduru_ad: filo.filo_muduru_ad || '',
      filo_muduru_soyad: filo.filo_muduru_soyad || '',
      filo_muduru_telefon: filo.filo_muduru_telefon || '',
    });
    setIsDialogOpen(true);
  };

  const handleShowIstatistik = (filo: Filo) => {
    setSelectedFilo(filo);
    loadIstatistikler(filo.filo_id);
    setIsIstatistikOpen(true);
  };

  const resetForm = () => {
    setEditingFilo(null);
    setFormData({
      sirket_id: '',
      filo_adi: '',
      aciklama: '',
      filo_muduru_ad: '',
      filo_muduru_soyad: '',
      filo_muduru_telefon: '',
    });
  };

  const getSirketAdi = (sirket_id: number) => {
    const sirket = sirketler.find(s => s.sirket_id === sirket_id);
    return sirket?.sirket_adi || 'Bilinmiyor';
  };

  const filteredFilolar = filolar.filter(filo =>
    filo.filo_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getSirketAdi(filo.sirket_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (filo.filo_muduru_ad?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Truck className="w-8 h-8 text-red-500" />
            Filo Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Filo bilgilerini ve istatistiklerini yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Filo Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingFilo ? 'Filo Düzenle' : 'Yeni Filo Ekle'}</DialogTitle>
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
                  <Label htmlFor="filo_adi">Filo Adı *</Label>
                  <Input
                    id="filo_adi"
                    value={formData.filo_adi}
                    onChange={(e) => setFormData({ ...formData, filo_adi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="aciklama">Açıklama</Label>
                  <Input
                    id="aciklama"
                    value={formData.aciklama}
                    onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                    placeholder="Filo açıklaması"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filo_muduru_ad">Filo Müdürü Adı</Label>
                  <Input
                    id="filo_muduru_ad"
                    value={formData.filo_muduru_ad}
                    onChange={(e) => setFormData({ ...formData, filo_muduru_ad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="filo_muduru_soyad">Filo Müdürü Soyadı</Label>
                  <Input
                    id="filo_muduru_soyad"
                    value={formData.filo_muduru_soyad}
                    onChange={(e) => setFormData({ ...formData, filo_muduru_soyad: e.target.value })}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="filo_muduru_telefon">Filo Müdürü Telefon</Label>
                  <Input
                    id="filo_muduru_telefon"
                    value={formData.filo_muduru_telefon}
                    onChange={(e) => setFormData({ ...formData, filo_muduru_telefon: e.target.value })}
                    placeholder="0555 123 4567"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingFilo ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Filo Listesi</CardTitle>
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
                    <TableHead>Filo Adı</TableHead>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead>Filo Müdürü</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilolar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Filo bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFilolar.map((filo) => (
                      <TableRow key={filo.filo_id}>
                        <TableCell className="font-medium">{filo.filo_adi}</TableCell>
                        <TableCell>{getSirketAdi(filo.sirket_id)}</TableCell>
                        <TableCell className="max-w-xs truncate">{filo.aciklama || '-'}</TableCell>
                        <TableCell>
                          {filo.filo_muduru_ad ? `${filo.filo_muduru_ad} ${filo.filo_muduru_soyad || ''}` : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={filo.durum ? 'bg-green-500' : 'bg-gray-500'}>
                            {filo.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowIstatistik(filo)}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(filo)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(filo.filo_id)}
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

      {/* İstatistik Dialog */}
      <Dialog open={isIstatistikOpen} onOpenChange={setIsIstatistikOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-red-500" />
              {selectedFilo?.filo_adi} - İstatistikler
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedFilo && istatistikler[selectedFilo.filo_id] ? (
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-blue-600 font-medium">Toplam Araç</p>
                    <p className="text-2xl font-bold text-blue-800">
                      {istatistikler[selectedFilo.filo_id].toplam_arac}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-green-600 font-medium">Aktif Araç</p>
                    <p className="text-2xl font-bold text-green-800">
                      {istatistikler[selectedFilo.filo_id].aktif_arac}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-gray-600 font-medium">Pasif Araç</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {istatistikler[selectedFilo.filo_id].pasif_arac}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-orange-50">
                  <CardContent className="p-4">
                    <p className="text-sm text-orange-600 font-medium">Toplam KM</p>
                    <p className="text-2xl font-bold text-orange-800">
                      {Math.round(istatistikler[selectedFilo.filo_id].toplam_km).toLocaleString('tr-TR')} km
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Kapat</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

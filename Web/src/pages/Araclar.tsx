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
import { Plus, Edit2, Trash2, Search, Car, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

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
  durum: boolean;
  olusturulma_tarihi: string;
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
  });

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
                    <TableHead>Yıl</TableHead>
                    <TableHead>Araç Tipi</TableHead>
                    <TableHead>Filo</TableHead>
                    <TableHead>Şirket</TableHead>
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
                        <TableCell className="font-medium">{arac.plaka}</TableCell>
                        <TableCell>{arac.marka} {arac.model}</TableCell>
                        <TableCell>{arac.yil}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {aracTipiOptions.find(o => o.value === arac.arac_tipi)?.label || arac.arac_tipi || '-'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getFiloAdi(arac.filo_id)}</TableCell>
                        <TableCell>{getSirketAdi(arac.sirket_id)}</TableCell>
                        <TableCell>
                          <Badge className={arac.durum ? 'bg-green-500' : 'bg-gray-500'}>
                            {arac.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(arac)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
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
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { soforAPI, aracAPI, aracSoforAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, UserCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Sofor {
  kullanici_id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: string;
  durum: boolean;
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
  { value: 'sürücü', label: 'Sürücü' },
  { value: 'admin', label: 'Admin' },
  { value: 'sirket_yoneticisi', label: 'Şirket Yöneticisi' },
  { value: 'muhasebe', label: 'Muhasebe' },
];

export default function SoforlerPage() {
  const [soforler, setSoforler] = useState<Sofor[]>([]);
  const [aracSoforler, setAracSoforler] = useState<AracSofor[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAtamaDialogOpen, setIsAtamaDialogOpen] = useState(false);
  const [editingSofor, setEditingSofor] = useState<Sofor | null>(null);
  const [editingAtama, setEditingAtama] = useState<AracSofor | null>(null);
  const [activeTab, setActiveTab] = useState<'soforler' | 'atamalar'>('soforler');
  
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    rol: 'sürücü',
    sifre: '',
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
      const [soforRes, aracSoforRes, aracRes] = await Promise.all([
        soforAPI.getAll(),
        aracSoforAPI.getAll(),
        aracAPI.getAll(),
      ]);
      setSoforler(soforRes.data || []);
      setAracSoforler(aracSoforRes.data || []);
      setAraclar(aracRes.araclar || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu: ' + (error.message || ''));
      console.error('Load data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSofor) {
        const { sifre, ...updateData } = formData;
        await soforAPI.update(editingSofor.kullanici_id, sifre ? formData : updateData);
        toast.success('Şoför başarıyla güncellendi');
      } else {
        await soforAPI.create(formData);
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

  const resetForm = () => {
    setEditingSofor(null);
    setFormData({
      ad: '',
      soyad: '',
      email: '',
      telefon: '',
      rol: 'sürücü',
      sifre: '',
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
    sofor.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sofor.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sofor.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAtamalar = aracSoforler.filter(atama =>
    atama.sofor_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    atama.sofor_soyadi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getAracPlaka(atama.arac_id).toLowerCase().includes(searchTerm.toLowerCase())
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
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input
                      id="telefon"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      placeholder="0555 123 4567"
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
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSoforler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                          <Badge variant="outline">
                            {rolOptions.find(o => o.value === sofor.rol)?.label || sofor.rol}
                          </Badge>
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
    </div>
  );
}

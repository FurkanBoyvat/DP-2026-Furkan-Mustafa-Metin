import React, { useState, useEffect } from 'react';
import { kullaniciAPI, sirketAPI, sirketYoneticiAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Edit2, Trash2, Search, Users, AlertCircle, Shield, UserCircle, Building2 } from 'lucide-react';
import { toast } from 'sonner';

interface Kullanici {
  kullanici_id: number;
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  rol: string;
  durum: boolean;
  olusturulma_tarihi: string;
  son_giris_tarih?: string;
}

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
}

interface SirketYonetici {
  yonetici_id: number;
  sirket_id: number;
  kullanici_id: number;
  yetki_seviyesi: number;
  olusturulma_tarihi: string;
}

const rolOptions = [
  { value: 'admin', label: 'Admin', color: 'bg-red-500', icon: Shield },
  { value: 'sirket_yoneticisi', label: 'Şirket Yöneticisi', color: 'bg-blue-500', icon: Building2 },
  { value: 'sürücü', label: 'Sürücü', color: 'bg-green-500', icon: UserCircle },
  { value: 'muhasebe', label: 'Muhasebe', color: 'bg-purple-500', icon: Users },
];

export default function KullanicilarPage() {
  const [kullanicilar, setKullanicilar] = useState<Kullanici[]>([]);
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [yoneticiler, setYoneticiler] = useState<SirketYonetici[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [rolFilter, setRolFilter] = useState<string>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAtamaDialogOpen, setIsAtamaDialogOpen] = useState(false);
  const [editingKullanici, setEditingKullanici] = useState<Kullanici | null>(null);
  const [activeTab, setActiveTab] = useState<'kullanicilar' | 'yoneticiler'>('kullanicilar');
  
  const [formData, setFormData] = useState({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    rol: 'sürücü',
    sifre: '',
  });

  const [atamaFormData, setAtamaFormData] = useState({
    sirket_id: '',
    kullanici_id: '',
    yetki_seviyesi: '1',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [kullaniciRes, sirketRes, yoneticiRes] = await Promise.all([
        kullaniciAPI.getAll(),
        sirketAPI.getAll(),
        sirketYoneticiAPI.getAll(),
      ]);
      setKullanicilar(kullaniciRes.data || []);
      setSirketler(sirketRes.sirketler || []);
      setYoneticiler(yoneticiRes.data || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingKullanici) {
        const { sifre, ...updateData } = formData;
        await kullaniciAPI.update(editingKullanici.kullanici_id, sifre ? formData : updateData);
        toast.success('Kullanıcı başarıyla güncellendi');
      } else {
        await kullaniciAPI.create(formData);
        toast.success('Kullanıcı başarıyla oluşturuldu');
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
        sirket_id: parseInt(atamaFormData.sirket_id),
        kullanici_id: parseInt(atamaFormData.kullanici_id),
        yetki_seviyesi: parseInt(atamaFormData.yetki_seviyesi),
      };

      await sirketYoneticiAPI.create(data);
      toast.success('Yönetici ataması başarıyla oluşturuldu');
      setIsAtamaDialogOpen(false);
      resetAtamaForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (kullanici_id: number) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    try {
      await kullaniciAPI.delete(kullanici_id);
      toast.success('Kullanıcı başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleAtamaDelete = async (yonetici_id: number) => {
    if (!confirm('Bu yönetici atamasını silmek istediğinize emin misiniz?')) return;
    try {
      await sirketYoneticiAPI.delete(yonetici_id);
      toast.success('Yönetici ataması silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (kullanici: Kullanici) => {
    setEditingKullanici(kullanici);
    setFormData({
      ad: kullanici.ad,
      soyad: kullanici.soyad,
      email: kullanici.email,
      telefon: kullanici.telefon,
      rol: kullanici.rol,
      sifre: '',
    });
    setIsDialogOpen(true);
  };

  const handleDurumToggle = async (kullanici: Kullanici) => {
    try {
      await kullaniciAPI.update(kullanici.kullanici_id, { durum: !kullanici.durum });
      toast.success('Durum güncellendi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Durum güncellenemedi');
    }
  };

  const resetForm = () => {
    setEditingKullanici(null);
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
    setAtamaFormData({
      sirket_id: '',
      kullanici_id: '',
      yetki_seviyesi: '1',
    });
  };

  const getRolInfo = (rol: string) => {
    return rolOptions.find(o => o.value === rol) || rolOptions[2];
  };

  const getSirketAdi = (sirket_id: number) => {
    const sirket = sirketler.find(s => s.sirket_id === sirket_id);
    return sirket?.sirket_adi || 'Bilinmiyor';
  };

  const getKullaniciAdi = (kullanici_id: number) => {
    const kullanici = kullanicilar.find(k => k.kullanici_id === kullanici_id);
    return kullanici ? `${kullanici.ad} ${kullanici.soyad}` : 'Bilinmiyor';
  };

  const getStats = () => {
    const total = kullanicilar.length;
    const aktif = kullanicilar.filter(k => k.durum).length;
    const admin = kullanicilar.filter(k => k.rol === 'admin').length;
    const sofor = kullanicilar.filter(k => k.rol === 'sürücü').length;
    return { total, aktif, admin, sofor };
  };

  const filteredKullanicilar = kullanicilar.filter(kullanici => {
    const matchesSearch = kullanici.ad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kullanici.soyad.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kullanici.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          kullanici.telefon.includes(searchTerm);
    const matchesRol = rolFilter === 'all' || kullanici.rol === rolFilter;
    return matchesSearch && matchesRol;
  });

  const stats = getStats();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Users className="w-8 h-8 text-red-500" />
            Kullanıcı Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Sistem kullanıcılarını ve yetkilerini yönetin</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isAtamaDialogOpen} onOpenChange={setIsAtamaDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetAtamaForm(); setIsAtamaDialogOpen(true); }} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Yönetici Ata
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Şirket Yöneticisi Ata</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAtamaSubmit} className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="atama_sirket">Şirket *</Label>
                    <Select
                      value={atamaFormData.sirket_id}
                      onValueChange={(value) => setAtamaFormData({ ...atamaFormData, sirket_id: value })}
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
                    <Label htmlFor="atama_kullanici">Kullanıcı *</Label>
                    <Select
                      value={atamaFormData.kullanici_id}
                      onValueChange={(value) => setAtamaFormData({ ...atamaFormData, kullanici_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Kullanıcı seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        {kullanicilar
                          .filter(k => k.rol === 'sirket_yoneticisi')
                          .map((kullanici) => (
                            <SelectItem key={kullanici.kullanici_id} value={String(kullanici.kullanici_id)}>
                              {kullanici.ad} {kullanici.soyad} - {kullanici.email}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yetki_seviyesi">Yetki Seviyesi</Label>
                    <Select
                      value={atamaFormData.yetki_seviyesi}
                      onValueChange={(value) => setAtamaFormData({ ...atamaFormData, yetki_seviyesi: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Yetki seviyesi seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 - Temel</SelectItem>
                        <SelectItem value="2">2 - Standart</SelectItem>
                        <SelectItem value="3">3 - Gelişmiş</SelectItem>
                        <SelectItem value="4">4 - Tam Yetki</SelectItem>
                        <SelectItem value="5">5 - Süper Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    Ata
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Yeni Kullanıcı
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingKullanici ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}</DialogTitle>
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
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="telefon">Telefon</Label>
                    <Input
                      id="telefon"
                      value={formData.telefon}
                      onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
                      placeholder="0555 123 4567"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="rol">Rol *</Label>
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
                            <div className="flex items-center gap-2">
                              <option.icon className="w-4 h-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="sifre">
                      {editingKullanici ? 'Şifre (değiştirmek için doldurun)' : 'Şifre *'}
                    </Label>
                    <Input
                      id="sifre"
                      type="password"
                      value={formData.sifre}
                      onChange={(e) => setFormData({ ...formData, sifre: e.target.value })}
                      required={!editingKullanici}
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    {editingKullanici ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-600 font-medium">Toplam Kullanıcı</p>
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
            <p className="text-sm text-red-600 font-medium">Admin</p>
            <p className="text-2xl font-bold text-red-800">{stats.admin}</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-50">
          <CardContent className="p-4">
            <p className="text-sm text-purple-600 font-medium">Sürücü</p>
            <p className="text-2xl font-bold text-purple-800">{stats.sofor}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'kullanicilar' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('kullanicilar')}
        >
          Kullanıcılar
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'yoneticiler' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('yoneticiler')}
        >
          Şirket Yöneticileri
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              {activeTab === 'kullanicilar' ? 'Kullanıcı Listesi' : 'Yönetici Atamaları'}
            </CardTitle>
            {activeTab === 'kullanicilar' && (
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Select value={rolFilter} onValueChange={setRolFilter}>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="Rol filtresi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    {rolOptions.map((option) => (
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
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab === 'kullanicilar' ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad Soyad</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Son Giriş</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKullanicilar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Kullanıcı bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKullanicilar.map((kullanici) => {
                      const rolInfo = getRolInfo(kullanici.rol);
                      const RolIcon = rolInfo.icon;
                      return (
                        <TableRow key={kullanici.kullanici_id}>
                          <TableCell className="font-medium">
                            {kullanici.ad} {kullanici.soyad}
                          </TableCell>
                          <TableCell>{kullanici.email}</TableCell>
                          <TableCell>{kullanici.telefon || '-'}</TableCell>
                          <TableCell>
                            <Badge className={`${rolInfo.color} flex items-center gap-1`}>
                              <RolIcon className="w-3 h-3" />
                              {rolInfo.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <button
                              onClick={() => handleDurumToggle(kullanici)}
                              className="flex items-center gap-1"
                            >
                              <Badge className={kullanici.durum ? 'bg-green-500' : 'bg-gray-500'}>
                                {kullanici.durum ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </button>
                          </TableCell>
                          <TableCell>
                            {kullanici.son_giris_tarih 
                              ? new Date(kullanici.son_giris_tarih).toLocaleDateString('tr-TR')
                              : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(kullanici)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(kullanici.kullanici_id)}
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
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Şirket</TableHead>
                    <TableHead>Yönetici</TableHead>
                    <TableHead>Yetki Seviyesi</TableHead>
                    <TableHead>Atama Tarihi</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yoneticiler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Yönetici ataması bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    yoneticiler.map((yonetici) => (
                      <TableRow key={yonetici.yonetici_id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4 text-gray-400" />
                            {getSirketAdi(yonetici.sirket_id)}
                          </div>
                        </TableCell>
                        <TableCell>{getKullaniciAdi(yonetici.kullanici_id)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Seviye {yonetici.yetki_seviyesi}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(yonetici.olusturulma_tarihi).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleAtamaDelete(yonetici.yonetici_id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
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

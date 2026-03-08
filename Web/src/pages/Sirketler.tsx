import React, { useState, useEffect } from 'react';
import { sirketAPI, sirketDetayAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Plus, Edit2, Trash2, Search, Building2, AlertCircle, Info, MapPin, Phone, Mail, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Sirket {
  sirket_id: number;
  sirket_adi: string;
  vergi_no: string;
  telefon: string;
  email: string;
  web_sitesi?: string;
  durum: boolean;
  olusturulma_tarihi: string;
}

interface SirketDetay {
  sirket_detay_id: number;
  sirket_id: number;
  musteri_hizmetler_telefon?: string;
  merkez_adres?: string;
  merkez_il?: string;
  merkez_ilce?: string;
  merkez_posta_kodu?: string;
  kulucu_ad?: string;
  kulucu_soyad?: string;
  kulucu_unvan?: string;
  muhasebe_email?: string;
  muhasebe_telefon?: string;
}

export default function SirketlerPage() {
  const [sirketler, setSirketler] = useState<Sirket[]>([]);
  const [sirketDetaylari, setSirketDetaylari] = useState<Record<number, SirketDetay>>({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetayDialogOpen, setIsDetayDialogOpen] = useState(false);
  const [selectedSirket, setSelectedSirket] = useState<Sirket | null>(null);
  const [editingSirket, setEditingSirket] = useState<Sirket | null>(null);
  const [activeTab, setActiveTab] = useState('temel');
  
  const [formData, setFormData] = useState({
    sirket_adi: '',
    vergi_no: '',
    telefon: '',
    email: '',
    web_sitesi: '',
  });

  const [detayFormData, setDetayFormData] = useState({
    musteri_hizmetler_telefon: '',
    merkez_adres: '',
    merkez_il: '',
    merkez_ilce: '',
    merkez_posta_kodu: '',
    kulucu_ad: '',
    kulucu_soyad: '',
    kulucu_unvan: '',
    muhasebe_email: '',
    muhasebe_telefon: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const sirketRes = await sirketAPI.getAll();
      setSirketler(sirketRes.sirketler || []);
      
      // Load details for each company
      const detayRes = await sirketDetayAPI.getAll();
      const detayMap: Record<number, SirketDetay> = {};
      (detayRes.sirket_detaylari || []).forEach((detay: SirketDetay) => {
        detayMap[detay.sirket_id] = detay;
      });
      setSirketDetaylari(detayMap);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSirket) {
        await sirketAPI.update(editingSirket.sirket_id, formData);
        toast.success('Şirket başarıyla güncellendi');
      } else {
        await sirketAPI.create(formData);
        toast.success('Şirket başarıyla oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDetaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSirket) return;
    
    try {
      const existingDetay = sirketDetaylari[selectedSirket.sirket_id];
      const data = { ...detayFormData, sirket_id: selectedSirket.sirket_id };
      
      if (existingDetay) {
        await sirketDetayAPI.update(existingDetay.sirket_detay_id, detayFormData);
      } else {
        await sirketDetayAPI.create(data);
      }
      toast.success('Şirket detayları başarıyla kaydedildi');
      setIsDetayDialogOpen(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (sirket_id: number) => {
    if (!confirm('Bu şirketi silmek istediğinize emin misiniz?')) return;
    try {
      await sirketAPI.delete(sirket_id);
      toast.success('Şirket başarıyla silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (sirket: Sirket) => {
    setEditingSirket(sirket);
    setFormData({
      sirket_adi: sirket.sirket_adi,
      vergi_no: sirket.vergi_no,
      telefon: sirket.telefon,
      email: sirket.email,
      web_sitesi: sirket.web_sitesi || '',
    });
    setIsDialogOpen(true);
  };

  const handleShowDetay = (sirket: Sirket) => {
    setSelectedSirket(sirket);
    const detay = sirketDetaylari[sirket.sirket_id];
    if (detay) {
      setDetayFormData({
        musteri_hizmetler_telefon: detay.musteri_hizmetler_telefon || '',
        merkez_adres: detay.merkez_adres || '',
        merkez_il: detay.merkez_il || '',
        merkez_ilce: detay.merkez_ilce || '',
        merkez_posta_kodu: detay.merkez_posta_kodu || '',
        kulucu_ad: detay.kulucu_ad || '',
        kulucu_soyad: detay.kulucu_soyad || '',
        kulucu_unvan: detay.kulucu_unvan || '',
        muhasebe_email: detay.muhasebe_email || '',
        muhasebe_telefon: detay.muhasebe_telefon || '',
      });
    } else {
      setDetayFormData({
        musteri_hizmetler_telefon: '',
        merkez_adres: '',
        merkez_il: '',
        merkez_ilce: '',
        merkez_posta_kodu: '',
        kulucu_ad: '',
        kulucu_soyad: '',
        kulucu_unvan: '',
        muhasebe_email: '',
        muhasebe_telefon: '',
      });
    }
    setIsDetayDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSirket(null);
    setFormData({
      sirket_adi: '',
      vergi_no: '',
      telefon: '',
      email: '',
      web_sitesi: '',
    });
  };

  const filteredSirketler = sirketler.filter(sirket =>
    sirket.sirket_adi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sirket.vergi_no.includes(searchTerm) ||
    sirket.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-red-500" />
            Şirket Yönetimi
          </h1>
          <p className="text-slate-500 mt-1">Şirket bilgilerini ve detaylarını yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Şirket Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingSirket ? 'Şirket Düzenle' : 'Yeni Şirket Ekle'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="sirket_adi">Şirket Adı *</Label>
                  <Input
                    id="sirket_adi"
                    value={formData.sirket_adi}
                    onChange={(e) => setFormData({ ...formData, sirket_adi: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vergi_no">Vergi No *</Label>
                  <Input
                    id="vergi_no"
                    value={formData.vergi_no}
                    onChange={(e) => setFormData({ ...formData, vergi_no: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefon">Telefon *</Label>
                  <Input
                    id="telefon"
                    value={formData.telefon}
                    onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
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
                  <Label htmlFor="web_sitesi">Web Sitesi</Label>
                  <Input
                    id="web_sitesi"
                    value={formData.web_sitesi}
                    onChange={(e) => setFormData({ ...formData, web_sitesi: e.target.value })}
                    placeholder="www.ornek.com"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <DialogClose asChild>
                  <Button type="button" variant="outline">İptal</Button>
                </DialogClose>
                <Button type="submit" className="bg-red-500 hover:bg-red-600">
                  {editingSirket ? 'Güncelle' : 'Kaydet'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Şirket Listesi</CardTitle>
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
                    <TableHead>Şirket Adı</TableHead>
                    <TableHead>Vergi No</TableHead>
                    <TableHead>İletişim</TableHead>
                    <TableHead>Web Sitesi</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSirketler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>Şirket bulunamadı</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSirketler.map((sirket) => (
                      <TableRow key={sirket.sirket_id}>
                        <TableCell className="font-medium">{sirket.sirket_adi}</TableCell>
                        <TableCell>{sirket.vergi_no}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1 text-sm">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" /> {sirket.telefon}
                            </span>
                            <span className="flex items-center gap-1 text-gray-500">
                              <Mail className="w-3 h-3" /> {sirket.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {sirket.web_sitesi ? (
                            <span className="flex items-center gap-1 text-sm">
                              <Globe className="w-3 h-3" /> {sirket.web_sitesi}
                            </span>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={sirket.durum ? 'bg-green-500' : 'bg-gray-500'}>
                            {sirket.durum ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleShowDetay(sirket)}
                              title="Detaylar"
                            >
                              <Info className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(sirket)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => handleDelete(sirket.sirket_id)}
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

      {/* Detay Dialog */}
      <Dialog open={isDetayDialogOpen} onOpenChange={setIsDetayDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-red-500" />
              {selectedSirket?.sirket_adi} - Detaylar
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="temel" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="temel">Temel Bilgiler</TabsTrigger>
              <TabsTrigger value="detay">Detaylı Bilgiler</TabsTrigger>
            </TabsList>
            
            <TabsContent value="temel" className="space-y-4">
              {selectedSirket && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Vergi Numarası</p>
                      <p className="text-lg font-semibold">{selectedSirket.vergi_no}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Telefon</p>
                      <p className="text-lg font-semibold">{selectedSirket.telefon}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold">{selectedSirket.email}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">Web Sitesi</p>
                      <p className="text-lg font-semibold">{selectedSirket.web_sitesi || '-'}</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="detay">
              <form onSubmit={handleDetaySubmit} className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="musteri_hizmetler_telefon">Müşteri Hizmetleri Telefon</Label>
                    <Input
                      id="musteri_hizmetler_telefon"
                      value={detayFormData.musteri_hizmetler_telefon}
                      onChange={(e) => setDetayFormData({ ...detayFormData, musteri_hizmetler_telefon: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="muhasebe_telefon">Muhasebe Telefon</Label>
                    <Input
                      id="muhasebe_telefon"
                      value={detayFormData.muhasebe_telefon}
                      onChange={(e) => setDetayFormData({ ...detayFormData, muhasebe_telefon: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="merkez_adres">Merkez Adres</Label>
                    <Input
                      id="merkez_adres"
                      value={detayFormData.merkez_adres}
                      onChange={(e) => setDetayFormData({ ...detayFormData, merkez_adres: e.target.value })}
                      placeholder="Sokak, Cadde, No"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merkez_il">İl</Label>
                    <Input
                      id="merkez_il"
                      value={detayFormData.merkez_il}
                      onChange={(e) => setDetayFormData({ ...detayFormData, merkez_il: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merkez_ilce">İlçe</Label>
                    <Input
                      id="merkez_ilce"
                      value={detayFormData.merkez_ilce}
                      onChange={(e) => setDetayFormData({ ...detayFormData, merkez_ilce: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="merkez_posta_kodu">Posta Kodu</Label>
                    <Input
                      id="merkez_posta_kodu"
                      value={detayFormData.merkez_posta_kodu}
                      onChange={(e) => setDetayFormData({ ...detayFormData, merkez_posta_kodu: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="muhasebe_email">Muhasebe Email</Label>
                    <Input
                      id="muhasebe_email"
                      type="email"
                      value={detayFormData.muhasebe_email}
                      onChange={(e) => setDetayFormData({ ...detayFormData, muhasebe_email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kulucu_ad">Kurucu Adı</Label>
                    <Input
                      id="kulucu_ad"
                      value={detayFormData.kulucu_ad}
                      onChange={(e) => setDetayFormData({ ...detayFormData, kulucu_ad: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kulucu_soyad">Kurucu Soyadı</Label>
                    <Input
                      id="kulucu_soyad"
                      value={detayFormData.kulucu_soyad}
                      onChange={(e) => setDetayFormData({ ...detayFormData, kulucu_soyad: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="kulucu_unvan">Kurucu Ünvan</Label>
                    <Input
                      id="kulucu_unvan"
                      value={detayFormData.kulucu_unvan}
                      onChange={(e) => setDetayFormData({ ...detayFormData, kulucu_unvan: e.target.value })}
                      placeholder="CEO, Müdür vb."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    Detayları Kaydet
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}

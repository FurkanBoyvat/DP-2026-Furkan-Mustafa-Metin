import React, { useState, useEffect } from 'react';
import { yakitAPI, aracAPI } from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Plus, Edit2, Trash2, Search, Fuel, AlertCircle, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface YakitKayit {
  yakit_id: number;
  arac_id: number;
  yakit_miktari: number;
  yakit_tutari: number;
  birim_fiyat: number;
  istasyon_adi?: string;
  ikmal_tarihi: string;
  kayit_tarihi: string;
}

interface Arac {
  arac_id: number;
  plaka: string;
  marka: string;
  model: string;
}

interface AylikRapor {
  ay: string;
  toplam_miktar: number;
  toplam_tutar: number;
  ortalama_fiyat: number;
}

export default function YakitPage() {
  const [yakitKayitlari, setYakitKayitlari] = useState<YakitKayit[]>([]);
  const [araclar, setAraclar] = useState<Arac[]>([]);
  const [aylikRapor, setAylikRapor] = useState<AylikRapor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingKayit, setEditingKayit] = useState<YakitKayit | null>(null);
  const [activeTab, setActiveTab] = useState<'kayitlar' | 'rapor'>('kayitlar');
  
  const [formData, setFormData] = useState({
    arac_id: '',
    yakit_miktari: '',
    yakit_tutari: '',
    birim_fiyat: '',
    istasyon_adi: '',
    ikmal_tarihi: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [yakitRes, aracRes, raporRes] = await Promise.all([
        yakitAPI.getAll(),
        aracAPI.getAll(),
        yakitAPI.getAylikRapor(),
      ]);
      setYakitKayitlari(yakitRes.yakit_kayitlari || []);
      setAraclar(aracRes.araclar || []);
      setAylikRapor(raporRes.rapor || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const miktar = parseFloat(formData.yakit_miktari);
      const tutar = parseFloat(formData.yakit_tutari);
      const fiyat = parseFloat(formData.birim_fiyat) || (tutar / miktar);

      const data = {
        arac_id: parseInt(formData.arac_id),
        yakit_miktari: miktar,
        yakit_tutari: tutar,
        birim_fiyat: fiyat,
        istasyon_adi: formData.istasyon_adi,
        ikmal_tarihi: formData.ikmal_tarihi,
      };

      if (editingKayit) {
        await yakitAPI.update(editingKayit.yakit_id, data);
        toast.success('Yakıt kaydı güncellendi');
      } else {
        await yakitAPI.create(data);
        toast.success('Yakıt kaydı oluşturuldu');
      }
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Bir hata oluştu');
    }
  };

  const handleDelete = async (yakit_id: number) => {
    if (!confirm('Bu yakıt kaydını silmek istediğinize emin misiniz?')) return;
    try {
      await yakitAPI.delete(yakit_id);
      toast.success('Yakıt kaydı silindi');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Silme işlemi başarısız');
    }
  };

  const handleEdit = (kayit: YakitKayit) => {
    setEditingKayit(kayit);
    setFormData({
      arac_id: String(kayit.arac_id),
      yakit_miktari: String(kayit.yakit_miktari),
      yakit_tutari: String(kayit.yakit_tutari),
      birim_fiyat: String(kayit.birim_fiyat),
      istasyon_adi: kayit.istasyon_adi || '',
      ikmal_tarihi: kayit.ikmal_tarihi?.split('T')[0] || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingKayit(null);
    setFormData({
      arac_id: '',
      yakit_miktari: '',
      yakit_tutari: '',
      birim_fiyat: '',
      istasyon_adi: '',
      ikmal_tarihi: new Date().toISOString().split('T')[0],
    });
  };

  const getAracPlaka = (arac_id: number) => {
    const arac = araclar.find(a => a.arac_id === arac_id);
    return arac?.plaka || 'Bilinmiyor';
  };

  const getAracInfo = (arac_id: number) => {
    const arac = araclar.find(a => a.arac_id === arac_id);
    return arac ? `${arac.plaka} - ${arac.marka} ${arac.model}` : 'Bilinmiyor';
  };

  const calculateTotals = () => {
    return yakitKayitlari.reduce((acc, kayit) => ({
      toplamMiktar: acc.toplamMiktar + parseFloat(String(kayit.yakit_miktari)),
      toplamTutar: acc.toplamTutar + parseFloat(String(kayit.yakit_tutari)),
    }), { toplamMiktar: 0, toplamTutar: 0 });
  };

  const filteredKayitlar = yakitKayitlari.filter(kayit =>
    getAracPlaka(kayit.arac_id).toLowerCase().includes(searchTerm.toLowerCase()) ||
    (kayit.istasyon_adi?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const totals = calculateTotals();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Fuel className="w-8 h-8 text-red-500" />
            Yakıt Takibi
          </h1>
          <p className="text-slate-500 mt-1">Yakıt tüketimi kayıtlarını ve raporlarını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="bg-red-500 hover:bg-red-600">
                <Plus className="w-4 h-4 mr-2" />
                Yakıt Girişi
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingKayit ? 'Yakıt Kaydı Düzenle' : 'Yeni Yakıt Girişi'}</DialogTitle>
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
                    <Label htmlFor="yakit_miktari">Yakıt Miktarı (L) *</Label>
                    <Input
                      id="yakit_miktari"
                      type="number"
                      step="0.01"
                      value={formData.yakit_miktari}
                      onChange={(e) => {
                        const miktar = parseFloat(e.target.value);
                        const birimFiyat = parseFloat(formData.birim_fiyat);
                        const tutar = birimFiyat ? miktar * birimFiyat : '';
                        setFormData({ 
                          ...formData, 
                          yakit_miktari: e.target.value,
                          yakit_tutari: tutar ? String(tutar) : formData.yakit_tutari
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birim_fiyat">Birim Fiyat (TL) *</Label>
                    <Input
                      id="birim_fiyat"
                      type="number"
                      step="0.01"
                      value={formData.birim_fiyat}
                      onChange={(e) => {
                        const fiyat = parseFloat(e.target.value);
                        const miktar = parseFloat(formData.yakit_miktari);
                        const tutar = miktar ? miktar * fiyat : '';
                        setFormData({ 
                          ...formData, 
                          birim_fiyat: e.target.value,
                          yakit_tutari: tutar ? String(tutar) : formData.yakit_tutari
                        });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="yakit_tutari">Toplam Tutar (TL) *</Label>
                    <Input
                      id="yakit_tutari"
                      type="number"
                      step="0.01"
                      value={formData.yakit_tutari}
                      onChange={(e) => setFormData({ ...formData, yakit_tutari: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ikmal_tarihi">İkmal Tarihi *</Label>
                    <Input
                      id="ikmal_tarihi"
                      type="date"
                      value={formData.ikmal_tarihi}
                      onChange={(e) => setFormData({ ...formData, ikmal_tarihi: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="istasyon_adi">İstasyon Adı</Label>
                    <Input
                      id="istasyon_adi"
                      value={formData.istasyon_adi}
                      onChange={(e) => setFormData({ ...formData, istasyon_adi: e.target.value })}
                      placeholder="Shell, BP, PO vb."
                    />
                  </div>
                </div>
                <DialogFooter className="mt-6">
                  <DialogClose asChild>
                    <Button type="button" variant="outline">İptal</Button>
                  </DialogClose>
                  <Button type="submit" className="bg-red-500 hover:bg-red-600">
                    {editingKayit ? 'Güncelle' : 'Kaydet'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Özet Kartlar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Fuel className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Toplam Yakıt</p>
                <p className="text-2xl font-bold text-blue-800">
                  {totals.toplamMiktar.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-green-600 font-medium">Toplam Tutar</p>
                <p className="text-2xl font-bold text-green-800">
                  {totals.toplamTutar.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Ortalama Fiyat</p>
                <p className="text-2xl font-bold text-orange-800">
                  {yakitKayitlari.length > 0 
                    ? (totals.toplamTutar / totals.toplamMiktar).toLocaleString('tr-TR', { maximumFractionDigits: 2 }) 
                    : '0'} TL/L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'kayitlar' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('kayitlar')}
        >
          Yakıt Kayıtları
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'rapor' ? 'text-red-500 border-b-2 border-red-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('rapor')}
        >
          Aylık Rapor
        </button>
      </div>

      {activeTab === 'kayitlar' ? (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Yakıt Kayıtları</CardTitle>
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
                      <TableHead>Araç</TableHead>
                      <TableHead>Miktar (L)</TableHead>
                      <TableHead>Birim Fiyat</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>İstasyon</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredKayitlar.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                          <p>Yakıt kaydı bulunamadı</p>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredKayitlar.map((kayit) => (
                        <TableRow key={kayit.yakit_id}>
                          <TableCell className="font-medium">{getAracInfo(kayit.arac_id)}</TableCell>
                          <TableCell>{kayit.yakit_miktari} L</TableCell>
                          <TableCell>{kayit.birim_fiyat} TL/L</TableCell>
                          <TableCell className="font-semibold">
                            {parseFloat(String(kayit.yakit_tutari)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                          </TableCell>
                          <TableCell>{kayit.istasyon_adi || '-'}</TableCell>
                          <TableCell>{new Date(kayit.ikmal_tarihi).toLocaleDateString('tr-TR')}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(kayit)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600"
                                onClick={() => handleDelete(kayit.yakit_id)}
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
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Aylık Yakıt Raporu</CardTitle>
          </CardHeader>
          <CardContent>
            {aylikRapor.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Rapor verisi bulunamadı</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ay</TableHead>
                      <TableHead>Toplam Miktar (L)</TableHead>
                      <TableHead>Toplam Tutar</TableHead>
                      <TableHead>Ortalama Fiyat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aylikRapor.map((rapor, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{rapor.ay}</TableCell>
                        <TableCell>{parseFloat(String(rapor.toplam_miktar)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} L</TableCell>
                        <TableCell className="font-semibold">
                          {parseFloat(String(rapor.toplam_tutar)).toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                        </TableCell>
                        <TableCell>
                          {parseFloat(String(rapor.ortalama_fiyat)).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} TL/L
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

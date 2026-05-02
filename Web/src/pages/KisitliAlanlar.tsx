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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus, Edit2, Trash2, Search, MapPin, AlertCircle, AlertTriangle, Gauge, Ban,
  MapPinned, Navigation
} from 'lucide-react';
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
  const [inputMode, setInputMode] = useState<'coordinates' | 'address'>('coordinates');
  const [addressInput, setAddressInput] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedCoords, setGeocodedCoords] = useState<{lat: number, lon: number, display_name: string} | null>(null);
  const [useBoundary, setUseBoundary] = useState(true); // Hassas sınır kullanımı
  const [autoRadius, setAutoRadius] = useState(true); // Otomatik yarıçap
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
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
      console.log('API Response:', alanRes);
      setAlanlar(alanRes.data || alanRes.kisitli_alanlar || []);
      setSirketler(sirketRes.data || sirketRes.sirketler || []);
    } catch (error: any) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.sirket_id) {
        toast.error('Lütfen bir şirket seçin');
        return;
      }
      if (!formData.alan_tipi) {
        toast.error('Lütfen bir alan tipi seçin');
        return;
      }
      if (inputMode === 'coordinates' && (!formData.merkez_enlem || !formData.merkez_boylam)) {
        toast.error('Lütfen koordinatları girin');
        return;
      }
      // Adres modunda ve yeni kayıt ise adres API'sini kullan
      if (inputMode === 'address' && !editingAlan && addressInput.trim()) {
        // Hassas sınır (poligon) kullanımı
        if (useBoundary) {
          const data = {
            alan_adi: formData.alan_adi,
            aciklama: formData.aciklama,
            adres: addressInput,
            max_hiz_kmh: formData.max_hiz_kmh ? parseFloat(formData.max_hiz_kmh) : undefined,
            alan_tipi: formData.alan_tipi || 'yasaklı_alan',
            sirket_id: parseInt(formData.sirket_id),
            useBoundary: true
          };
          await kisitliAlanAPI.createFromAddressWithBoundary(data);
          toast.success('Kısıtlı alan sınır verisi ile (poligon) oluşturuldu');
        } else {
          // Basit daire modu - yarıçap otomatik veya manuel
          const data = {
            alan_adi: formData.alan_adi,
            aciklama: formData.aciklama,
            adres: addressInput,
            yaricap_metre: autoRadius ? 0 : parseFloat(formData.yaricap_metre) || 100, // 0 = otomatik
            max_hiz_kmh: formData.max_hiz_kmh ? parseFloat(formData.max_hiz_kmh) : undefined,
            alan_tipi: formData.alan_tipi || 'yasaklı_alan',
            sirket_id: parseInt(formData.sirket_id),
          };
          await kisitliAlanAPI.createFromAddress(data);
          toast.success(`Kısıtlı alan oluşturuldu (${autoRadius ? 'otomatik yarıçap' : formData.yaricap_metre + 'm'})`);
        }
      } else {
        // Normal koordinat bazlı oluşturma/güncelleme
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
    setInputMode('coordinates');
    setAddressInput('');
    setGeocodedCoords(null);
    setUseBoundary(true);
    setAutoRadius(true);
    setAddressSuggestions([]);
    setShowSuggestions(false);
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

  // Adres arama fonksiyonu - birden fazla sonuç getir
  const searchAddress = async () => {
    if (!addressInput || addressInput.trim().length < 3) {
      toast.error('Lütfen en az 3 karakter içeren bir adres girin');
      return;
    }

    setIsGeocoding(true);
    setShowSuggestions(false);
    try {
      const result = await kisitliAlanAPI.searchAddressMultiple(addressInput, 5);
      if (result.success && result.data && result.data.length > 0) {
        if (result.data.length === 1) {
          // Tek sonuç varsa direkt seç
          handleAddressSelect(result.data[0]);
        } else {
          // Birden fazla sonuç varsa listele
          setAddressSuggestions(result.data);
          setShowSuggestions(true);
          toast.success(`${result.data.length} adres bulundu, lütfen seçin`);
        }
      } else {
        toast.error('Adres bulunamadı. Lütfen daha açık bir adres deneyin.');
      }
    } catch (error: any) {
      toast.error('Adres arama hatası: ' + (error.message || 'Bilinmeyen hata'));
    } finally {
      setIsGeocoding(false);
    }
  };

  // Adres seçim fonksiyonu
  const handleAddressSelect = (selected: any) => {
    setGeocodedCoords(selected);
    setAddressInput(selected.display_name);
    setFormData(prev => ({
      ...prev,
      merkez_enlem: String(selected.lat),
      merkez_boylam: String(selected.lon),
      aciklama: prev.aciklama || selected.display_name
    }));
    setShowSuggestions(false);
    toast.success(`Seçildi: ${selected.display_name.substring(0, 50)}...`);
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
                {!editingAlan && (
                  <div className="space-y-2 sm:col-span-2">
                    <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'coordinates' | 'address')} className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="coordinates" className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          Koordinat ile
                        </TabsTrigger>
                        <TabsTrigger value="address" className="flex items-center gap-2">
                          <MapPinned className="w-4 h-4" />
                          Adres ile
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="coordinates" className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="merkez_enlem">Merkez Enlem *</Label>
                            <Input
                              id="merkez_enlem"
                              type="number"
                              step="0.000001"
                              value={formData.merkez_enlem}
                              onChange={(e) => setFormData({ ...formData, merkez_enlem: e.target.value })}
                              placeholder="39.9334"
                              required={inputMode === 'coordinates'}
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
                              placeholder="32.8597"
                              required={inputMode === 'coordinates'}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="address" className="space-y-4 mt-4">
                        <div className="space-y-2 relative">
                          <Label htmlFor="adres">Adres *</Label>
                          <div className="flex gap-2">
                            <Input
                              id="adres"
                              value={addressInput}
                              onChange={(e) => {
                                setAddressInput(e.target.value);
                                if (e.target.value.length < 3) setShowSuggestions(false);
                              }}
                              placeholder="Örn: Kayseri Esenyurt Mahallesi veya Çankaya, Ankara"
                              className="flex-1"
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchAddress())}
                            />
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={searchAddress}
                              disabled={isGeocoding || addressInput.trim().length < 3}
                            >
                              {isGeocoding ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <Search className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                          <p className="text-xs text-slate-500">
                            Mahalle, semt veya ilçe adı girin ve 🔍 butonuna tıklayın. Birden fazla sonuç varsa listeden seçin.
                          </p>
                          
                          {/* Adres Öneri Listesi */}
                          {showSuggestions && addressSuggestions.length > 0 && (
                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                              <div className="p-2 bg-slate-50 text-xs font-medium text-slate-500 border-b">
                                {addressSuggestions.length} sonuç bulundu - Lütfen doğru olanı seçin
                              </div>
                              {addressSuggestions.map((suggestion, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => handleAddressSelect(suggestion)}
                                  className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b border-slate-100 last:border-0 transition-colors"
                                >
                                  <p className="text-sm text-slate-800 truncate">{suggestion.display_name}</p>
                                  <p className="text-xs text-slate-500">
                                    {suggestion.type} • {suggestion.lat.toFixed(4)}, {suggestion.lon.toFixed(4)}
                                  </p>
                                </button>
                              ))}
                            </div>
                          )}
                          
                          {/* Hassas Sınır Seçeneği */}
                          <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-md mt-2">
                            <Switch
                              checked={useBoundary}
                              onCheckedChange={setUseBoundary}
                              id="use-boundary"
                            />
                            <div className="flex-1">
                              <Label htmlFor="use-boundary" className="text-sm font-medium text-blue-900 cursor-pointer">
                                Hassas Sınır (Poligon) Kullan
                              </Label>
                              <p className="text-xs text-blue-700 mt-0.5">
                                {useBoundary 
                                  ? 'Mahalle/semt sınırlarını tam olarak kullanır (önerilir)' 
                                  : 'Sadece merkez nokta ve yarıçap kullanır'}
                              </p>
                            </div>
                          </div>
                          
                          {/* Otomatik Yarıçap Seçeneği - Sadece daire modunda */}
                          {!useBoundary && (
                            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md mt-2">
                              <Switch
                                checked={autoRadius}
                                onCheckedChange={setAutoRadius}
                                id="auto-radius"
                              />
                              <div className="flex-1">
                                <Label htmlFor="auto-radius" className="text-sm font-medium text-green-900 cursor-pointer">
                                  Yarıçabı Otomatik Belirle
                                </Label>
                                <p className="text-xs text-green-700 mt-0.5">
                                  {autoRadius 
                                    ? 'Adres tipine göre otomatik: Şehir 10km, İlçe 5km, Mahalle 1km' 
                                    : 'Manuel yarıçap giriniz'}
                                </p>
                              </div>
                            </div>
                          )}
                          
                          {/* Manuel Yarıçap Input - Otomatik kapalıysa göster */}
                          {!useBoundary && !autoRadius && (
                            <div className="space-y-2 mt-2">
                              <Label htmlFor="yaricap_adres">Yarıçap (metre)</Label>
                              <Input
                                id="yaricap_adres"
                                type="number"
                                value={formData.yaricap_metre}
                                onChange={(e) => setFormData({ ...formData, yaricap_metre: e.target.value })}
                                placeholder="Örn: 1000"
                              />
                            </div>
                          )}
                          
                          {geocodedCoords && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                              <p className="text-sm text-green-800 flex items-center gap-2">
                                <Navigation className="w-4 h-4" />
                                Adres bulundu:
                              </p>
                              <p className="text-xs text-green-700 mt-1 font-mono">
                                {geocodedCoords.lat.toFixed(6)}, {geocodedCoords.lon.toFixed(6)}
                              </p>
                              <p className="text-xs text-slate-600 mt-1 truncate" title={geocodedCoords.display_name}>
                                {geocodedCoords.display_name}
                              </p>
                            </div>
                          )}
                          {formData.merkez_enlem && formData.merkez_boylam && !geocodedCoords && (
                            <div className="p-2 bg-blue-50 border border-blue-200 rounded-md">
                              <p className="text-xs text-blue-700">
                                Koordinatlar: {formData.merkez_enlem}, {formData.merkez_boylam}
                              </p>
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}

                {editingAlan && (
                  <>
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
                  </>
                )}

                {/* Yarıçap sadece koordinat modunda veya düzenlemede göster */}
                {(inputMode === 'coordinates' || editingAlan) && (
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
                )}
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
                              {alan.geometri_tipi === 'cokgen' || alan.geometri_tipi === 'dikdortgen' || alan.geometri_tipi === 'poligon'
                                ? 'Poligon (Sınır)' 
                                : `${Number(alan.merkez_enlem)?.toFixed(6)}, ${Number(alan.merkez_boylam)?.toFixed(6)}`}
                            </div>
                          </TableCell>
                          <TableCell>{alan.geometri_tipi === 'cokgen' || alan.geometri_tipi === 'dikdortgen' || alan.geometri_tipi === 'poligon' ? '-' : `${alan.yaricap_metre} m`}</TableCell>
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

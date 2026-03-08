const API_BASE_URL = 'http://localhost:3000/api';

const getToken = () => localStorage.getItem('token');

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Bir hata oluştu' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Araçlar API
export const aracAPI = {
  getAll: (params?: { sirket_id?: number; filo_id?: number; durum?: boolean }) => {
    const query = new URLSearchParams();
    if (params?.sirket_id) query.append('sirket_id', String(params.sirket_id));
    if (params?.filo_id) query.append('filo_id', String(params.filo_id));
    if (params?.durum !== undefined) query.append('durum', String(params.durum));
    return fetchWithAuth(`/araclar?${query.toString()}`);
  },
  getById: (arac_id: number) => fetchWithAuth(`/araclar/${arac_id}`),
  create: (data: any) => fetchWithAuth('/araclar', { method: 'POST', body: JSON.stringify(data) }),
  update: (arac_id: number, data: any) => fetchWithAuth(`/araclar/${arac_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (arac_id: number) => fetchWithAuth(`/araclar/${arac_id}`, { method: 'DELETE' }),
  getByPlaka: (plaka: string) => fetchWithAuth(`/araclar/plaka/${plaka}`),
  getCount: (sirket_id?: number) => {
    const query = sirket_id ? `?sirket_id=${sirket_id}` : '';
    return fetchWithAuth(`/araclar/sayisi/toplam${query}`);
  },
};

// Şoförler API
export const soforAPI = {
  getAll: () => fetchWithAuth('/kullanicilar/soforler/all'),
  getById: (kullanici_id: number) => fetchWithAuth(`/kullanicilar/${kullanici_id}`),
  create: (data: any) => fetchWithAuth('/kullanicilar', { method: 'POST', body: JSON.stringify(data) }),
  update: (kullanici_id: number, data: any) => fetchWithAuth(`/kullanicilar/${kullanici_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (kullanici_id: number) => fetchWithAuth(`/kullanicilar/${kullanici_id}`, { method: 'DELETE' }),
};

// Araç Şoförleri API
export const aracSoforAPI = {
  getAll: () => fetchWithAuth('/arac-soforleri'),
  getAktif: () => fetchWithAuth('/arac-soforleri/aktif/all'),
  getById: (sofor_id: number) => fetchWithAuth(`/arac-soforleri/${sofor_id}`),
  create: (data: any) => fetchWithAuth('/arac-soforleri', { method: 'POST', body: JSON.stringify(data) }),
  update: (sofor_id: number, data: any) => fetchWithAuth(`/arac-soforleri/${sofor_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (sofor_id: number) => fetchWithAuth(`/arac-soforleri/${sofor_id}`, { method: 'DELETE' }),
};

// Filolar API
export const filoAPI = {
  getAll: () => fetchWithAuth('/filolar'),
  getById: (filo_id: number) => fetchWithAuth(`/filolar/${filo_id}`),
  getIstatistikler: (filo_id: number) => fetchWithAuth(`/filolar/${filo_id}/istatistikler`),
  create: (data: any) => fetchWithAuth('/filolar', { method: 'POST', body: JSON.stringify(data) }),
  update: (filo_id: number, data: any) => fetchWithAuth(`/filolar/${filo_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (filo_id: number) => fetchWithAuth(`/filolar/${filo_id}`, { method: 'DELETE' }),
};

// Şirketler API
export const sirketAPI = {
  getAll: () => fetchWithAuth('/sirketler'),
  getById: (sirket_id: number) => fetchWithAuth(`/sirketler/${sirket_id}`),
  create: (data: any) => fetchWithAuth('/sirketler', { method: 'POST', body: JSON.stringify(data) }),
  update: (sirket_id: number, data: any) => fetchWithAuth(`/sirketler/${sirket_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (sirket_id: number) => fetchWithAuth(`/sirketler/${sirket_id}`, { method: 'DELETE' }),
};

// Şirket Detayları API
export const sirketDetayAPI = {
  getAll: () => fetchWithAuth('/sirket-detaylari'),
  getAktif: () => fetchWithAuth('/sirket-detaylari/aktif/all'),
  getById: (detay_id: number) => fetchWithAuth(`/sirket-detaylari/${detay_id}`),
  getBySirketId: (sirket_id: number) => fetchWithAuth(`/sirket-detaylari/sirket/${sirket_id}`),
  create: (data: any) => fetchWithAuth('/sirket-detaylari', { method: 'POST', body: JSON.stringify(data) }),
  update: (detay_id: number, data: any) => fetchWithAuth(`/sirket-detaylari/${detay_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (detay_id: number) => fetchWithAuth(`/sirket-detaylari/${detay_id}`, { method: 'DELETE' }),
};

// Şirket Yöneticileri API
export const sirketYoneticiAPI = {
  getAll: () => fetchWithAuth('/sirket-yoneticileri'),
  getAktif: () => fetchWithAuth('/sirket-yoneticileri/aktif/all'),
  getById: (yonetici_atama_id: number) => fetchWithAuth(`/sirket-yoneticileri/${yonetici_atama_id}`),
  create: (data: any) => fetchWithAuth('/sirket-yoneticileri', { method: 'POST', body: JSON.stringify(data) }),
  update: (yonetici_atama_id: number, data: any) => fetchWithAuth(`/sirket-yoneticileri/${yonetici_atama_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (yonetici_atama_id: number) => fetchWithAuth(`/sirket-yoneticileri/${yonetici_atama_id}`, { method: 'DELETE' }),
};

// Yakıt API
export const yakitAPI = {
  getAll: () => fetchWithAuth('/yakit'),
  getById: (kayit_id: number) => fetchWithAuth(`/yakit/${kayit_id}`),
  getByArac: (arac_id: number) => fetchWithAuth(`/yakit/arac/${arac_id}`),
  getAylikRapor: () => fetchWithAuth('/yakit/rapor/aylik'),
  create: (data: any) => fetchWithAuth('/yakit', { method: 'POST', body: JSON.stringify(data) }),
  update: (kayit_id: number, data: any) => fetchWithAuth(`/yakit/${kayit_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (kayit_id: number) => fetchWithAuth(`/yakit/${kayit_id}`, { method: 'DELETE' }),
};

// Bakım API
export const bakimAPI = {
  getAll: () => fetchWithAuth('/bakim'),
  getById: (talep_id: number) => fetchWithAuth(`/bakim/${talep_id}`),
  create: (data: any) => fetchWithAuth('/bakim', { method: 'POST', body: JSON.stringify(data) }),
  update: (talep_id: number, data: any) => fetchWithAuth(`/bakim/${talep_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (talep_id: number) => fetchWithAuth(`/bakim/${talep_id}`, { method: 'DELETE' }),
};

// Raporlar API
export const raporAPI = {
  getAll: () => fetchWithAuth('/raporlar'),
  getById: (rapor_id: number) => fetchWithAuth(`/raporlar/${rapor_id}`),
  getBySirket: (sirket_id: number) => fetchWithAuth(`/raporlar/sirket/${sirket_id}`),
  create: (data: any) => fetchWithAuth('/raporlar', { method: 'POST', body: JSON.stringify(data) }),
  update: (rapor_id: number, data: any) => fetchWithAuth(`/raporlar/${rapor_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (rapor_id: number) => fetchWithAuth(`/raporlar/${rapor_id}`, { method: 'DELETE' }),
};

// Kısıtlı Alanlar API
export const kisitliAlanAPI = {
  getAll: () => fetchWithAuth('/kisitli-alanlar'),
  getAktif: () => fetchWithAuth('/kisitli-alanlar/aktif/all'),
  getById: (alan_id: number) => fetchWithAuth(`/kisitli-alanlar/${alan_id}`),
  create: (data: any) => fetchWithAuth('/kisitli-alanlar', { method: 'POST', body: JSON.stringify(data) }),
  update: (alan_id: number, data: any) => fetchWithAuth(`/kisitli-alanlar/${alan_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (alan_id: number) => fetchWithAuth(`/kisitli-alanlar/${alan_id}`, { method: 'DELETE' }),
};

// Bölge İhlalleri API
export const bolgeIhlalAPI = {
  getAll: () => fetchWithAuth('/bolge-ihlalleri'),
  getCozulmemis: () => fetchWithAuth('/bolge-ihlalleri/cozulmemis/all'),
  getById: (ihlal_id: number) => fetchWithAuth(`/bolge-ihlalleri/${ihlal_id}`),
  create: (data: any) => fetchWithAuth('/bolge-ihlalleri', { method: 'POST', body: JSON.stringify(data) }),
  update: (ihlal_id: number, data: any) => fetchWithAuth(`/bolge-ihlalleri/${ihlal_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (ihlal_id: number) => fetchWithAuth(`/bolge-ihlalleri/${ihlal_id}`, { method: 'DELETE' }),
};

// Takip API
export const takipAPI = {
  // Konum
  updateKonum: (data: any) => fetchWithAuth('/takip/konum/update', { method: 'POST', body: JSON.stringify(data) }),
  getKonum: (arac_id: number) => fetchWithAuth(`/takip/konum/${arac_id}`),
  getTumKonumlar: () => fetchWithAuth('/takip/konumlar/all'),
  // KM
  addKM: (data: any) => fetchWithAuth('/takip/km/add', { method: 'POST', body: JSON.stringify(data) }),
  getKM: (arac_id: number) => fetchWithAuth(`/takip/km/${arac_id}`),
  // Hız
  addHiz: (data: any) => fetchWithAuth('/takip/hiz/add', { method: 'POST', body: JSON.stringify(data) }),
  getHiz: (arac_id: number) => fetchWithAuth(`/takip/hiz/${arac_id}`),
  getHizStats: (arac_id: number) => fetchWithAuth(`/takip/hiz-stats/${arac_id}`),
  addHizAsimi: (data: any) => fetchWithAuth('/takip/hiz/asimi', { method: 'POST', body: JSON.stringify(data) }),
};

// Kullanıcılar API
export const kullaniciAPI = {
  getAll: () => fetchWithAuth('/kullanicilar'),
  getById: (kullanici_id: number) => fetchWithAuth(`/kullanicilar/${kullanici_id}`),
  create: (data: any) => fetchWithAuth('/kullanicilar', { method: 'POST', body: JSON.stringify(data) }),
  update: (kullanici_id: number, data: any) => fetchWithAuth(`/kullanicilar/${kullanici_id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (kullanici_id: number) => fetchWithAuth(`/kullanicilar/${kullanici_id}`, { method: 'DELETE' }),
};

// Auth API
export const authAPI = {
  login: (email: string, sifre: string) => fetchWithAuth('/auth/login', { method: 'POST', body: JSON.stringify({ email, sifre }) }),
  register: (data: any) => fetchWithAuth('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchWithAuth('/auth/profile'),
};

# 🚗 Araç Takip Sistemi

# Görseller
<img width="1413" height="1015" alt="image" src="https://github.com/user-attachments/assets/1e68ec2a-e04b-4f54-bf5d-31c022e70df8" />
<img width="624" height="239" alt="image" src="https://github.com/user-attachments/assets/7e609ec6-a038-438c-b3ce-938c7bf4899a" />
<img width="1916" height="986" alt="image" src="https://github.com/user-attachments/assets/76d6cc78-8b35-425f-8321-e781630a5458" />
<img width="1913" height="985" alt="image" src="https://github.com/user-attachments/assets/48a26ddd-0747-4893-a30a-c37a85a78692" />
<img width="860" height="704" alt="image" src="https://github.com/user-attachments/assets/e286ef30-b588-4e9a-9802-2238d82a46bd" />
<img width="777" height="839" alt="image" src="https://github.com/user-attachments/assets/7917545e-03f8-4863-9a21-483f2e089aaa" />
<img width="1905" height="382" alt="image" src="https://github.com/user-attachments/assets/326d8144-c445-46f8-94cd-b789525ae32f" />

Kapsamlı araç filo yönetim ve GPS takip sistemi. Şirketlerin araçlarını gerçek zamanlı olarak takip etmelerini, yönetmelerini ve raporlamalarını sağlayan modern bir web uygulaması.

## ✨ Özellikler

### 🏢 Şirket Yönetimi
- Çoklu şirket desteği
- Şirket bilgileri ve vergi kayıtları
- Şirket yönetici atamaları

### 👥 Kullanıcı Yönetimi
- Rol bazlı yetkilendirme (Admin, Şirket Yöneticisi, Sürücü, Muhasebe)
- JWT tabanlı kimlik doğrulama
- Kullanıcı profilleri ve yetki yönetimi

### 🚛 Araç Filo Yönetimi
- Araç kayıt ve takip
- Filo organizasyonu
- Araç şoför atamaları
- KM takibi ve bakım kayıtları

### 📍 GPS Takip ve Harita
- Gerçek zamanlı konum takibi
- Hız kayıtları ve ihlal uyarıları
- Kısıtlı alan tanımlama
- Bölge ihlal kayıtları
- Interactive map with Leaflet

### ⛽ Yakıt ve Bakım
- Yakıt tüketim takibi
- Bakım talep yönetimi
- Rutin ve acil bakım planlaması
- Bakım tipleri (Rutin, Acil, Özel, Ayakkabı, Yağ Değişim)

### 📊 Raporlama ve Analitik
- Detaylı raporlar ve analizler
- Grafiksel veri görselleştirme
- Performans metrikleri
- İstatistiksel paneller

## 🛠️ Teknoloji Yığını

### Backend (API)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Veritabanı
- **JWT** - Kimlik doğrulama
- **bcryptjs** - Şifreleme
- **Helmet** - Güvenlik
- **CORS** - Cross-origin resource sharing
- **Moment.js** - Tarih işlemleri

### Frontend (Web)
- **React 18** - UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Build tool
- **React Router** - Yönlendirme
- **TailwindCSS** - Stil framework
- **Radix UI** - UI bileşenleri
- **Material-UI** - İkonlar ve bileşenler
- **Leaflet & React-Leaflet** - Harita
- **Recharts** - Grafikler
- **Lucide React** - İkonlar

## 📁 Proje Yapısı

```
Araç Takip Sistemi/
├── Api/                          # Backend API
│   ├── src/
│   │   ├── config/              # Veritabanı yapılandırması
│   │   ├── controllers/         # Controller'lar
│   │   ├── middleware/          # Middleware'ler
│   │   ├── routes/              # API rotaları
│   │   └── index.js             # Ana API dosyası
│   ├── .env                     # Ortam değişkenleri
│   ├── database.sql             # Veritabanı şeması
│   └── package.json             # Bağımlılıklar
├── Web/                         # Frontend uygulaması
│   ├── src/
│   │   ├── auth/               # Kimlik doğrulama bileşenleri
│   │   ├── components/         # UI bileşenleri
│   │   │   ├── ui/            # Temel UI bileşenleri
│   │   │   ├── Dashboard.tsx  # Ana panel
│   │   │   ├── MapPanel.tsx   # Harita paneli
│   │   │   └── Charts.tsx     # Grafikler
│   │   ├── styles/            # Stil dosyaları
│   │   └── App.tsx            # Ana uygulama
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
└── README.md                    # Bu dosya
```

## 🚀 Kurulum

### Gereksinimler
- Node.js (v18 veya üzeri)
- PostgreSQL (v12 veya üzeri)
- npm veya yarn

### 1. Veritabanı Kurulumu
```sql
-- PostgreSQL'de veritabanını oluşturun
CREATE DATABASE arac_takip_sistemi;

-- Veritabanı şemasını içe aktarın
\i Api/database.sql
```

### 2. Backend Kurulumu
```bash
# API klasörüne gidin
cd Api

# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini yapılandırın
# .env dosyasını düzenleyin:
cp .env.example .env
```

### 3. Frontend Kurulumu
```bash
# Web klasörüne gidin
cd Web

# Bağımlılıkları yükleyin
npm install
```

### 4. Uygulamayı Çalıştırma
```bash
# Terminal 1: Backend'i başlatın
cd Api
npm run dev

# Terminal 2: Frontend'i başlatın
cd Web
npm run dev
```

Veya `komutlar.txt` dosyasındaki komutları kullanabilirsiniz:
```bash
# API için
node . api

# Web için
npm run dev site
```

## 🗄️ Veritabanı

### Ana Tablolar
- **kullanicilar** - Kullanıcı bilgileri ve roller
- **sirketler** - Şirket bilgileri
- **filolar** - Araç filoları
- **araclar** - Araç bilgileri
- **arac_konum_takibi** - GPS konum verileri
- **arac_hiz_kayitlari** - Hız kayıtları
- **yakit_tuketim_kayitlari** - Yakıt tüketimi
- **bakim_talepleri** - Bakım talepleri
- **raporlar** - Sistem raporları

### Veritabanı Şeması
Veritabanı şeması `Api/database.sql` dosyasında bulunmaktadır. Bu dosya tüm tabloları, indeksleri ve ilişkileri içerir.

## 🔌 API Dokümantasyonu

### Kimlik Doğrulama
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `GET /api/auth/profile` - Profil bilgileri

### Araç Yönetimi
- `GET /api/vehicles` - Araçları listele
- `POST /api/vehicles` - Yeni araç ekle
- `PUT /api/vehicles/:id` - Araç güncelle
- `DELETE /api/vehicles/:id` - Araç sil

### Takip Sistemi
- `GET /api/tracking/location/:vehicleId` - Konum bilgisini al
- `POST /api/tracking/location` - Konum güncelle
- `GET /api/tracking/speed/:vehicleId` - Hız kayıtları

### Raporlama
- `GET /api/reports/vehicles` - Araç raporları
- `GET /api/reports/fuel` - Yakıt raporları
- `GET /api/reports/maintenance` - Bakım raporları

## 🎯 Kullanım

### 1. Giriş Yap
- Kullanıcı bilgilerinizle sisteme giriş yapın
- Rolünüze göre ilgili panele yönlendirilirsiniz

### 2. Araç Takibi
- Harita üzerinden araçların gerçek zamanlı konumunu izleyin
- Hız ve konum ihlallerini takip edin

### 3. Filo Yönetimi
- Yeni araçlar ekleyin
- Şoför atamaları yapın
- Bakım takibi yapın

### 4. Raporlama
- Detaylı raporlar oluşturun
- Performans analizleri görüntüleyin
- Verileri dışa aktarın

## 🎨 Ekran Görüntüleri

*(Ekran görüntüleri yakında eklenecektir)*

- Ana Dashboard
- Harita Paneli
- Araç Yönetimi
- Raporlama Arayüzü

## 🤝 Katkıda Bulunma

Katkıda bulunmak isterseniz:

1. Bu projeyi fork edin
2. Özellik branch'ini oluşturun (`git checkout -b feature/YeniOzellik`)
3. Değişikliklerinizi commit edin (`git commit -am 'Yeni özellik eklendi'`)
4. Branch'e push edin (`git push origin feature/YeniOzellik`)
5. Pull Request oluşturun

## 📝 Geliştirme Notları

### Ortam Değişkenleri
```env
# .env dosyası örneği
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=arac_takip_sistemi
DB_USER=postgres
DB_PASSWORD=sifreniz
JWT_SECRET=gizli-anahtar
```

### API Portları
- Backend: `http://localhost:5000`
- Frontend: `http://localhost:5173`

### Güvenlik
- JWT token tabanlı kimlik doğrulama
- Şifreler bcrypt ile hash'lenir
- Helmet ile HTTP başlık güvenliği
- CORS yapılandırması

## 🐛 Hata Bildirme

Hata bildirmek veya öneride bulunmak için:
- GitHub Issues kullanın
- Hata detaylarını, adımları ve ekran görüntülerini ekleyin

## 📄 Lisans

Bu proje MIT Lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasını inceleyin.

## 👨‍💻 Yazar

**Ramazan** - *Proje geliştirici*

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

# 🚗 Araç Takip Sistemi Web - Mobil - Api

# Görseller
<img width="1413" height="1015" alt="image" src="https://github.com/user-attachments/assets/1e68ec2a-e04b-4f54-bf5d-31c022e70df8" />
<img width="624" height="239" alt="image" src="https://github.com/user-attachments/assets/7e609ec6-a038-438c-b3ce-938c7bf4899a" />
<img width="1910" height="942" alt="image" src="https://github.com/user-attachments/assets/1dab3218-18e1-4f6d-885b-94aef2d29189" />
<img width="1918" height="918" alt="image" src="https://github.com/user-attachments/assets/7228255a-a505-4089-949d-2b3b4d5e8181" />
<img width="1913" height="985" alt="image" src="https://github.com/user-attachments/assets/48a26ddd-0747-4893-a30a-c37a85a78692" />
<img width="860" height="704" alt="image" src="https://github.com/user-attachments/assets/e286ef30-b588-4e9a-9802-2238d82a46bd" />
<img width="777" height="839" alt="image" src="https://github.com/user-attachments/assets/7917545e-03f8-4863-9a21-483f2e089aaa" />
<img width="1905" height="382" alt="image" src="https://github.com/user-attachments/assets/326d8144-c445-46f8-94cd-b789525ae32f" />

# 🚗 Araç Takip Sistemi (Vehicle Tracking System)

[![React](https://img.shields.io/badge/React-19.1-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12%2B-blue?logo=postgresql)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Araç Takip Sistemi**, modern web teknolojileri ile geliştirilmiş, kurumsal ölçekte araç filo yönetimi ve gerçek zamanlı GPS takip çözümüdür. Şirketlerin araçlarını harita üzerinden anlık izlemelerini, hız ve bölge ihlallerini denetlemelerini ve detaylı yakıt/bakım raporları almalarını sağlar.

---

## ✨ Öne Çıkan Özellikler

### 📍 Gerçek Zamanlı Takip ve Coğrafi Sınırlandırma (Geofencing)
- **Gelişmiş Geofencing**: **Ray Casting** algoritması kullanılarak geliştirilen özel bölge denetimi. PostGIS gerektirmeden tam doğrulukla çalışır.
- **Canlı İzleme**: Leaflet entegrasyonu ile araçların anlık konum, hız ve durum bilgileri.
- **İhlal Yönetimi**: Kısıtlı alan giriş-çıkışları ve hız aşımı durumlarında anlık bildirimler ve kayıt tutma.

### 🏢 Kurumsal Hiyerarşi ve Yönetim
- **Çoklu Şirket Desteği**: Tek platform üzerinden birden fazla şirketi ve bu şirketlere ait filoları yönetme imkanı.
- **Detaylı Rol Yönetimi**: Admin, Şirket Yöneticisi, Şoför ve Muhasebe rollerine özel yetkilendirme (RBAC).
- **Akıllı Atamalar**: Araç-şoför ve şirket-yönetici eşleştirmeleri.

### ⛽ Operasyonel Verimlilik
- **Yakıt Takibi**: Şoför bazlı yakıt tüketim analizleri ve leaderboard sistemi.
- **Bakım Yönetimi**: Periyodik ve acil bakım taleplerinin oluşturulması, takibi ve onay süreci.
- **Gelişmiş Raporlama**: Recharts ile görselleştirilmiş, dışa aktarılabilir performans ve maliyet raporları.

---

## 🛠️ Teknoloji Yığını

### **Frontend (Modern & Hızlı)**
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite 6
- **Styling**: TailwindCSS 4 & Framer Motion (Animasyonlar)
- **UI Components**: Radix UI, Material-UI, Lucide Icons
- **Mapping**: Leaflet & React-Leaflet
- **Data Viz**: Recharts

### **Backend (Güvenli & Ölçeklenebilir)**
- **Runtime**: Node.js (Express.js)
- **Database**: PostgreSQL
- **Security**: JWT (JSON Web Token), bcryptjs, Helmet, CORS
- **Validation**: Express-Validator
- **Zaman Yönetimi**: Moment.js / Date-fns

---

## 📂 Proje Yapısı

```bash
Araç Takip Sistemi/
├── Api/              # Node.js + Express Backend
│   ├── src/
│   │   ├── controllers/  # İş mantığı
│   │   ├── routes/       # API uç noktaları
│   │   ├── middleware/   # Auth & Validation
│   │   └── config/       # DB bağlantı ayarları
│   └── database.sql      # Veritabanı şeması ve başlangıç verileri
├── Web/              # React + Vite + Tailwind Frontend
│   ├── src/
│   │   ├── components/   # Yeniden kullanılabilir UI bileşenleri
│   │   ├── pages/        # Dashboard, Harita, Raporlar vb.
│   │   ├── services/     # API entegrasyonu (Axios)
│   │   └── auth/         # Login/Register süreçleri
└── docs/             # Teknik dokümantasyon
```

---

## 🚀 Hızlı Kurulum

### 1. Veritabanı Hazırlığı
PostgreSQL üzerinde bir veritabanı oluşturun ve `Api/database.sql` içeriğini çalıştırın:
```bash
psql -U postgres -d arac_takip_sistemi -f Api/database.sql
```

### 2. Backend Kurulumu
```bash
cd Api
npm install
# .env dosyasını oluşturun ve DB bilgilerinizi girin
npm run dev
```

### 3. Frontend Kurulumu
```bash
cd Web
npm install
npm run dev
```

## 📄 Lisans

Bu proje **MIT Lisansı** altında korunmaktadır. Detaylar için `LICENSE` dosyasına bakabilirsiniz.

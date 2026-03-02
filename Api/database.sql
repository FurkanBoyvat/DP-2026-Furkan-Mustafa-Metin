-- ==========================================
-- ARAÇ TAKIP SİSTEMİ VERİTABANı
-- PostgreSQL Veritabanı Tabloları
-- ==========================================

-- Veritabanını oluştur
CREATE DATABASE arac_takip_sistemi;

-- Bağlantı yap
\c arac_takip_sistemi

-- ==========================================
-- 1. KULLANICILAR TABLOSU
-- ==========================================
CREATE TABLE kullanicilar (
    kullanici_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    sifre VARCHAR(255) NOT NULL,
    ad VARCHAR(100) NOT NULL,
    soyad VARCHAR(100) NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    rol VARCHAR(50) NOT NULL CHECK (rol IN ('admin', 'sirket_yoneticisi', 'surucü', 'muhasebe')),
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    son_giris_tarih TIMESTAMP
);

CREATE INDEX idx_kullanicilar_email ON kullanicilar(email);
CREATE INDEX idx_kullanicilar_rol ON kullanicilar(rol);

-- ==========================================
-- 2. ŞİRKETLER TABLOSU
-- ==========================================
CREATE TABLE sirketler (
    sirket_id SERIAL PRIMARY KEY,
    sirket_adi VARCHAR(255) NOT NULL,
    vergi_no VARCHAR(50) UNIQUE NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    web_sitesi VARCHAR(255),
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sirketler_vergi_no ON sirketler(vergi_no);
CREATE INDEX idx_sirketler_durum ON sirketler(durum);

-- ==========================================
-- 3. ŞİRKET DETAYLARı TABLOSU
-- ==========================================
CREATE TABLE sirket_detaylari (
    sirket_detay_id SERIAL PRIMARY KEY,
    sirket_id INTEGER NOT NULL UNIQUE,
    musteri_hizmetler_telefon VARCHAR(20),
    merkez_adres TEXT,
    merkez_il VARCHAR(100),
    merkez_ilce VARCHAR(100),
    merkez_posta_kodu VARCHAR(10),
    kulucu_ad VARCHAR(100),
    kulucu_soyad VARCHAR(100),
    kulucu_unvan VARCHAR(100),
    muhasebe_email VARCHAR(255),
    muhasebe_telefon VARCHAR(20),
    logo_url VARCHAR(500),
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE
);

CREATE INDEX idx_sirket_detaylari_sirket_id ON sirket_detaylari(sirket_id);

-- ==========================================
-- 4. SIRKET YÖNETICILERI TABLOSU
-- ==========================================
CREATE TABLE sirket_yoneticileri (
    yonetici_id SERIAL PRIMARY KEY,
    sirket_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    yetki_seviyesi INTEGER DEFAULT 1,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id) ON DELETE CASCADE,
    UNIQUE(sirket_id, kullanici_id)
);

CREATE INDEX idx_sirket_yoneticileri_sirket_id ON sirket_yoneticileri(sirket_id);
CREATE INDEX idx_sirket_yoneticileri_kullanici_id ON sirket_yoneticileri(kullanici_id);

-- ==========================================
-- 5. FİLOLAR TABLOSU
-- ==========================================
CREATE TABLE filolar (
    filo_id SERIAL PRIMARY KEY,
    sirket_id INTEGER NOT NULL,
    filo_adi VARCHAR(255) NOT NULL,
    aciklama TEXT,
    filo_muduru_ad VARCHAR(100),
    filo_muduru_soyad VARCHAR(100),
    filo_muduru_telefon VARCHAR(20),
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE
);

CREATE INDEX idx_filolar_sirket_id ON filolar(sirket_id);
CREATE INDEX idx_filolar_durum ON filolar(durum);

-- ==========================================
-- 6. ARAÇLAR TABLOSU
-- ==========================================
CREATE TABLE araclar (
    arac_id SERIAL PRIMARY KEY,
    filo_id INTEGER NOT NULL,
    sirket_id INTEGER NOT NULL,
    plaka VARCHAR(20) UNIQUE NOT NULL,
    marka VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    yil INTEGER NOT NULL,
    renk VARCHAR(50),
    arac_tipi VARCHAR(50) CHECK (arac_tipi IN ('kamyon', 'otobüs', 'minibüs', 'araç', 'traktör', 'taksi', 'diğer')),
    vin_no VARCHAR(50) UNIQUE,
    motor_no VARCHAR(50),
    sarj_no VARCHAR(50),
    kapasite_kg DECIMAL(10, 2),
    kapasite_m3 DECIMAL(10, 2),
    yakit_tipi VARCHAR(50) CHECK (yakit_tipi IN ('benzin', 'dizel', 'lpg', 'elektrik', 'hibrit')),
    ortalama_yakit_tuketimi DECIMAL(5, 2),
    sigorta_numarasi VARCHAR(50),
    sigorta_baslangic_tarihi DATE,
    sigorta_bitis_tarihi DATE,
    teknik_muayene_tarihi DATE,
    son_bakım_tarihi DATE,
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (filo_id) REFERENCES filolar(filo_id) ON DELETE CASCADE,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE
);

CREATE INDEX idx_araclar_plaka ON araclar(plaka);
CREATE INDEX idx_araclar_filo_id ON araclar(filo_id);
CREATE INDEX idx_araclar_sirket_id ON araclar(sirket_id);
CREATE INDEX idx_araclar_durum ON araclar(durum);

-- ==========================================
-- 7. ARAÇ ŞOFÖRLERI TABLOSU
-- ==========================================
CREATE TABLE arac_soforleri (
    sofor_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    sofor_adı VARCHAR(100) NOT NULL,
    sofor_soyadi VARCHAR(100) NOT NULL,
    ehliyet_numarasi VARCHAR(50) UNIQUE NOT NULL,
    ehliyet_son_validasyon_tarihi DATE NOT NULL,
    telefon VARCHAR(20) NOT NULL,
    adres TEXT,
    atama_tarihi DATE DEFAULT CURRENT_DATE,
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id) ON DELETE SET NULL
);

CREATE INDEX idx_arac_soforleri_arac_id ON arac_soforleri(arac_id);
CREATE INDEX idx_arac_soforleri_kullanici_id ON arac_soforleri(kullanici_id);

-- ==========================================
-- 8. ARAÇ KM TAKIBI TABLOSU
-- ==========================================
CREATE TABLE arac_km_takibi (
    km_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    eski_km DECIMAL(10, 2) NOT NULL,
    yeni_km DECIMAL(10, 2) NOT NULL,
    km_fark DECIMAL(10, 2) GENERATED ALWAYS AS (yeni_km - eski_km) STORED,
    bakım_gerekli BOOLEAN DEFAULT false,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notlar TEXT,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
);

CREATE INDEX idx_arac_km_takibi_arac_id ON arac_km_takibi(arac_id);
CREATE INDEX idx_arac_km_takibi_kayit_tarihi ON arac_km_takibi(kayit_tarihi);

-- ==========================================
-- 9. ARAÇ KONUM TAKIBI TABLOSU (GERÇEK ZAMANLI)
-- ==========================================
CREATE TABLE arac_konum_takibi (
    konum_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    enlem DECIMAL(10, 8) NOT NULL,
    boylam DECIMAL(11, 8) NOT NULL,
    hiz DECIMAL(5, 2) DEFAULT 0,
    irtifa DECIMAL(10, 2),
    uydu_sayisi INTEGER,
    gps_dogruluk DECIMAL(5, 2),
    motor_durum BOOLEAN,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
);

CREATE INDEX idx_arac_konum_takibi_arac_id ON arac_konum_takibi(arac_id);
CREATE INDEX idx_arac_konum_takibi_kayit_tarihi ON arac_konum_takibi(kayit_tarihi);
CREATE INDEX idx_arac_konum_takibi_enlem_boylam ON arac_konum_takibi(enlem, boylam);

-- ==========================================
-- 10. ARAÇ HIZ KAYITLARI TABLOSU
-- ==========================================
CREATE TABLE arac_hiz_kayitlari (
    hiz_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    max_hiz DECIMAL(5, 2) NOT NULL,
    min_hiz DECIMAL(5, 2) DEFAULT 0,
    ortalama_hiz DECIMAL(5, 2),
    hiz_ast_numarasi VARCHAR(100),
    surucü_adı VARCHAR(100),
    yol VARCHAR(255),
    baslangic_konumu VARCHAR(255),
    bitis_konumu VARCHAR(255),
    baslangic_tarihi TIMESTAMP NOT NULL,
    bitis_tarihi TIMESTAMP NOT NULL,
    sure_saat DECIMAL(4, 2) GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (bitis_tarihi - baslangic_tarihi)) / 3600
    ) STORED,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
);

CREATE INDEX idx_arac_hiz_kayitlari_arac_id ON arac_hiz_kayitlari(arac_id);
CREATE INDEX idx_arac_hiz_kayitlari_baslangic_tarihi ON arac_hiz_kayitlari(baslangic_tarihi);
CREATE INDEX idx_arac_hiz_kayitlari_max_hiz ON arac_hiz_kayitlari(max_hiz);

-- ==========================================
-- 11. KIŞITLI ALANLAR TABLOSU
-- ==========================================
CREATE TABLE kisitli_alanlar (
    alan_id SERIAL PRIMARY KEY,
    sirket_id INTEGER NOT NULL,
    alan_adi VARCHAR(255) NOT NULL,
    alan_tipi VARCHAR(50) CHECK (alan_tipi IN ('yasaklı_alan', 'düşük_hız_bölgesi', 'yüksek_hız_bölgesi', 'tehlikeli_bölge')),
    aciklama TEXT,
    merkez_enlem DECIMAL(10, 8) NOT NULL,
    merkez_boylam DECIMAL(11, 8) NOT NULL,
    yaricap_metre DECIMAL(10, 2) NOT NULL,
    max_hiz_kmh DECIMAL(5, 2),
    durum BOOLEAN DEFAULT true NOT NULL,
    olusturulma_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    guncelleme_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE
);

CREATE INDEX idx_kisitli_alanlar_sirket_id ON kisitli_alanlar(sirket_id);
CREATE INDEX idx_kisitli_alanlar_merkez_konum ON kisitli_alanlar(merkez_enlem, merkez_boylam);

-- ==========================================
-- 12. BÖLGE İHLAL KAYITLARI TABLOSU
-- ==========================================
CREATE TABLE bolge_ihlal_kayitlari (
    ihlal_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    alan_id INTEGER NOT NULL,
    ihlal_tipi VARCHAR(50) CHECK (ihlal_tipi IN ('bölgeye_giriş', 'hız_aşımı', 'kalış')),
    giris_tarihi TIMESTAMP NOT NULL,
    cikis_tarihi TIMESTAMP,
    kalış_suresi_dakika INTEGER,
    max_hiz DECIMAL(5, 2),
    surucü_adı VARCHAR(100),
    onay_durum BOOLEAN DEFAULT false,
    notlar TEXT,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE,
    FOREIGN KEY (alan_id) REFERENCES kisitli_alanlar(alan_id) ON DELETE CASCADE
);

CREATE INDEX idx_bolge_ihlal_kayitlari_arac_id ON bolge_ihlal_kayitlari(arac_id);
CREATE INDEX idx_bolge_ihlal_kayitlari_alan_id ON bolge_ihlal_kayitlari(alan_id);
CREATE INDEX idx_bolge_ihlal_kayitlari_giris_tarihi ON bolge_ihlal_kayitlari(giris_tarihi);

-- ==========================================
-- 13. YAKIT TÜKETIM KAYITLARI TABLOSU
-- ==========================================
CREATE TABLE yakit_tuketim_kayitlari (
    yakit_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    yakit_miktari DECIMAL(8, 2) NOT NULL,
    yakit_tutari DECIMAL(10, 2) NOT NULL,
    birim_fiyat DECIMAL(8, 2) NOT NULL,
    istasyon_adi VARCHAR(255),
    ikmal_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kayit_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
);

CREATE INDEX idx_yakit_tuketim_kayitlari_arac_id ON yakit_tuketim_kayitlari(arac_id);
CREATE INDEX idx_yakit_tuketim_kayitlari_ikmal_tarihi ON yakit_tuketim_kayitlari(ikmal_tarihi);

-- ==========================================
-- 14. BAKIM TALEPLERI TABLOSU
-- ==========================================
CREATE TABLE bakim_talepleri (
    talek_id SERIAL PRIMARY KEY,
    arac_id INTEGER NOT NULL,
    bakim_tipi VARCHAR(50) CHECK (bakim_tipi IN ('rutin_bakim', 'acil_bakim', 'ozel_bakim', 'ayakkabi', 'yag_degisim')),
    talek_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    durum VARCHAR(50) DEFAULT 'bekleniyor' CHECK (durum IN ('bekleniyor', 'tamamlandi', 'iptal', 'devam_ediyor')),
    tahmini_bitis_tarihi DATE,
    gercek_bitis_tarihi TIMESTAMP,
    tahmini_maliyet DECIMAL(10, 2),
    gercek_maliyet DECIMAL(10, 2),
    aciklama TEXT,
    FOREIGN KEY (arac_id) REFERENCES araclar(arac_id) ON DELETE CASCADE
);

CREATE INDEX idx_bakim_talepleri_arac_id ON bakim_talepleri(arac_id);
CREATE INDEX idx_bakim_talepleri_talek_tarihi ON bakim_talepleri(talek_tarihi);
CREATE INDEX idx_bakim_talepleri_durum ON bakim_talepleri(durum);

-- ==========================================
-- 15. RAPORLAR TABLOSU
-- ==========================================
CREATE TABLE raporlar (
    rapor_id SERIAL PRIMARY KEY,
    sirket_id INTEGER NOT NULL,
    kullanici_id INTEGER NOT NULL,
    rapor_tipi VARCHAR(50) CHECK (rapor_tipi IN ('gunluk', 'haftalik', 'aylik', 'yillik', 'ozel')),
    rapor_adi VARCHAR(255) NOT NULL,
    rapor_tarihi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    baslangic_tarihi DATE,
    bitis_tarihi DATE,
    bulundu_url VARCHAR(500),
    aciklama TEXT,
    FOREIGN KEY (sirket_id) REFERENCES sirketler(sirket_id) ON DELETE CASCADE,
    FOREIGN KEY (kullanici_id) REFERENCES kullanicilar(kullanici_id) ON DELETE SET NULL
);

CREATE INDEX idx_raporlar_sirket_id ON raporlar(sirket_id);
CREATE INDEX idx_raporlar_rapor_tarihi ON raporlar(rapor_tarihi);

-- ==========================================
-- VIEWS (GÖRÜNTÜLER)
-- ==========================================

-- Aktif araçlar görünümü
CREATE VIEW aktif_araclar AS
SELECT 
    a.arac_id,
    a.plaka,
    a.marka,
    a.model,
    s.sirket_adi,
    f.filo_adi,
    a.durum,
    kkt.enlem,
    kkt.boylam,
    kkt.hiz,
    kkt.kayit_tarihi AS konum_guncelleme_tarihi
FROM araclar a
JOIN sirketler s ON a.sirket_id = s.sirket_id
JOIN filolar f ON a.filo_id = f.filo_id
LEFT JOIN arac_konum_takibi kkt ON a.arac_id = kkt.arac_id
WHERE a.durum = true AND s.durum = true;

-- Araç başına km ortalaması
CREATE VIEW arac_km_istatistikleri AS
SELECT 
    a.arac_id,
    a.plaka,
    COUNT(*) AS kayit_sayisi,
    SUM(akt.km_fark) AS toplam_km,
    AVG(akt.km_fark) AS ortalama_km_per_kayit,
    MAX(akt.kayit_tarihi) AS son_km_kayit_tarihi
FROM araclar a
LEFT JOIN arac_km_takibi akt ON a.arac_id = akt.arac_id
GROUP BY a.arac_id, a.plaka;

-- Araç hız istatistikleri
CREATE VIEW arac_hiz_istatistikleri AS
SELECT 
    a.arac_id,
    a.plaka,
    COUNT(*) AS toplam_kayit,
    MAX(ahk.max_hiz) AS max_hiz_kmh,
    AVG(ahk.ortalama_hiz) AS ortalama_hiz_kmh,
    MAX(ahk.baslangic_tarihi) AS son_kayit_tarihi
FROM araclar a
LEFT JOIN arac_hiz_kayitlari ahk ON a.arac_id = ahk.arac_id
GROUP BY a.arac_id, a.plaka;

-- ==========================================
-- TRIGGERS (TETIKLEYICILER)
-- ==========================================

-- Guncelleme tarihi otomatik güncellemesi
CREATE OR REPLACE FUNCTION guncelleme_tarihi_guncelle()
RETURNS TRIGGER AS $$
BEGIN
    NEW.guncelleme_tarihi = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER kullanicilar_guncelleme BEFORE UPDATE ON kullanicilar
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

CREATE TRIGGER sirketler_guncelleme BEFORE UPDATE ON sirketler
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

CREATE TRIGGER sirket_detaylari_guncelleme BEFORE UPDATE ON sirket_detaylari
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

CREATE TRIGGER filolar_guncelleme BEFORE UPDATE ON filolar
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

CREATE TRIGGER araclar_guncelleme BEFORE UPDATE ON araclar
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

CREATE TRIGGER kisitli_alanlar_guncelleme BEFORE UPDATE ON kisitli_alanlar
FOR EACH ROW EXECUTE FUNCTION guncelleme_tarihi_guncelle();

-- ==========================================
-- TEST VERİLERİ (OPSIYONEL)
-- ==========================================

-- Test şirketi
INSERT INTO sirketler (sirket_adi, vergi_no, telefon, email, web_sitesi)
VALUES ('Lojistik Solutionlar A.Ş.', '12345678901', '0212 555 0000', 'info@lojistik.com', 'www.lojistik.com');

-- Test kullanıcısı (admin)
INSERT INTO kullanicilar (email, sifre, ad, soyad, telefon, rol)
VALUES ('admin@lojistik.com', 'hashed_password_123', 'Merve', 'Kaya', '05551234567', 'admin');

-- Test filo
INSERT INTO filolar (sirket_id, filo_adi, filo_muduru_ad, filo_muduru_soyad, filo_muduru_telefon, aciklama)
VALUES (1, 'İstanbul Filo', 'Ali', 'Yılmaz', '05559876543', 'İstanbul bölgesi araçları');

-- Test araç
INSERT INTO araclar (filo_id, sirket_id, plaka, marka, model, yil, renk, arac_tipi, vin_no, kapasite_kg, yakit_tipi)
VALUES (1, 1, '34-AB-1234', 'Volvo', 'FH16', 2023, 'Beyaz', 'kamyon', 'VVVWZZZ88Z123456', 25000.00, 'dizel');

-- ==========================================
-- VERITABANI KAPAT
-- ==========================================

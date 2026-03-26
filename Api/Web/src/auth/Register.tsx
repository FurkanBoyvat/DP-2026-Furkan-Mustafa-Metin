import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, Car } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface RegisterFormData {
  ad: string;
  soyad: string;
  email: string;
  telefon: string;
  sifre: string;
  sifreTekrar: string;
  rol: string;
}

export default function Register() {
  const [formData, setFormData] = useState<RegisterFormData>({
    ad: '',
    soyad: '',
    email: '',
    telefon: '',
    sifre: '',
    sifreTekrar: '',
    rol: 'surucü'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTekrar, setShowPasswordTekrar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Şifre kontrolü
    if (formData.sifre !== formData.sifreTekrar) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }

    // Form verilerini kontrol et
    console.log('Register form data:', formData);

    try {
      const requestData = {
        ad: formData.ad.trim(),
        soyad: formData.soyad.trim(),
        email: formData.email.trim(),
        telefon: formData.telefon.trim(),
        sifre: formData.sifre,
        rol: formData.rol
      };

      console.log('Request data:', JSON.stringify(requestData, null, 2));

      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        // Başarılı kayıt sonrası giriş sayfasına yönlendir
        window.location.href = '/login?registered=true';
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        
        // Daha detaylı hata mesajları
        if (errorData.code === 'SERVER_ERROR' && errorData.error) {
          setError(`Sunucu hatası: ${errorData.error}`);
        } else {
          setError(errorData.message || 'Kayıt başarısız');
        }
      }
    } catch (err) {
      console.log('Fetch error:', err);
      setError('Sunucu ile bağlantı kurulamadı');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo ve Başlık */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <Car className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Araç Takip Sistemi
          </h1>
          <p className="text-muted-foreground">
            Yeni hesap oluşturun
          </p>
        </div>

        {/* Kayıt Formu */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ad" className="text-sm font-medium text-foreground">
                  Ad
                </label>
                <Input
                  id="ad"
                  name="ad"
                  type="text"
                  placeholder="Ahmet"
                  value={formData.ad}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="soyad" className="text-sm font-medium text-foreground">
                  Soyad
                </label>
                <Input
                  id="soyad"
                  name="soyad"
                  type="text"
                  placeholder="Yılmaz"
                  value={formData.soyad}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                E-posta
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="telefon" className="text-sm font-medium text-foreground">
                Telefon
              </label>
              <Input
                id="telefon"
                name="telefon"
                type="tel"
                placeholder="0555 123 45 67"
                value={formData.telefon}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="rol" className="text-sm font-medium text-foreground">
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={formData.rol}
                onChange={handleChange}
                disabled={isLoading}
                className="flex h-9 w-full min-w-0 rounded-md border border-input bg-input-background px-3 py-1 text-base transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              >
                <option value="surucü">Sürücü</option>
                <option value="muhasebe">Muhasebe</option>
                <option value="sirket_yoneticisi">Şirket Yöneticisi</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="sifre" className="text-sm font-medium text-foreground">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="sifre"
                  name="sifre"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.sifre}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="sifreTekrar" className="text-sm font-medium text-foreground">
                Şifre (Tekrar)
              </label>
              <div className="relative">
                <Input
                  id="sifreTekrar"
                  name="sifreTekrar"
                  type={showPasswordTekrar ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.sifreTekrar}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="w-full pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordTekrar(!showPasswordTekrar)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isLoading}
                >
                  {showPasswordTekrar ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Kayıt yapılıyor...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Kayıt Ol
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Zaten hesabınız var mı?{' '}
              <a
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                Giriş yapın
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

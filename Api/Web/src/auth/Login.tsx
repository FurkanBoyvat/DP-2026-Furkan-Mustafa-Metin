import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Car, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface LoginFormData {
  email: string;
  password: string;
}

export default function Login() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // URL parametresini kontrol et
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      // URL'den parametreyi temizle
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Form verilerini kontrol et
    console.log('Form data:', formData);
    
    if (!formData.email || !formData.password) {
      setError('E-posta ve şifre alanları zorunludur');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email.trim(),
          sifre: formData.password  // Backend expects 'sifre' instead of 'password'
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', data);
        
        // Token'ı localStorage'a kaydet
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Ana uygulamaya yönlendir
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        console.log('Error data:', errorData);
        setError(errorData.message || 'Giriş başarısız');
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
            Hesabınıza giriş yapın
          </p>
        </div>

        {/* Giriş Formu */}
        <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-md border border-green-200 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              {success}
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md border border-destructive/20">
              {error}
            </div>
          )}

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
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Şifre
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
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

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  Giriş yapılıyor...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Hesabınız yok mu?{' '}
              <a
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Kayıt olun
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

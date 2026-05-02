import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, UserPlus, Car, AlertCircle, CheckCircle, User, Mail, Phone, Shield, Lock } from 'lucide-react';

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
    ad: '', soyad: '', email: '', telefon: '', sifre: '', sifreTekrar: '', rol: 'surucü'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTekrar, setShowPasswordTekrar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Şifre güç göstergesi
  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[A-Z]/.test(p)) strength++;
    if (/[0-9]/.test(p)) strength++;
    if (/[^A-Za-z0-9]/.test(p)) strength++;
    return strength;
  };
  const pwStrength = getPasswordStrength(formData.sifre);
  const strengthLabels = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  useEffect(() => { setMounted(true); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.sifre !== formData.sifreTekrar) {
      setError('Şifreler eşleşmiyor');
      setIsLoading(false);
      return;
    }
    if (formData.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad: formData.ad.trim(), soyad: formData.soyad.trim(),
          email: formData.email.trim(), telefon: formData.telefon.trim(),
          sifre: formData.sifre, rol: formData.rol
        }),
      });

      if (response.ok) {
        window.location.href = '/login?registered=true';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Kayıt başarısız. Bilgilerinizi kontrol edin.');
      }
    } catch {
      setError('Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = (field: string) => ({
    background: focused === field ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === field ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused === field ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'
  });

  const roleOptions = [
    { value: 'surucü', label: 'Sürücü', icon: '🚗' },
    { value: 'muhasebe', label: 'Muhasebe', icon: '💼' },
    { value: 'sirket_yoneticisi', label: 'Şirket Yöneticisi', icon: '🏢' },
    { value: 'admin', label: 'Admin', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 py-8"
      style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1526 40%, #0a0f1a 100%)' }}>

      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-lg"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(24px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>

        {/* Logo */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-18 h-18 rounded-3xl mb-4 relative"
            style={{ width: 72, height: 72, background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 0 40px rgba(99,102,241,0.4)' }}>
            <Car className="w-9 h-9 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0f1a] animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Hesap Oluştur</h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Araç Takip Sistemi</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border"
          style={{
            background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Kayıt Formu</h2>
            <p className="text-slate-500 text-sm">Tüm alanları eksiksiz doldurun</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Ad Soyad */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ad</label>
                <input
                  name="ad" type="text" placeholder="Ahmet"
                  value={formData.ad} onChange={handleChange}
                  onFocus={() => setFocused('ad')} onBlur={() => setFocused(null)}
                  required disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                  style={inputStyle('ad')}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Soyad</label>
                <input
                  name="soyad" type="text" placeholder="Yılmaz"
                  value={formData.soyad} onChange={handleChange}
                  onFocus={() => setFocused('soyad')} onBlur={() => setFocused(null)}
                  required disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                  style={inputStyle('soyad')}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> E-posta</span>
              </label>
              <input
                name="email" type="email" placeholder="ornek@email.com"
                value={formData.email} onChange={handleChange}
                onFocus={() => setFocused('email')} onBlur={() => setFocused(null)}
                required disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                style={inputStyle('email')}
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1.5"><Phone className="w-3 h-3" /> Telefon</span>
              </label>
              <input
                name="telefon" type="tel" placeholder="0555 123 45 67"
                value={formData.telefon} onChange={handleChange}
                onFocus={() => setFocused('telefon')} onBlur={() => setFocused(null)}
                required disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                style={inputStyle('telefon')}
              />
            </div>

            {/* Rol Seçimi */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1.5"><Shield className="w-3 h-3" /> Rol</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map(opt => (
                  <button type="button" key={opt.value}
                    onClick={() => { setFormData(p => ({ ...p, rol: opt.value })); if (error) setError(''); }}
                    disabled={isLoading}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                    style={{
                      background: formData.rol === opt.value ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${formData.rol === opt.value ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                      color: formData.rol === opt.value ? '#a5b4fc' : '#64748b'
                    }}>
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Şifre */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <span className="inline-flex items-center gap-1.5"><Lock className="w-3 h-3" /> Şifre</span>
              </label>
              <div className="relative">
                <input
                  name="sifre" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                  value={formData.sifre} onChange={handleChange}
                  onFocus={() => setFocused('sifre')} onBlur={() => setFocused(null)}
                  required disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                  style={inputStyle('sifre')}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Şifre güç göstergesi */}
              {formData.sifre && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                        style={{ background: i <= pwStrength ? strengthColors[pwStrength] : 'rgba(255,255,255,0.08)' }} />
                    ))}
                  </div>
                  <p className="text-xs" style={{ color: strengthColors[pwStrength] }}>
                    Şifre güvenliği: {strengthLabels[pwStrength]}
                  </p>
                </div>
              )}
            </div>

            {/* Şifre Tekrar */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Şifre Tekrar</label>
              <div className="relative">
                <input
                  name="sifreTekrar" type={showPasswordTekrar ? 'text' : 'password'} placeholder="••••••••"
                  value={formData.sifreTekrar} onChange={handleChange}
                  onFocus={() => setFocused('sifreTekrar')} onBlur={() => setFocused(null)}
                  required disabled={isLoading}
                  className="w-full px-4 py-3 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                  style={inputStyle('sifreTekrar')}
                />
                <button type="button" onClick={() => setShowPasswordTekrar(!showPasswordTekrar)} disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPasswordTekrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                {/* Eşleşme göstergesi */}
                {formData.sifreTekrar && (
                  <div className="absolute right-10 top-1/2 -translate-y-1/2">
                    {formData.sifre === formData.sifreTekrar
                      ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                      : <AlertCircle className="w-4 h-4 text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm mt-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'linear-gradient(135deg, #4f46e5, #2563eb)' }} />
              <span className="relative flex items-center gap-2.5">
                {isLoading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kayıt yapılıyor...</>
                ) : (
                  <><UserPlus className="w-4 h-4" />Kayıt Ol</>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-slate-600 font-medium">ZATEN ÜYE MİSİNİZ?</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          <p className="text-center text-sm text-slate-500">
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              ← Giriş Yap
            </a>
          </p>
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-600">Güvenli bağlantı · SSL şifreli</span>
        </div>
      </div>
    </div>
  );
}

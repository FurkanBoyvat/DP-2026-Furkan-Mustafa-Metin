import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle, ArrowLeft, Lock } from 'lucide-react';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [sifreTekrar, setSifreTekrar] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordTekrar, setShowPasswordTekrar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const getPasswordStrength = (p: string) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const pwStrength = getPasswordStrength(yeniSifre);
  const strengthLabels = ['', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
  const strengthColors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (!t) {
      setError('Geçersiz şifre sıfırlama linki. Lütfen yeni bir talepte bulunun.');
    } else {
      setToken(t);
    }
  }, []);

  const inputStyle = (field: string) => ({
    background: focused === field ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${focused === field ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
    boxShadow: focused === field ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniSifre !== sifreTekrar) { setError('Şifreler eşleşmiyor'); return; }
    if (yeniSifre.length < 6) { setError('Şifre en az 6 karakter olmalıdır'); return; }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, yeniSifre }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setTimeout(() => { window.location.href = '/login'; }, 3000);
      } else {
        setError(data.message || 'Şifre sıfırlama başarısız.');
      }
    } catch {
      setError('Sunucu ile bağlantı kurulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1526 40%, #0a0f1a 100%)' }}>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)', animationDelay: '1s' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-md"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-3xl mb-5 relative"
            style={{ width: 80, height: 80, background: success ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: success ? '0 0 40px rgba(16,185,129,0.4)' : '0 0 40px rgba(99,102,241,0.4)', transition: 'all 0.5s' }}>
            {success ? <CheckCircle className="w-10 h-10 text-white" /> : <KeyRound className="w-10 h-10 text-white" />}
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">
            {success ? 'Şifre Sıfırlandı!' : 'Yeni Şifre Belirle'}
          </h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Araç Takip Sistemi</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-8 border"
          style={{ background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)', borderColor: 'rgba(255,255,255,0.08)', boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)' }}>

          {/* Başarı ekranı */}
          {success ? (
            <div className="text-center py-4">
              <div className="w-20 h-20 mx-auto mb-5 rounded-3xl flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Harika! Şifreniz Değişti</h2>
              <p className="text-slate-500 text-sm mb-6">3 saniye içinde giriş sayfasına yönlendiriliyorsunuz...</p>
              <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #10b981, #059669)', width: '100%' }} />
              </div>
              <a href="/login" className="inline-block mt-5 text-emerald-400 hover:text-emerald-300 font-semibold text-sm transition-colors">
                Hemen Giriş Yap →
              </a>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-white mb-1">Yeni Şifre</h2>
                <p className="text-slate-500 text-sm">Güçlü bir şifre belirleyin</p>
              </div>

              {error && (
                <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!token ? (
                <div className="text-center py-6">
                  <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm mb-4">Geçersiz veya eksik şifre sıfırlama linki.</p>
                  <a href="/forgot-password" className="text-amber-400 hover:text-amber-300 font-semibold text-sm">
                    Yeni sıfırlama talebi oluştur →
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Yeni Şifre */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span className="inline-flex items-center gap-1.5"><Lock className="w-3 h-3" /> Yeni Şifre</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'} value={yeniSifre}
                        onChange={e => { setYeniSifre(e.target.value); setError(''); }}
                        onFocus={() => setFocused('sifre')} onBlur={() => setFocused(null)}
                        placeholder="••••••••" disabled={isLoading}
                        className="w-full px-4 py-3.5 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                        style={inputStyle('sifre')}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {yeniSifre && (
                      <div className="mt-2">
                        <div className="flex gap-1 mb-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                              style={{ background: i <= pwStrength ? strengthColors[pwStrength] : 'rgba(255,255,255,0.08)' }} />
                          ))}
                        </div>
                        <p className="text-xs" style={{ color: strengthColors[pwStrength] }}>
                          {strengthLabels[pwStrength]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Şifre Tekrar */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Şifre Tekrar</label>
                    <div className="relative">
                      <input
                        type={showPasswordTekrar ? 'text' : 'password'} value={sifreTekrar}
                        onChange={e => { setSifreTekrar(e.target.value); setError(''); }}
                        onFocus={() => setFocused('tekrar')} onBlur={() => setFocused(null)}
                        placeholder="••••••••" disabled={isLoading}
                        className="w-full px-4 py-3.5 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                        style={inputStyle('tekrar')}
                      />
                      <button type="button" onClick={() => setShowPasswordTekrar(!showPasswordTekrar)} disabled={isLoading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        {showPasswordTekrar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      {sifreTekrar && (
                        <div className="absolute right-10 top-1/2 -translate-y-1/2">
                          {yeniSifre === sifreTekrar
                            ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                            : <AlertCircle className="w-4 h-4 text-red-400" />}
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 20px rgba(99,102,241,0.4)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }} />
                    <span className="relative flex items-center gap-2.5">
                      {isLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Kaydediliyor...</>
                        : <><KeyRound className="w-4 h-4" />Şifremi Sıfırla</>}
                    </span>
                  </button>
                </form>
              )}

              <div className="flex items-center gap-4 mt-6" style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <a href="/login" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                  <ArrowLeft className="w-4 h-4" /> Giriş Sayfasına Dön
                </a>
              </div>
            </>
          )}
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-600">Güvenli bağlantı · SSL şifreli</span>
        </div>
      </div>
    </div>
  );
}

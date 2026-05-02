import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, LogIn, Car, CheckCircle, AlertCircle, Wifi, WifiOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focused, setFocused] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('registered') === 'true') {
      setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('E-posta ve şifre alanları zorunludur');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), sifre: password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/';
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'E-posta veya şifre hatalı');
      }
    } catch {
      setError('Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1526 40%, #0a0f1a 100%)' }}>

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/3 w-64 h-64 rounded-full opacity-10 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', animationDelay: '2s' }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      {/* Card */}
      <div
        className="relative w-full max-w-md"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 relative"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 0 40px rgba(99,102,241,0.4), 0 0 80px rgba(59,130,246,0.2)' }}>
            <Car className="w-10 h-10 text-white" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#0a0f1a] animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Araç Takip</h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Yönetim Sistemi</p>
        </div>

        {/* Form card */}
        <div className="rounded-3xl p-8 border"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Hoş Geldiniz</h2>
            <p className="text-slate-500 text-sm">Hesabınıza giriş yapın</p>
          </div>

          {/* Success */}
          {success && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399' }}>
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                E-posta Adresi
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); setSuccess(''); }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="ornek@email.com"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-600 outline-none disabled:opacity-50 transition-all duration-300"
                  style={{
                    background: focused === 'email' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused === 'email' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: focused === 'email' ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Şifre
                </label>
                <a href="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium">
                  Şifremi Unuttum
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); setSuccess(''); }}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl text-white text-sm placeholder-slate-600 outline-none disabled:opacity-50 transition-all duration-300"
                  style={{
                    background: focused === 'password' ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${focused === 'password' ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: focused === 'password' ? '0 0 0 3px rgba(99,102,241,0.1)' : 'none'
                  }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button type="submit" disabled={isLoading}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm mt-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                boxShadow: '0 4px 20px rgba(99,102,241,0.4)'
              }}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'linear-gradient(135deg, #2563eb, #4f46e5)' }} />
              <span className="relative flex items-center gap-2.5">
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            <span className="text-xs text-slate-600 font-medium">VEYA</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-slate-500">
            Hesabınız yok mu?{' '}
            <a href="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Kayıt Olun →
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-600">Güvenli bağlantı · SSL şifreli</span>
        </div>
      </div>
    </div>
  );
}

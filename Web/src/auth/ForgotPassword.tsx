import React, { useState, useEffect } from 'react';
import { Car, Mail, AlertCircle, CheckCircle, ArrowLeft, KeyRound, Send } from 'lucide-react';

type Step = 'email' | 'sent' | 'success';

export default function ForgotPassword() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (step === 'sent' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('E-posta adresi zorunludur'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta adresi girin'); return; }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('sent');
        setCountdown(60);
      } else {
        setError(data.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch {
      setError('Sunucu ile bağlantı kurulamadı. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCountdown(60);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0a0f1a 0%, #0d1526 40%, #0a0f1a 100%)' }}>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full opacity-20 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full opacity-15 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', animationDelay: '1.5s' }} />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="relative w-full max-w-md"
        style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }}>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-3xl mb-5 relative"
            style={{ width: 80, height: 80, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 0 40px rgba(245,158,11,0.3)' }}>
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Şifremi Unuttum</h1>
          <p className="text-slate-500 text-sm font-medium tracking-widest uppercase">Araç Takip Sistemi</p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border overflow-hidden"
          style={{
            background: 'rgba(15, 23, 42, 0.85)', backdropFilter: 'blur(24px)',
            borderColor: 'rgba(255,255,255,0.08)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
          }}>

          {/* Step indicator */}
          <div className="flex" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            {(['email', 'sent', 'success'] as Step[]).map((s, i) => (
              <div key={s} className="flex-1 h-1 transition-all duration-500"
                style={{
                  background: i <= ['email', 'sent', 'success'].indexOf(step)
                    ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                    : 'rgba(255,255,255,0.05)'
                }} />
            ))}
          </div>

          <div className="p-8">
            {/* STEP 1: Email girişi */}
            {step === 'email' && (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white mb-2">Şifre Sıfırlama</h2>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Kayıtlı e-posta adresinizi girin. Şifre sıfırlama bağlantısı göndereceğiz.
                  </p>
                </div>

                {error && (
                  <div className="mb-5 flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      <span className="inline-flex items-center gap-1.5"><Mail className="w-3 h-3" /> E-posta Adresi</span>
                    </label>
                    <input
                      type="email" value={email}
                      onChange={e => { setEmail(e.target.value); setError(''); }}
                      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                      placeholder="ornek@email.com" disabled={isLoading}
                      className="w-full px-4 py-3.5 rounded-2xl text-white text-sm placeholder-slate-600 outline-none transition-all duration-300 disabled:opacity-50"
                      style={{
                        background: focused ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${focused ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        boxShadow: focused ? '0 0 0 3px rgba(245,158,11,0.1)' : 'none'
                      }}
                    />
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white font-bold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'linear-gradient(135deg, #d97706, #dc2626)' }} />
                    <span className="relative flex items-center gap-2.5">
                      {isLoading
                        ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Gönderiliyor...</>
                        : <><Send className="w-4 h-4" />Sıfırlama Linki Gönder</>}
                    </span>
                  </button>
                </form>
              </>
            )}

            {/* STEP 2: Email gönderildi */}
            {step === 'sent' && (
              <div className="text-center py-4">
                {/* Animasyonlu zarf ikonu */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6"
                  style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <Mail className="w-12 h-12 text-amber-400" />
                  <div className="absolute -top-2 -right-2 w-7 h-7 bg-emerald-400 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-4 h-4 text-emerald-900" />
                  </div>
                </div>

                <h2 className="text-2xl font-black text-white mb-2">E-posta Gönderildi!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-2">
                  <span className="text-amber-400 font-semibold">{email}</span> adresine<br />
                  şifre sıfırlama bağlantısı gönderdik.
                </p>
                <p className="text-slate-600 text-xs mb-8">Spam/Junk klasörünü de kontrol edin.</p>

                {/* Geri sayım */}
                <div className="mb-6 p-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-slate-500 text-sm mb-1">E-posta gelmediyse</p>
                  {countdown > 0 ? (
                    <p className="text-slate-400 text-sm">
                      <span className="text-amber-400 font-bold">{countdown}s</span> sonra tekrar gönderebilirsiniz
                    </p>
                  ) : (
                    <button onClick={handleResend} disabled={isLoading}
                      className="text-amber-400 hover:text-amber-300 font-bold text-sm transition-colors">
                      Tekrar Gönder →
                    </button>
                  )}
                </div>

                <button onClick={() => setStep('email')}
                  className="w-full py-3 rounded-2xl text-slate-400 hover:text-white text-sm font-medium transition-all duration-200"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  Farklı bir e-posta dene
                </button>
              </div>
            )}

            {/* Geri dön */}
            <div className="flex items-center gap-4 mt-6" style={{ paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <a href="/login"
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
                <ArrowLeft className="w-4 h-4" />
                Giriş Sayfasına Dön
              </a>
              <div className="flex-1" />
              <a href="/register" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Kayıt Ol
              </a>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 flex items-center justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-slate-600">Güvenli bağlantı · SSL şifreli</span>
        </div>
      </div>
    </div>
  );
}

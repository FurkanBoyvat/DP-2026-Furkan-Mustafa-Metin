import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  kullanici_id: number;
  email: string;
  ad: string;
  soyad: string;
  telefon: string;
  rol: string;
  durum: boolean;
  olusturulma_tarihi: string;
  son_giris_tarih: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await fetch('http://localhost:3000/api/auth/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();

        if (data.success) {
          setProfile(data.kullanici);
        } else {
          setError(data.message || 'Profil bilgileri alınamadı');
          if (data.code === 'INVALID_TOKEN') {
            localStorage.removeItem('token');
            navigate('/login');
          }
        }
      } catch (err) {
        setError('Sunucu ile bağlantı kurulamadı');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-red-500 text-center mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-slate-800">Profilim</h1>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
            >
              Çıkış Yap
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ad
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  {profile.ad}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Soyad
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  {profile.soyad}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Telefon
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  {profile.telefon}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rol
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.rol === 'admin' ? 'bg-red-100 text-red-800' :
                    profile.rol === 'sirket_yoneticisi' ? 'bg-blue-100 text-blue-800' :
                    profile.rol === 'filo_yoneticisi' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.rol.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Durum
                </label>
                <div className="bg-slate-50 p-3 rounded-md">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    profile.durum ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {profile.durum ? 'AKTİF' : 'PASİF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
              <div>
                <span className="font-medium">Kullanıcı ID:</span> #{profile.kullanici_id}
              </div>
              <div>
                <span className="font-medium">Oluşturulma Tarihi:</span> {new Date(profile.olusturulma_tarihi).toLocaleDateString('tr-TR')}
              </div>
              {profile.son_giris_tarih && (
                <div>
                  <span className="font-medium">Son Giriş:</span> {new Date(profile.son_giris_tarih).toLocaleDateString('tr-TR')}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

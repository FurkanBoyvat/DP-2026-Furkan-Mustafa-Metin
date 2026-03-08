import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Login from './auth/Login';
import Register from './auth/Register';
import Profile from './auth/Profile';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';

// Pages
import Araclar from './pages/Araclar';
import Soforler from './pages/Soforler';
import Filolar from './pages/Filolar';
import Sirketler from './pages/Sirketler';
import Yakit from './pages/Yakit';
import Bakim from './pages/Bakim';
import Raporlar from './pages/Raporlar';
import KisitliAlanlar from './pages/KisitliAlanlar';
import BolgeIhlalleri from './pages/BolgeIhlalleri';
import Kullanicilar from './pages/Kullanicilar';
import Bildirimler from './pages/Bildirimler';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <Router>
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/" replace />} 
          />
          <Route 
            path="/profile" 
            element={isAuthenticated ? <Profile /> : <Navigate to="/login" replace />} 
          />
          
          {/* Protected Routes with Layout */}
          <Route element={isAuthenticated ? <Layout /> : <Navigate to="/login" replace />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/araclar" element={<Araclar />} />
            <Route path="/soforler" element={<Soforler />} />
            <Route path="/filolar" element={<Filolar />} />
            <Route path="/sirketler" element={<Sirketler />} />
            <Route path="/yakit" element={<Yakit />} />
            <Route path="/bakim" element={<Bakim />} />
            <Route path="/raporlar" element={<Raporlar />} />
            <Route path="/kisitli-alanlar" element={<KisitliAlanlar />} />
            <Route path="/bolge-ihlalleri" element={<BolgeIhlalleri />} />
            <Route path="/kullanicilar" element={<Kullanicilar />} />
            <Route path="/bildirimler" element={<Bildirimler />} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </>
  );
}

export default App;

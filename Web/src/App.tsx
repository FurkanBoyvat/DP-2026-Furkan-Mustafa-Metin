import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './auth/Login';
import Register from './auth/Register';
import Profile from './auth/Profile';
import MainApp from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Token kontrolü
    const token = localStorage.getItem('token');
    if (token) {
      // Token geçerliliğini kontrol et (opsiyonel)
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
        <Route 
          path="/" 
          element={isAuthenticated ? <MainApp /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </Router>
  );
}

export default App;

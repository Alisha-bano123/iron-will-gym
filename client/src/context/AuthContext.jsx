import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data);
      localStorage.setItem('gymUser', JSON.stringify(res.data));
      return res.data;
    } catch (err) {
      localStorage.removeItem('gymToken');
      localStorage.removeItem('gymUser');
      setUser(null);
      throw err;
    }
  }, []);

  // App open hone pe — token check karo
  useEffect(() => {
    const token = localStorage.getItem('gymToken');
    if (!token) {
      setLoading(false);
      return;
    }
    const saved = localStorage.getItem('gymUser');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
    refreshUser()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshUser]);

  // ── FIX: login ke baad user set karo + loading false karo PEHLE navigate ho
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user: userData } = res.data;

    // Pehle localStorage set karo
    localStorage.setItem('gymToken', token);
    localStorage.setItem('gymUser', JSON.stringify(userData));

    // Phir state update karo — loading already false hai kyunki initial load ho chuka
    setUser(userData);

    // Return karo taaki Login.jsx navigate kar sake
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('gymToken');
    localStorage.removeItem('gymUser');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
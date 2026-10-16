import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('umcp_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('umcp_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('umcp_token');
      if (savedToken) {
        try {
          const res = await api.get('/users/me');
          if (res.success && res.data) {
            setUser(res.data);
            localStorage.setItem('umcp_user', JSON.stringify(res.data));
          }
        } catch {
          // Token expired or invalid
          setUser(null);
          setToken(null);
          localStorage.removeItem('umcp_token');
          localStorage.removeItem('umcp_user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('umcp_token', res.data.token);
      localStorage.setItem('umcp_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.error?.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await api.post('/auth/register', formData);
    if (res.success && res.data) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('umcp_token', res.data.token);
      localStorage.setItem('umcp_user', JSON.stringify(res.data.user));
      return res.data.user;
    }
    throw new Error(res.error?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch {
      // Ignore failure on logout call
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('umcp_token');
      localStorage.removeItem('umcp_user');
    }
  };

  const updateProfile = async (updates) => {
    const res = await api.patch('/users/me', updates);
    if (res.success && res.data) {
      setUser(res.data);
      localStorage.setItem('umcp_user', JSON.stringify(res.data));
      return res.data;
    }
    throw new Error(res.error?.message || 'Update failed');
  };

  const hasRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateProfile,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

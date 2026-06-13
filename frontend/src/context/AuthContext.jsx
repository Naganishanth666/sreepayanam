import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // { id, fullName, email, role, ... }
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('sp_token');
    const savedUser  = localStorage.getItem('sp_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('sp_token');
        localStorage.removeItem('sp_user');
      }
    }
    setLoading(false);
  }, []);

  // Persist whenever token/user changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('sp_token', token);
      localStorage.setItem('sp_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('sp_token');
      localStorage.removeItem('sp_user');
    }
  }, [token, user]);

  // Login
  const login = useCallback(async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    setToken(data.token);
    setUser({ id: data.id, fullName: data.name, email, role: data.role });
    return data;
  }, []);

  // Register
  const register = useCallback(async (formData) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    setToken(data.token);
    setUser({ id: data.id, fullName: formData.fullName, email: formData.email, role: data.role });
    return data;
  }, []);

  // Logout
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const isLoggedIn  = !!user;
  const isAdmin     = user?.role === 'Admin';
  const isAgent     = user?.role === 'Agent';
  const isCustomer  = user?.role === 'Customer';

  // Helper to build auth headers for API calls
  const authHeaders = useCallback(() => {
    return token
      ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
      : { 'Content-Type': 'application/json' };
  }, [token]);

  return (
    <AuthContext.Provider value={{
      user, token, loading,
      isLoggedIn, isAdmin, isAgent, isCustomer,
      login, register, logout, authHeaders
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;

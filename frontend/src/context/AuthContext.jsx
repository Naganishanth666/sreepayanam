import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContextValue';

const safeStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Session state still lives in memory when storage is unavailable.
    }
  },
  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage cleanup failures.
    }
  }
};

const readStoredSession = () => {
  const savedToken = safeStorage.get('sp_token');
  const savedUser = safeStorage.get('sp_user');
  if (!savedToken || !savedUser) return { token: null, user: null };

  try {
    const parsedUser = JSON.parse(savedUser);
    if (!parsedUser || typeof parsedUser !== 'object') throw new Error('Invalid stored session');
    return { token: savedToken, user: parsedUser };
  } catch {
    safeStorage.remove('sp_token');
    safeStorage.remove('sp_user');
    return { token: null, user: null };
  }
};

export const AuthProvider = ({ children }) => {
  const [session] = useState(readStoredSession);
  const [user, setUser] = useState(session.user);       // { id, fullName, email, role, ... }
  const [token, setToken] = useState(session.token);
  const [loading] = useState(false);

  // Persist whenever token/user changes
  useEffect(() => {
    if (token && user) {
      safeStorage.set('sp_token', token);
      safeStorage.set('sp_user', JSON.stringify(user));
    } else {
      safeStorage.remove('sp_token');
      safeStorage.remove('sp_user');
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

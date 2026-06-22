/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

const API_URL = import.meta.env.VITE_API_URL;
const TOKEN_KEY = 'scripty_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authUser, setAuthUser] = useState(() => {
    try {
      const stored = localStorage.getItem('scripty_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Sync / clear session if there's a mismatch
  React.useEffect(() => {
    if ((token && !authUser) || (!token && authUser)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('scripty_user');
      setToken(null);
      setAuthUser(null);
    }
  }, [token, authUser]);

  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  const persistSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem('scripty_user', JSON.stringify(user));
    setToken(token);
    setAuthUser(user);
    setAuthError(null);
  };

  const clearSession = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('scripty_user');
    setToken(null);
    setAuthUser(null);
  }, []);

  const login = async (email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Login failed.');
        return false;
      }
      persistSession(data.token, data.user);
      return true;
    } catch (err) {
      setAuthError('Network error. Please check your connection.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginDemo = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Demo login failed.');
        return false;
      }
      persistSession(data.token, data.user);
      return true;
    } catch (err) {
      setAuthError('Network error. Please check your connection.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed.');
        return false;
      }
      persistSession(data.token, data.user);
      return true;
    } catch (err) {
      setAuthError('Network error. Please check your connection.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearSession();
  }, [clearSession]);

  /** Returns headers with Authorization for authenticated API calls */
  const authHeaders = useCallback(() => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [token]);

  return (
    <AuthContext.Provider value={{
      token,
      authUser,
      authError,
      authLoading,
      isAuthenticated: !!token && !!authUser,
      login,
      loginDemo,
      register,
      logout,
      authHeaders,
      clearSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

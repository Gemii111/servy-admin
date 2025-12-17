import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Admin } from '../services/api/auth';
import { mockLogin, type LoginPayload } from '../services/api/auth';

type AuthContextValue = {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'servy_admin_auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // تحميل الحالة من localStorage عند بداية التشغيل
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as { admin: Admin; token: string };
        setAdmin(parsed.admin);
        setToken(parsed.token);
      }
    } catch {
      // تجاهل أي أخطاء parsing
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await mockLogin(payload);
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Login failed');
      }
      setAdmin(res.data.admin);
      setToken(res.data.accessToken);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ admin: res.data.admin, token: res.data.accessToken })
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      admin,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
    }),
    [admin, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};



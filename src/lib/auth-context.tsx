'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  role: 'admin' | 'user';
  has_finance: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateFinanceToggle: (hasFinance: boolean) => Promise<boolean>;
  createUserAccount: (params: {
    username: string;
    password: string;
    fullName?: string;
    hasFinance: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: () => {},
  updateFinanceToggle: async () => false,
  createUserAccount: async () => ({ success: false }),
});

const STORAGE_KEY = 'personal_manager_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        if (saved) {
          const parsed = JSON.parse(saved);
          // Verify with Supabase
          const { data } = await supabase
            .from('profiles')
            .select('id, username, full_name, role, has_finance')
            .eq('id', parsed.id)
            .single();

          if (data) {
            setUser(data as UserProfile);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } else {
            setUser(parsed);
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const trimmedUser = username.trim().toLowerCase();
    const trimmedPass = password.trim();

    try {
      // Query profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, password_hash, full_name, role, has_finance')
        .eq('username', trimmedUser)
        .single();

      if (error || !data) {
        // Fallback check for default admin
        if (trimmedUser === 'huyproplus2004' && trimmedPass === '572004huypromax') {
          const fallbackAdmin: UserProfile = {
            id: 'a0000000-0000-0000-0000-000000000001',
            username: 'huyproplus2004',
            full_name: 'Huy Pro Plus',
            role: 'admin',
            has_finance: true,
          };
          setUser(fallbackAdmin);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackAdmin));
          return { success: true };
        }
        return { success: false, error: 'Tên đăng nhập không tồn tại!' };
      }

      if (data.password_hash !== trimmedPass) {
        return { success: false, error: 'Mật khẩu không chính xác!' };
      }

      const profile: UserProfile = {
        id: data.id,
        username: data.username,
        full_name: data.full_name,
        role: data.role as 'admin' | 'user',
        has_finance: Boolean(data.has_finance),
      };

      setUser(profile);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
      return { success: true };
    } catch {
      return { success: false, error: 'Lỗi kết nối máy chủ xác thực!' };
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateFinanceToggle = useCallback(async (hasFinance: boolean) => {
    if (!user) return false;
    const updated = { ...user, has_finance: hasFinance };
    setUser(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }

    try {
      await supabase
        .from('profiles')
        .update({ has_finance: hasFinance })
        .eq('id', user.id);
      return true;
    } catch {
      return true;
    }
  }, [user]);

  const createUserAccount = useCallback(async (params: {
    username: string;
    password: string;
    fullName?: string;
    hasFinance: boolean;
  }) => {
    if (!user || user.role !== 'admin') {
      return { success: false, error: 'Chỉ Admin mới có quyền thêm tài khoản!' };
    }

    const trimmedUser = params.username.trim().toLowerCase();
    const trimmedPass = params.password.trim();

    if (!trimmedUser || !trimmedPass) {
      return { success: false, error: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!' };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          username: trimmedUser,
          password_hash: trimmedPass,
          full_name: params.fullName || trimmedUser,
          role: 'user',
          has_finance: params.hasFinance,
        })
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message.includes('unique') ? 'Tên đăng nhập đã tồn tại!' : error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        updateFinanceToggle,
        createUserAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

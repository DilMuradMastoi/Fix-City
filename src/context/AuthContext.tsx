import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, email: string, password: string, confirmPassword?: string, avatar?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  quickDemoLogin: (type: 'citizen' | 'admin') => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('fixmycity_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('fixmycity_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = useCallback(async () => {
    const activeToken = localStorage.getItem('fixmycity_token');
    if (!activeToken) {
      setIsLoading(false);
      return;
    }
    try {
      const response = await api.get('/auth/me');
      if (response.data.success && response.data.data) {
        setUser(response.data.data);
        localStorage.setItem('fixmycity_user', JSON.stringify(response.data.data));
      }
    } catch (err) {
      console.warn('Session check failed:', err);
      setUser(null);
      setToken(null);
      localStorage.removeItem('fixmycity_token');
      localStorage.removeItem('fixmycity_user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.data;

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('fixmycity_token', receivedToken);
        localStorage.setItem('fixmycity_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Login failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Network error occurred',
      };
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string, avatar?: string) => {
    try {
      const response = await api.post('/auth/register', {
        name,
        email,
        password,
        confirmPassword,
        avatar,
      });
      if (response.data.success) {
        const receivedToken = response.data.token;
        const receivedUser = response.data.data;

        setToken(receivedToken);
        setUser(receivedUser);
        localStorage.setItem('fixmycity_token', receivedToken);
        localStorage.setItem('fixmycity_user', JSON.stringify(receivedUser));
        return { success: true };
      }
      return { success: false, message: response.data.message || 'Registration failed' };
    } catch (err: any) {
      return {
        success: false,
        message: err.response?.data?.message || err.message || 'Registration failed',
      };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('fixmycity_token');
    localStorage.removeItem('fixmycity_user');
  };

  const quickDemoLogin = async (type: 'citizen' | 'admin') => {
    if (type === 'admin') {
      await login('admin@fixmycity.gov', 'admin123');
    } else {
      await login('marcus@citizen.org', 'citizen123');
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem('fixmycity_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        quickDemoLogin,
        updateUser,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import axios from 'axios';
import api from '@/util/axios';

interface User {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: { name: string };
  rank?: { name: string };
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  register: (...args: any[]) => Promise<void>;
  sendVerificationMail: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AUTH_STORAGE_KEY = 'memoAuthTokens';

interface Tokens {
  accessToken: string;
  refreshToken: string;
}



export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const saveTokens = (tokens: Tokens) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  };

  const clearTokens = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const fetchProfile = async (token: string) => {
    try {
      const res = await api.get('/users/profile/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;
      setUser({
        ...data,
        fullName: `${data.firstName} ${data.lastName}`,
      });
    } catch (error) {
      clearTokens();
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { accessToken, refreshToken } = res.data.data;
      saveTokens({ accessToken, refreshToken });
      await fetchProfile(accessToken);
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string
  ) => {
    setLoading(true);
    if (password !== confirmPassword) {
      setLoading(false);
      throw new Error('Passwords do not match');
    }
    try {
      await api.post('/auth/register', {
        email,
        password,
        confirmPassword,
        firstName,
        lastName,
      });
      await sendVerificationMail(email);
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendVerificationMail = async (email: string) => {
    await api.post('/auth/send-verification-mail', { email });
  };

  const verifyEmail = async (token: string) => {
    const res = await api.post('/auth/verify-email', { token });
    return res.data;
  };

  const logout = () => {
    clearTokens();
  };

  const refreshTokens = async (): Promise<string | null> => {
    if (!refreshToken) return null;
    try {
      const res = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
        res.data;
      saveTokens({ accessToken: newAccessToken, refreshToken: newRefreshToken });
      return newAccessToken;
    } catch {
      clearTokens();
      return null;
    }
  };

  // Axios interceptor for refreshing token
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          refreshToken
        ) {
          originalRequest._retry = true;
          const newToken = await refreshTokens();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, [refreshToken]);

  // Restores session on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      const tokens: Tokens = JSON.parse(stored);
      setAccessToken(tokens.accessToken);
      setRefreshToken(tokens.refreshToken);
      fetchProfile(tokens.accessToken);
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        register,
        logout,
        loading,
        sendVerificationMail,
        verifyEmail,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

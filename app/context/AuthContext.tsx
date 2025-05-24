'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';

interface User {
  fullName?: string; 
  firstName?: string;
  lastName?: string;
  email?: string;
  department?: { name: string };
  rank?: { name: string };
  [key: string]: any; 
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string
  ) => Promise<void>;
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

  // Save tokens to localStorage and state
  const saveTokens = (tokens: Tokens) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(tokens));
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
  };

  // Clear tokens and user info
  const clearTokens = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  // Fetch user profile using accessToken
const fetchProfile = useCallback(async (token: string) => {
  try {
    const res = await fetch(
      'https://memo-integration-server.onrender.com/api/users/profile/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error('Failed to fetch profile');
    const data = await res.json();
    setUser({
      ...data.data,
      fullName: `${data.data.firstName} ${data.data.lastName}`,
    });
  } catch (error) {
    clearTokens();
  }
}, []);




  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        'https://memo-integration-server.onrender.com/api/auth/login',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Login failed');
      }

      const data = await res.json();

      saveTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });

      await fetchProfile(data.data.accessToken);
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
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
      const res = await fetch(
        'https://memo-integration-server.onrender.com/api/auth/register',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password, firstName, confirmPassword, lastName }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Registration failed');
      }

      await sendVerificationMail(email);
    } catch (error) {
      clearTokens();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Send verification mail
  const sendVerificationMail = async (email: string) => {
    try {
      const res = await fetch(
        'https://memo-integration-server.onrender.com/api/auth/send-verification-mail',
        {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Verification mail failed');
      }
    } catch (error) {
      clearTokens();
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token: string) => {
    const res = await fetch(
      'https://memo-integration-server.onrender.com/api/auth/verify-email',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Verification failed');
    }

    return await res.json();
  };

  // Logout
  const logout = () => {
    clearTokens();
  };

  // Refresh tokens function
  const refreshTokens = useCallback(async () => {
    if (!refreshToken) return;
    try {
      const res = await fetch(
        'https://memo-integration-server.onrender.com/api/auth/refresh-token',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }
      );
      if (!res.ok) throw new Error('Failed to refresh token');
      const data = await res.json();
      saveTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      await fetchProfile(data.accessToken);
    } catch {
      clearTokens();
    }
  }, [refreshToken, fetchProfile]);

  // Load tokens from localStorage on mount & fetch profile
  useEffect(() => {
    const restoreSession = async () => {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          const tokens: Tokens = JSON.parse(stored);
          setAccessToken(tokens.accessToken);
          setRefreshToken(tokens.refreshToken);
          await fetchProfile(tokens.accessToken);
        } catch {
          clearTokens();
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, [fetchProfile]);

  // Periodic refresh every 5 minutes
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(() => {
      refreshTokens();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, refreshTokens]);

  return (
    <AuthContext.Provider
      value={{ user, accessToken, login, register, logout, loading, sendVerificationMail, verifyEmail }}
    >
      {children}
    </AuthContext.Provider>
  );
};

//  useAuth hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

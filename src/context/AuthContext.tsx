import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Usuario } from '../types';
import { loginApi, registerApi } from '../services/api';

interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: { email: string; password?: string }) => Promise<void>;
  register: (data: { username: string; email: string; password?: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (credentials: { email: string; password?: string }) => {
    const response = await loginApi(credentials);
    if (response.token) {
      setToken(response.token);
      const loggedUser = response.user || {
        id: 'usr-' + Date.now(),
        username: credentials.email.split('@')[0],
        email: credentials.email
      };
      setUser(loggedUser);
    }
  };

  const register = async (data: { username: string; email: string; password?: string }) => {
    const response = await registerApi(data);
    if (response.token || response.user) {
      const regUser = response.user || {
        id: 'usr-' + Date.now(),
        username: data.username,
        email: data.email
      };
      setToken(response.token || 'mock-reg-token');
      setUser(regUser);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/user';
import { Tenant } from '../types/tenant';
import { authService } from '../services/authService';
import { tenantService } from '../services/tenantService';

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          if (userData.tenantId) {
            const tenantData = await tenantService.findOne(userData.tenantId);
            setTenant(tenantData);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const { token, user: userData } = await authService.login(email, password);
      localStorage.setItem('token', token);
      setUser(userData);
      if (userData.tenantId) {
        const tenantData = await tenantService.findOne(userData.tenantId);
        setTenant(tenantData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  const register = async (userData: any) => {
    try {
      setError(null);
      const { token, user: newUser } = await authService.register(userData);
      localStorage.setItem('token', token);
      setUser(newUser);
      if (newUser.tenantId) {
        const tenantData = await tenantService.findOne(newUser.tenantId);
        setTenant(tenantData);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setTenant(null);
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      setError(null);
      const updatedUser = await authService.updateUser(data);
      setUser(updatedUser);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ user, tenant, loading, error, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
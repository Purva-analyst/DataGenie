import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string) => void;
  register: (email: string, name: string) => void;
  logout: () => void;
  updatePlan: (plan: User['plan']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check local storage for persistent mock session
    const storedUser = localStorage.getItem('dig_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string) => {
    // Mock login
    const newUser: User = {
      id: '1',
      name: email.split('@')[0],
      email,
      plan: 'free',
    };
    setUser(newUser);
    localStorage.setItem('dig_user', JSON.stringify(newUser));
  };

  const register = (email: string, name: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      plan: 'free'
    };
    setUser(newUser);
    localStorage.setItem('dig_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dig_user');
  };

  const updatePlan = (plan: User['plan']) => {
    if (user) {
      const updated = { ...user, plan };
      setUser(updated);
      localStorage.setItem('dig_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updatePlan }}>
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
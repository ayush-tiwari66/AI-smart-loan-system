import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('smartloan_token');
    const savedUser = localStorage.getItem('smartloan_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { user: userData, token: authToken } = res.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('smartloan_token', authToken);
    localStorage.setItem('smartloan_user', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    const { user: userData, token: authToken } = res.data;
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('smartloan_token', authToken);
    localStorage.setItem('smartloan_user', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('smartloan_token');
    localStorage.removeItem('smartloan_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

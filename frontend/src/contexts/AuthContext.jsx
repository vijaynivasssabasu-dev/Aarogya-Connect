import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    if (token && savedRole) {
      api.get('/auth/me')
        .then(({ data }) => { setUser(data.user); setRole(data.role); })
        .catch(() => localStorage.clear())
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setUser(data.user); setRole(data.role);
    return data;
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    setUser(data.user); setRole(data.role);
    return data;
  };

  const logout = () => { localStorage.clear(); setUser(null); setRole(null); };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

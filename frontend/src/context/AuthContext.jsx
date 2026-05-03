import { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_USERS, LS_AUTH_KEY } from '../utils/constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(LS_AUTH_KEY)); } catch { return null; }
  });

  const login = useCallback((email, password, remember = false) => {
    const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
    if (!found) return { ok: false, error: 'Invalid email or password' };
    const { password: _, ...safe } = found;
    setUser(safe);
    if (remember) localStorage.setItem(LS_AUTH_KEY, JSON.stringify(safe));
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LS_AUTH_KEY);
  }, []);

  const register = useCallback((data) => {
    const exists = MOCK_USERS.find((u) => u.email === data.email);
    if (exists) return { ok: false, error: 'Email already registered' };
    return { ok: true };
  }, []);

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates };
      localStorage.setItem(LS_AUTH_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, register, updateProfile, isAdmin: user?.role === 'Admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('sonora_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data.user);
      } catch (err) {
        console.error('Failed to load user:', err);
        localStorage.removeItem('sonora_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('sonora_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (username, email, password) => {
    const res = await authAPI.register(username, email, password);
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('sonora_token', newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('sonora_token');
    setToken(null);
    setUser(null);
  };

  const quickLoginAdmin = () => login('admin@sonora.io', 'admin123');
  const quickLoginDemo = () => login('demo@sonora.io', 'user123');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        quickLoginAdmin,
        quickLoginDemo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

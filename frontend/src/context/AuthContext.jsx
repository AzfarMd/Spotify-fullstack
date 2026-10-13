import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredUser, setStoredUser, setToken } from '../api/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [loading, setLoading] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [backendOnline, setBackendOnline] = useState(false);

  // Check backend server availability on mount
  useEffect(() => {
    async function checkServer() {
      const isOnline = await api.music.checkHealth();
      setBackendOnline(isOnline);
    }
    checkServer();
    const interval = setInterval(checkServer, 15000);
    return () => clearInterval(interval);
  }, []);

  const login = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const res = await api.auth.login({ username, email, password });
      setUser(res.user);
      setAuthModalOpen(false);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async ({ username, email, password, role }) => {
    setLoading(true);
    try {
      const res = await api.auth.register({ username, email, password, role });
      setUser(res.user);
      setAuthModalOpen(false);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.auth.logout();
    setUser(null);
  };

  // Helper for quick testing toggle
  const switchRole = (newRole) => {
    if (!user) {
      const testUser = {
        id: `usr_${Date.now()}`,
        username: newRole === 'artist' ? 'ArtistDemo' : 'ListenerDemo',
        email: `${newRole}@spotify.demo`,
        role: newRole,
      };
      setStoredUser(testUser);
      setToken(`mock_token_${Date.now()}`);
      setUser(testUser);
    } else {
      const updated = { ...user, role: newRole };
      setStoredUser(updated);
      setUser(updated);
    }
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuth = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isArtist: user?.role === 'artist',
        loading,
        authModalOpen,
        authMode,
        backendOnline,
        login,
        register,
        logout,
        switchRole,
        openAuth,
        closeAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

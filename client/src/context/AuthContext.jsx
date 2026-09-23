import React, { createContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore current user on initial mount if token exists
  useEffect(() => {
    let isMounted = true;

    const restoreUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken) {
        if (isMounted) setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');
        if (isMounted && response.data.success) {
          setUser(response.data.data.user);
          setToken(storedToken);
        }
      } catch (err) {
        // Token is invalid or expired: clear local storage and state
        localStorage.removeItem('token');
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    restoreUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // Login action
  const login = useCallback(async (email, password) => {
    setError(null);
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.message || 'Login failed. Please check your credentials.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Register action (strictly donor or ngo)
  const register = useCallback(async (userData) => {
    setError(null);
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.success) {
        const { token: receivedToken, user: receivedUser } = response.data.data;
        localStorage.setItem('token', receivedToken);
        setToken(receivedToken);
        setUser(receivedUser);
        return { success: true, user: receivedUser };
      }
      return { success: false, message: response.data.message };
    } catch (err) {
      const message = err.message || 'Registration failed. Please check your information.';
      setError(message);
      return { success: false, message };
    }
  }, []);

  // Logout action (client-side removal per documented API specification)
  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // Ignore network errors during logout since client token removal is the primary mechanism
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user && token),
    role: user?.role || null,
    isDonor: user?.role === 'donor',
    isNgo: user?.role === 'ngo',
    isAdmin: user?.role === 'admin',
    isVerifiedNgo: user?.role === 'ngo' && user?.verificationStatus === 'VERIFIED',
    isPendingNgo: user?.role === 'ngo' && user?.verificationStatus === 'PENDING',
    isRejectedNgo: user?.role === 'ngo' && user?.verificationStatus === 'REJECTED'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if token exists on mount and restore user data
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken) {
      setToken(savedToken);
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (err) {
          console.error('Failed to parse saved user:', err);
        }
      }
      // Fetch fresh user data from backend to ensure favorites are up to date
      fetchUser(savedToken);
    }
  }, []);

  // Fetch user data from backend
  const fetchUser = async (authToken) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      };
      const { data } = await axiosInstance.get('/auth/me', config);
      setUser({
        _id: data._id,
        name: data.name,
        email: data.email,
        favorites: data.favorites || [],
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    }
  };

  // Register user
  const register = async (name, email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post(
        '/auth/register',
        { name, email, password }
      );
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        favorites: data.favorites || [],
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axiosInstance.post(
        '/auth/login',
        { email, password }
      );
      const userData = {
        _id: data._id,
        name: data.name,
        email: data.email,
        favorites: data.favorites || [],
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(data.token);
      setUser(userData);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    register,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
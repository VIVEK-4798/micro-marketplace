import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  const loadToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        setUserToken(token);
        // retrieve favorites if needed
        const res = await api.get('/auth/me');
        setFavorites(res.data.favorites || []);
      }
    } catch (e) {
      console.log('loadToken error', e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadToken();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const token = res.data.token;
    await AsyncStorage.setItem('userToken', token);
    setUserToken(token);
    // fetch user data for favorites
    const me = await api.get('/auth/me');
    setFavorites(me.data.favorites || []);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    setUserToken(null);
    setFavorites([]);
  };

  const toggleFavorite = (productId) => {
    if (favorites.includes(productId)) {
      setFavorites(favorites.filter((id) => id !== productId));
      api.delete(`/products/${productId}/favorite`);
    } else {
      setFavorites([...favorites, productId]);
      api.post(`/products/${productId}/favorite`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userToken,
        loading,
        login,
        logout,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
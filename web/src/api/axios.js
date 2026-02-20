import axios from 'axios';

// In production, use the full backend URL. In dev, use relative path (proxied by Vite)
const baseURL = import.meta.env.VITE_API_URL || '/api';

const instance = axios.create({
  baseURL,
});

// attach token
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default instance;
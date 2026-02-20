import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// replace YOUR_LOCAL_IP with your machine's IP on the network
const BASE_URL = 'http://YOUR_LOCAL_IP:5000';

const instance = axios.create({
  baseURL: BASE_URL,
});

// attach token automatically if available
instance.interceptors.request.use(async (config) => {
  if (config.headers && !config.headers.Authorization) {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default instance;
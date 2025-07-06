import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE + '/api',
  timeout: 10000, // 10 second timeout
});

api.interceptors.request.use(
  async (config) => {
    console.log('Axios request:', config.method?.toUpperCase(), config.url);
    console.log('Request headers:', config.headers);
    
    // Don't add Authorization header for auth endpoints (register, login)
    if (config.url?.includes('/auth/register') || config.url?.includes('/auth/login')) {
      console.log('Skipping Authorization header for auth endpoint');
      return config;
    }

    const sessionToken = await AsyncStorage.getItem('sessionToken');

    if (sessionToken) {
      config.headers.Authorization = sessionToken;
      console.log('Added Authorization header');
    }

    return config;
  },
  (error) => {
    console.error('Axios request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('Axios response:', response.status, response.config.url);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Axios response error:', error.response?.status, error.config?.url);
    console.error('Error data:', error.response?.data);
    return Promise.reject(error);
  }
);

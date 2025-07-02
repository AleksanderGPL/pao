import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE + '/api',
});

api.interceptors.request.use(
  async (config) => {
    const sessionToken = await AsyncStorage.getItem('sessionToken');

    if (sessionToken) {
      config.headers.Authorization = sessionToken;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

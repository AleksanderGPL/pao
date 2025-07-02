import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE + '/api/auth',
  headers: {
    "Authorization": `Bearer ${await AsyncStorage.getItem("token")}`,
  }
});
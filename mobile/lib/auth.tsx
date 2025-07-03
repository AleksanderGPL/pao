import { useEffect } from 'react';
import { router, usePathname, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import { api } from './axios';

export async function checkUserAuth(pathName: string) {
  try {
    const sessionToken = await AsyncStorage.getItem('sessionToken');

    if (sessionToken) {
      // User is authenticated, redirect to main app

      api
        .get<{ name: string }>('/auth')
        .then(async (res) => {
          if (res.data.name !== (await AsyncStorage.getItem('username'))) {
            await AsyncStorage.setItem('username', res.data.name);
          }
        })
        .catch((err) => {
          if (err.response.status === 401) {
            router.replace('/username');
          }
        });

      if (pathName === '/username') {
        router.replace('/(tabs)');
      }
    } else {
      // User is not authenticated, redirect to username screen
      router.replace('/username');
    }
  } catch (error) {
    console.error('Error checking username:', error);
    // If there's an error, default to username screen
    router.replace('/username');
  }
}

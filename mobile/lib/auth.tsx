import { useEffect } from 'react';
import { router, usePathname, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { Text } from '@/components/Text';
import { api } from './axios';
import { useUsernameStore } from './username-store';

export async function checkUserAuth(pathName: string) {
  try {
    const sessionToken = await AsyncStorage.getItem('sessionToken');
    const { username, setUsername, loadUsername } = useUsernameStore.getState();

    // Load username from AsyncStorage on first run
    if (username === null) {
      await loadUsername();
    }

    if (sessionToken) {
      // User is authenticated, redirect to main app

      api
        .get<{ name: string }>('/auth')
        .then(async (res) => {
          const currentUsername = useUsernameStore.getState().username;
          if (res.data.name !== currentUsername) {
            await setUsername(res.data.name);
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

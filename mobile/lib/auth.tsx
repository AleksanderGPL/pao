import { useEffect } from 'react';
import { router, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from 'react-native';
import { Text } from '@/components/Text';

export async function checkUserAuth() {
  try {
    const username = await AsyncStorage.getItem('username');

    if (username) {
      // User has already entered username, redirect to main app
      router.replace('/(tabs)');
    } else {
      // User hasn't entered username, redirect to username screen
      router.replace('/username');
    }
  } catch (error) {
    console.error('Error checking username:', error);
    // If there's an error, default to username screen
    router.replace('/username');
  }
}

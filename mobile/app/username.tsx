import { View } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  function isValidUsername(name: string): boolean {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 20;
  }

  async function handleContinue() {
    if (!isValidUsername(username)) return;

    setIsLoading(true);
    try {
      // Store username in AsyncStorage
      await AsyncStorage.setItem('username', username.trim());

      // Navigate to main app
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving username:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View className="flex-1 justify-center p-8">
      <View className="gap-6">
        <View className="items-center gap-2">
          <Text className="text-center text-3xl font-bold">Welcome to Pao!</Text>
          <Text className="text-muted-foreground text-center">
            Enter your username to get started
          </Text>
        </View>

        <View className="gap-4">
          <Input
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            maxLength={20}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Button onPress={handleContinue} disabled={!isValidUsername(username) || isLoading}>
            <Text className={!isValidUsername(username) ? 'text-muted-foreground' : ''}>
              {isLoading ? 'Saving...' : 'Continue'}
            </Text>
          </Button>

          {username.trim().length > 0 && !isValidUsername(username) && (
            <Text className="text-center text-sm text-red-500">
              Username must be between 2-20 characters
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

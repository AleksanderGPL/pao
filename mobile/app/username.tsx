import { View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { api } from '@/lib/axios';
import { useUsernameStore } from '@/lib/username-store';

export default function UsernameScreen() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showError, setShowError] = useState(false);
  const router = useRouter();
  const { setUsername: setUsernameInStore } = useUsernameStore();
  const { redirect } = useLocalSearchParams();

  function isValidUsername(name: string): boolean {
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 20;
  }

  function Capitalize(str: string){
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  async function handleContinue() {
    if (!isValidUsername(username)) {
      setShowError(true);
      setTimeout(() => setShowError(false), 2000);
      return;
    }

    setIsLoading(true);
    try {
      // Store username in both AsyncStorage and Zustand store
      const response = await api.post<{ sessionToken: string }>('/auth/register', {
        name: username.trim(),
      });

      await setUsernameInStore(Capitalize(username.trim()));
      await AsyncStorage.setItem('sessionToken', response.data.sessionToken);

      // Navigate to main app
      if (redirect) {
        router.replace({
          pathname: decodeURIComponent(redirect as string),
        });
      } else {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Error saving username:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled">
        <View className="justify-center p-8 pt-8">
          <View className="gap-6">
            <View className="items-center gap-2">
              <Text className="text-center text-3xl font-bold">Welcome to Pao!</Text>
              <Text className="text-center text-muted-foreground">
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
              <View>
                <Button
                  className={!isValidUsername(username) ? 'bg-[#8459FF]' : 'bg-[#8459FF]'}
                  onPress={handleContinue}
                  disabled={isLoading}>
                  <Text
                    className={
                      !isValidUsername(username) ? 'text-muted-foreground text-white' : ''
                    }>
                    {isLoading ? 'Saving...' : 'Continue'}
                  </Text>
                </Button>
                {showError || (username.trim().length > 0 && !isValidUsername(username)) ? (
                  <Text className="text-center text-sm text-red-500">
                    Username must be between 2-20 characters
                  </Text>
                ) : (
                  // empty space
                  <View className="h-[20px]"></View>
                )}
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

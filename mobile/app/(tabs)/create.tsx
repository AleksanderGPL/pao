import { useState } from 'react';
import { Alert, View } from 'react-native';
import { BackButton } from 'components/base/BackButton';

import { ThemedText } from 'components/ThemedText';
import { ThemedView } from 'components/ThemedView';
import { Container } from 'components/Container';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { Text } from 'components/Text';
import { api } from '@/lib/axios';
import { router } from 'expo-router';
import { useUsernameStore } from '@/lib/username-store';

export default function CreateGameScreen() {
  const [gameName, setGameName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const { username } = useUsernameStore();

  const handleMaxPlayersChange = (text: string) => {
    // Only allow numeric characters
    const numericText = text.replace(/[^0-9]/g, '');

    // Cap at 100 players
    const numValue = parseInt(numericText) || 0;
    if (numValue > 100) {
      Alert.alert('Maximum Players', 'Maximum players is capped at 100. Value has been adjusted.');
      setMaxPlayers('100');
    } else {
      setMaxPlayers(numericText);
    }
  };

  const handleCreateGame = async () => {
    if (
      !maxPlayers.trim() ||
      isNaN(Number(maxPlayers)) ||
      Number(maxPlayers) < 2 ||
      Number(maxPlayers) > 100
    ) {
      Alert.alert('Error', 'Please enter a valid number of max players (2-100)');
      return;
    }

    setIsCreating(true);
    try {
      const res = await api.post<{ code: string }>('/game', {
        name: gameName.trim() ? gameName : `${username}'s game`,
        maxPlayers: Number(maxPlayers),
      });

      router.push({
        pathname: '/game',
        params: { gameCode: res.data.code },
      });
    } catch (error: any) {
      console.error('Error creating game:', error);

      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error',
          'You need to be logged in to create a game. Please restart the app and try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to username screen to re-authenticate
                router.push('/username');
              },
            },
          ]
        );
      } else if (error.response?.status === 400) {
        Alert.alert('Error', 'Invalid game data. Please check your input and try again.');
      } else {
        Alert.alert('Error', 'Failed to create game. Please try again later.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <View className="h-full flex-1 p-5 pt-8">
      {/* Back Button */}
      <View className="mb-4">
        <BackButton onPress={() => router.replace('/username')} />
      </View>
      <View className="w-full items-center pb-6">
        <Text className="text-center text-4xl font-extrabold leading-[3.2rem]">
          Create New Game
        </Text>
      </View>

      <View className="space-y-2">
        <View>
          <Text className="mb-2 font-medium">Game Name</Text>
          <Input
            placeholder={`${username}'s game`}
            value={gameName}
            onChangeText={setGameName}
            className="mb-4"
          />
        </View>

        <View>
          <Text className="mb-2 font-medium">Max Players</Text>
          <Input
            placeholder="Enter max players (2-100)"
            value={maxPlayers}
            onChangeText={handleMaxPlayersChange}
            keyboardType="numeric"
            inputMode="numeric"
            className="mb-6"
          />
        </View>

        <Button onPress={handleCreateGame} disabled={isCreating} className="mt-4">
          <Text>{isCreating ? 'Creating...' : 'Create Game'}</Text>
        </Button>
      </View>
    </View>
  );
}

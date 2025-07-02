import { useState } from 'react';
import { View, Alert } from 'react-native';

import { ThemedText } from 'components/ThemedText';
import { ThemedView } from 'components/ThemedView';
import { Container } from 'components/Container';
import { Input } from 'components/Input';
import { Button } from 'components/Button';
import { Text } from 'components/Text';
import { api } from '@/lib/axios';

export default function CreateGameScreen() {
  const [gameName, setGameName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');

  const handleMaxPlayersChange = (text: string) => {
    // Only allow numeric characters
    const numericText = text.replace(/[^0-9]/g, '');
    setMaxPlayers(numericText);
  };

  const handleCreateGame = async () => {
    if (!gameName.trim()) {
      Alert.alert('Error', 'Please enter a game name');
      return;
    }
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }
    if (!maxPlayers.trim() || isNaN(Number(maxPlayers)) || Number(maxPlayers) < 2) {
      Alert.alert('Error', 'Please enter a valid number of max players (minimum 2)');
      return;
    }

    const res = await api.post<{ code: string }>('/game', {
      name: gameName,
      maxPlayers: Number(maxPlayers),
    });

    Alert.alert(
      'Game Created!',
      `Game: ${gameName}\nHost: ${playerName}\nMax Players: ${maxPlayers}\nCode: ${res.data.code}`
    );
  };

  return (
    <Container>
      <Text className="mb-6 text-center text-2xl font-bold">Create New Game</Text>

      <View className="space-y-2">
        <View>
          <Text className="mb-2 font-medium">Game Name</Text>
          <Input
            placeholder="Enter game name"
            value={gameName}
            onChangeText={setGameName}
            className="mb-4"
          />
        </View>

        <View>
          <Text className="mb-2 font-medium">Max Players</Text>
          <Input
            placeholder="Enter max players"
            value={maxPlayers}
            onChangeText={handleMaxPlayersChange}
            keyboardType="numeric"
            inputMode="numeric"
            className="mb-6"
          />
        </View>

        <Button onPress={handleCreateGame} className="mt-4">
          <Text>Create Game</Text>
        </Button>
      </View>
    </Container>
  );
}

import LoadingScreen from '@/components/screens/loading';
import { Text } from '@/components/Text';
import { useState } from 'react';
import { View } from 'react-native';

export default function GameScreen() {
  const [hasConnected, setHasConnected] = useState(false);

  const [players, setPlayers] = useState<[]>([]);
  if (!hasConnected) {
    return <LoadingScreen />;
  }

  return (
    <View>
      <Text>Game</Text>
    </View>
  );
}

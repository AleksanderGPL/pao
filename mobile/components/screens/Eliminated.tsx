import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ShadowView } from '../base/ShadowView';

export default function EliminatedScreen({ onBackToLobby }: { onBackToLobby?: () => void }) {
  const router = useRouter();

  const handleBackToLobby = () => {
    if (onBackToLobby) {
      onBackToLobby();
    } else {
      // Fallback to navigation if no callback provided
      router.push('/(tabs)');
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-red-50 p-6">
      <ShadowView className="w-full max-w-sm items-center rounded-3xl bg-white p-8">
        <Text className="mb-4 text-6xl">💀</Text>

        <Text className="mb-2 text-center text-3xl font-bold text-red-600">You&apos;re Out!</Text>

        <Text className="mb-8 text-center text-lg text-gray-600">Better luck next time</Text>

        <Button onPress={handleBackToLobby} className="w-full">
          <Text>Watch Game</Text>
        </Button>
      </ShadowView>
    </View>
  );
}

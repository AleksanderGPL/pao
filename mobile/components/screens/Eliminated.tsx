import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Text';
import { Button } from '@/components/Button';

export default function EliminatedScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center justify-center bg-red-50 p-6">
      <View className="w-full max-w-sm items-center rounded-3xl bg-white p-8 shadow-lg">
        <Text className="mb-4 text-6xl">💀</Text>

        <Text className="mb-2 text-center text-3xl font-bold text-red-600">You're Out!</Text>

        <Text className="mb-8 text-center text-lg text-gray-600">Better luck next time</Text>

        <Button onPress={() => router.push('/(tabs)')} className="w-full">
          <Text>Back to Lobby</Text>
        </Button>
      </View>
    </View>
  );
}

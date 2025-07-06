import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { ShadowView } from '../base/ShadowView';
import { getShotImageUrl } from '@/lib/axios';
import { RefObject } from 'react';
import { Image } from 'expo-image';

interface EliminatedScreenProps {
  onBackToLobby?: () => void;
  gameCode: string;
  targetId: RefObject<number | null>;
}

export default function EliminatedScreen({
  onBackToLobby,
  gameCode,
  targetId,
}: EliminatedScreenProps) {
  const router = useRouter();

  const handleBackToLobby = () => {
    if (onBackToLobby) {
      onBackToLobby();
    } else {
      // Fallback to navigation if no callback provided
      router.push('/(tabs)');
    }
  };

  // Construct the shot image URL if we have the necessary data
  const eliminationImageUrl = getShotImageUrl(gameCode, targetId.current!);

  return (
    <View className="flex-1 items-center justify-center bg-red-50 p-6">
      <ShadowView className="w-full max-w-sm items-center rounded-3xl bg-white p-8">
        <Text className="mb-4 text-6xl">💀</Text>

        <Text className="mb-2 text-center text-3xl font-bold text-red-600">You&apos;re Out!</Text>

        <Text className="mb-6 text-center text-lg text-gray-600">Better luck next time</Text>

        {/* Show elimination shot image if available */}
        {eliminationImageUrl && (
          <View className="mb-6 w-full">
            <Text className="mb-2 text-center text-sm font-medium text-gray-700">
              Your elimination shot:
            </Text>
            <Image
              source={eliminationImageUrl}
              className="w-full rounded-lg border-2 border-red-200"
              contentFit="cover"
              style={{
                aspectRatio: 0.75,
              }}
            />
          </View>
        )}

        <Button onPress={handleBackToLobby} className="w-full">
          <Text>Watch Game</Text>
        </Button>
      </ShadowView>
    </View>
  );
}

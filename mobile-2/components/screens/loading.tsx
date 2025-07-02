import { View, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import Animated, {
  useSharedValue,
  withRepeat,
  withTiming,
  useAnimatedStyle,
  Easing,
} from 'react-native-reanimated';

import { Text } from '@/components/Text';
import { Button } from '@/components/Button';

export default function LoadingScreen() {
  const router = useRouter();
  const { gameCode } = useLocalSearchParams<{ gameCode: string }>();
  const [isJoining, setIsJoining] = useState(true);

  // Animation values
  const opacity = useSharedValue(0.3);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Start animations
    opacity.value = withRepeat(
      withTiming(1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    console.log('Attempting to join game with code:', gameCode);
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ scale: scale.value }],
    };
  });

  if (!isJoining) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-10">
        <View className="items-center gap-6">
          <Text className="text-2xl font-semibold text-green-600">Success!</Text>
          <Text className="text-center text-gray-600">Ready to join game: {gameCode}</Text>
          <View className="gap-3">
            <Button
              onPress={() => {
                // TODO: Navigate to game screen
                console.log('Navigate to game');
              }}>
              <Text>Enter Game</Text>
            </Button>
            <Button variant="outline" onPress={() => router.push('/(tabs)')}>
              <Text>Back to Scan</Text>
            </Button>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center bg-white p-10">
      <View className="items-center gap-8">
        <Animated.View style={animatedStyle} className="items-center justify-center">
          <View className="h-20 w-20 items-center justify-center rounded-full bg-blue-100">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        </Animated.View>

        <View className="items-center gap-2">
          <Text className="text-xl font-semibold">Joining Game</Text>
          <Text className="text-center text-gray-600">Code: {gameCode}</Text>
          <Text className="text-center text-sm text-gray-500">
            Please wait while we connect you...
          </Text>
        </View>

        <Button variant="outline" onPress={() => router.back()}>
          <Text>Cancel</Text>
        </Button>
      </View>
    </View>
  );
}

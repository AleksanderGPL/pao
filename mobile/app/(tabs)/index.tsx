import { Alert, Platform, View, useWindowDimensions, SafeAreaView } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { useUsernameStore } from '@/lib/username-store';
import { QrCode } from 'lucide-react-native';
import { Icon } from 'components/base/LucideIcon';

import { ThemedText } from 'components/ThemedText';
import { ThemedView } from 'components/ThemedView';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';
import { BackButton } from 'components/base/BackButton';
import { ShadowView } from 'components/base/ShadowView';

export default function HomeScreen() {
  const [gameCode, setGameCode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const router = useRouter();
  const { username } = useUsernameStore();

  // Reset QR scanning state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setHasScanned(false);
      setGameCode('');
    }, [])
  );

  function isValidGameCode(code: string): boolean {
    const trimmedCode = code.trim();
    return trimmedCode.length === 8 && /^[A-Za-z]+$/.test(trimmedCode);
  }

  function handleJoinGame() {
    router.push({
      pathname: '/game',
      params: { gameCode: gameCode.trim() },
    });
  }

  function handleBarcodeScanned({ type, data }: { type: string; data: string }) {
    if (hasScanned) return; // Prevent multiple scans

    console.log('QR Code scanned:', data);
    setGameCode(data);
    setHasScanned(true); // Mark as scanned to prevent multiple scans

    // Navigate to loading screen immediately after scanning
    router.push({
      pathname: '/game',
      params: { gameCode: data.trim() },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <View
        className="h-full flex-1 px-4 pt-8 md:px-6 lg:px-8 max-w-[500px] md:max-w-none self-center w-full"
        style={{
          paddingTop: Platform.OS === 'android' ? 32 : 24,
        }}>
        {/* Back Button */}
        <View className="mb-2 sm:mb-4">
          <BackButton onPress={() => router.replace('/username')} />
        </View>
        <View className="w-full items-center pb-6">
          <Text
            className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold text-center leading-tight sm:leading-snug lg:leading-normal xl:leading-relaxed"
          >
            {username ? `Welcome ` : 'Join a game'}
            {username && (
              <Text className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold">
                {username}!
              </Text>
            )}
          </Text>
          <Text
            className="text-sm sm:text-base lg:text-lg xl:text-xl text-gray-500 text-center mt-2"
          >
            {username
              ? 'Ready to play? Scan a code or enter one below to join a game.'
              : 'Scan a QR code or enter a game code to get started.'}
          </Text>
        </View>

        <View>
          <View
            className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-stretch lg:items-start justify-center w-full"
          >
            {/* Camera View */}
            <View
              className="items-center max-w-[400px] self-center w-full lg:w-1/2 lg:flex-1 aspect-square lg:aspect-[3/4] min-h-[180px] sm:min-h-[260px] lg:min-h-[400px] max-h-[400px] lg:max-h-[500px]">
              <BlurView
                intensity={40}
                tint="light"
                style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden' }}
              >
                {/* Camera or fallback content goes here */}
              </BlurView>
              <ShadowView style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden' }}>
                {/* QR Code Icon in top left when camera is active */}
                {permission && permission.granted && !hasScanned && (
                  <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                    <Icon icon={QrCode} size={24} className="text-white/80 sm:w-8 sm:h-8" />
                  </View>
                )}
                {!permission ? (
                  <View className="size-full bg-black items-center justify-center rounded-lg bg-gray-200" style={{ borderRadius: 24 }}>
                    <Text className="text-center text-gray-500 text-sm sm:text-base">Loading camera...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200 p-4" style={{ borderRadius: 24 }}>
                    <Text className="mb-4 text-center text-gray-700 text-sm sm:text-base">
                      Camera access needed for QR scanning
                    </Text>
                    <Button onPress={requestPermission}>
                      <Text>Grant Permission</Text>
                    </Button>
                  </View>
                ) : hasScanned ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200" style={{ borderRadius: 24 }}>
                    <Text className="text-center text-gray-500 text-sm sm:text-base">QR Code scanned! Redirecting...</Text>
                  </View>
                ) : (
                  <CameraView
                    style={{ width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden' }}
                    facing="back"
                    barcodeScannerSettings={{
                      barcodeTypes: ['qr'],
                    }}
                    onBarcodeScanned={handleBarcodeScanned}
                  />
                )}
              </ShadowView>
            </View>
            {/* Input Section */}
            <View
              className="gap-2 mt-2 sm:mt-4 lg:mt-0 lg:ml-8 lg:flex-1 lg:w-1/2 max-w-[400px] self-center lg:self-start justify-center"
            >
              <Input
                placeholder="Enter game code"
                value={gameCode}
                onChangeText={(text) => {
                  setGameCode(text);
                }}
                className="text-sm sm:text-base py-2 sm:py-3"
              />
              <Button variant={'outline'} onPress={handleJoinGame} className="py-2 sm:py-3">
                <Text className={`${!isValidGameCode(gameCode) ? 'text-muted-foreground' : ''} text-sm sm:text-base`}>
                  Join Game
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

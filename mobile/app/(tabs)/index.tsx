import { Alert, Platform, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { useUsernameStore } from '@/lib/username-store';

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
    if (!isValidGameCode(gameCode)) {
      Alert.alert('Invalid Game Code', 'Please enter a valid game code');
      return;
    }
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
    <View className="h-full flex-1 p-5">
      {/* Back Button */}
      <View className="mb-4">
        <BackButton onPress={() => router.replace('/username')} />
      </View>
      <View className="w-full items-center pb-6">
        <Text className="text-4xl font-extrabold text-center leading-[3.2rem]">
          {username ? `Welcome ` : 'Join a game'}
          {username && (
            <Text className="text-4xl font-extrabold">{username}!</Text>
          )}
        </Text>
        <Text className="text-lg text-gray-500 text-center mt-2">
          {username
            ? 'Ready to play? Scan a code or enter one below to join a game.'
            : 'Scan a QR code or enter a game code to get started.'}
        </Text>
      </View>

      <View>
        <View>
          <View className="gap-4">
            {/* Camera View */}
            <View className="w-full items-center" style={{ aspectRatio: 3 / 4 }}>
              <BlurView intensity={40} tint="light" style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden' }}>
                {/* Camera or fallback content goes here */}
              </BlurView>
              <ShadowView style={{ position: 'absolute', width: '100%', height: '100%', borderRadius: 24, overflow: 'hidden' }}>
                {!permission ? (
                  <View className="size-full bg-black items-center justify-center rounded-lg bg-gray-200" style={{ borderRadius: 24 }}>
                    <Text className="text-center text-gray-500">Loading camera...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200 p-4" style={{ borderRadius: 24 }}>
                    <Text className="mb-4 text-center text-gray-700">
                      Camera access needed for QR scanning
                    </Text>
                    <Button onPress={requestPermission}>
                      <Text>Grant Permission</Text>
                    </Button>
                  </View>
                ) : hasScanned ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200" style={{ borderRadius: 24 }}>
                    <Text className="text-center text-gray-500">QR Code scanned! Redirecting...</Text>
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
            <View className="gap-2">
              <Input
                placeholder="Enter game code"
                value={gameCode}
                onChangeText={(text) => {
                  setGameCode(text);
                }}
              />
              <Button variant={'outline'} onPress={handleJoinGame}>
                <Text className={!isValidGameCode(gameCode) ? 'text-muted-foreground' : ''}>
                  Join Game
                </Text>
              </Button>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

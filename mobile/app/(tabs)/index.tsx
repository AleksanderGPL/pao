import {
  Alert,
  Platform,
  View,
  useWindowDimensions,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
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
  const [cameraKey, setCameraKey] = useState(0);
  const router = useRouter();
  const { username } = useUsernameStore();

  // Reset QR scanning state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      setHasScanned(false);
      setGameCode('');
      // Force camera restart by changing the key
      setCameraKey((prev) => prev + 1);
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

    let extractedGameCode = data;

    // Check if the scanned data is a URL from our deployed website
    if (data.includes(process.env.EXPO_PUBLIC_DEPLOY_LINK?.toString()!)) {
      try {
        console.log('data', data);
        const url = new URL(data);
        const gameCodeParam = url.searchParams.get('gameCode');
        if (gameCodeParam) {
          extractedGameCode = gameCodeParam;
          console.log('Extracted game code from URL:', extractedGameCode);
        }
      } catch (error) {
        extractedGameCode = data;
        console.error('Error parsing URL:', error);
      }
    }

    setGameCode(extractedGameCode);
    setHasScanned(true); // Mark as scanned to prevent multiple scans

    // Navigate to loading screen immediately after scanning
    router.push({
      pathname: '/game',
      params: { gameCode: extractedGameCode.trim() },
    });
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View
            className="h-full w-full max-w-[500px] flex-1 self-center px-4 pt-8 md:max-w-none md:px-6 lg:px-8"
            style={{
              paddingTop: Platform.OS === 'android' ? 32 : 24,
            }}>
            {/* Back Button */}
            <View className="mb-2 sm:mb-4">
              <BackButton onPress={() => router.replace('/username')} />
            </View>
            <View className="w-full items-center pb-6">
              <Text className="text-center text-xl font-extrabold leading-tight sm:text-2xl lg:text-3xl xl:text-4xl">
                {username ? `Welcome ` : 'Join a game'}
                {username && (
                  <Text className="text-xl font-extrabold sm:text-2xl lg:text-3xl xl:text-4xl">
                    {username}!
                  </Text>
                )}
              </Text>
              <Text className="mt-2 text-center text-xs text-gray-500 sm:text-sm lg:text-base xl:text-lg">
                {username
                  ? 'Ready to play? Scan a code or enter one below to join a game.'
                  : 'Scan a QR code or enter a game code to get started.'}
              </Text>
            </View>

            <View>
              <View className="flex w-full flex-col items-stretch justify-center gap-4 lg:flex-row lg:items-start lg:gap-8">
                {/* Camera View */}
                <View className="aspect-square max-h-[400px] min-h-[180px] w-full max-w-[400px] items-center self-center sm:min-h-[260px] lg:aspect-[3/4] lg:max-h-[500px] lg:min-h-[400px] lg:w-1/2 lg:flex-1">
                  <BlurView
                    intensity={40}
                    tint="light"
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 24,
                      overflow: 'hidden',
                    }}>
                    {/* Camera or fallback content goes here */}
                  </BlurView>
                  <ShadowView
                    style={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: 24,
                      overflow: 'hidden',
                    }}>
                    {/* QR Code Icon in top left when camera is active */}
                    {permission && permission.granted && !hasScanned && (
                      <View style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
                        <Icon icon={QrCode} size={24} className="text-white/80 sm:h-8 sm:w-8" />
                      </View>
                    )}
                    {!permission ? (
                      <View
                        className="size-full items-center justify-center rounded-lg bg-black bg-gray-200"
                        style={{ borderRadius: 24 }}>
                        <Text className="text-center text-sm text-gray-500 sm:text-base">
                          Loading camera...
                        </Text>
                      </View>
                    ) : !permission.granted ? (
                      <View
                        className="size-full items-center justify-center rounded-lg bg-gray-200 p-4"
                        style={{ borderRadius: 24 }}>
                        <Text className="mb-4 text-center text-sm text-gray-700 sm:text-base">
                          Camera access needed for QR scanning
                        </Text>
                        <Button onPress={requestPermission}>
                          <Text>Grant Permission</Text>
                        </Button>
                      </View>
                    ) : hasScanned ? (
                      <View
                        className="size-full items-center justify-center rounded-lg bg-gray-200"
                        style={{ borderRadius: 24 }}>
                        <Text className="text-center text-sm text-gray-500 sm:text-base">
                          QR Code scanned! Redirecting...
                        </Text>
                      </View>
                    ) : (
                      <CameraView
                        key={cameraKey}
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: 24,
                          overflow: 'hidden',
                        }}
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
                <View className="m-4 w-full max-w-[400px] gap-4 self-center lg:ml-8 lg:mt-0 lg:w-1/2 lg:flex-1 lg:justify-center lg:self-start">
                  <Input
                    placeholder="Enter game code"
                    value={gameCode}
                    onChangeText={(text) => {
                      setGameCode(text.toUpperCase());
                    }}
                    autoCapitalize="characters"
                    className="w-full py-2 text-sm sm:py-3 sm:text-base rounded-2xl"
                  />
                  <Button
                    onPress={handleJoinGame}>
                    <Text
                      className={`${!isValidGameCode(gameCode) ? 'font-bold text-muted-foreground text-white' : ''} text-sm sm:text-base`}>
                      Join Game
                    </Text>
                  </Button>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isTablet = width > 700;

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
        className="h-full flex-1 p-5 pt-8"
        style={{
          paddingHorizontal: Math.max(16, width * 0.04),
          paddingTop: Platform.OS === 'android' ? 32 : 24,
          maxWidth: isTablet ? undefined : 500,
          alignSelf: 'center',
          width: '100%',
        }}>
        {/* Back Button */}
        <View style={{ marginBottom: isSmallScreen ? 8 : 16 }}>
          <BackButton onPress={() => router.replace('/username')} />
        </View>
        <View className="w-full items-center pb-6">
          <Text
            className="text-center text-4xl font-extrabold leading-[3.2rem]"
            style={{
              fontSize: isSmallScreen ? 28 : isTablet ? 40 : 32,
              lineHeight: isSmallScreen ? 36 : isTablet ? 48 : 40,
            }}>
            {username ? `Welcome ` : 'Join a game'}
            {username && (
              <Text
                className="text-4xl font-extrabold"
                style={{ fontSize: isSmallScreen ? 28 : isTablet ? 40 : 32 }}>
                {username}!
              </Text>
            )}
          </Text>
          <Text
            className="mt-2 text-center text-lg text-gray-500"
            style={{ fontSize: isSmallScreen ? 14 : isTablet ? 20 : 16 }}>
            {username
              ? 'Ready to play? Scan a code or enter one below to join a game.'
              : 'Scan a QR code or enter a game code to get started.'}
          </Text>
        </View>

        <View>
          <View
            style={{
              flexDirection: isTablet ? 'row' : 'column',
              gap: isTablet ? 32 : 16,
              alignItems: isTablet ? 'flex-start' : 'stretch',
              justifyContent: 'center',
              width: '100%',
            }}>
            {/* Camera View */}
            <View
              className="items-center"
              style={{
                flex: isTablet ? 1 : undefined,
                width: isTablet ? '50%' : '100%',
                maxWidth: 400,
                alignSelf: 'center',
                aspectRatio: 3 / 4,
                minHeight: isSmallScreen ? 180 : isTablet ? 400 : 260,
                maxHeight: isTablet ? 420 : 340,
              }}>
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
                    <Icon icon={QrCode} size={isSmallScreen ? 24 : 32} className="text-white/80" />
                  </View>
                )}
                {!permission ? (
                  <View
                    className="size-full items-center justify-center rounded-lg bg-black bg-gray-200"
                    style={{ borderRadius: 24 }}>
                    <Text
                      className="text-center text-gray-500"
                      style={{ fontSize: isSmallScreen ? 13 : 16 }}>
                      Loading camera...
                    </Text>
                  </View>
                ) : !permission.granted ? (
                  <View
                    className="size-full items-center justify-center rounded-lg bg-gray-200 p-4"
                    style={{ borderRadius: 24 }}>
                    <Text
                      className="mb-4 text-center text-gray-700"
                      style={{ fontSize: isSmallScreen ? 13 : 16 }}>
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
                    <Text
                      className="text-center text-gray-500"
                      style={{ fontSize: isSmallScreen ? 13 : 16 }}>
                      QR Code scanned! Redirecting...
                    </Text>
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
              className="gap-2"
              style={{
                marginTop: isTablet ? 0 : isSmallScreen ? 8 : 16,
                marginLeft: isTablet ? 32 : 0,
                flex: isTablet ? 1 : undefined,
                width: isTablet ? '50%' : '100%',
                maxWidth: 400,
                alignSelf: isTablet ? 'flex-start' : 'center',
                justifyContent: 'center',
              }}>
              <Input
                placeholder="Enter game code"
                value={gameCode}
                onChangeText={(text) => {
                  setGameCode(text);
                }}
                style={{
                  fontSize: isSmallScreen ? 14 : 16,
                  paddingVertical: isSmallScreen ? 8 : 12,
                }}
              />
              <Button
                variant={'outline'}
                onPress={handleJoinGame}
                style={{ paddingVertical: isSmallScreen ? 8 : 12 }}>
                <Text
                  className={!isValidGameCode(gameCode) ? 'text-muted-foreground' : ''}
                  style={{ fontSize: isSmallScreen ? 14 : 16 }}>
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

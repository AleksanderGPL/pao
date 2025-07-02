import { Platform, View } from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useEffect } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from 'components/ThemedText';
import { ThemedView } from 'components/ThemedView';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { Input } from '@/components/Input';

export default function HomeScreen() {
  const [gameCode, setGameCode] = useState('');
  const [permission, requestPermission] = useCameraPermissions();
  const [hasScanned, setHasScanned] = useState(false);
  const router = useRouter();

  // Reset QR scanning state when screen comes into focus
  useFocusEffect(() => {
    setHasScanned(false);
    setGameCode('');
  });

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
    <View className="h-full flex-1 p-5">
      <Text className="w-full pb-5 text-center text-3xl leading-[3rem]">Join a game</Text>

      <View>
        <View>
          <View className="gap-4">
            {/* Camera View */}
            <View>
              <View className="aspect-square w-full items-center">
                {!permission ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200">
                    <Text className="text-center text-gray-500">Loading camera...</Text>
                  </View>
                ) : !permission.granted ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200 p-4">
                    <Text className="mb-4 text-center text-gray-700">
                      Camera access needed for QR scanning
                    </Text>
                    <Button onPress={requestPermission}>
                      <Text>Grant Permission</Text>
                    </Button>
                  </View>
                ) : hasScanned ? (
                  <View className="size-full items-center justify-center rounded-lg bg-gray-200">
                    <Text className="text-center text-gray-500">QR Code scanned! Redirecting...</Text>
                  </View>
                ) : (
                  <View className="size-full overflow-hidden rounded-lg">
                    <CameraView
                      style={{ width: '100%', height: '100%' }}
                      facing="back"
                      barcodeScannerSettings={{
                        barcodeTypes: ['qr'],
                      }}
                      onBarcodeScanned={handleBarcodeScanned}
                    />
                  </View>
                )}
              </View>
              <Text className="mt-2 text-center text-sm text-gray-600">
                {hasScanned ? 'Redirecting to game...' : 'Point camera at QR code to scan'}
              </Text>
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

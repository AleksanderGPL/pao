import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState, useRef } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Pressable,
  Platform,
  Alert,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Button } from '../Button';
import { CameraView, useCameraPermissions } from 'expo-camera';
import QRCodeStyled from 'react-native-qrcode-styled';
import * as Clipboard from 'expo-clipboard';
import type { ApiResponse } from '@/app/game';
import { api, getShotImageUrl } from '@/lib/axios';
import { X, AlertCircle, Camera, Copy, QrCode } from 'lucide-react-native';

const TargetOverlay = ({ player }: { player?: ApiResponse['players'][number] }) => {
  return (
    <View className="absolute left-4 right-4 top-10">
      <Card className="border-white/20 bg-black/70">
        <CardContent className="p-3">
          <View className="flex-row items-center space-x-3">
            {player ? (
              <>
                <Avatar className="h-10 w-10" alt={`${player.user.name} profile picture`}>
                  <AvatarImage
                    source={{
                      uri: player.user.profilePicture,
                    }}
                  />
                  <AvatarFallback>
                    <Text className="text-sm font-semibold text-white">
                      {player.user.name.charAt(0)}
                    </Text>
                  </AvatarFallback>
                </Avatar>
                <View className="flex-1">
                  <Text className="font-semibold text-white">🎯 Target: {player.user.name}</Text>
                  <Text className="text-xs text-white/80">Find and eliminate this player</Text>
                </View>
              </>
            ) : (
              <Text className="text-sm font-semibold text-white">No target</Text>
            )}
          </View>
        </CardContent>
      </Card>
    </View>
  );
};

const CameraErrorView = ({ error, onRetry }: { error: string; onRetry: () => void }) => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900 p-6">
      <View className="items-center space-y-4">
        <AlertCircle size={48} className="text-red-500" />
        <Text className="text-center text-lg font-semibold text-white">Camera Error</Text>
        <Text className="text-center text-white/80">{error}</Text>
        <Button onPress={onRetry} className="mt-4">
          <Text>Retry</Text>
        </Button>
      </View>
    </View>
  );
};

const CameraPermissionView = ({ onRequestPermission }: { onRequestPermission: () => void }) => {
  return (
    <View className="flex-1 items-center justify-center bg-gray-900 p-6">
      <View className="items-center space-y-4">
        <AlertCircle size={48} className="text-yellow-500" />
        <Text className="text-center text-lg font-semibold text-white">Camera Permission Required</Text>
        <Text className="text-center text-white/80">
          This app needs camera access to take photos of your targets.
        </Text>
        <Button onPress={onRequestPermission} className="mt-4">
          <Text>Grant Permission</Text>
        </Button>
      </View>
    </View>
  );
};

export const ActiveGameScreen = ({
  players,
  gameInfo,
  target,
  isEliminated,
}: {
  players: ApiResponse['players'];
  target: number;
  gameInfo: Omit<ApiResponse, 'players'>;
  isEliminated: boolean;
}) => {
  const alivePlayers = players.filter((player) => player.isAlive);
  const eliminatedPlayers = players.filter((player) => !player.isAlive);
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const currentTarget = players.find((p) => p.id === target);

  const [isShooting, setIsShooting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedImageFormat, setCapturedImageFormat] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [selectedShotImage, setSelectedShotImage] = useState<string | null>(null);
  const [photoTakenAt, setPhotoTakenAt] = useState<number | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  // Get screen dimensions for responsive QR code sizing
  const { width: screenWidth } = Dimensions.get('window');
  const qrSize = Math.min(screenWidth - 80, 300); // Responsive size

  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

  // Reset camera error when starting camera
  useEffect(() => {
    if (isShooting) {
      setCameraError(null);
      setIsCameraReady(false);
      
      // On Android, add extra logging for debugging
      if (Platform.OS === 'android') {
        console.log('Starting camera on Android');
        console.log('Camera permission status:', permission?.granted);
      }
    }
  }, [isShooting, permission?.granted]);

  const handleCameraError = (error: any) => {
    console.error('Camera error:', error);
    let errorMessage = 'An unknown camera error occurred';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    // Android-specific error handling
    if (Platform.OS === 'android') {
      console.log('Android camera error detected');
      // On Android, sometimes the camera preview doesn't show but still works
      // Let's try to continue anyway
      if (errorMessage.includes('preview') || errorMessage.includes('display')) {
        console.log('Android preview issue detected, continuing anyway');
        setIsCameraReady(true);
        return;
      }
    }
    
    setCameraError(errorMessage);
    setIsShooting(false);
  };

  const handleRequestPermission = async () => {
    try {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert(
          'Permission Required',
          'Camera permission is required to take photos. Please enable it in your device settings.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Permission request error:', error);
      Alert.alert('Error', 'Failed to request camera permission');
    }
  };

  const handleCameraReady = () => {
    console.log('Camera is ready');
    // Add a longer delay on Android to ensure camera preview is fully rendered
    const delay = Platform.OS === 'android' ? 500 : 100;
    setTimeout(() => {
      setIsCameraReady(true);
    }, delay);
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      setCameraError(null);

      // Optimized camera options for faster uploads
      const cameraOptions = {
        quality: 0.6, // Lower quality for faster uploads
        base64: false,
        skipProcessing: true, // Skip processing for better performance
        exif: false, // Disable EXIF to reduce file size
        imageType: 'jpg' as const, // Use JPEG for smaller file size
        ...(Platform.OS === 'android' && {
          // Android-specific optimizations
          skipProcessing: true,
        }),
      };

      const photo = await cameraRef.current.takePictureAsync(cameraOptions);
      
      if (!photo?.uri) {
        throw new Error('Failed to capture photo');
      }

      setCapturedImage(photo.uri);
      setCapturedImageFormat(photo.format || 'jpeg');
      setPhotoTakenAt(Date.now());
      setIsShooting(false);
    } catch (error) {
      handleCameraError(error);
    } finally {
      setIsCapturing(false);
    }
  };

  const discardPhoto = () => {
    setCapturedImage(null);
    setCapturedImageFormat(null);
    setPhotoTakenAt(null);
    setIsShooting(true); // Go back to camera view
  };

  const copyGameCode = async () => {
    try {
      await Clipboard.setStringAsync(gameInfo.code);
      Alert.alert('Copied!', 'Game code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy game code');
    }
  };

  const confirmShot = async () => {
    if (!capturedImage || !capturedImageFormat || isUploading) return;

    // Validate that we still have the same target
    if (!target || !currentTarget) {
      Alert.alert('Error', 'No target assigned. Please refresh the game.');
      return;
    }

    // Double-check that the current target matches what we're trying to shoot
    if (currentTarget.id !== target) {
      Alert.alert('Error', 'Target has changed. Please take a new photo.');
      setCapturedImage(null);
      setCapturedImageFormat(null);
      setPhotoTakenAt(null);
      return;
    }

    // Check if the photo is too old (more than 5 minutes)
    if (photoTakenAt && Date.now() - photoTakenAt > 5 * 60 * 1000) {
      Alert.alert('Error', 'Photo is too old. Please take a new photo.');
      setCapturedImage(null);
      setCapturedImageFormat(null);
      setPhotoTakenAt(null);
      return;
    }

    // Start upload process
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 10;
      });
    }, 200);

    try {
      console.log('Starting shot confirmation...');
      console.log('Game code:', gameInfo.code);
      console.log('Current target ID:', target);
      console.log('Current target name:', currentTarget.user.name);
      console.log('Photo taken at:', photoTakenAt ? new Date(photoTakenAt).toISOString() : 'unknown');
      console.log('Image format:', capturedImageFormat);
      
      // For React Native, we need to handle FormData differently
      const formData = new FormData();
      
      // Create the file object for React Native
      const fileUri = capturedImage;
      const fileName = `shot.${capturedImageFormat}`;
      const mimeType = `image/${capturedImageFormat.toLowerCase()}`;
      
      formData.append('image', {
        uri: fileUri,
        type: mimeType,
        name: fileName,
      } as any);
      
      console.log('FormData created, making API request...');

      // Upload with optimized settings
      const apiResponse = await api.post(`/game/${gameInfo.code}/player/${target}/shoot`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000, // 30 second timeout (reduced for better UX)
      });
      
      console.log('API response:', apiResponse.data);

      // Complete progress
      setUploadProgress(100);
      
      // Clear the photo data
      setCapturedImage(null);
      setCapturedImageFormat(null);
      setPhotoTakenAt(null);
      
      // Show success feedback
      Alert.alert('Success', 'Target eliminated!');
    } catch (error: any) {
      console.error('Upload error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to upload image';
      if (error?.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Upload Failed', errorMessage);
    } finally {
      // Clean up
      clearInterval(progressInterval);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  if (capturedImage) {
    return (
      <>
        <Image
          source={{ uri: capturedImage }}
          className="h-full w-full"
          style={{ transform: [{ scaleX: -1 }] }}
        />
        <TargetOverlay player={currentTarget!} />
        
        {/* Upload Progress Overlay */}
        {isUploading && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center">
            <View className="bg-white rounded-lg p-6 m-4 max-w-sm w-full">
              <Text className="text-center text-lg font-semibold mb-4">Uploading Shot...</Text>
              <View className="bg-gray-200 rounded-full h-2 mb-4">
                <View 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </View>
              <Text className="text-center text-sm text-gray-600">
                {Math.round(uploadProgress)}% Complete
              </Text>
            </View>
          </View>
        )}
        
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-4 px-4">
          <Button 
            className="flex-1 bg-red-500" 
            onPress={discardPhoto}
            disabled={isUploading}
          >
            <Text>Discard</Text>
          </Button>
          <Button 
            className={`flex-1 ${isUploading ? 'bg-gray-400' : 'bg-green-500'}`} 
            onPress={confirmShot}
            disabled={isUploading}
          >
            <Text>{isUploading ? 'Uploading...' : 'Confirm Shot'}</Text>
          </Button>
        </View>
      </>
    );
  }

  // Handle permission states
  if (!permission) {
    return <LoadingScreen />;
  }

  if (!permission.granted) {
    return <CameraPermissionView onRequestPermission={handleRequestPermission} />;
  }

  if (isShooting) {
    if (cameraError) {
      return (
        <CameraErrorView 
          error={cameraError} 
          onRetry={() => {
            setCameraError(null);
            setIsShooting(false);
          }} 
        />
      );
    }

    return (
      <View className="h-full w-full" style={{ backgroundColor: 'black' }}>
        <CameraView
          ref={cameraRef}
          facing='front'
          className="h-full w-full"
          onCameraReady={handleCameraReady}
          style={{ flex: 1, width: '100%', height: '100%' }}
        />

        <TargetOverlay player={currentTarget!} />

        {/* Camera loading indicator */}
        {!isCameraReady && (
          <View className="absolute inset-0 items-center justify-center bg-black/20">
            <View className="rounded-lg bg-black/80 p-4">
              <Text className="text-white">
                {Platform.OS === 'android' ? 'Initializing camera on Android...' : 'Initializing camera...'}
              </Text>
            </View>
          </View>
        )}

        <View className="absolute bottom-10 left-0 right-0 flex-row items-center justify-center gap-4 px-4">
          <TouchableOpacity
            activeOpacity={0.5}
            className="absolute left-4 size-[2.5rem] flex-1 items-center justify-center rounded-full bg-black/50"
            onPress={() => setIsShooting(false)}
            disabled={isCapturing}>
            <X size={20} className="text-white/80" />
          </TouchableOpacity>
          <View className="rounded-full border-[5px] border-white p-1">
            <TouchableOpacity
              activeOpacity={0.5}
              className={`size-[3rem] rounded-full ${isCameraReady ? 'bg-white' : 'bg-gray-400'}`}
              onPress={takePicture}
              disabled={isCapturing || !isCameraReady}></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'white' }}>
      {/* Shot Image Modal */}
      <Modal
        visible={!!selectedShotImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedShotImage(null)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => setSelectedShotImage(null)}
          >
            <X size={24} className="text-white" />
          </TouchableOpacity>
          {selectedShotImage && (
            <Image
              source={{ uri: selectedShotImage }}
              className="w-full h-3/4"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName={`p-5 ${Platform.OS === 'android' ? 'pt-4' : 'pt-8'}`}>
        {/* Game Header */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Game {gameInfo.code}</CardTitle>
            <CardDescription>
              {gameInfo.status === 'active' ? '🟢 Active' : '🔴 Inactive'} • {alivePlayers.length}{' '}
              of {players.length} players alive
            </CardDescription>
          </CardHeader>
        </Card>

        {/* QR Code Section */}
        <Card className="mb-4">
            {showQRCode ? (
              <View className="items-center space-y-4">
                <View className="rounded-lg bg-white p-4">
                  <QRCodeStyled
                    data={process.env.EXPO_PUBLIC_DEPLOY_LINK + '?gameCode=' + gameInfo.code}
                    className="aspect-square"
                    padding={20}
                    pieceSize={6}
                    style={{
                      width: qrSize,
                      height: qrSize,
                    }}
                  />
                </View>
                <Button
                  variant="outline"
                  onPress={copyGameCode}
                  className="flex-row items-center gap-2">
                  <Text className="font-mono text-lg font-medium">{gameInfo.code}</Text>
                  <Copy size={18} />
                </Button>
                <Button
                  variant="ghost"
                  onPress={() => setShowQRCode(false)}
                  className="mt-2">
                  <Text>Hide QR Code</Text>
                </Button>
              </View>
            ) : (
              <Button
                variant="outline"
                onPress={() => setShowQRCode(true)}
                className="flex-row items-center gap-2">
                <QrCode size={18} />
                <Text>Show QR Code</Text>
              </Button>
            )}
        </Card>

        <Button 
          className={`mb-4 ${isEliminated ? 'bg-gray-400' : ''}`} 
          onPress={() => setIsShooting(true)}
          disabled={isEliminated || isUploading}
        >
          <Text className={isEliminated ? 'text-gray-600' : ''}>
            {isEliminated ? 'Eliminated' : isUploading ? 'Uploading...' : 'Shoot Target'}
          </Text>
        </Button>
        
        {/* Upload Status Indicator */}
        {isUploading && (
          <View className="mb-4 rounded-lg bg-blue-50 border border-blue-200 p-3">
            <View className="flex-row items-center gap-2">
              <View className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <Text className="text-blue-700 font-medium">Uploading elimination shot...</Text>
            </View>
            <View className="mt-2 bg-blue-100 rounded-full h-1">
              <View 
                className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
          </View>
        )}

        {/* Current Target */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>🎯 Current Target</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center space-x-3">
              <Avatar className="h-12 w-12" alt={`${currentTarget?.user.name} profile picture`}>
                <AvatarImage
                  source={{
                    uri: currentTarget?.user.profilePicture,
                  }}
                />
                <AvatarFallback>
                  <Text className="text-lg font-semibold">
                    {currentTarget?.user.name.charAt(0)}
                  </Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-lg font-semibold">{currentTarget?.user.name}</Text>
                <Text className="text-sm text-muted-foreground">
                  Find and eliminate this player
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Game Stats */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>📊 Game Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Time Remaining</Text>
                {/* <Text className="font-semibold">{formatTimeRemaining(gameInfo.timeRemaining)}</Text> */}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Eliminations</Text>
                {/* <Text className="font-semibold">{gameInfo.eliminationsToday}</Text> */}
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Players Alive</Text>
                <Text className="font-semibold">
                  {alivePlayers.length}/{players.length}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Alive Players */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>✅ Alive Players ({alivePlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              {alivePlayers.map((player, index) => (
                <View key={index} className="flex-row items-center space-x-3">
                  <Avatar alt={`${player.user.name} profile picture`}>
                    <AvatarImage source={{ uri: player.user.profilePicture }} />
                    <AvatarFallback>
                      <Text className="font-semibold">{player.user.name.charAt(0)}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <Text className="font-medium">{player.user.name}</Text>
                    <Text className="text-sm text-green-600">Active</Text>
                  </View>
                  {player.id === target && (
                    <View className="rounded bg-red-100 px-2 py-1">
                      <Text className="text-xs font-medium text-red-700">TARGET</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>❌ Eliminated Players ({eliminatedPlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                {eliminatedPlayers.map((player, index) => {
                  // Construct shot image URL if not provided
                  const shotImageUrl = player.shotImageUrl || getShotImageUrl(gameInfo.code, player.id);
                  
                  return (
                    <View key={index} className="flex-row items-center space-x-3 opacity-60">
                      <Avatar alt={`${player.user.name} profile picture`}>
                        <AvatarImage source={{ uri: player.user.profilePicture }} />
                        <AvatarFallback>
                          <Text className="font-semibold">{player.user.name.charAt(0)}</Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1">
                        <Text className="font-medium line-through">{player.user.name}</Text>
                        <Text className="text-sm text-red-600">Eliminated</Text>
                      </View>
                      {/* Shot Image */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedShotImage(shotImageUrl)}
                      >
                        <View className="h-12 w-12 rounded-lg border border-gray-300 bg-gray-100 items-center justify-center overflow-hidden">
                          <Image
                            source={{ uri: shotImageUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                            onError={() => {
                              // Fallback to camera icon if image fails to load
                              console.log('Failed to load shot image:', shotImageUrl);
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

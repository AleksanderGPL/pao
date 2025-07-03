import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState, useRef } from 'react';
import { View, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Player } from '@/app/game';
import { Button } from '../Button';
import { CameraView } from 'expo-camera';

const ShootScreen = () => {
  return (
    <View className="flex-1 items-center justify-center">
      <CameraView facing={'front'} className="h-full w-full" />
    </View>
  );
};

export const ActiveGameScreen = ({
  players,
  gameInfo,
}: {
  players: Player[];
  gameInfo: {
    gameCode: string;
    gameStatus: string;
    currentTarget: string;
    maxPlayers: number;
    timeRemaining: number;
    eliminationsToday: number;
  };
}) => {
  const alivePlayers = players.filter((player) => player.isAlive);
  const eliminatedPlayers = players.filter((player) => !player.isAlive);
  const formatTimeRemaining = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const [isShooting, setIsShooting] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: false,
        });
        setCapturedImage(photo.uri);
        setIsShooting(false);
      } catch (error) {
        console.error('Error taking picture:', error);
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const discardPhoto = () => {
    setCapturedImage(null);
  };

  const confirmShot = () => {
    // Here you would typically send the photo to your backend
    // For now, we'll just discard it
    setCapturedImage(null);
    // You might want to show a success message or update game state
  };

  if (capturedImage) {
    return (
      <>
        <Image
          source={{ uri: capturedImage }}
          className="h-full w-full"
          style={{ transform: [{ scaleX: -1 }] }}
        />
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-4 px-4">
          <Button className="flex-1 bg-red-500" onPress={discardPhoto}>
            <Text>Discard</Text>
          </Button>
          <Button className="flex-1 bg-green-500" onPress={confirmShot}>
            <Text>Confirm Shot</Text>
          </Button>
        </View>
      </>
    );
  }

  if (isShooting) {
    return (
      <View className="h-full w-full">
        <CameraView ref={cameraRef} facing={'front'} className="h-full w-full" />
        <View className="absolute bottom-10 left-0 right-0 flex-row justify-center gap-4 px-4">
          <Button
            className="flex-1 bg-red-500"
            onPress={() => setIsShooting(false)}
            disabled={isCapturing}>
            <Text>Cancel</Text>
          </Button>
          <Button className="flex-1" onPress={takePicture} disabled={isCapturing}>
            <Text>{isCapturing ? 'Taking...' : 'Shoot'}</Text>
          </Button>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5">
        {/* Game Header */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Game {gameInfo.gameCode}</CardTitle>
            <CardDescription>
              {gameInfo.gameStatus === 'active' ? '🟢 Active' : '🔴 Inactive'} •{' '}
              {alivePlayers.length} of {gameInfo.maxPlayers} players alive
            </CardDescription>
          </CardHeader>
        </Card>

        <Button className="mb-4" onPress={() => setIsShooting(true)}>
          <Text>Shoot Target</Text>
        </Button>

        {/* Current Target */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>🎯 Current Target</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="flex-row items-center space-x-3">
              <Avatar className="h-12 w-12" alt={`${gameInfo.currentTarget} profile picture`}>
                <AvatarImage
                  source={{
                    uri: players.find((p) => p.username === gameInfo.currentTarget)?.profilePicture,
                  }}
                />
                <AvatarFallback>
                  <Text className="text-lg font-semibold">{gameInfo.currentTarget.charAt(0)}</Text>
                </AvatarFallback>
              </Avatar>
              <View className="flex-1">
                <Text className="text-lg font-semibold">{gameInfo.currentTarget}</Text>
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
                <Text className="font-semibold">{formatTimeRemaining(gameInfo.timeRemaining)}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Eliminations Today</Text>
                <Text className="font-semibold">{gameInfo.eliminationsToday}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Players Alive</Text>
                <Text className="font-semibold">
                  {alivePlayers.length}/{gameInfo.maxPlayers}
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
                  <Avatar alt={`${player.username} profile picture`}>
                    <AvatarImage source={{ uri: player.profilePicture }} />
                    <AvatarFallback>
                      <Text className="font-semibold">{player.username.charAt(0)}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <Text className="font-medium">{player.username}</Text>
                    <Text className="text-sm text-green-600">Active</Text>
                  </View>
                  {player.username === gameInfo.currentTarget && (
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
                {eliminatedPlayers.map((player, index) => (
                  <View key={index} className="flex-row items-center space-x-3 opacity-60">
                    <Avatar alt={`${player.username} profile picture`}>
                      <AvatarImage source={{ uri: player.profilePicture }} />
                      <AvatarFallback>
                        <Text className="font-semibold">{player.username.charAt(0)}</Text>
                      </AvatarFallback>
                    </Avatar>
                    <View className="flex-1">
                      <Text className="font-medium line-through">{player.username}</Text>
                      <Text className="text-sm text-red-600">Eliminated</Text>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </>
  );
};

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
} from 'react-native';
import { Button } from '../Button';
import { CameraView } from 'expo-camera';
import type { ApiResponse } from '@/app/game';
import { api } from '@/lib/axios';
import { X } from 'lucide-react-native';

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
  target,
}: {
  players: ApiResponse['players'];
  target: number;
  gameInfo: Omit<ApiResponse, 'players'>;
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
        setCapturedImageFormat(photo.format);
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

  const confirmShot = async () => {
    if (!capturedImage) return;

    const response = await fetch(capturedImage);
    const blob = await response.blob();
    const formData = new FormData();
    formData.append('image', blob, `shot.${capturedImageFormat}`);
    await api.post(`/game/${gameInfo.code}/player/${target}/shoot`, formData);

    setCapturedImage(null);
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
        <CameraView
          ref={cameraRef}
          facing={Platform.OS === 'web' ? undefined : 'back'}
          className="h-full w-full"
        />

        <TargetOverlay player={currentTarget!} />

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
              className="size-[3rem] rounded-full bg-white"
              onPress={takePicture}
              disabled={isCapturing}></TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 pt-8">
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
                {eliminatedPlayers.map((player, index) => (
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

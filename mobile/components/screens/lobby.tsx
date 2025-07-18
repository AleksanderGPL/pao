import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { RefObject, useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, Alert } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import { Button } from '../Button';
import { ApiResponse } from '@/app/game';
import { RefreshCw, Copy, Icon, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { BackButton } from '../base/BackButton';
import { ShadowView } from '../base/ShadowView';

function Capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function LobbyScreen({
  players,
  gameCode,
  onStartGame,
  onRefresh,
  currentUser,
  gameName,
  currentPlayerId,
}: {
  players: ApiResponse['players'] | null;
  gameCode: string;
  gameName: string;
  onStartGame: () => void;
  onRefresh?: () => void;
  currentUser?: string;
  currentPlayerId?: RefObject<number | null>;
}) {
  const [hasConnected, setHasConnected] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  // Get screen dimensions for responsive sizing
  const { width: screenWidth } = Dimensions.get('window');
  const qrSize = Math.min(screenWidth - 40, 400); // 70% of screen width, max 280px

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    router.push('/(tabs)');
  };

  const copyGameCode = async () => {
    try {
      await Clipboard.setStringAsync(gameCode);
      Alert.alert('Copied!', 'Game code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy game code');
    }
  };

  // Don't render if players is null
  if (!players) {
    return <LoadingScreen />;
  }

  // Safety check for players array
  if (!Array.isArray(players)) {
    console.error('Players is not an array:', players);
    return <LoadingScreen />;
  }

  // Filter out any invalid player objects
  const validPlayers = players.filter((player) => player && player.user && player.user.name);

  // Console log players as soon as we get them
  console.log('Players received in lobby:', players);
  console.log('Valid players:', validPlayers);

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 pb-0 min-h-screen pt-8">
        {/* Back Button */}
        <View className="mb-4 flex-row items-center justify-center gap-2">
          <Button
            onPress={handleBack}
            variant="ghost"
            className="absolute left-0 m-0 rounded-xl border-0 p-0">
            <ChevronLeft size={25} className="text-muted-foreground" />
          </Button>
          <Text className="font-semibold">{gameName}</Text>
        </View>

        {/* QR Code - Centered and Responsive */}

        <ShadowView className="w-full max-w-[400px] items-center self-center rounded-3xl bg-white pb-7">
          <QRCodeStyled
            data={'https://pao.aleksander.cc/game' + '?gameCode=' + gameCode}
            className="aspect-square h-[20rem] w-full"
            padding={40}
            pieceSize={8}
            style={{
              width: qrSize,
              height: qrSize,
            }}
          />
          <Button
            variant="outline"
            onPress={copyGameCode}
            className="-mt-6 flex-row items-center gap-2 rounded-xl border-0 bg-black/5">
            <Text className="font-mono text-lg font-medium text-muted-foreground">{gameCode}</Text>
            <Copy size={18} className="text-muted-foreground" />
          </Button>
        </ShadowView>

        {/* Players List with Refresh */}
        <View className="my-4 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold">Players ({validPlayers.length})</Text>

            <Button
              variant="outline"
              onPress={handleRefresh}
              disabled={isRefreshing}
              className="flex-row items-center gap-2">
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
              <Text>{isRefreshing ? 'Refreshing...' : 'Refresh'}</Text>
            </Button>
          </View>
          <View className="gap-3">
            {(showAllPlayers ? validPlayers : validPlayers.slice(0, 3)).map((player) => (
              <View
                key={player.user.name}
                className="flex-row items-center gap-3 rounded-2xl bg-card p-3 px-4">
                <Avatar className="h-12 w-12" alt={`${player.user.name} profile picture`}>
                  <AvatarImage source={{ uri: player.user.profilePicture }} />
                </Avatar>
                <View className="flex-1">
                  <Text className="text-lg font-semibold">
                    {Capitalize(player.user.name)}
                    {player.isHost && (
                      <Text className="text-[1rem] font-bold text-[grey]"> Host</Text>
                    )}
                    {currentPlayerId?.current === player.id && (
                      <Text className="ml-2 text-sm text-muted-foreground"> (you)</Text>
                    )}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          {validPlayers.length > 3 && (
            <Button
              variant="outline"
              onPress={() => setShowAllPlayers(!showAllPlayers)}
              className="mt-3 w-full">
              <Text>
                {showAllPlayers ? 'Show Less' : `Show ${validPlayers.length - 3} More Players`}
              </Text>
            </Button>
          )}
        </View>
        <View className="flex-1" />
        <View className="w-full pb-5">
          {validPlayers.length < 3 ? (
            <View className="items-center">
              <Text className="text-center text-muted-foreground">
                Waiting for {3 - validPlayers.length} more player
                {3 - validPlayers.length === 1 ? '' : 's'} to join...
              </Text>
            </View>
          ) : validPlayers.find(
              (player) => player.isHost && currentPlayerId?.current === player.id
            ) ? (
            <Button onPress={onStartGame} className="w-full">
              <Text>Start Game</Text>
            </Button>
          ) : (
            <View className="items-center">
              <Text className="text-center text-muted-foreground">
                Waiting for host to start the game...
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

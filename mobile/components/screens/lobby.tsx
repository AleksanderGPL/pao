import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { View, ScrollView, Dimensions, Alert } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import { Button } from '../Button';
import { ApiResponse } from '@/app/game';
import { RefreshCw, Copy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { BackButton } from '../base/BackButton';
import { ShadowView } from '../base/ShadowView';

export default function LobbyScreen({
  players,
  gameCode,
  onStartGame,
  onRefresh,
  currentUser,
}: {
  players: ApiResponse['players'] | null;
  gameCode: string;
  onStartGame: () => void;
  onRefresh?: () => void;
  currentUser?: string;
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

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 flex-1 pb-0 pt-8">
        {/* Back Button */}
        <View className="mb-4">
          <BackButton onPress={handleBack} />
        </View>

        {/* QR Code - Centered and Responsive */}
        <View
          className="items-center rounded-xl w-full max-w-[400px] self-center">
          <ShadowView className="bg-white rounded-xl">
            <QRCodeStyled
              data={`https://pao.aleksander.cc/game?gameCode=${gameCode}`}
              className="aspect-square h-[20rem] w-full rounded-xl"
              padding={20}
              pieceSize={8}
              style={{
                width: qrSize,
                height: qrSize,
              }}
            />
          </ShadowView>
        </View>

        {/* Copy Game Code Button */}
        <View className="m-4 w-full max-w-[400px] self-center">
          <ShadowView className="bg-white rounded-xl">
          <Button
            variant="outline"
            onPress={copyGameCode}
              className="w-full rounded-xl border-0">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="font-mono text-lg font-semibold">{gameCode}</Text>
              <Copy size={18} className="text-muted-foreground" />
            </View>
          </Button>
          </ShadowView>
        </View>

        {/* Players List with Refresh */}
        <View className="mb-4 flex-1 gap-3">
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
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}>
            <View className="gap-3">
              {validPlayers.map((player) => (
                <View
                  key={player.user.name}
                  className="flex-row items-center gap-3 rounded-2xl bg-card p-3 px-4">
                  <Avatar className="h-12 w-12" alt={`${player.user.name} profile picture`}>
                    <AvatarImage source={{ uri: player.user.profilePicture }} />
                  </Avatar>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold">
                      {player.user.name}
                      {currentUser === player.user.name && (
                        <Text className="ml-2 text-sm text-muted-foreground">(you)</Text>
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        <View className="w-full pb-5">
          {validPlayers.find((player) => player.isHost && currentUser === player.user.name) ? (
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

import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import QRCodeStyled from 'react-native-qrcode-styled';
import { Button } from '../Button';
import { ApiResponse } from '@/app/game';
import { RefreshCw, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';

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
  
  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (onRefresh) {
        onRefresh();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const handleBack = () => {
    // Navigate back to the main screen and reset QR scanning
    router.push('/(tabs)');
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
  const validPlayers = players.filter(player => player && player.user && player.user.name);
  
  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 flex-1 pb-0">
        
        {/* Back Button */}
        <View className="mb-4">
          <Button variant="outline" onPress={handleBack} className="self-start">
            <View className="flex-row items-center gap-2">
              <ArrowLeft size={18} />
              <Text>Back</Text>
            </View>
          </Button>
        </View>
        
        <View className="h-[20rem]">
          <QRCodeStyled
            data={gameCode}
            style={{ backgroundColor: 'white' }}
            className="mb-5 aspect-square h-[20rem] w-full rounded-xl"
            padding={20}
            pieceSize={8}
          />
        </View>
        
        {/* Players List with Refresh */}
        <View className="gap-3 mb-4">
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
            className="max-h-48" 
            showsVerticalScrollIndicator={true}
            nestedScrollEnabled={true}>
            <View className="gap-3">
              {validPlayers.map((player) => (
                <View
                  key={player.user.name}
                  className="flex-row items-center gap-3 rounded-2xl bg-card p-2 px-4">
                  <Avatar className="h-12 w-12" alt={`${player.user.name} profile picture`}>
                    <AvatarImage source={{ uri: player.user.profilePicture }} />
                  </Avatar>
                  <View className="flex-1">
                    <Text className="text-lg font-semibold">
                      {player.user.name}
                      {currentUser === player.user.name && (
                        <Text className="text-sm text-muted-foreground ml-2">(you)</Text>
                      )}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
        
        <View className="mb-2 flex-1" />
        <View className="w-full flex-row justify-between pb-5">
          <Button variant="outline" onPress={() => {}}>
            <Text>Share</Text>
          </Button>
          <Button onPress={onStartGame}>
            <Text>Start Game</Text>
          </Button>
        </View>
      </ScrollView>
    </>
  );
}

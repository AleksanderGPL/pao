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
import { RefreshCw, ArrowLeft, Copy } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';

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
  const qrSize = Math.min(screenWidth * 0.7, 280); // 70% of screen width, max 280px
  
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
        
        {/* QR Code - Centered and Responsive */}
        <View 
          className="mb-6" 
          style={{ 
            height: qrSize + 40,
            width: '100%',
            position: 'relative',
          }}>
          <View 
            style={{ 
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: [{ translateX: -qrSize / 2 }, { translateY: -qrSize / 2 }],
              width: qrSize, 
              height: qrSize,
              backgroundColor: 'white',
              borderRadius: 12,
              padding: qrSize / 12,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <QRCodeStyled
              data={gameCode}
              style={{ 
                backgroundColor: 'white',
                              width: qrSize - (qrSize / 6),
              height: qrSize - (qrSize / 6),
                justifyContent: 'center',
                alignItems: 'center',
              }}
              padding={0}
              pieceSize={(qrSize - (qrSize / 6)) / 25}
            />
          </View>
        </View>
        
        {/* Copy Game Code Button */}
        <View className="mb-4">
          <Button 
            variant="outline" 
            onPress={copyGameCode} 
            className="w-full"
            style={{
              backgroundColor: 'white',
              borderRadius: 12,
              padding: 16,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              borderWidth: 0,
            }}>
            <View className="flex-row items-center justify-center gap-2">
              <Text className="font-mono text-lg font-semibold">{gameCode}</Text>
              <Copy size={18} className="text-muted-foreground" />
            </View>
          </Button>
        </View>
        
        {/* Players List with Refresh */}
        <View className="flex-1 gap-3 mb-4">
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
        
        <View className="w-full flex-row justify-between pb-5">
          <Button variant="outline" onPress={copyGameCode}>
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

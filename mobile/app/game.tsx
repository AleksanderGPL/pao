import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Platform } from 'react-native';
import { ActiveGameScreen } from '@/components/screens/ActiveGame';
import { SpectatorScreen } from '@/components/screens/SpectatorScreen';
import LobbyScreen from '@/components/screens/lobby';
import { api } from '@/lib/axios';
import { useLocalSearchParams } from 'expo-router';
import { useUsernameStore } from '@/lib/username-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useWebSocket } from '@/hooks/useWebsocket';
import EliminatedScreen from '@/components/screens/Eliminated';
import { WinScreen } from '@/components/screens/WinScreen';

export interface ApiResponse {
  id: number;
  code: string;
  name: string;
  maxPlayers: number;
  status: 'inactive' | 'active' | 'finished';
  createdAt: string;
  playerId: number;
  players: {
    id: number;
    isAlive: boolean;
    isHost: boolean;
    shotImageUrl?: string; // URL to the elimination shot image
    user: {
      name: string;
      profilePicture: string;
    };
  }[];
}

export default function GameScreen() {
  const [hasConnected, setHasConnected] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isEliminated, setIsEliminated] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const currentPlayerId = useRef<number | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const params = useLocalSearchParams();
  const { username, loadUsername } = useUsernameStore();

  const [gameInfo, setGameInfo] = useState<Omit<ApiResponse, 'players'> | null>(null);
  const [players, setPlayers] = useState<ApiResponse['players'] | null>(null);
  const [currentTarget, setCurrentTarget] = useState<number | null>(0);

  // Get current user from Zustand store
  useEffect(() => {
    const getCurrentUser = async () => {
      if (!username) {
        await loadUsername();
      }
      const currentUsername = useUsernameStore.getState().username;
      if (currentUsername) {
        setCurrentUser(currentUsername);
      }
    };
    getCurrentUser();
  }, [username, loadUsername]);

  useEffect(() => {
    const getSessionToken = async () => {
      const token = await AsyncStorage.getItem('sessionToken');
      setSessionToken(token);
    };
    getSessionToken();
  }, []);

  const shouldConnectWebSocket = sessionToken !== null;

  useWebSocket(
    shouldConnectWebSocket
      ? `${process.env.EXPO_PUBLIC_API_BASE}/api/game/${params.gameCode}/ws?token=${sessionToken}`
      : '',
    {
      onMessage: (event) => {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'player_join':
            if (message.data.player.id === currentPlayerId.current) {
              console.log('You joined the game');
              return;
            }
            console.log('player_join', message.data.player.id);
            if (!players?.some((player) => player.id === message.data.player.id)) {
              setPlayers(
                (prev) => [...(prev || []), message.data.player] as ApiResponse['players']
              );
            }
            break;
          case 'start_game':
            setHasStarted(true);
            break;
          case 'player_target_assigned':
            setCurrentTarget(message.data.targetId);
            break;
          case 'player_kill':
            console.log('player_kill', message.data.playerId);
            setPlayers((prev) =>
              prev
                ? prev.map((player) =>
                    player.id === message.data.playerId
                      ? {
                          ...player,
                          isAlive: false,
                          shotImageUrl: message.data.shotImageUrl, // Add shot image URL if provided
                        }
                      : player
                  )
                : null
            );
            if (message.data.playerId === currentPlayerId.current) {
              setIsEliminated(true);
              console.log('isEliminated', isEliminated);
            }
            break;
          case 'game_ended':
            setHasEnded(true);
            break;
          default:
            console.log('Unknown message type:', message.type);
            break;
        }
      },
    }
  );

  const fetchGameData = async () => {
    try {
      const res = await api.post<ApiResponse>(`/game/${params.gameCode}/join`);
      setGameInfo(res.data);
      setPlayers(res.data.players);
      currentPlayerId.current = res.data.playerId;
      console.log(res.data.playerId);
      setHasStarted(res.data.status === 'active');
      setHasConnected(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.error('Game not found');
      }
    }
  };

  const startGame = async () => {
    await api.post(`/game/${params.gameCode}/start`);
    setHasStarted(true);
  };

  useEffect(() => {
    fetchGameData();
  }, [params.gameCode]);

  // Check if current player is actually eliminated
  const currentPlayer = players?.find((p) => p.id === currentPlayerId.current);
  const isPlayerEliminated = currentPlayer ? !currentPlayer.isAlive : false;

  return (
    <View className={`flex-1 ${Platform.OS === 'android' ? 'mt-4' : ''}`}>
      {!hasConnected ? (
        <LoadingScreen />
      ) : !hasStarted ? (
        <LobbyScreen
          players={players!}
          gameCode={gameInfo!.code}
          gameName={gameInfo!.name}
          onStartGame={startGame}
          onRefresh={fetchGameData}
          currentUser={currentUser}
        />
      ) : hasEnded ? (
        <WinScreen />
      ) : isEliminated || isPlayerEliminated ? (
        isEliminated ? (
          <EliminatedScreen
            gameCode={gameInfo!.code}
            targetId={currentPlayerId}
            onBackToLobby={() => {
              setIsEliminated(false);
              // This will now show the SpectatorScreen since isPlayerEliminated is still true
            }}
          />
        ) : (
          <SpectatorScreen players={players!} gameInfo={gameInfo!} />
        )
      ) : (
        <ActiveGameScreen
          players={players!}
          gameInfo={gameInfo!}
          target={currentTarget!}
          isEliminated={isEliminated}
          currentPlayerId={currentPlayerId.current}
        />
      )}
    </View>
  );
}

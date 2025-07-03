import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ActiveGameScreen } from '@/components/screens/ActiveGame';
import LobbyScreen from '@/components/screens/lobby';
import { api } from '@/lib/axios';
import { useLocalSearchParams } from 'expo-router';
import { useUsernameStore } from '@/lib/username-store';

export interface ApiResponse {
  id: number;
  code: string;
  name: string;
  maxPlayers: number;
  status: 'inactive' | 'active' | 'finished';
  createdAt: string;
  players: [
    {
      id: number;
      isAlive: boolean;
      isHost: boolean;
      user: {
        name: string;
        profilePicture: string;
      };
    },
  ];
}

export default function GameScreen() {
  const [hasConnected, setHasConnected] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
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

  const fetchGameData = async () => {
    try {
      const res = await api.post<ApiResponse>(`/game/${params.gameCode}/join`);
      setGameInfo(res.data);
      setPlayers(res.data.players);
      setHasConnected(true);
    } catch (err: any) {
      if (err.response?.status === 404) {
        console.error('Game not found');
      }
    }
  };

  useEffect(() => {
    fetchGameData();
  }, [params.gameCode]);

  if (!hasConnected) {
    return <LoadingScreen />;
  }

  if (!hasStarted) {
    return (
      <LobbyScreen
        players={players!}
        gameCode={gameInfo!.code}
        onStartGame={() => setHasStarted(true)}
        onRefresh={fetchGameData}
        currentUser={currentUser}
      />
    );
  }

  return <ActiveGameScreen players={players!} gameInfo={gameInfo!} target={currentTarget!} />;
}

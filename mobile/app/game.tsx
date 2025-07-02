import LoadingScreen from '@/components/screens/loading';
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
  const params = useLocalSearchParams();

  const [gameInfo, setGameInfo] = useState<Omit<ApiResponse, 'players'> | null>(null);
  const [players, setPlayers] = useState<ApiResponse['players'] | null>(null);
  const [currentTarget, setCurrentTarget] = useState<number | null>(0);

  useEffect(() => {
    api
      .post<ApiResponse>(`/game/${params.gameCode}/join`)
      .then((res) => {
        setGameInfo(res.data);
        setPlayers(res.data.players);
        setHasConnected(true);
      })
      .catch((err) => {
        if (err.response.status === 404) {
          console.error('Game not found');
        }
      });
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
      />
    );
  }

  return <ActiveGameScreen players={players!} gameInfo={gameInfo!} target={currentTarget!} />;
}

import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { ActiveGameScreen } from '@/components/screens/ActiveGame';
import LobbyScreen from '@/components/screens/Lobby';
import { api } from '@/lib/axios';
import { useLocalSearchParams } from 'expo-router';

export type Player = {
  username: string;
  profilePicture: string;
  isAlive: boolean;
};

export default function GameScreen() {
  const [hasConnected, setHasConnected] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  api.get(`/game/${useLocalSearchParams().gameCode}`).then((res) => {
    console.log(res.data);
  }).catch((err) => {
    if (err.response.status === 404) {
      console.error('Game not found');
    }
  });

  useEffect(() => {
    setTimeout(() => {
      setHasConnected(true);
    }, 1000);
  }, []);

  const [players, setPlayers] = useState<Player[]>([
    {
      username: 'Alex_Hunter',
      profilePicture: 'https://i.pravatar.cc/150?img=1',
      isAlive: true,
    },
    {
      username: 'SniperQueen',
      profilePicture: 'https://i.pravatar.cc/150?img=2',
      isAlive: true,
    },
    {
      username: 'StealthMaster',
      profilePicture: 'https://i.pravatar.cc/150?img=3',
      isAlive: false,
    },
    {
      username: 'NightCrawler',
      profilePicture: 'https://i.pravatar.cc/150?img=4',
      isAlive: true,
    },
    {
      username: 'ShadowBlade',
      profilePicture: 'https://i.pravatar.cc/150?img=5',
      isAlive: true,
    },
    {
      username: 'CyberNinja',
      profilePicture: 'https://i.pravatar.cc/150?img=6',
      isAlive: false,
    },
  ]);
  const gameInfo = {
    gameCode: 'SNQ-7K9M',
    maxPlayers: 8,
    currentTarget: 'SniperQueen',
    gameStatus: 'active',
    timeRemaining: 3600, // seconds
    eliminationsToday: 2,
    startTime: new Date('2024-01-15T09:00:00Z'),
    endTime: new Date('2024-01-22T21:00:00Z'),
  };

  if (!hasConnected) {
    return <LoadingScreen />;
  }

  if (!hasStarted) {
    return (
      <LobbyScreen
        players={players}
        gameCode={gameInfo.gameCode}
        onStartGame={() => setHasStarted(true)}
      />
    );
  }

  return <ActiveGameScreen players={players} gameInfo={gameInfo} />;
}

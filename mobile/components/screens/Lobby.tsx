import LoadingScreen from '@/components/screens/Loading';
import { Text } from '@/components/Text';
import { Container } from '@/components/Container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useEffect, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { Player } from '@/app/game';
import QRCodeStyled from 'react-native-qrcode-styled';
import { Button } from '../Button';

export default function LobbyScreen({
  players,
  gameCode,
  onStartGame,
}: {
  players: Player[];
  gameCode: string;
  onStartGame: () => void;
}) {
  const [hasConnected, setHasConnected] = useState(false);
  const [showAllPlayers, setShowAllPlayers] = useState(false);
  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 flex-1 pb-0">
        <View className="h-[20rem]">
          <QRCodeStyled
            data={'Simple QR Code'}
            style={{ backgroundColor: 'white' }}
            className="mb-5 aspect-square h-[20rem] w-full rounded-xl"
            padding={20}
            pieceSize={8}
          />
        </View>
        <View className="gap-3">
          {(showAllPlayers ? players : players.slice(0, 3)).map((player) => (
            <View
              key={player.username}
              className="flex-row items-center gap-3 rounded-2xl bg-card p-2 px-4">
              <Avatar className="h-12 w-12" alt={`${player.username} profile picture`}>
                <AvatarImage source={{ uri: player.profilePicture }} />
              </Avatar>
              <Text className="text-lg font-semibold">{player.username}</Text>
            </View>
          ))}
          <Button variant="outline" onPress={() => setShowAllPlayers(!showAllPlayers)}>
            {showAllPlayers ? 'Show less' : 'Show all'}
          </Button>
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

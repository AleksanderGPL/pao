import { Text } from '@/components/Text';
import { Avatar, AvatarImage } from '@/components/Avatar';
import { useState } from 'react';
import { View, ScrollView, Alert } from 'react-native';
import { Player } from '@/app/game';
import QRCodeStyled from 'react-native-qrcode-styled';
import { Button } from '../Button';
import * as Clipboard from 'expo-clipboard';
import { Copy } from 'lucide-react-native';

export default function LobbyScreen({
  players,
  gameCode,
  onStartGame,
}: {
  players: Player[];
  gameCode: string;
  onStartGame: () => void;
}) {
  const [showAllPlayers, setShowAllPlayers] = useState(false);

  const copyGameCode = async () => {
    try {
      await Clipboard.setStringAsync(gameCode);
      Alert.alert('Copied!', 'Game code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy game code');
    }
  };

  return (
    <>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="p-5 flex-1 pb-0">
        <View className="h-[20rem]">
          <QRCodeStyled
            data={gameCode}
            style={{ backgroundColor: 'white' }}
            className="aspect-square h-[20rem] w-full rounded-xl"
            padding={20}
            pieceSize={8}
          />
          <Button variant="outline" onPress={copyGameCode} className="mb-4">
            <View className="flex-row items-center justify-center gap-2">
              <Text className="font-mono text-lg font-semibold">{gameCode}</Text>
              <Copy size={18} className="text-muted-foreground" />
            </View>
          </Button>
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
            <Text>{showAllPlayers ? 'Show less' : 'Show all'}</Text>
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

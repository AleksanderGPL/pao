import { View } from 'react-native';
import { Card, CardContent } from '../Card';
import { Text } from '../Text';
import { Avatar, AvatarFallback, AvatarImage } from '../Avatar';
import { ShadowView } from '../base/ShadowView';

const getRankColor = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-yellow-500';
    case 2:
      return 'bg-gray-400';
    case 3:
      return 'bg-amber-600';
    default:
      return 'bg-gray-300';
  }
};

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return '🏆';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '';
  }
};

export const WinScreen = ({ leaderBoard }: { leaderBoard: { name: string; kills: number }[] }) => {
  const topPlayers = leaderBoard
    .sort((a, b) => b.kills - a.kills)
    .slice(0, 3)
    .map((player, index) => ({
      name: player.name,
      kills: player.kills,
      initials: player.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
      rank: index + 1,
    }));
  return (
    <View className="flex-1 bg-background px-6 py-8">
      {/* Header */}
      <View className="mb-8 items-center">
        <Text className="mb-2 text-3xl font-bold text-foreground">Game Complete!</Text>
        <Text className="text-lg text-muted-foreground">Final Rankings</Text>
      </View>

      {/* Podium Layout */}
      <View className="flex-1 justify-center">
        <View className="mb-8 flex-row items-end justify-center gap-2">
          {/* 2nd Place */}
          <View className="flex-1">
            <ShadowView className="mb-4 items-center rounded-lg bg-card py-4" shadowSize="lg">
              <View
                className={`h-8 w-8 rounded-full ${getRankColor(2)} mb-3 items-center justify-center`}>
                <Text className="text-sm font-bold text-white">2</Text>
              </View>
              <Avatar className="mb-3 size-14" alt={`${topPlayers[1].name} avatar`}>
                <AvatarFallback>
                  <Text className="text-lg font-semibold">{topPlayers[1].initials}</Text>
                </AvatarFallback>
              </Avatar>
              <CardContent className="p-2">
                <Text className="mb-1 text-center text-sm font-semibold">{topPlayers[1].name}</Text>
                <Text className="text-center text-xs text-muted-foreground">
                  {topPlayers[1].kills} kills
                </Text>
              </CardContent>
            </ShadowView>
            <View className="h-20 w-20 self-center rounded-t-lg bg-gray-400" />
          </View>

          {/* 1st Place */}
          <View className="flex-1">
            <ShadowView className="mb-4 items-center rounded-lg bg-card py-4" shadowSize="2xl">
              <View
                className={`h-10 w-10 rounded-full ${getRankColor(1)} mb-4 items-center justify-center`}>
                <Text className="text-lg font-bold text-white">1</Text>
              </View>
              <Text className="mb-2 text-2xl">{getRankIcon(1)}</Text>
              <Avatar className="mb-4 size-16" alt={`${topPlayers[0].name} avatar`}>
                <AvatarFallback>
                  <Text className="text-xl font-semibold">{topPlayers[0].initials}</Text>
                </AvatarFallback>
              </Avatar>
              <CardContent className="p-2">
                <Text className="mb-1 text-center text-base font-bold">{topPlayers[0].name}</Text>
                <Text className="text-center text-sm text-muted-foreground">
                  {topPlayers[0].kills} kills
                </Text>
              </CardContent>
            </ShadowView>
            <View className="h-28 w-24 self-center rounded-t-lg bg-yellow-500" />
          </View>

          {/* 3rd Place */}
          <View className="flex-1">
            <ShadowView className="mb-4 items-center rounded-lg bg-card py-4" shadowSize="lg">
              <View
                className={`h-8 w-8 rounded-full ${getRankColor(3)} mb-3 items-center justify-center`}>
                <Text className="text-sm font-bold text-white">3</Text>
              </View>
              <Avatar className="mb-3 size-14" alt={`${topPlayers[2].name} avatar`}>
                <AvatarFallback>
                  <Text className="text-lg font-semibold">{topPlayers[2].initials}</Text>
                </AvatarFallback>
              </Avatar>
              <CardContent className="p-2">
                <Text className="mb-1 text-center text-sm font-semibold">{topPlayers[2].name}</Text>
                <Text className="text-center text-xs text-muted-foreground">
                  {topPlayers[2].kills} kills
                </Text>
              </CardContent>
            </ShadowView>
            <View className="h-16 w-16 self-center rounded-t-lg bg-amber-600" />
          </View>
        </View>

        {/* Congratulations Message */}
        <View className="mt-8 items-center">
          <ShadowView shadowSize="lg">
            <Card className="bg-card px-8 py-6">
              <CardContent className="items-center">
                <Text className="mb-2 text-center text-xl font-bold text-foreground">
                  🎉 Congratulations! 🎉
                </Text>
                <Text className="text-center text-base text-muted-foreground">
                  Thanks for playing!
                </Text>
              </CardContent>
            </Card>
          </ShadowView>
        </View>
      </View>
    </View>
  );
};

import { Text } from "@/components/Text";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/Avatar';
import { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Platform,
  SafeAreaView,
} from 'react-native';
import type { ApiResponse } from '@/app/game';
import { getShotImageUrl } from '@/lib/axios';
import { X, Eye } from 'lucide-react-native';

export const SpectatorScreen = ({
  players,
  gameInfo,
}: {
  players: ApiResponse['players'];
  gameInfo: Omit<ApiResponse, 'players'>;
}) => {
  const alivePlayers = players.filter((player) => player.isAlive);
  const eliminatedPlayers = players.filter((player) => !player.isAlive);
  const [selectedShotImage, setSelectedShotImage] = useState<string | null>(null);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: 'white' }}>
      {/* Shot Image Modal */}
      <Modal
        visible={!!selectedShotImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedShotImage(null)}
      >
        <View className="flex-1 bg-black/90 items-center justify-center">
          <TouchableOpacity
            className="absolute top-12 right-4 z-10"
            onPress={() => setSelectedShotImage(null)}
          >
            <X size={24} className="text-white" />
          </TouchableOpacity>
          {selectedShotImage && (
            <Image
              source={{ uri: selectedShotImage }}
              className="w-full h-3/4"
              resizeMode="contain"
            />
          )}
        </View>
      </Modal>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName={`p-5 ${Platform.OS === 'android' ? 'pt-4' : 'pt-8'}`}>
        
        {/* Spectator Header */}
        <Card className="mb-4 bg-red-50 border-red-200">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-center gap-2">
              <Eye size={20} className="text-red-600" />
              <Text className="text-red-700 font-semibold text-lg">Spectator Mode</Text>
            </View>
            <Text className="text-center text-red-600 text-sm mt-1">
              You have been eliminated. Watch the game progress below.
            </Text>
          </CardContent>
        </Card>

        {/* Game Header */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Game {gameInfo.code}</CardTitle>
            <CardDescription>
              {gameInfo.status === 'active' ? '🟢 Active' : '🔴 Inactive'} • {alivePlayers.length}{' '}
              of {players.length} players alive
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Game Stats */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>📊 Game Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-2">
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Players Alive</Text>
                <Text className="font-semibold">
                  {alivePlayers.length}/{players.length}
                </Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-muted-foreground">Players Eliminated</Text>
                <Text className="font-semibold">
                  {eliminatedPlayers.length}/{players.length}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>

        {/* Alive Players */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>✅ Alive Players ({alivePlayers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <View className="space-y-3">
              {alivePlayers.map((player, index) => (
                <View key={index} className="flex-row items-center space-x-3">
                  <Avatar alt={`${player.user.name} profile picture`}>
                    <AvatarImage source={{ uri: player.user.profilePicture }} />
                    <AvatarFallback>
                      <Text className="font-semibold">{player.user.name.charAt(0)}</Text>
                    </AvatarFallback>
                  </Avatar>
                  <View className="flex-1">
                    <Text className="font-medium">{player.user.name}</Text>
                    <Text className="text-sm text-green-600">Active</Text>
                  </View>
                </View>
              ))}
            </View>
          </CardContent>
        </Card>

        {/* Eliminated Players */}
        {eliminatedPlayers.length > 0 && (
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>❌ Eliminated Players ({eliminatedPlayers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <View className="space-y-3">
                {eliminatedPlayers.map((player, index) => {
                  // Construct shot image URL if not provided
                  const shotImageUrl = player.shotImageUrl || getShotImageUrl(gameInfo.code, player.id);
                  
                  return (
                    <View key={index} className="flex-row items-center space-x-3 opacity-60">
                      <Avatar alt={`${player.user.name} profile picture`}>
                        <AvatarImage source={{ uri: player.user.profilePicture }} />
                        <AvatarFallback>
                          <Text className="font-semibold">{player.user.name.charAt(0)}</Text>
                        </AvatarFallback>
                      </Avatar>
                      <View className="flex-1">
                        <Text className="font-medium line-through">{player.user.name}</Text>
                        <Text className="text-sm text-red-600">Eliminated</Text>
                      </View>
                      {/* Shot Image */}
                      <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setSelectedShotImage(shotImageUrl)}
                      >
                        <View className="h-12 w-12 rounded-lg border border-gray-300 bg-gray-100 items-center justify-center overflow-hidden">
                          <Image
                            source={{ uri: shotImageUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                            onError={() => {
                              // Fallback to camera icon if image fails to load
                              console.log('Failed to load shot image:', shotImageUrl);
                            }}
                          />
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </CardContent>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

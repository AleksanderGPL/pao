import { Platform, View } from 'react-native';

import { ThemedText } from 'components/ThemedText';
import { ThemedView } from 'components/ThemedView';

export default function HomeScreen() {
  return (
    <View className="p-10">
      <ThemedText>Join</ThemedText>
    </View>
  );
}

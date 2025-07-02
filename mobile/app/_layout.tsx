import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import 'react-native-reanimated';
import '../global.css';
import { ThemeProvider } from 'components/ThemeProvider';
import { checkUserAuth } from '@/lib/auth';
import { useEffect } from 'react';

export default function RootLayout() {
  const deviceColorScheme = useDeviceColorScheme();


  useEffect(() => {
    checkUserAuth();
  }, []);

  return (
    <ThemeProvider defaultTheme="system">
      <Stack>
        <Stack.Screen
          name="username"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="game"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme as useDeviceColorScheme } from 'react-native';
import 'react-native-reanimated';
import { enableScreens } from 'react-native-screens';
import '../global.css';
import { ThemeProvider } from 'components/ThemeProvider';
import { checkUserAuth } from '@/lib/auth';
import { useEffect } from 'react';
import { useGlobalSearchParams, useSearchParams } from 'expo-router/build/hooks';

// Enable react-native-screens
enableScreens();

export default function RootLayout() {
  const deviceColorScheme = useDeviceColorScheme();
  const pathname = usePathname();
  const searchParams = useGlobalSearchParams();

  useEffect(() => {
    checkUserAuth(pathname, searchParams as Record<string, string>);
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
        <Stack.Screen name="(tabs)" options={{ headerShown: false, gestureEnabled: true }} />
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

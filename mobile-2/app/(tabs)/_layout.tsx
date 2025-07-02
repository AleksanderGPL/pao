import { Tabs } from 'expo-router';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { HapticTab } from 'components/base/HapticTab';
import TabBarBackground from 'components/ui/TabBarBackground';
import { Calendar, Feather, Plane, Home, UserPlus, CirclePlus } from 'lucide-react-native';
import { Icon } from 'components/base/LucideIcon';
import { useTheme } from 'components/ThemeProvider';

// import * as ExpoCalendar from 'expo-calendar';
export default function TabLayout() {
  const { theme } = useTheme();
  // Define theme-aware colors
  const getThemeColors = () => {
    if (theme === 'dark') {
      return {
        activeTintColor: 'hsl(210, 40%, 98%)', // foreground
        inactiveTintColor: 'hsl(215, 20%, 65%)', // foregroundMuted
        backgroundColor: 'hsl(220 11% 12%)', // card
        borderColor: 'hsl(215, 27%, 17%)', // border
      };
    } else {
      return {
        activeTintColor: 'hsl(221, 39%, 11%)', // foreground
        inactiveTintColor: 'hsl(215, 14%, 34%)', // foregroundMuted
        backgroundColor: 'hsl(0, 0%, 100%)', // card (white)
        borderColor: 'hsl(214, 32%, 91%)', // border
      };
    }
  };

  const colors = getThemeColors();
  // useEffect(() => {
  //   (async () => {
  //     const { status } = await ExpoCalendar.requestCalendarPermissionsAsync();
  //     if (status === 'granted') {
  //       const calendars = await ExpoCalendar.getCalendarsAsync(ExpoCalendar.EntityTypes.EVENT);
  //       console.log('Here are all your calendars:');
  //       console.log({ calendars });
  //     }
  //   })();
  // }, []);

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.activeTintColor,
          tabBarInactiveTintColor: colors.inactiveTintColor,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,

          tabBarShowLabel: false,
          tabBarHideOnKeyboard: true,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: 'absolute',
            },
            default: {
              height: 70,
              backgroundColor: colors.backgroundColor,
              // borderTopColor: colors.borderColor,
              borderTopWidth: 0,
              paddingHorizontal: 30,
              borderRadius: 20,
              marginHorizontal: 20,
              marginBottom: 20,
            },
          }),

          tabBarIconStyle: {
            height: 60,
          },
        }}
        backBehavior="history">
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Explore',
            tabBarIcon: ({ color, focused }) => (
              <Icon
                size={25}
                icon={UserPlus}
                className={focused ? 'text-foreground' : 'text-muted-foreground/70'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <Icon
                size={25}
                icon={CirclePlus}
                className={focused ? 'text-foreground' : 'text-muted-foreground/70'}
              />
            ),
          }}
        />
      </Tabs>
    </>
  );
}

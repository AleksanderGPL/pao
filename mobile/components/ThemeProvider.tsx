import React, { createContext, useContext, useState } from 'react';
import { View, useColorScheme as useNativeColorScheme } from 'react-native';
import { themes, type ThemeMode, type ColorScheme } from '../lib/theme';

interface ThemeContextType {
  theme: ColorScheme;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDarkTheme: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({ children, defaultTheme = 'light' }: ThemeProviderProps) {
  const deviceTheme = useNativeColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);

  // Force light mode always
  const resolvedTheme: ColorScheme = 'light';

  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const contextValue: ThemeContextType = {
    theme: resolvedTheme,
    themeMode,
    setTheme,
    isDarkTheme: resolvedTheme === 'dark',
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <View style={themes[resolvedTheme]} className="flex-1">
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

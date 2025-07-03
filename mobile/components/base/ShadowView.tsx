import React from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';

interface ShadowViewProps extends ViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  className?: string;
  shadowColor?: string;
  shadowOffset?: { width: number; height: number };
  shadowOpacity?: number;
  shadowRadius?: number;
  elevation?: number;
}

export function ShadowView({
  children,
  style,
  className,
  shadowColor = '#000',
  shadowOffset = { width: 0, height: 4 },
  shadowOpacity = 0.25,
  shadowRadius = 16.5,
  elevation = 8,
  ...rest
}: ShadowViewProps) {
  return (
    <View
      style={[
        {
          shadowColor,
          shadowOffset,
          shadowOpacity,
          shadowRadius,
          elevation,
        },
        style,
      ]}
      className={className}
      {...rest}
    >
      {children}
    </View>
  );
} 
import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

interface ShadowViewProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  shadowSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function ShadowView({ children, className, shadowSize = 'md', ...rest }: ShadowViewProps) {
  const shadowClasses = {
    sm: 'shadow-sm shadow-black/10',
    md: 'shadow-md shadow-black/10',
    lg: 'shadow-lg shadow-black/10',
    xl: 'shadow-xl shadow-black/10',
    '2xl': 'shadow-2xl',
  };

  const baseClasses = shadowClasses[shadowSize];

  return (
    <View className={cn(baseClasses, className)} {...rest}>
      {children}
    </View>
  );
}

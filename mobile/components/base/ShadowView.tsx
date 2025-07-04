import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../lib/utils';

interface ShadowViewProps extends ViewProps {
  children: React.ReactNode;
  className?: string;
  shadowSize?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function ShadowView({
  children,
  className,
  shadowSize = 'md',
  ...rest
}: ShadowViewProps) {
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
    '2xl': 'shadow-2xl',
  };

  const baseClasses = shadowClasses[shadowSize];

  return (
    <View
      className={cn(baseClasses, className)}
      {...rest}
    >
      {children}
    </View>
  );
} 
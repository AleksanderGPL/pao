import { View } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { Button, buttonVariants } from '../Button';
import { Text } from '../Text';
import React from 'react';
import type { VariantProps } from 'class-variance-authority';

interface BackButtonProps {
  onPress: () => void;
  children?: React.ReactNode;
  className?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
}

export function BackButton({ onPress, children = 'Back', className = 'self-start', variant = 'outline' }: BackButtonProps) {
  return (
    <Button variant={variant} onPress={onPress} className={className}>
      <View className="flex-row items-center gap-2">
        <ArrowLeft size={18} />
        <Text>{children}</Text>
      </View>
    </Button>
  );
} 
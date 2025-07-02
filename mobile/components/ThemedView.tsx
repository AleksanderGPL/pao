import { View, type ViewProps } from 'react-native';
import { cn } from 'lib/utils';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function ThemedView({ className, lightColor, darkColor, ...otherProps }: ThemedViewProps) {
  const baseClasses = 'bg-white dark:bg-gray-950';

  return <View className={cn(baseClasses, className)} {...otherProps} />;
}

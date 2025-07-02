import { Text, type TextProps } from 'react-native';
import { cn } from 'lib/utils';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({ className, type = 'default', ...rest }: ThemedTextProps) {
  const baseClasses = 'text-black dark:text-white';

  const typeClasses = {
    default: 'text-base leading-6',
    defaultSemiBold: 'text-base leading-6 font-semibold',
    title: 'text-3xl font-bold leading-8',
    subtitle: 'text-xl font-bold',
    link: 'text-base leading-7 text-blue-600 dark:text-blue-400',
  };

  return <Text className={cn(baseClasses, typeClasses[type], className)} {...rest} />;
}

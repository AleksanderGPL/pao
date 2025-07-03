import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet, Platform } from 'react-native';

export type HapticTabProps = BottomTabBarButtonProps & { selectedBackgroundColor?: string };

export function HapticTab(props: HapticTabProps) {
  const isSelected = props.accessibilityState?.selected;
  const selectedBg = props.selectedBackgroundColor || '#EBE9FF';

  if (Platform.OS === 'web') {
    // On web, use className for background color
    const className = [
      props.className,
      isSelected ? 'bg-[#EBE9FF] rounded-[12px] mx-1' : '',
    ]
      .filter(Boolean)
      .join(' ');
    return <PlatformPressable {...props} className={className} />;
  }

  return (
    <PlatformPressable
      {...props}
      style={[
        isSelected && { backgroundColor: selectedBg, borderRadius: 12, marginHorizontal: 4 },
        props.style,
      ]}
      android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
      onPressIn={(ev) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}

const styles = StyleSheet.create({
  selectedTab: {
    ...Platform.select({
      web: {
        backgroundColor: '#EBE9FF',
        borderRadius: 12,
        marginHorizontal: 4,
      },
      default: {
        backgroundColor: '#EBE9FF',
        borderRadius: 12,
        marginHorizontal: 4,
      },
    }),
  },
});

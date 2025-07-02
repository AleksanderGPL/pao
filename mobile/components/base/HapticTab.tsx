import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { StyleSheet } from 'react-native';

export function HapticTab(props: BottomTabBarButtonProps) {
  const isSelected = props.accessibilityState?.selected;

  return (
    <PlatformPressable
      {...props}
      style={[props.style, isSelected && styles.selectedTab]}
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
    backgroundColor: 'rgba(128, 128, 128, 0.2)', // Gray background with transparency
    borderRadius: 12,
    marginHorizontal: 4,
  },
});

import { StyleSheet, Text } from 'react-native';

import { colors, components, ripple, size, type } from '@/theme';

import { Touchable } from './touchable';

type Props = {
  label: string;
  selected?: boolean;
  small?: boolean;
  onPress: () => void;
};

export function Chip({ label, selected, small, onPress }: Props) {
  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      ripple={selected ? ripple.onWork : ripple.light}
      style={[components.chip, small && styles.small, selected && components.chipSelected]}
      pressedStyle={selected ? { backgroundColor: colors.workPressed } : components.chipPressed}>
      <Text style={[type.label, small ? null : styles.largeText, { color: selected ? colors.onWork : colors.text }]}>
        {label}
      </Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  small: {
    height: size.chipHeightSmall,
    paddingHorizontal: 14,
  },
  largeText: {
    fontSize: 15,
  },
});

import { StyleSheet, View } from 'react-native';

import { colors, radius, size } from '@/theme';

import { Icon } from './icon';

export function Radio({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, { borderColor: selected ? colors.work : colors.textMuted }]}>
      {selected && <View style={styles.dot} />}
    </View>
  );
}

export function Checkbox({ checked, disabled }: { checked: boolean; disabled?: boolean }) {
  const active = checked && !disabled;
  return (
    <View
      style={[
        styles.checkbox,
        active
          ? { backgroundColor: colors.work, borderColor: colors.work }
          : { borderColor: disabled ? colors.border : colors.textMuted },
      ]}>
      {active && <Icon name="check" size={16} strokeWidth={3} color={colors.onWork} />}
    </View>
  );
}

const styles = StyleSheet.create({
  radio: {
    width: size.radio,
    height: size.radio,
    borderRadius: radius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.work,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, components, radius, space, type } from '@/theme';

import { Icon } from './icon';
import { Switch } from './switch';
import { Touchable } from './touchable';

/** Karta z wierszami rozdzielonymi linią (grupa ustawień). */
export function ListGroup({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <View style={styles.group}>
      {items.map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <View style={[components.divider, styles.divider]} />}
          {child}
        </Fragment>
      ))}
    </View>
  );
}

type RowProps = {
  title: string;
  subtitle?: string;
  onPress: () => void;
  disabled?: boolean;
} & (
  | { switchValue: boolean; value?: never; chevron?: never }
  | { switchValue?: never; value?: string; chevron?: boolean }
);

export function ListRow({ title, subtitle, onPress, disabled, switchValue, value, chevron }: RowProps) {
  const isSwitch = switchValue !== undefined;
  const titleColor = disabled ? colors.textDisabled : colors.text;
  const mutedColor = disabled ? colors.textDisabled : colors.textMuted;

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      scaleTo={1}
      accessibilityRole={isSwitch ? 'switch' : 'button'}
      accessibilityState={isSwitch ? { checked: switchValue, disabled } : { disabled }}
      style={styles.row}
      pressedStyle={{ backgroundColor: colors.surfacePressed }}>
      <View style={styles.texts}>
        <Text style={[type.body, styles.title, { color: titleColor }]}>{title}</Text>
        {subtitle && <Text style={[type.bodyS, { color: mutedColor }]}>{subtitle}</Text>}
      </View>
      {isSwitch && <Switch value={switchValue} disabled={disabled} />}
      {value && <Text style={[type.body, styles.title, { color: mutedColor }]}>{value}</Text>}
      {chevron && <Icon name="chevron-right" size={20} color={disabled ? colors.iconDisabled : colors.textMuted} />}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  divider: {
    marginHorizontal: space.lg,
  },
  row: {
    ...components.listRow,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    gap: space.sm,
  },
  texts: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 16,
  },
});

import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius, ripple, size, type } from '@/theme';

import { Icon, type IconName } from './icon';
import { Touchable } from './touchable';

type Variant = 'primary' | 'outline' | 'break' | 'breakOutline';

const variants = {
  primary: {
    base: { backgroundColor: colors.work },
    pressed: { backgroundColor: colors.workPressed },
    disabled: { backgroundColor: colors.border },
    text: colors.onWork,
    disabledText: colors.textDisabled,
    ripple: ripple.onWork,
  },
  outline: {
    base: { borderWidth: 1.5, borderColor: colors.borderStrong },
    pressed: { backgroundColor: colors.surfaceRaised },
    disabled: { borderColor: colors.border },
    text: colors.text,
    disabledText: colors.textDisabled,
    ripple: ripple.light,
  },
  break: {
    base: { backgroundColor: colors.breakSurface },
    pressed: { backgroundColor: colors.breakSurfacePressed },
    disabled: { backgroundColor: colors.breakDisabledBg },
    text: colors.breakText,
    disabledText: colors.breakDisabledText,
    ripple: ripple.break,
  },
  breakOutline: {
    base: { borderWidth: 1.5, borderColor: colors.breakBorder },
    pressed: { backgroundColor: colors.breakSurface },
    disabled: { borderColor: colors.breakDisabledBg },
    text: colors.breakText,
    disabledText: colors.breakDisabledText,
    ripple: ripple.break,
  },
} satisfies Record<Variant, unknown>;

type Props = {
  title: string;
  onPress: () => void;
  variant?: Variant;
  /** large = przycisk Start (64), domyślnie 56. */
  large?: boolean;
  icon?: IconName;
  iconRight?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', large, icon, iconRight, disabled, style }: Props) {
  const v = variants[variant];
  const color = disabled ? v.disabledText : v.text;
  const iconNode = icon && <Icon name={icon} size={large ? 24 : 22} color={color} />;

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      ripple={v.ripple}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[styles.button, { height: large ? size.buttonPrimaryHeight : size.buttonHeight }, v.base, disabled && v.disabled, style]}
      pressedStyle={v.pressed}>
      <View style={styles.content}>
        {!iconRight && iconNode}
        <Text style={[large ? type.buttonL : type.button, { color }]}>{title}</Text>
        {iconRight && iconNode}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, motion, radius, ripple, size, type } from '@/theme';

import { Icon, type IconName } from './icon';
import { Touchable } from './touchable';

type RoundProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  primary?: boolean;
  iconColor?: string;
};

/** Okrągły przycisk z podpisem (Stop / Pauza / Przerwa teraz). */
export function RoundButton({ icon, label, onPress, primary, iconColor }: RoundProps) {
  const [pressed, setPressed] = useState(false);
  const diameter = primary ? size.roundPrimary : size.roundSecondary;

  return (
    <View style={styles.wrap}>
      <View style={styles.slot}>
        {primary && pressed && <View style={styles.halo} />}
        <Touchable
          onPress={onPress}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          accessibilityRole="button"
          accessibilityLabel={label}
          scaleTo={primary ? motion.pressScale : motion.roundPressScale}
          ripple={primary ? ripple.onWork : ripple.light}
          style={[
            styles.round,
            { width: diameter, height: diameter },
            { backgroundColor: primary ? colors.work : colors.surfaceRaised },
          ]}
          pressedStyle={{ backgroundColor: primary ? colors.workPressed : colors.surfaceRaisedPressed }}>
          <Icon
            name={icon}
            size={primary ? 30 : 24}
            color={iconColor ?? (primary ? colors.onWork : colors.text)}
          />
        </Touchable>
      </View>
      <Text style={[type.caption, styles.label]}>{label}</Text>
    </View>
  );
}

type IconButtonProps = {
  icon: IconName;
  label: string;
  onPress: () => void;
  /** Tło: surface (pasek aplikacji), surfaceRaised (−/+ na kartach) albo brak. */
  background?: string;
  diameter?: number;
  disabled?: boolean;
};

/** Okrągły przycisk z samą ikoną: ustawienia, wstecz, −/+. */
export function IconButton({
  icon,
  label,
  onPress,
  background = colors.surfaceRaised,
  diameter = size.iconButton,
  disabled,
}: IconButtonProps) {
  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      scaleTo={motion.roundPressScale}
      style={[styles.round, { width: diameter, height: diameter, backgroundColor: background }]}
      pressedStyle={{ backgroundColor: colors.surfaceRaisedPressed }}>
      <Icon name={icon} size={size.icon} color={disabled ? colors.iconDisabled : colors.text} />
    </Touchable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: 10,
    width: size.roundPrimary,
  },
  round: {
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  /** Wszystkie przyciski stoją w polu 88×88, żeby środki i podpisy były w jednej linii. */
  slot: {
    width: size.roundPrimary,
    height: size.roundPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: size.roundPrimary + 16,
    height: size.roundPrimary + 16,
    borderRadius: radius.full,
    backgroundColor: colors.workHalo,
  },
  label: {
    textAlign: 'center',
  },
});

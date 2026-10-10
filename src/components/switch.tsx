import { useEffect, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { colors, motion, radius, size } from '@/theme';

const INSET = (size.switchHeight - size.switchThumb) / 2;
const TRAVEL = size.switchWidth - size.switchThumb - INSET * 2;

type Props = {
  value: boolean;
  disabled?: boolean;
};

/**
 * Przełącznik (sam wygląd). Dotyk obsługuje cały wiersz, w którym stoi –
 * w ten sposób łatwiej trafić palcem.
 */
export function Switch({ value, disabled }: Props) {
  const [progress] = useState(() => new Animated.Value(value ? 1 : 0));

  useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: motion.switchMs,
      useNativeDriver: false,
    }).start();
  }, [progress, value]);

  const trackColor = disabled
    ? colors.surfaceRaised
    : progress.interpolate({ inputRange: [0, 1], outputRange: [colors.border, colors.work] });
  const thumbColor = disabled
    ? colors.iconDisabled
    : progress.interpolate({ inputRange: [0, 1], outputRange: [colors.textMuted, colors.onWork] });
  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [0, TRAVEL] });

  return (
    <Animated.View style={[styles.track, { backgroundColor: trackColor }]}>
      <Animated.View style={[styles.thumb, { backgroundColor: thumbColor, transform: [{ translateX }] }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: size.switchWidth,
    height: size.switchHeight,
    borderRadius: radius.full,
    padding: INSET,
  },
  thumb: {
    width: size.switchThumb,
    height: size.switchThumb,
    borderRadius: radius.full,
  },
});

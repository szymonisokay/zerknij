import { useState, type ReactNode } from 'react';
import {
  Animated,
  Pressable,
  type GestureResponderEvent,
  type PressableAndroidRippleConfig,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { motion, ripple as ripples } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  /** Skala przy wciśnięciu (design: 0.96, okrągłe 0.94). */
  scaleTo?: number;
  ripple?: PressableAndroidRippleConfig | null;
  children?: ReactNode;
};

/** Pressable ze stanem „wciśnięty” z design systemu: inne tło, lekkie zmniejszenie i fala. */
export function Touchable({
  style,
  pressedStyle,
  scaleTo = motion.pressScale,
  ripple = ripples.light,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Props) {
  const [pressed, setPressed] = useState(false);
  const [scale] = useState(() => new Animated.Value(1));

  const animateTo = (toValue: number) =>
    Animated.timing(scale, { toValue, duration: 100, useNativeDriver: true }).start();

  const handlePressIn = (e: GestureResponderEvent) => {
    setPressed(true);
    animateTo(scaleTo);
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    setPressed(false);
    animateTo(1);
    onPressOut?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      android_ripple={ripple ?? undefined}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[{ overflow: 'hidden' }, style, pressed && pressedStyle, { transform: [{ scale }] }]}>
      {children}
    </AnimatedPressable>
  );
}

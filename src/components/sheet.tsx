import { useEffect, useState, type ReactNode } from 'react';
import { Animated, Easing, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, components, radius, space } from '@/theme';

type Props = {
  /** Wołane po animacji zamknięcia – rodzic wtedy odmontowuje panel. */
  onClose: () => void;
  /** Dostaje `close`, żeby przyciski w panelu mogły go zamknąć z animacją. */
  children: (close: () => void) => ReactNode;
};

/** Panel dolny (bottom sheet) na przyciemnionym tle. Zamyka się tapnięciem w tło lub przyciskiem wstecz. */
export function Sheet({ onClose, children }: Props) {
  const insets = useSafeAreaInsets();
  const [anim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [anim]);

  const close = () =>
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => onClose());

  return (
    <Modal transparent visible statusBarTranslucent navigationBarTranslucent animationType="none" onRequestClose={close}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.scrim,
          { opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.85] }) },
        ]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Zamknij" />
      </Animated.View>

      <View style={styles.bottom} pointerEvents="box-none">
        <Animated.View
          style={[
            components.sheet,
            { paddingBottom: space.md + insets.bottom },
            { transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [800, 0] }) }] },
          ]}>
          <View style={styles.handle} />
          {children(close)}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    backgroundColor: colors.scrim,
  },
  bottom: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
  },
});

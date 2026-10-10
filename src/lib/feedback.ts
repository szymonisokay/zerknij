import * as Haptics from 'expo-haptics';
import { Vibration } from 'react-native';

import { settingsStore } from '@/state/settings';

/** Krótki „klik” przy Start, Pauza i Stop. */
export function click() {
  Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm).catch(() => {});
}

/** Wibracja przy zmianie fazy – tylko gdy włączone „Wibracje”. */
export function phaseVibration() {
  if (settingsStore.get().vibration) Vibration.vibrate([0, 250, 150, 250]);
}

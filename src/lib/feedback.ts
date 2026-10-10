import * as Haptics from 'expo-haptics';

/** Krótki „klik” przy Start, Pauza i Stop. (Wibracje przy zmianie fazy robi moduł natywny.) */
export function click() {
  Haptics.performAndroidHapticsAsync(Haptics.AndroidHaptics.Confirm).catch(() => {});
}

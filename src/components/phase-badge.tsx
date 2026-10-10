import { Text, View } from 'react-native';

import { colors, components, radius, size, type } from '@/theme';

const tones = {
  work: { label: 'Praca', bg: colors.workSoft, fg: colors.work },
  break: { label: 'Przerwa', bg: colors.breakSurface, fg: colors.break },
  paused: { label: 'Pauza', bg: colors.surfaceRaised, fg: colors.textMuted },
};

/** Plakietka fazy: kolor zawsze idzie w parze z tekstem. */
export function PhaseBadge({ tone }: { tone: keyof typeof tones }) {
  const t = tones[tone];
  return (
    <View style={[components.badge, { backgroundColor: t.bg }]}>
      <View style={{ width: size.dot, height: size.dot, borderRadius: radius.full, backgroundColor: t.fg }} />
      <Text style={[type.label, { color: t.fg, fontSize: 16 }]}>{t.label}</Text>
    </View>
  );
}

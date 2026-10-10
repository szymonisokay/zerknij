import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon } from '@/components/icon';
import { LimitSheet } from '@/components/limit-sheet';
import { ListGroup, ListRow } from '@/components/list';
import { IconButton } from '@/components/round-button';
import { plural } from '@/lib/format';
import { chooseSound, updateSettings, useSettings, type Settings } from '@/state/settings';
import { colors, screen, space, type } from '@/theme';

export default function SettingsScreen() {
  const s = useSettings();
  const [limitOpen, setLimitOpen] = useState(false);
  const toggle = (key: keyof Settings) => () => updateSettings({ [key]: !s[key] });

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <IconButton icon="arrow-left" label="Wstecz" background="transparent" onPress={() => router.back()} />
        <Text style={type.h3}>Ustawienia</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Sygnały">
          <ListGroup>
            <ListRow title="Dźwięki" switchValue={s.sound} onPress={toggle('sound')} />
            <ListRow
              title="Start przerwy"
              subtitle={`Systemowy · ${s.breakStartSound?.title ?? 'domyślny'}`}
              chevron
              disabled={!s.sound}
              onPress={() => chooseSound('breakStartSound')}
            />
            <ListRow
              title="Koniec przerwy"
              subtitle={`Systemowy · ${s.breakEndSound?.title ?? 'domyślny'}`}
              chevron
              disabled={!s.sound}
              onPress={() => chooseSound('breakEndSound')}
            />
            <ListRow title="Wibracje" switchValue={s.vibration} onPress={toggle('vibration')} />
          </ListGroup>
        </Section>

        <Section title="Przerwa">
          <ListGroup>
            <ListRow
              title="Pokaż na pełnym ekranie"
              subtitle="Także na ekranie blokady"
              switchValue={s.fullScreenBreak}
              onPress={toggle('fullScreenBreak')}
            />
            <ListRow title="Nie wygaszaj ekranu" switchValue={s.keepAwakeOnBreak} onPress={toggle('keepAwakeOnBreak')} />
          </ListGroup>
        </Section>

        <Section title="Pętla">
          <ListGroup>
            <ListRow title="Limit cykli" value={limitSummary(s)} chevron onPress={() => setLimitOpen(true)} />
            <ListRow
              title="Pauza przy wyłączonym ekranie"
              subtitle="Nie liczy, gdy telefon leży"
              switchValue={s.pauseOnScreenOff}
              onPress={toggle('pauseOnScreenOff')}
            />
          </ListGroup>
        </Section>

        <View style={styles.spacer} />

        <View style={styles.footer}>
          <Icon name="wifi-off" size={20} color={colors.textMuted} />
          <Text style={[type.caption, styles.footerText]}>
            Działa w pełni offline · wersja {Constants.expoConfig?.version}
          </Text>
        </View>
      </ScrollView>

      {limitOpen && <LimitSheet onClose={() => setLimitOpen(false)} />}
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={[type.sectionTitle, styles.sectionTitle]}>{title}</Text>
      {children}
    </View>
  );
}

function limitSummary({ limitMode, limitCount, limitTime }: Settings) {
  if (limitMode === 'count') return `${limitCount} ${plural(limitCount, 'cykl', 'cykle', 'cykli')}`;
  if (limitMode === 'until') return `Do ${limitTime}`;
  return 'Bez limitu';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
    paddingHorizontal: space.xs,
    paddingTop: space.xs,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: screen.paddingHorizontal,
    paddingBottom: space.md,
  },
  section: {
    marginTop: space.xl,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    paddingHorizontal: space.xxs,
  },
  spacer: {
    flexGrow: 1,
    minHeight: space.xxxl,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
  },
  footerText: {
    fontSize: 14,
  },
});

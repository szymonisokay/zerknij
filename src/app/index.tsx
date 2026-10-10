import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { Chip } from '@/components/chip';
import { Icon } from '@/components/icon';
import { ListGroup, ListRow } from '@/components/list';
import { IconButton } from '@/components/round-button';
import { click } from '@/lib/feedback';
import { breakLabel, clock, plural } from '@/lib/format';
import { startSession, useSession } from '@/state/session';
import { BREAK_SEC, PRESETS, updateSettings, useSettings, WORK_MIN, type Settings } from '@/state/settings';
import { colors, components, radius, screen, size, space, type } from '@/theme';

export default function StartScreen() {
  const session = useSession();
  const settings = useSettings();
  const { workMin, breakSec } = settings;

  if (session) return <Redirect href="/session" />;

  // Po starcie ekran sam przekieruje na /session (Redirect wyżej).
  const start = () => {
    click();
    startSession();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={type.h3}>Zerknij</Text>
          <IconButton
            icon="settings"
            label="Ustawienia"
            background={colors.surface}
            onPress={() => router.push('/settings')}
          />
        </View>

        <Text style={[type.h1, styles.title]}>Daj oczom chwilę oddechu</Text>
        <Text style={[type.body, styles.lead]}>
          Co 20 minut spójrz na coś oddalonego o ok. 6 m przez 20 sekund. Timer sam wraca do pracy.
        </Text>

        <View style={styles.chips}>
          {PRESETS.map((p) => (
            <Chip
              key={`${p.workMin}-${p.breakSec}`}
              label={`${p.workMin} min · ${breakLabel(p.breakSec)}`}
              selected={p.workMin === workMin && p.breakSec === breakSec}
              onPress={() => updateSettings(p)}
            />
          ))}
        </View>

        <View style={styles.cards}>
          <TimeCard
            label="Czas pracy"
            dotColor={colors.work}
            value={clock(workMin * 60)}
            onStep={(dir) => updateSettings({ workMin: step(workMin, dir, WORK_MIN) })}
            canDecrease={workMin > WORK_MIN.min}
            canIncrease={workMin < WORK_MIN.max}
          />
          <TimeCard
            label="Przerwa"
            dotColor={colors.break}
            value={clock(breakSec)}
            onStep={(dir) => updateSettings({ breakSec: step(breakSec, dir, BREAK_SEC) })}
            canDecrease={breakSec > BREAK_SEC.min}
            canIncrease={breakSec < BREAK_SEC.max}
          />
        </View>

        <View style={styles.section}>
          <ListGroup>
            <ListRow title="Dźwięk" switchValue={settings.sound} onPress={() => updateSettings({ sound: !settings.sound })} />
            <ListRow
              title="Wibracje"
              switchValue={settings.vibration}
              onPress={() => updateSettings({ vibration: !settings.vibration })}
            />
          </ListGroup>
        </View>

        <View style={styles.spacer} />

        <Button title="Start" icon="play" large onPress={start} />
        <View style={styles.footer}>
          <Icon name="repeat" size={18} color={colors.textMuted} />
          <Text style={type.caption}>{loopHint(settings)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type TimeCardProps = {
  label: string;
  dotColor: string;
  value: string;
  onStep: (dir: 1 | -1) => void;
  canDecrease: boolean;
  canIncrease: boolean;
};

function TimeCard({ label, dotColor, value, onStep, canDecrease, canIncrease }: TimeCardProps) {
  return (
    <View style={[components.card, styles.timeCard]}>
      <View style={styles.timeCardText}>
        <View style={styles.timeCardLabel}>
          <View style={[styles.dot, { backgroundColor: dotColor }]} />
          <Text style={[type.bodyS, { color: colors.textMuted }]}>{label}</Text>
        </View>
        <Text style={type.valueL}>{value}</Text>
      </View>
      <IconButton icon="minus" label={`${label}: mniej`} onPress={() => onStep(-1)} disabled={!canDecrease} />
      <IconButton icon="plus" label={`${label}: więcej`} onPress={() => onStep(1)} disabled={!canIncrease} />
    </View>
  );
}

function step(value: number, dir: 1 | -1, range: { min: number; max: number; step: number }) {
  return Math.min(range.max, Math.max(range.min, value + dir * range.step));
}

function loopHint({ limitMode, limitCount, limitTime }: Settings) {
  if (limitMode === 'count') return `Zatrzyma się po ${limitCount} ${plural(limitCount, 'cyklu', 'cyklach', 'cyklach')}`;
  if (limitMode === 'until') return `Zatrzyma się o ${limitTime}`;
  return 'Działa w pętli, dopóki nie zatrzymasz';
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: screen.paddingHorizontal,
    paddingTop: space.xs,
    paddingBottom: space.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    marginTop: space.lg,
  },
  lead: {
    marginTop: space.xs,
    color: colors.textMuted,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
    marginTop: space.md,
  },
  cards: {
    gap: space.sm,
    marginTop: screen.sectionGap,
  },
  section: {
    marginTop: screen.sectionGap,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  timeCardText: {
    flex: 1,
    gap: space.xxs,
  },
  timeCardLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  },
  dot: {
    width: size.dot,
    height: size.dot,
    borderRadius: radius.full,
  },
  spacer: {
    flexGrow: 1,
    minHeight: space.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xs,
    marginTop: space.md,
  },
});

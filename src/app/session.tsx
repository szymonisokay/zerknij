import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/button';
import { HorizonIllustration, Icon } from '@/components/icon';
import { PhaseBadge } from '@/components/phase-badge';
import { ProgressRing } from '@/components/progress-ring';
import { RoundButton } from '@/components/round-button';
import { Touchable } from '@/components/touchable';
import { click } from '@/lib/feedback';
import { breakLabel, clock, durationLabel, plural } from '@/lib/format';
import {
  breakNow,
  isLastCycle,
  phaseLength,
  skipBreak,
  snoozeBreak,
  stopSession,
  syncSession,
  timeLeft,
  togglePause,
  useSession,
  useTodayStats,
  type Session,
} from '@/state/session';
import { useSettings } from '@/state/settings';
import { colors, motion, radius, ripple, screen, size, space, type } from '@/theme';

export default function SessionScreen() {
  const session = useSession();
  const { keepAwakeOnBreak } = useSettings();
  const now = useNow();
  const isBreak = session?.phase === 'break';

  const [phaseAnim] = useState(() => new Animated.Value(isBreak ? 1 : 0));
  useEffect(() => {
    Animated.timing(phaseAnim, {
      toValue: isBreak ? 1 : 0,
      duration: motion.phaseTransitionMs,
      useNativeDriver: false,
    }).start();
  }, [phaseAnim, isBreak]);

  useEffect(() => {
    if (!isBreak || !keepAwakeOnBreak) return;
    activateKeepAwakeAsync('break');
    return () => {
      deactivateKeepAwake('break');
    };
  }, [isBreak, keepAwakeOnBreak]);

  if (!session) return <Redirect href="/" />;

  const backgroundColor = phaseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.bg, colors.breakBg],
  });

  return (
    <Animated.View style={[styles.fill, { backgroundColor }]}>
      <SafeAreaView style={styles.fill} edges={['top', 'bottom']}>
        {isBreak ? <BreakView session={session} now={now} /> : <WorkView session={session} now={now} />}
      </SafeAreaView>
    </Animated.View>
  );
}

/**
 * Odświeża ekran co pełną sekundę. Fazy przełącza moduł natywny (także w tle) –
 * tu tylko go szturchamy, żeby zmiana na ekranie wypadła dokładnie o czasie.
 */
function useNow() {
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      syncSession();
      const t = Date.now();
      setNow(t);
      timer = setTimeout(tick, 1000 - (t % 1000) + 10);
    };
    tick();
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      clearTimeout(timer);
      tick();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, []);

  return now;
}

const secondsLeft = (s: Session, now: number) => Math.ceil(timeLeft(s, now) / 1000);

function TopBar({ session, tone }: { session: Session; tone: 'work' | 'break' | 'paused' }) {
  const cycleText = session.maxCycles ? `Cykl ${session.cycle} z ${session.maxCycles}` : `Cykl ${session.cycle}`;
  return (
    <View style={styles.topBar}>
      <PhaseBadge tone={tone} />
      <Text style={[type.body, styles.cycle, { color: tone === 'break' ? colors.breakTextMuted : colors.textMuted }]}>
        {cycleText}
      </Text>
    </View>
  );
}

function WorkView({ session, now }: { session: Session; now: number }) {
  const stats = useTodayStats(now);
  const paused = session.pausedLeft != null;
  const left = timeLeft(session, now);
  const breakSec = session.breakMs / 1000;
  const workMin = session.workMs / 60_000;
  const next = isLastCycle(session)
    ? `Następnie: ostatnia przerwa ${breakLabel(breakSec)}, potem koniec`
    : `Następnie: przerwa ${breakLabel(breakSec)}, potem znów ${workMin} min`;

  return (
    <View style={styles.screen}>
      <TopBar session={session} tone={paused ? 'paused' : 'work'} />

      <View style={styles.center}>
        <ProgressRing
          diameter={size.ringWork.diameter}
          stroke={size.ringWork.stroke}
          progress={left / phaseLength(session)}
          color={paused ? colors.textMuted : colors.work}
          trackColor={colors.surfaceRaised}>
          <Text style={[type.timerXL, paused && { color: colors.textMuted }]}>{clock(secondsLeft(session, now))}</Text>
          <Text style={[type.body, styles.ringLabel]}>{paused ? 'wstrzymane' : 'do przerwy'}</Text>
        </ProgressRing>

        <View style={styles.nextPill}>
          <View style={[styles.dot, { backgroundColor: colors.break }]} />
          <Text style={[type.body, styles.nextText]} numberOfLines={1} adjustsFontSizeToFit>
            {next}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Stat value={String(stats.breaks)} label={plural(stats.breaks, 'przerwa dziś', 'przerwy dziś', 'przerw dziś')} />
        <Stat value={durationLabel(Math.floor((now - session.startedAt) / 60_000))} label="czas sesji" />
        <Stat value={String(stats.skipped)} label="pominięte" />
      </View>

      <View style={styles.controls}>
        <RoundButton
          icon="stop"
          label="Stop"
          onPress={() => {
            click();
            stopSession();
          }}
        />
        <RoundButton
          primary
          icon={paused ? 'play' : 'pause'}
          label={paused ? 'Wznów' : 'Pauza'}
          onPress={() => {
            click();
            togglePause();
          }}
        />
        <RoundButton icon="eye" label="Przerwa teraz" iconColor={colors.break} onPress={() => breakNow()} />
      </View>
    </View>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={type.stat}>{value}</Text>
      <Text style={type.caption}>{label}</Text>
    </View>
  );
}

function BreakView({ session, now }: { session: Session; now: number }) {
  const secs = secondsLeft(session, now);
  const workMin = session.workMs / 60_000;

  return (
    <View style={styles.screen}>
      <TopBar session={session} tone="break" />

      <View style={styles.center}>
        <View style={styles.breakIntro}>
          <Text style={[type.display, styles.breakTitle]}>Spójrz w dal</Text>
          <Text style={[type.bodyL, styles.breakLead]}>
            Skup wzrok na czymś oddalonym o ok. 6 metrów. Spokojnie pomrugaj.
          </Text>
        </View>

        <ProgressRing
          diameter={size.ringBreak.diameter}
          stroke={size.ringBreak.stroke}
          progress={timeLeft(session, now) / phaseLength(session)}
          color={colors.break}
          trackColor={colors.breakSurface}>
          <HorizonIllustration />
          <Text style={[type.timerL, styles.breakTimer]}>{secs < 60 ? secs : clock(secs)}</Text>
          <Text style={[type.body, { color: colors.breakTextMuted }]}>
            {secs < 60 ? plural(secs, 'sekunda', 'sekundy', 'sekund') : 'do końca'}
          </Text>
        </ProgressRing>

        {/* Ikona w środku tekstu – wtedy całość jest wyśrodkowana, także gdy tekst się zawinie. */}
        <Text style={[type.body, styles.breakHint]} textBreakStrategy="balanced">
          <View style={styles.inlineIcon}>
            <Icon name="repeat" size={18} color={colors.breakTextMuted} />
          </View>
          {'  '}
          {isLastCycle(session)
            ? 'To ostatnia przerwa, potem koniec sesji'
            : `Potem automatycznie wracamy do ${workMin} min pracy`}
        </Text>
      </View>

      <Touchable
        onPress={() => snoozeBreak()}
        accessibilityRole="button"
        accessibilityLabel="Odłóż przerwę o 5 minut"
        ripple={ripple.break}
        style={styles.snooze}
        pressedStyle={{ backgroundColor: colors.breakSurface }}>
        <Text style={[type.label, styles.snoozeText]}>Za 5 min</Text>
      </Touchable>

      <View style={styles.breakButtons}>
        <Button
          title="Zakończ"
          variant="breakOutline"
          style={styles.breakEnd}
          onPress={() => {
            click();
            stopSession();
          }}
        />
        <Button
          title="Pomiń przerwę"
          variant="break"
          icon="skip-forward"
          iconRight
          style={styles.breakSkip}
          onPress={() => skipBreak()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: screen.paddingHorizontal,
    paddingTop: space.xs,
    paddingBottom: space.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cycle: {
    fontSize: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.xxxl,
  },
  ringLabel: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: space.xxs,
  },
  nextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: space.sm,
    minHeight: 44,
    paddingHorizontal: space.lg,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  nextText: {
    flexShrink: 1,
  },
  dot: {
    width: size.dot,
    height: size.dot,
    borderRadius: radius.full,
  },
  stats: {
    flexDirection: 'row',
    paddingVertical: space.md,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: space.xs,
    marginTop: space.xl,
  },
  breakIntro: {
    alignItems: 'center',
    gap: space.sm,
  },
  breakTitle: {
    color: colors.breakText,
    textAlign: 'center',
  },
  breakLead: {
    color: colors.breakTextSecondary,
    textAlign: 'center',
  },
  breakTimer: {
    color: colors.breakText,
    marginTop: space.xs,
  },
  breakHint: {
    color: colors.breakTextMuted,
    textAlign: 'center',
  },
  inlineIcon: {
    width: 18,
    height: 18,
    transform: [{ translateY: 3 }],
  },
  snooze: {
    alignSelf: 'center',
    height: size.chipHeight,
    paddingHorizontal: 18,
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.breakBorder,
    marginBottom: space.md,
  },
  snoozeText: {
    color: colors.breakText,
    fontSize: 15,
  },
  breakButtons: {
    flexDirection: 'row',
    gap: space.sm,
  },
  breakEnd: {
    flex: 1,
  },
  breakSkip: {
    flex: 1.38,
  },
});

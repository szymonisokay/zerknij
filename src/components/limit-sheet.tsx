import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { breakLabel, durationLabel, timeOfDay } from '@/lib/format';
import { LIMIT_COUNT, updateSettings, useSettings, type LimitMode } from '@/state/settings';
import { colors, radius, space, type } from '@/theme';

import { Button } from './button';
import { Chip } from './chip';
import { Checkbox, Radio } from './choice';
import { IconButton } from './round-button';
import { Sheet } from './sheet';
import { Touchable } from './touchable';

/** Szybkie wybory liczby cykli: tyle, ile mieści się w 1, 2 i 4 godzinach. */
const QUICK_HOURS = [1, 2, 4];

export function LimitSheet({ onClose }: { onClose: () => void }) {
  const settings = useSettings();
  const [mode, setMode] = useState<LimitMode>(settings.limitMode);
  const [count, setCount] = useState(settings.limitCount);
  const [time, setTime] = useState(settings.limitTime);
  const [notify, setNotify] = useState(settings.notifyOnEnd);
  const [openedAt] = useState(Date.now);

  const cycleMs = settings.workMin * 60_000 + settings.breakSec * 1000;
  const quick = [...new Map(QUICK_HOURS.map((h) => [Math.max(1, Math.round((h * 3_600_000) / cycleMs)), h])).entries()];

  const pickTime = () => {
    const [h, m] = time.split(':').map(Number);
    const value = new Date();
    value.setHours(h, m, 0, 0);
    DateTimePickerAndroid.open({
      value,
      mode: 'time',
      is24Hour: true,
      onValueChange: (_, date) => {
        setTime(timeOfDay(date));
        setMode('until');
      },
    });
  };

  return (
    <Sheet onClose={onClose}>
      {(close) => (
        <>
          <View style={styles.intro}>
            <Text style={type.h2}>Limit cykli</Text>
            <Text style={[type.bodyS, styles.muted]}>
              Kiedy timer ma się sam zatrzymać? Jeden cykl to {settings.workMin} min pracy i{' '}
              {breakLabel(settings.breakSec)} przerwy.
            </Text>
          </View>

          <View style={styles.options}>
            <Option
              title="Bez limitu"
              subtitle="Działa, dopóki nie zatrzymasz"
              selected={mode === 'none'}
              onPress={() => setMode('none')}
            />

            <Option title="Liczba cykli" selected={mode === 'count'} onPress={() => setMode('count')}>
              {mode === 'count' && (
                <View style={styles.countBody}>
                  <View style={styles.stepper}>
                    <IconButton
                      icon="minus"
                      label="Mniej cykli"
                      diameter={44}
                      background={colors.surfacePressed}
                      disabled={count <= LIMIT_COUNT.min}
                      onPress={() => setCount((c) => Math.max(LIMIT_COUNT.min, c - 1))}
                    />
                    <Text style={[type.valueM, styles.count]}>{count}</Text>
                    <IconButton
                      icon="plus"
                      label="Więcej cykli"
                      diameter={44}
                      background={colors.surfacePressed}
                      disabled={count >= LIMIT_COUNT.max}
                      onPress={() => setCount((c) => Math.min(LIMIT_COUNT.max, c + 1))}
                    />
                    <View style={styles.estimate}>
                      <Text style={[type.bodyS, styles.muted]}>ok. {durationLabel((count * cycleMs) / 60_000)}</Text>
                      <Text style={[type.bodyS, styles.muted]}>
                        koniec ~{timeOfDay(new Date(openedAt + count * cycleMs))}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.quick}>
                    {quick.map(([n, h]) => (
                      <Chip key={n} small label={`${n} (${h} h)`} selected={n === count} onPress={() => setCount(n)} />
                    ))}
                  </View>
                </View>
              )}
            </Option>

            <Option
              title="Do godziny"
              subtitle="Np. koniec pracy"
              selected={mode === 'until'}
              onPress={() => setMode('until')}
              right={
                <Touchable
                  onPress={pickTime}
                  accessibilityRole="button"
                  accessibilityLabel={`Godzina zakończenia ${time}`}
                  style={styles.timeField}
                  pressedStyle={{ backgroundColor: colors.surfaceRaisedPressed }}>
                  <Text style={[type.stat, { color: mode === 'until' ? colors.text : colors.textMuted }]}>{time}</Text>
                </Touchable>
              }
            />
          </View>

          <Pressable
            style={styles.notify}
            disabled={mode === 'none'}
            onPress={() => setNotify((n) => !n)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: notify, disabled: mode === 'none' }}>
            <Checkbox checked={notify} disabled={mode === 'none'} />
            <Text style={[type.body, { color: mode === 'none' ? colors.textDisabled : colors.text }]}>
              Powiadom mnie, gdy sesja się zakończy
            </Text>
          </Pressable>

          <View style={styles.buttons}>
            <Button title="Anuluj" variant="outline" style={styles.cancel} onPress={close} />
            <Button
              title="Zapisz"
              style={styles.save}
              onPress={() => {
                updateSettings({ limitMode: mode, limitCount: count, limitTime: time, notifyOnEnd: notify });
                close();
              }}
            />
          </View>
        </>
      )}
    </Sheet>
  );
}

type OptionProps = {
  title: string;
  subtitle?: string;
  selected: boolean;
  onPress: () => void;
  right?: ReactNode;
  children?: ReactNode;
};

function Option({ title, subtitle, selected, onPress, right, children }: OptionProps) {
  return (
    <Touchable
      onPress={onPress}
      scaleTo={1}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={[styles.option, selected && styles.optionSelected]}
      pressedStyle={{ backgroundColor: colors.surfacePressed }}>
      <View style={styles.optionRow}>
        <Radio selected={selected} />
        <View style={styles.optionTexts}>
          <Text style={[type.body, styles.optionTitle]}>{title}</Text>
          {subtitle && <Text style={[type.bodyS, styles.muted]}>{subtitle}</Text>}
        </View>
        {right}
      </View>
      {children}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  intro: {
    gap: space.xs,
  },
  muted: {
    color: colors.textMuted,
  },
  options: {
    gap: 10,
  },
  option: {
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: colors.surfaceRaised,
  },
  optionSelected: {
    borderColor: colors.work,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  optionTexts: {
    flex: 1,
    gap: 2,
  },
  optionTitle: {
    fontSize: 16,
  },
  countBody: {
    marginTop: space.md,
    marginLeft: 38,
    gap: space.md,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  count: {
    minWidth: 60,
    textAlign: 'center',
  },
  estimate: {
    flex: 1,
    alignItems: 'flex-end',
  },
  quick: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.xs,
  },
  timeField: {
    height: 44,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfacePressed,
  },
  notify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minHeight: 44,
  },
  buttons: {
    flexDirection: 'row',
    gap: space.sm,
  },
  cancel: {
    flex: 1,
  },
  save: {
    flex: 1.38,
  },
});

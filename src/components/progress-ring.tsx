import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type Props = {
  diameter: number;
  stroke: number;
  /** 0–1: jaka część łuku jest wypełniona (od godziny 12, zgodnie z ruchem wskazówek). */
  progress: number;
  color: string;
  trackColor: string;
  children?: ReactNode;
};

export function ProgressRing({ diameter, stroke, progress, color, trackColor, children }: Props) {
  const r = (diameter - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(1, Math.max(0, progress));
  const c = diameter / 2;

  return (
    <View style={{ width: diameter, height: diameter }}>
      <Svg width={diameter} height={diameter}>
        <Circle cx={c} cy={c} r={r} stroke={trackColor} strokeWidth={stroke} fill="none" />
        {clamped > 0 && (
          <Circle
            cx={c}
            cy={c}
            r={r}
            stroke={color}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${c} ${c})`}
          />
        )}
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

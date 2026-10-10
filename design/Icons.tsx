/**
 * Zerknij – ikony z projektu jako komponenty React Native.
 *   npx expo install react-native-svg
 *
 * Użycie: <Icon name="pause" size={30} color={colors.onWork} />
 */
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'settings' | 'play' | 'pause' | 'stop' | 'eye' | 'arrow-left'
  | 'chevron-right' | 'repeat' | 'wifi-off' | 'skip-forward';

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number };

const FILLED: IconName[] = ['play', 'pause', 'stop'];

export function Icon({ name, size = 24, color = '#E8EFEA', strokeWidth = 2 }: Props) {
  const filled = FILLED.includes(name);
  const p = filled
    ? { fill: color }
    : { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...p}>
      {name === 'settings' && (
        <>
          <Circle cx="12" cy="12" r="3" />
          <Path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </>
      )}
      {name === 'play' && <Path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" />}
      {name === 'pause' && (
        <>
          <Rect x="6" y="4.5" width="4" height="15" rx="1.5" />
          <Rect x="14" y="4.5" width="4" height="15" rx="1.5" />
        </>
      )}
      {name === 'stop' && <Rect x="5" y="5" width="14" height="14" rx="2.5" />}
      {name === 'eye' && (
        <>
          <Path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <Circle cx="12" cy="12" r="3" />
        </>
      )}
      {name === 'arrow-left' && (
        <>
          <Path d="M19 12H5" />
          <Path d="M12 19l-7-7 7-7" />
        </>
      )}
      {name === 'chevron-right' && <Path d="M9 6l6 6-6 6" />}
      {name === 'repeat' && (
        <>
          <Path d="M17 2l4 4-4 4" />
          <Path d="M3 11V9a3 3 0 0 1 3-3h15" />
          <Path d="M7 22l-4-4 4-4" />
          <Path d="M21 13v2a3 3 0 0 1-3 3H3" />
        </>
      )}
      {name === 'wifi-off' && (
        <>
          <Path d="M1 1l22 22" />
          <Path d="M16.7 11.1A10.9 10.9 0 0 1 19 12.5" />
          <Path d="M5 12.6a11 11 0 0 1 5.2-2.5" />
          <Path d="M10.7 5.1A16 16 0 0 1 22.6 9" />
          <Path d="M1.4 9a16 16 0 0 1 4.3-2.7" />
          <Path d="M8.5 16.1a5 5 0 0 1 7 0" />
          <Path d="M12 20h.01" />
        </>
      )}
      {name === 'skip-forward' && (
        <>
          <Path d="M5 4l10 8-10 8z" />
          <Path d="M19 5v14" />
        </>
      )}
    </Svg>
  );
}

/** Ilustracja „horyzont” z ekranu przerwy (56 × 32). */
export function HorizonIllustration({ width = 56, color = '#F4B860' }: { width?: number; color?: string }) {
  return (
    <Svg width={width} height={(width * 32) / 56} viewBox="0 0 56 32" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <Path d="M2 24h52" />
      <Path d="M8 24l10-12 7 7 9-13 14 18" />
      <Circle cx="44" cy="6" r="3" />
    </Svg>
  );
}

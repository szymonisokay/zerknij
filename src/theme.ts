/**
 * Zerknij – design tokens (źródło: design/theme.ts, opis: design/DESIGN_SYSTEM.md).
 *
 * Fonty ładuje src/app/_layout.tsx przez useAppFonts().
 */
import { TextStyle, ViewStyle } from 'react-native';
import {
  useFonts,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

/* ───────────── Fonty ───────────── */

export const fonts = {
  displayMedium: 'SpaceGrotesk_500Medium',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodySemiBold: 'DMSans_600SemiBold',
  bodyBold: 'DMSans_700Bold',
} as const;

export function useAppFonts(): boolean {
  const [loaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });
  return loaded;
}

/* ───────────── Kolory ───────────── */

export const colors = {
  // Neutralne
  bg: '#0E1311',
  bgDeep: '#0A0D0C',
  scrim: '#060807',
  surface: '#171E1B',
  surfaceRaised: '#1F2824',
  surfacePressed: '#24302B',
  surfaceRaisedPressed: '#33413B',
  surfaceDisabled: '#131915',
  border: '#2A3530',
  borderStrong: '#3A4540',
  borderPressed: '#3F4D47',
  text: '#E8EFEA',
  textSecondary: '#C9D4CE',
  textMuted: '#9AABA2',
  textDisabled: '#5C6B64',
  iconDisabled: '#46524C',

  // Praca (mint)
  work: '#7DD3A8',
  workPressed: '#62BD90',
  workLight: '#A8E6C6',
  workSoft: '#16241D',
  workHalo: 'rgba(125,211,168,0.18)',
  onWork: '#0B1A12',

  // Przerwa (bursztyn)
  breakBg: '#17120B',
  breakSurface: '#2A1F12',
  breakSurfacePressed: '#3D2D19',
  breakBorder: '#3A2C1A',
  break: '#F4B860',
  onBreak: '#2A1F12',
  breakText: '#F5EDE2',
  breakTextSecondary: '#CDBFAC',
  breakTextMuted: '#B8A891',
  breakDisabledBg: '#1F180F',
  breakDisabledText: '#5E5141',

  // Ripple (Pressable android_ripple)
  rippleLight: 'rgba(255,255,255,0.12)',
  rippleOnWork: 'rgba(255,255,255,0.22)',
  rippleBreak: 'rgba(244,184,96,0.18)',
} as const;

/* ───────────── Typografia ───────────── */

const t = (
  fontFamily: string,
  fontSize: number,
  lineHeight: number,
  letterSpacing = 0,
): TextStyle => ({
  fontFamily,
  fontSize,
  lineHeight,
  letterSpacing,
  color: colors.text,
  includeFontPadding: false,
});

export const type = {
  clock: t(fonts.displayMedium, 76, 76, -2),
  timerXL: { ...t(fonts.displayMedium, 72, 72, -2), fontVariant: ['tabular-nums'] } as TextStyle,
  timerL: { ...t(fonts.displayMedium, 64, 64, -2), fontVariant: ['tabular-nums'] } as TextStyle,
  valueL: { ...t(fonts.displayMedium, 40, 44, -1), fontVariant: ['tabular-nums'] } as TextStyle,
  display: t(fonts.displayBold, 36, 42, -0.6),
  valueM: t(fonts.displayMedium, 32, 36),
  h1: t(fonts.displayBold, 30, 35, -0.5),
  h2: t(fonts.displayBold, 24, 30),
  h3: t(fonts.displayBold, 22, 28, -0.3),
  stat: t(fonts.displayMedium, 20, 26),
  buttonL: t(fonts.displayBold, 18, 22),

  title: t(fonts.bodySemiBold, 17, 22),
  bodyL: t(fonts.body, 16, 24),
  button: t(fonts.bodySemiBold, 16, 20),
  body: t(fonts.body, 15, 22),
  label: t(fonts.bodySemiBold, 14, 18),
  bodyS: t(fonts.body, 14, 21),
  caption: { ...t(fonts.body, 13, 18), color: colors.textMuted } as TextStyle,
  sectionTitle: { ...t(fonts.bodySemiBold, 13, 18), color: colors.work } as TextStyle,
  micro: { ...t(fonts.body, 12, 16), color: colors.textMuted } as TextStyle,
} as const;

/* ───────────── Odstępy, promienie, rozmiary ───────────── */

export const space = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 28,
  xxxl: 32,
} as const;

export const screen = {
  paddingHorizontal: 20,
  paddingTop: 24,
  paddingBottom: 28,
  sectionGap: 20,
  groupGap: 12,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 20,
  xxl: 24,
  sheet: 28,
  full: 999,
} as const;

export const size = {
  touchMin: 44,
  iconButton: 48,
  buttonPrimaryHeight: 64,
  buttonHeight: 56,
  roundPrimary: 88,
  roundSecondary: 64,
  roundSmall: 56,
  chipHeight: 40,
  chipHeightSmall: 36,
  badgeHeight: 36,
  dot: 8,
  listRow: 60,
  switchWidth: 48,
  switchHeight: 28,
  switchThumb: 22,
  radio: 24,
  icon: 22,
  iconStroke: 1.8,
  progressBar: 6,
  ringWork: { diameter: 300, stroke: 14 },
  ringBreak: { diameter: 260, stroke: 12 },
} as const;

/* ───────────── Stany i ruch ───────────── */

export const motion = {
  pressScale: 0.96,
  roundPressScale: 0.94,
  rippleMs: 300,
  switchMs: 150,
  phaseTransitionMs: 300,
} as const;

/* ───────────── Gotowe style komponentów ───────────── */

export const components = {
  chip: {
    height: size.chipHeight,
    paddingHorizontal: space.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  } as ViewStyle,
  chipSelected: { backgroundColor: colors.work, borderColor: colors.work } as ViewStyle,
  chipPressed: {
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.borderPressed,
    transform: [{ scale: motion.pressScale }],
  } as ViewStyle,

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
  } as ViewStyle,
  listRow: {
    minHeight: size.listRow,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  } as ViewStyle,
  divider: { height: 1, backgroundColor: colors.border } as ViewStyle,

  badge: {
    height: size.badgeHeight,
    paddingHorizontal: 14,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.xs,
  } as ViewStyle,

  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    paddingTop: space.sm,
    paddingHorizontal: space.lg,
    paddingBottom: space.xxl,
    gap: space.lg,
  } as ViewStyle,
} as const;

/** Ripple dla <Pressable android_ripple={ripple.light} /> */
export const ripple = {
  light: { color: colors.rippleLight, borderless: false },
  onWork: { color: colors.rippleOnWork, borderless: false },
  break: { color: colors.rippleBreak, borderless: false },
} as const;

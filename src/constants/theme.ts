/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0F172A',
    textSecondary: '#64748B',
    background: '#F5F6F8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#EEF0F4',
    border: '#E6E8EC',
    primary: '#FF5A1F',
    primarySoft: '#FFEDE5',
    onPrimary: '#FFFFFF',
    success: '#16A34A',
    successSoft: '#DCFCE7',
    warning: '#D97706',
    warningSoft: '#FEF3C7',
    danger: '#DC2626',
    dangerSoft: '#FEE2E2',
    info: '#2563EB',
    infoSoft: '#DBEAFE',
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    background: '#0B0D12',
    backgroundElement: '#161A22',
    backgroundSelected: '#222733',
    border: '#262B36',
    primary: '#FF6B35',
    primarySoft: '#3A1D10',
    onPrimary: '#FFFFFF',
    success: '#22C55E',
    successSoft: '#0F2E1B',
    warning: '#F59E0B',
    warningSoft: '#33250A',
    danger: '#F87171',
    dangerSoft: '#3B1414',
    info: '#60A5FA',
    infoSoft: '#13233F',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

import { Platform } from 'react-native';

export const Colors = {
  primary: '#F6A3A6',
  primaryDark: '#F07A7E',
  primaryAlpha: 'rgba(246,163,166,0.19)',
  background: '#F4FBF8',
  textPrimary: '#0B0B12',
  textSecondary: '#616161',
  textMuted: '#AAAAAA',
  border: '#E0E0E0',
  cardBackground: '#E0E0E0',
  white: '#FFFFFF',
  accentDark: '#854448',
  accentLight: '#F6EEEE',
  danger: '#F43F5E',
};

export const Typography = {
  size: {
    xs: 10,
    sm: 12,
    md: 14,
    base: 16,
    score: 24,
    lg: 20,
    icon: 26, // header back/nav icon labels (pronunciation screens)
    xl: 36,
  },
  family: {
    regular: 'Inter_400Regular',
    semiBold: 'Inter_600SemiBold',
  },
};

export const Spacing = {
  screenHorizontal: 16,
  headerTop: 56,
  headerContentGap: 16,
  headerInner: 20, // header/nav paddingHorizontal (shared.ts screenHeader/navRow, pronunciation header)
  borderRadius: {
    card: 12,
    banner: 8,
    button: 18,
    action: 16, // full-width action buttons (PrimaryButton, record/stop buttons)
    progress: 26, // progress bar track/fill, scrollbar thumb
    pill: 999,
  },
};

// 기기별 상태바 높이(topInset) + 콘텐츠 여백 토큰을 합산하여 paddingTop 값(number)을 반환
export const getHeaderTop = (topInset: number): number =>
  topInset + Spacing.headerContentGap;

export const Shadow = {
  card: Platform.select({
    ios: {
      shadowColor: Colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
    },
    android: {
      elevation: 2,
    },
  }) ?? {},
  cardFull: {
    shadowColor: Colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1 as number,
    shadowRadius: 0,
    elevation: 2,
  },
};

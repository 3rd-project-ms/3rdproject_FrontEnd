// constants/theme.ts
// LinguaDate 디자인 시스템 — 프론트 B 담당 화면 기준

export const colors = {
  // 배경
  bg_dark: '#0F0F1A',
  bg_card: '#1C1C2E',
  bg_input: '#252535',
  bg_overlay: 'rgba(0,0,0,0.6)',

  // 포인트 컬러 (핑크 계열)
  primary: '#FF6B9D',
  primary_light: '#FFB3CC',
  primary_dim: 'rgba(255,107,157,0.15)',

  // 말풍선
  bubble_user: '#FF6B9D',
  bubble_ai: '#252535',
  bubble_user_text: '#FFFFFF',
  bubble_ai_text: '#F0F0F0',

  // 텍스트
  text_primary: '#FFFFFF',
  text_secondary: '#A0A0B8',
  text_muted: '#5A5A72',
  text_pink: '#FF6B9D',

  // 상태
  success: '#4ECDA4',
  warning: '#FFB347',
  error: '#FF6B6B',
  score_high: '#4ECDA4',
  score_mid: '#FFB347',
  score_low: '#FF6B6B',

  // 구분선
  border: 'rgba(255,255,255,0.08)',
  border_pink: 'rgba(255,107,157,0.3)',
};

export const fonts = {
  size: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 26,
  },
  weight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  full: 999,
};

export const shadow = {
  card: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  pink_glow: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};


// ===== 레벨테스트/온보딩(nutty) 디자인 토큰 (이름 충돌 없음) =====
// 앱 전역 디자인 토큰

export const COLORS = {
  primary: '#F6A3A6',

  background: '#F4FBF8',

  subColor1: '#EEF2F6',
  subColor1Dark: '#2C3A5F',

  subColor2: '#FF9F43',
  subColor2Light: '#FAF5EE',

  subColor3: '#854448',
  subColor3Light: '#F6EEEE',

  black: '#0B0B12',
  gray0: '#616161',
  gray1: '#AAAAAA',
  gray2: '#E0E0E0',
  white: '#FFFFFF',

  error: '#FF4D5A',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 64,
};

export const FONT_SIZE = {
  tiny: 10,
  small: 12,
  regular: 14,
  medium: 16,
  large: 20,
  display: 36,
};

export const FONT_WEIGHT = {
  regular: '400',
  semibold: '600',
} as const;

export const TYPOGRAPHY = {
  regular10: {
    fontSize: 10,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.black,
  },
  semibold12: {
    fontSize: 12,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  regular14: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.black,
  },
  semibold14: {
    fontSize: 14,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  regular16: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.regular,
    color: COLORS.black,
  },
  semibold16: {
    fontSize: 16,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  semibold20: {
    fontSize: 20,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
  semibold36: {
    fontSize: 36,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.black,
  },
};

export const LAYOUT = {
  screenPadding: 24,
  inputHeight: 48,
  buttonHeight: 48,
  buttonRadius: 12,
  cardRadius: 12,
};

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

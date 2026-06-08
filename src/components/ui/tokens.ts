export type Colors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  primary: string;
  primaryLight: string;
  primaryUltraLight: string;
  text: string;
  textMuted: string;
  textLight: string;
  border: string;
  scoreGold: string;
  success: string;
  error: string;
  white: string;
};

export const lightColors: Colors = {
  background: '#F4EDE2',
  surface: '#FFFBF5',
  surfaceAlt: '#EAE0D2',
  primary: '#7A2030',
  primaryLight: '#A8506A',
  primaryUltraLight: '#F5EAED',
  text: '#1E1208',
  textMuted: '#7A6A60',
  textLight: '#A8988C',
  border: '#D8C8B5',
  scoreGold: '#C8922A',
  success: '#3D8050',
  error: '#C03030',
  white: '#FFFFFF',
};

export const darkColors: Colors = {
  background: '#15100D',
  surface: '#211913',
  surfaceAlt: '#2A201A',
  primary: '#C2415A',
  primaryLight: '#D98AA0',
  primaryUltraLight: '#2A171C',
  text: '#F3E9DC',
  textMuted: '#B6A492',
  textLight: '#8A7869',
  border: 'rgba(212,162,74,0.16)',
  scoreGold: '#D4A24A',
  success: '#5FA877',
  error: '#E0556A',
  white: '#FFFFFF',
};

type ShadowValue = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export type ShadowSet = {
  sm: ShadowValue;
  md: ShadowValue;
  fab: ShadowValue;
};

export const lightShadow: ShadowSet = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
  },
  fab: {
    shadowColor: '#7A2030',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 14,
    elevation: 6,
  },
};

export const darkShadow: ShadowSet = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 6,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 6,
  },
  fab: {
    shadowColor: '#7A2030',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 22,
    elevation: 8,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 24,
  full: 999,
};

export const font = {
  sizeSm: 12,
  sizeMd: 14,
  sizeLg: 16,
  sizeXl: 18,
  sizeXxl: 22,
  sizeHero: 28,
  weightRegular: '400' as const,
  weightMedium: '500' as const,
  weightSemibold: '600' as const,
  weightBold: '700' as const,
};

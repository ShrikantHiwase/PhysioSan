/**
 * Physio Recovery App - Medical-Clean Theme
 * White/Soft Blue aesthetic, high accessibility (large fonts)
 */
export const PhysioColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  surfaceMuted: '#E2E8F0',

  primary: '#0EA5E9', // Soft blue
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',

  accent: '#0EA5E9',
  accentLight: '#7DD3FC',

  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  cardBorder: '#E2E8F0',
  divider: '#F1F5F9',
};

export const PhysioGradients = {
  primary: ['#0EA5E9', '#0284C7'] as [string, string],
  soft: ['#F8FAFC', '#F1F5F9'] as [string, string],
  card: ['#FFFFFF', '#F8FAFC'] as [string, string],
  success: ['#10B981', '#059669'] as [string, string],
};

export const PhysioSpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
};

/** Large touch targets for one-handed use (min 44pt) */
export const PhysioTouchTarget = {
  minHeight: 56,
  minWidth: 56,
  large: 64,
};

/** High accessibility - large fonts */
export const PhysioFontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
};

export const PhysioShadow = {
  sm: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
};

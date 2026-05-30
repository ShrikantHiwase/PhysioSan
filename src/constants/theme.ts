// ============================================
// FitForge Theme Constants
// ============================================

export const Colors = {
  background: '#0A0A0F',
  surface: '#141420',
  surfaceLight: '#1E1E2E',
  surfaceLighter: '#282840',
  
  accent: '#6C63FF',
  accentLight: '#8B83FF',
  accentDark: '#5048CC',
  
  neon: '#00F5D4',
  neonDim: '#00C4A8',
  neonYellow: '#F7FF58',
  
  coral: '#FF6B6B',
  coralDark: '#E85555',
  orange: '#FF9F43',
  purple: '#A855F7',
  purpleDark: '#7C3AED',
  blue: '#3B82F6',
  green: '#10B981',
  greenDark: '#059669',
  pink: '#EC4899',
  
  textPrimary: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textDark: '#374151',
  
  cardBorder: '#2A2A3E',
  divider: '#1F1F30',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
};

export const Gradients = {
  accent: ['#6C63FF', '#A855F7'] as [string, string],
  neon: ['#00F5D4', '#00C4A8'] as [string, string],
  coral: ['#FF6B6B', '#FF9F43'] as [string, string],
  purple: ['#A855F7', '#6C63FF'] as [string, string],
  blue: ['#3B82F6', '#6C63FF'] as [string, string],
  green: ['#10B981', '#00F5D4'] as [string, string],
  orange: ['#FF9F43', '#F59E0B'] as [string, string],
  pink: ['#EC4899', '#A855F7'] as [string, string],
  fire: ['#FF6B6B', '#F59E0B'] as [string, string],
  dark: ['#1E1E2E', '#141420'] as [string, string],
  cardDark: ['#1A1A2E', '#16162A'] as [string, string],
};

export const Spacing = {
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

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  }),
};

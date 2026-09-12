export const Colors = {
  // Core palette - Calm, healing, trustworthy
  primary: '#3D8B8B',      // Deep teal - stability, healing
  primaryLight: '#5BB5B5', // Light teal - growth, hope
  primaryDark: '#2A6363',  // Dark teal - depth, trust
  
  accent: '#E8917A',       // Warm coral - energy, warmth
  accentLight: '#F2B5A5',  // Light coral
  accentDark: '#D4705A',   // Dark coral
  
  // Backgrounds
  background: '#F4F7F6',   // Very light sage - calm, natural
  surface: '#FFFFFF',      // Pure white
  surfaceElevated: '#FAFBFC', // Slightly elevated
  
  // Text
  textPrimary: '#1D2B2B',   // Near black with teal undertone
  textSecondary: '#5A6B6B', // Muted teal-gray
  textTertiary: '#8A9A9A',  // Light teal-gray
  textInverse: '#FFFFFF',
  
  // Borders & Dividers
  border: '#E0E8E8',       // Subtle teal-gray
  borderLight: '#EEF2F2',  // Very subtle
  
  // Status
  success: '#5BA88C',      // Muted green - growth
  warning: '#E8B44C',      // Warm amber
  error: '#D46A6A',        // Muted red - not aggressive
  info: '#6A9FD4',         // Calm blue
  
  // Calendar specific
  calendarSober: '#5BA88C',    // Green for sober days
  calendarRelapse: '#D46A6A',  // Muted red for relapses
  calendarEmpty: '#E8ECEC',    // Light gray for no entry
  
  // Gradients
  gradientPrimary: ['#3D8B8B', '#5BB5B5'] as const,
  gradientAccent: ['#E8917A', '#F2B5A5'] as const,
  gradientBackground: ['#F4F7F6', '#E8ECEC'] as const,
};

export const Typography = {
  // Font sizes with clear hierarchy
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 40,
  },
  
  // Font weights
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const Shadows = {
  small: {
    shadowColor: '#1D2B2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: '#1D2B2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#3D8B8B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

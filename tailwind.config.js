/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Medical-Clean: White/Soft Blue
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceLight: '#F1F5F9',
        primary: '#0EA5E9',
        primaryLight: '#38BDF8',
        primaryDark: '#0284C7',
        accent: '#0EA5E9',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#94A3B8',
        cardBorder: '#E2E8F0',
      },
      fontFamily: {
        sans: ['System'],
      },
      fontSize: {
        // High accessibility - large fonts
        'physio-sm': '14px',
        'physio-base': '16px',
        'physio-lg': '18px',
        'physio-xl': '20px',
        'physio-2xl': '24px',
      },
    },
  },
  plugins: [],
};

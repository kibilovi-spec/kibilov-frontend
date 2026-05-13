import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1565C0',
          dark: '#0D47A1',
          mid: '#1976D2',
          light: '#E3F2FD',
          hover: '#1E88E5',
        },
        accent: { DEFAULT: '#FF6600', dark: '#E55A00' },
        success: '#16A34A',
        danger: '#D32F2F',
        warning: '#F59E0B',
        dark: '#1A2130',
        text2: '#4A5568',
        text3: '#8492A6',
        'gray-bg': '#F4F6F9',
        'gray-1': '#ECEFF4',
        'gray-2': '#DDE2EA',
        'gray-3': '#B0BAC8',
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Georgian', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 1px 4px rgba(0,0,0,0.08)',
        'md': '0 4px 16px rgba(0,0,0,0.10)',
        'lg': '0 8px 32px rgba(0,0,0,0.13)',
      },
    },
  },
  plugins: [],
};

export default config;

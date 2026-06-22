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
          DEFAULT: '#1348A8',
          dark: '#0A2D6E',
          mid: '#1A5CC8',
          light: '#EEF3FC',
          hover: '#1656C4',
        },
        accent: { DEFAULT: '#00B4D8', dark: '#0096B7', light: '#E0F7FA' },
        success: '#16A34A',
        danger: '#D32F2F',
        warning: '#F59E0B',
        dark: '#0F1C35',
        text2: '#3D4F6B',
        text3: '#7A8CA8',
        'gray-bg': '#F2F5FA',
        'gray-1': '#E8ECF4',
        'gray-2': '#D4DCEB',
        'gray-3': '#A8B6CC',
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

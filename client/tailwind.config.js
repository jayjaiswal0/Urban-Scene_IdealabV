/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#f8f9ff',
          dark: '#0b1326',
        },
        surface: {
          light: '#ffffff',
          dark: '#131b2e',
          subtleLight: '#eff4ff',
          subtleDark: '#171f33',
          hoverLight: '#e5eeff',
          hoverDark: '#222a3d',
        },
        primary: {
          light: '#004ac6',
          dark: '#4d8eff',
          subtleLight: '#dbe1ff',
          subtleDark: '#00285d',
        },
        border: {
          light: '#c3c6d7',
          dark: '#424754',
          subtleLight: '#edf2f7',
          subtleDark: '#222a3d',
        },
        status: {
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444',
          info: '#0284c7',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 15px -3px rgba(77, 142, 255, 0.4)',
        'glow-red': '0 0 15px -3px rgba(239, 68, 68, 0.4)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
    },
  },
  plugins: [],
};

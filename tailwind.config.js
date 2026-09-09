/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          900: '#0f2038',
          800: '#16304f',
          700: '#1f3a5f',
          600: '#2c4a77',
          500: '#3a5a8c',
        },
        accent: '#e06c2b',
        ink: '#20242b',
        fog: '#f2f5fa',
      },
      fontFamily: {
        sans: ['微软雅黑', 'Microsoft YaHei', 'PingFang SC', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shine: {
          '0%': { 'background-position': '100%' },
          '100%': { 'background-position': '-100%' },
        },
        gradient: {
          '0%': { 'background-position': '0% 50%' },
          '100%': { 'background-position': '300% 50%' },
        },
      },
      animation: {
        shine: 'shine 2s linear infinite',
        gradient: 'gradient 8s linear infinite',
      },
    },
  },
  plugins: [],
}

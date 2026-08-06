/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#ffad7d',
          400: '#ff8857',
          500: '#ed6534',
          600: '#ce4d25',
          700: '#a83c20',
        },
        surface: {
          50: '#fffdf8',
          100: '#f7f0e5',
          200: '#e9dece',
          300: '#c8b9a7',
          400: '#9d8d7a',
          500: '#75695d',
          600: '#554b44',
          700: '#3c342f',
          800: '#2a2421',
          900: '#211c1a',
          950: '#171312',
        },
      },
    },
  },
  plugins: [],
};

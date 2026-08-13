/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#111111',
        secondary: '#c5a46d',
        surface: '#ffffff',
        'on-surface': '#171717',
        'on-surface-variant': '#6b6b6b',
        'surface-lowest': '#ffffff',
        'surface-low': '#f5f5f3',
        'surface-medium': '#ecece8',
        'outline-variant': '#d8d8d2'
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
        headline: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif']
      },
      screens: {
        xs: '420px'
      }
    }
  },
  plugins: []
};

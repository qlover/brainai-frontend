/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#4a9eff',
        secondary: '#357abd',
        dark: '#1a1a1a',
        'dark-light': 'rgba(26, 26, 26, 0.85)'
      },
      backgroundColor: {
        'modal-overlay': 'rgba(0, 0, 0, 0.5)'
      }
    }
  },
  plugins: []
};

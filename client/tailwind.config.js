/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary:   '#FF6B35',   // Orange — buttons, highlights
        secondary: '#1A1A2E',   // Dark navy — sidebar, navbar
        accent:    '#FFD700',   // Gold — badges, stars, streak
        dark:      '#0F0F1A',   // Near black — page background
        card:      '#16213E',   // Card background
      },
      fontFamily: {
        heading: ['Montserrat', 'sans-serif'],  // Bold headings
        body:    ['Inter', 'sans-serif'],        // Body text
      },
    },
  },
  plugins: [],
};
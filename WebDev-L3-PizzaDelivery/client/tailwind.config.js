/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pizza: {
          red: '#D92D20',
          'red-deep': '#A91F18',
          'red-light': '#FDF2F2',
          cream: '#FFF8EF',
          ivory: '#FFFCF7',
          brown: '#38251F',
          'brown-secondary': '#765747',
          'brown-muted': '#9C8577',
          beige: '#F2E8DC',
          'beige-dark': '#E6D9C8',
          green: '#198754',
          'green-light': '#EBF7EE',
          amber: '#D97706',
          'amber-light': '#FEF3C7',
        },
        oasis: {
          dark: '#38251F',
          card: '#FFFCF7',
          border: '#F2E8DC',
          red: '#D92D20',
          'red-hover': '#A91F18',
          amber: '#D97706',
          gold: '#B45309',
          green: '#198754',
          muted: '#765747',
          light: '#38251F',
          cream: '#FFF8EF',
          ivory: '#FFFCF7',
          beige: '#F2E8DC',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'warm-sm': '0 2px 8px -2px rgba(56, 37, 31, 0.06)',
        'warm-md': '0 8px 24px -4px rgba(56, 37, 31, 0.08), 0 4px 8px -2px rgba(56, 37, 31, 0.04)',
        'warm-lg': '0 16px 36px -6px rgba(56, 37, 31, 0.12), 0 6px 16px -4px rgba(56, 37, 31, 0.06)',
        'glow-red': '0 8px 25px rgba(217, 45, 32, 0.25)',
        'glow-amber': '0 8px 25px rgba(217, 119, 6, 0.25)',
      }
    },
  },
  plugins: [],
}

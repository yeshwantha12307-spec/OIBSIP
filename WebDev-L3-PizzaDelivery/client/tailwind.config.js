/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oasis: {
          dark: '#0f1115',
          card: '#181b22',
          border: '#2a2f3a',
          red: '#e63946',
          'red-hover': '#d62839',
          amber: '#f4a261',
          gold: '#e9c46a',
          green: '#2a9d8f',
          muted: '#8b949e',
          light: '#f1faee'
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px rgba(230, 57, 70, 0.25)',
        'glow-amber': '0 0 25px rgba(244, 162, 97, 0.25)',
      }
    },
  },
  plugins: [],
}

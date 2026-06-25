/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e', // Neon fitness green
          600: '#16a34a',
          700: '#15803d',
          900: '#14532d',
        },
        dark: {
          bg: '#0b0f19',     // Rich dark blue/black
          card: '#161e2e',   // Slightly lighter blue/black card
          border: '#243046'  // Slate border
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

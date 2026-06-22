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
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#d6e0ff',
          300: '#b3c7ff',
          400: '#85a3ff',
          500: '#5c7aff',
          600: '#3d52eb',
          700: '#2b3cc7',
          800: '#2431a1',
          900: '#1b2580',
          950: '#111754',
        },
        accent: {
          50: '#fff5f7',
          100: '#ffebe6',
          200: '#ffd6cc',
          300: '#ffb3a3',
          400: '#ff8570',
          500: '#ff5c47',
          600: '#eb3b28',
          700: '#c72314',
          800: '#a1180d',
          900: '#80130a',
          950: '#540803',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

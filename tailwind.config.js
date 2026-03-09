/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/**/*.html",
    "./public/js/**/*.js",
    "./public/js/**/*.ts",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      colors: {
        dark: {
          950: '#020617',
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155'
        }
      },
      animation: {
        'in': 'fadeIn 0.2s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(5px)' },
          to: { opacity: '1', transform: 'translateY(0)' }
        }
      }
    }
  },
  plugins: [],
}

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
        // Premium Dark Theme - Apple Black
        dark: {
          950: '#000000',    // Pure black (main bg)
          900: '#0a0a0a',   // Elevated surfaces
          800: '#1c1c1e',   // Cards, modals (Apple's system background)
          700: '#2c2c2e',   // Secondary surfaces
          600: '#3a3a3c',   // Borders
          500: '#48484a',   // Muted elements
        },
        // Apple Accent Colors
        accent: {
          DEFAULT: '#f43f5e', // Primary rose (original)
          light: '#fb7185',   // Light rose
          dark: '#e11d48',    // Dark rose
        },
        // Semantic Colors
        surface: {
          base: '#FFFFFF',      // Light mode bg
          raised: '#F5F5F7',    // Light mode elevated
          dark: '#000000',      // Dark mode base
          darkRaised: '#1c1c1e' // Dark mode elevated
        },
        // Text Colors
        text: {
          primary: '#1d1d1f',      // Light mode primary
          secondary: '#86868b',    // Light mode secondary
          tertiary: '#a1a1a6',      // Light mode tertiary
          darkPrimary: '#f5f5f7',  // Dark mode primary
          darkSecondary: '#86868b',// Dark mode secondary
          darkTertiary: '#48484a', // Dark mode tertiary
        },
        // Border Colors
        border: {
          light: '#d2d2d7',  // Light mode
          dark: '#38383a',   // Dark mode (Apple's separator)
          premium: 'rgba(255, 255, 255, 0.08)', // Premium dark border
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

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/**/*.{html,js}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Apple Light Mode
        'apple-gray': '#f5f5f7',
        'apple-dark': '#1d1d1f',
        'apple-blue': '#0071e3',
        'apple-blue-hover': '#0077ed',
        'apple-green': '#34c759',
        'apple-orange': '#ff9500',
        'apple-red': '#ff3b30',
        
        // Text Colors
        'text-primary': '#1d1d1f',
        'text-secondary': '#86868b',
        'text-tertiary': '#a1a1a6',
        
        // Dark Mode
        'dark-base': '#000000',
        'dark-surface': '#1d1d1f',
        'dark-border': '#424245',
        'dark-gray': '#6e6e73',
        
        // Semantic
        'success': '#34c759',
        'warning': '#ff9500',
        'error': '#ff3b30',
        'info': '#0071e3',
      },
      borderRadius: {
        'pill': '980px',
        'apple-sm': '8px',
        'apple-md': '12px',
        'apple-lg': '16px',
        'apple-xl': '18px',
        'apple-2xl': '20px',
        'apple-3xl': '24px',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['SF Mono', 'JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'xxs': ['11px', { lineHeight: '16px' }],
        'xs': ['13px', { lineHeight: '18px' }],
        'sm': ['15px', { lineHeight: '20px' }],
        'base': ['17px', { lineHeight: '24px' }],
        'lg': ['20px', { lineHeight: '28px' }],
        'xl': ['24px', { lineHeight: '32px' }],
        '2xl': ['28px', { lineHeight: '36px' }],
        '3xl': ['32px', { lineHeight: '40px' }],
        '4xl': ['40px', { lineHeight: '48px' }],
      },
      boxShadow: {
        'apple-sm': '0 2px 8px rgba(0,0,0,0.04)',
        'apple-md': '0 4px 16px rgba(0,0,0,0.06)',
        'apple-lg': '0 8px 32px rgba(0,0,0,0.08)',
        'apple-xl': '0 12px 48px rgba(0,0,0,0.1)',
        'apple-2xl': '0 20px 64px rgba(0,0,0,0.15)',
        'glow-blue': '0 0 40px rgba(0,113,227,0.3)',
      },
      backdropBlur: {
        'apple': '20px',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.1, 0.25, 1)',
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.1)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
      },
      spacing: {
        '18': '72px',
        '88': '352px',
      },
    },
  },
  plugins: [],
}

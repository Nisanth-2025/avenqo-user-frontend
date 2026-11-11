/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
      },
      boxShadow: {
        'glass':       '0 8px 32px rgba(0, 0, 0, 0.08)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.12)',
        'input':       '0 1px 2px rgba(0, 0, 0, 0.05)',
        'input-focus': '0 0 0 3px rgba(23, 23, 23, 0.14)',
        'card':        '0 4px 24px rgba(0, 0, 0, 0.06)',
        'button':      '0 1px 3px rgba(0, 0, 0, 0.08)',
      },
      animation: {
        'gradient':   'gradient 8s ease infinite',
        'float':      'float 6s ease-in-out infinite',
        'fade-in':    'fadeIn 0.5s ease-out forwards',
        'slide-up':   'slideUp 0.4s ease-out forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':      { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      screens: {
        xs: '480px',
      },
    },
  },
  plugins: [],
};

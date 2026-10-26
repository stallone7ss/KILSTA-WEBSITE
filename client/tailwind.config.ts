import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f2f6fc',
          100: '#e2ebf7',
          200: '#c7d8ee',
          300: '#9dbbdf',
          400: '#6d97cc',
          500: '#4a78b8',
          600: '#375e9b',
          700: '#2d4b7d',
          800: '#1b3559',
          900: '#0a1f44',
          950: '#061530'
        },
        teal: {
          50: '#effcf9',
          100: '#c9f7ef',
          200: '#96ede1',
          300: '#5bdccd',
          400: '#2ec4b6',
          500: '#14a89d',
          600: '#0c877f',
          700: '#0d6c67',
          800: '#105653',
          900: '#114845'
        },
        gold: {
          50: '#fdf9ec',
          100: '#f9efc8',
          200: '#f2dc8d',
          300: '#e9c453',
          400: '#dfae2b',
          500: '#c9941e',
          600: '#a97318',
          700: '#855417',
          800: '#6f4319',
          900: '#5f391a'
        },
        mist: '#f5f8fc',
        ink: '#10233f'
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Sora', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,31,68,0.04), 0 12px 32px -12px rgba(10,31,68,0.18)',
        lift: '0 18px 48px -18px rgba(10,31,68,0.32)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.08)'
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
        'hero-glow':
          'radial-gradient(ellipse 70% 60% at 78% 20%, rgba(46,196,182,0.22), transparent 60%), radial-gradient(ellipse 55% 50% at 10% 90%, rgba(223,174,43,0.12), transparent 65%)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-600px 0' },
          '100%': { backgroundPosition: '600px 0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.4s ease-out both',
        shimmer: 'shimmer 1.8s linear infinite'
      }
    }
  },
  plugins: []
} satisfies Config;

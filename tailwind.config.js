/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          1: '#0066FF',
          2: '#3BB6FF',
        },
        surface: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.6)',
        success: '#00C48C',
        warning: '#FF9F1C',
        danger: '#FF5C5C',
        text: {
          primary: '#0B1220',
          secondary: '#6B7280',
          muted: '#C7CCD6',
        },
        bg: {
          start: '#F7FAFF',
          end: '#F2F6FB',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '20px',
        '6': '24px',
        '7': '32px',
        '8': '40px',
        '9': '48px',
      },
      borderRadius: {
        'sm': '8px',
        'card': '16px',
        'lg': '24px',
      },
      boxShadow: {
        'card': '0 6px 20px rgba(12, 18, 28, 0.08)',
        'topbar': '0 8px 30px rgba(8, 12, 20, 0.06)',
        'fab': '0 8px 24px rgba(0, 102, 255, 0.24)',
      },
      animation: {
        'shimmer': 'shimmer 1200ms ease-in-out infinite',
        'count-up': 'countUp 600ms ease-out',
        'micro-bounce': 'microBounce 220ms cubic-bezier(0.22, 0.9, 0.36, 1)',
        'stagger-in': 'staggerIn 360ms cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
        'toast-slide-up': 'toastSlideUp 260ms cubic-bezier(0.2, 0.9, 0.3, 1) forwards',
        'shake': 'shake 160ms ease-in-out',
        'spin-loader': 'spin 900ms linear infinite',
      },
      transitionTimingFunction: {
        'primary': 'cubic-bezier(0.2, 0.9, 0.3, 1)',
        'spring': 'cubic-bezier(0.22, 0.9, 0.36, 1)',
      },
      maxWidth: {
        'mobile': '420px',
      },
      minWidth: {
        'mobile': '320px',
      }
    },
  },
  plugins: [],
};
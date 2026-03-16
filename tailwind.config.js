/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        ooredoo: {
          DEFAULT: '#ED1C24',
          50: '#FFF7F6',
          100: '#FFECEB',
          200: '#FFC5C5',
          300: '#FF9B9B',
          400: '#FF5E5E',
          500: '#ED1C24',
          600: '#ED1C24',
          700: '#ED1C24',
          800: '#ED1C24',
          900: '#ED1C24',
          950: '#ED1C24',
        },
        ink: {
          DEFAULT: '#0A0A0A',
          secondary: '#222222',
        },
        gray: {
          DEFAULT: '#6E6E6E',
          light: '#A0A0A0',
        },
        brand: {
          text: '#0A0A0A',
          muted: '#6E6E6E',
          light: '#A0A0A0',
          bg: '#F5F2F0',
          card: '#FFFFFF',
          border: '#E8E0DF',
          cream: '#FFF7F6',
        }
      },
      fontFamily: {
        syne: ['Syne', 'system-ui', 'sans-serif'],
        jakarta: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
        '3xl': '1.375rem',
        '4xl': '1.75rem',
      },
      boxShadow: {
        'card': '0 4px 24px rgba(0,0,0,0.08)',
        'card-hover': '0 30px 70px rgba(237,28,36,0.14)',
        'modal': '0 20px 60px rgba(237,28,36,0.18)',
        'btn': '0 4px 16px rgba(237,28,36,0.38)',
        'btn-hover': '0 10px 28px rgba(237,28,36,0.5)',
        'stats': '0 8px 30px rgba(0,0,0,0.2)',
        'nav': '0 2px 20px rgba(0,0,0,0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.35s ease-out',
        'fade-in-up': 'fadeInUp 0.9s ease both',
        'fade-in-down': 'fadeInDown 0.8s ease both',
        'modal-in': 'modalIn 0.25s ease-out',
        'pulse-live': 'livePulse 2s infinite',
        'scroll-line': 'scrollLine 2s ease-in-out infinite',
        'float': 'float 8s ease-in-out infinite',
        'count-up': 'countUp 0.8s ease both',
        'ring-pulse': 'ringPulse 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        modalIn: {
          from: { opacity: '0', transform: 'translateY(16px) scale(0.97)' },
          to: { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        livePulse: {
          '0%, 100%': { boxShadow: '0 0 4px #4DFF8A', opacity: '1' },
          '50%': { boxShadow: '0 0 14px #4DFF8A', opacity: '0.7' },
        },
        scrollLine: {
          '0%': { width: '14px', opacity: '0.3' },
          '50%': { width: '48px', opacity: '0.8' },
          '100%': { width: '14px', opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-20px) scale(1.02)' },
        },
        ringPulse: {
          '0%, 100%': { boxShadow: '0 14px 42px rgba(227,6,19,0.4)' },
          '50%': { boxShadow: '0 14px 42px rgba(227,6,19,0.4), 0 0 0 22px rgba(227,6,19,0.06)' },
        },
      },
    },
  },
  corePlugins: {
    preflight: false,
  },
  plugins: [],
}


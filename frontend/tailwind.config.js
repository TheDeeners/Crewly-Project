/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7F1D3A',
          hover: '#6B1831',
          light: '#F8E9EE',
          dark: '#591328',
        },
        secondary: {
          DEFAULT: '#A83255',
          hover: '#912847',
          light: '#FDF2F5',
        },
        bg: {
          DEFAULT: '#F8F3F0',
          subtle: '#F2EBE6',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FAF7F5',
        },
        txt: {
          DEFAULT: '#29232A',
          muted: '#6B636D',
          light: '#9B939E',
        },
        border: {
          DEFAULT: '#E8DDD9',
          dark: '#D8C9C3',
        },
        status: {
          success: {
            DEFAULT: '#16A34A',
            bg: '#F0FDF4',
            border: '#BBF7D0',
            text: '#15803D',
          },
          pending: {
            DEFAULT: '#D97706',
            bg: '#FFFBEB',
            border: '#FDE68A',
            text: '#B45309',
          },
          rejected: {
            DEFAULT: '#DC2626',
            bg: '#FEF2F2',
            border: '#FECACA',
            text: '#B91C1C',
          },
          info: {
            DEFAULT: '#2563EB',
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
          },
          neutral: {
            DEFAULT: '#64748B',
            bg: '#F8FAFC',
            border: '#E2E8F0',
            text: '#475569',
          },
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Prompt', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(41, 35, 42, 0.04), 0 1px 2px -1px rgba(41, 35, 42, 0.04)',
        card: '0 4px 6px -1px rgba(41, 35, 42, 0.04), 0 2px 4px -2px rgba(41, 35, 42, 0.03)',
        cardHover: '0 10px 15px -3px rgba(127, 29, 58, 0.06), 0 4px 6px -4px rgba(41, 35, 42, 0.04)',
        float: '0 20px 25px -5px rgba(127, 29, 58, 0.08), 0 8px 10px -6px rgba(41, 35, 42, 0.04)',
      },
      borderRadius: {
        'lg': '0.5rem',
        'xl': '0.625rem',
        '2xl': '0.75rem',
        '3xl': '0.875rem',
      },
    },
  },
  plugins: [],
}

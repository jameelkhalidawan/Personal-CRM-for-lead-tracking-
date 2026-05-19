/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#0A0A0F',
          card: '#111118',
          elevated: '#1A1A24',
        },
        border: {
          DEFAULT: '#2A2A38',
          hover: '#3A3A50',
        },
        accent: {
          primary: '#6C63FF',
          hover: '#5A52E0',
          secondary: '#22D3EE',
        },
        text: {
          primary: '#F1F0FF',
          secondary: '#9B9AAF',
          muted: '#5A5970',
        },
        status: {
          new: '#6C63FF',
          contacted: '#22D3EE',
          interested: '#34D399',
          proposal: '#FBBF24',
          closed_won: '#10B981',
          closed_lost: '#EF4444',
          not_interested: '#6B7280',
        },
        priority: {
          high: '#EF4444',
          medium: '#FBBF24',
          low: '#6B7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        h1: ['28px', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['22px', { lineHeight: '1.3', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '1.4', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        small: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        label: [
          '11px',
          {
            lineHeight: '1.4',
            fontWeight: '500',
            letterSpacing: '0.08em',
          },
        ],
      },
      borderRadius: {
        xl: '12px',
      },
      maxWidth: {
        content: '1400px',
      },
    },
  },
  plugins: [],
};

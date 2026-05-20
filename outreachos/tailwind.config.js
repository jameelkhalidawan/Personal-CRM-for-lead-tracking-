/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: {
          primary: 'var(--color-bg-primary)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        border: {
          DEFAULT: 'var(--color-border)',
          hover: 'var(--color-border-hover)',
        },
        accent: {
          primary: '#6C63FF',
          hover: '#5A52E0',
          secondary: '#22D3EE',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
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

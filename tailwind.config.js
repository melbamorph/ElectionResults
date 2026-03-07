/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#111827',
        slate: '#64748b',
        paper: '#f4f2ee',
        line: '#d4d4d4',
        clay: '#a67c52',
        sage: '#6d8a66',
        smoke: '#6b7280',
        mist: '#f6f3ed',
        winner: '#0f766e',
        leader: '#7b6d50',
        alert: '#b45309',
      },
      boxShadow: {
        card: '0 10px 30px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        display: ['"Libre Franklin"', '"Segoe UI"', 'sans-serif'],
        body: ['"Source Serif 4"', 'Georgia', 'serif'],
      },
      keyframes: {
        rise: {
          '0%': { opacity: 0, transform: 'translateY(10px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        rise: 'rise 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

import type { Config } from 'tailwindcss';

export default {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brainster: { purple: '#2b235a', coral: '#ff6b6b', ink: '#0c0a1a' }
      },
      boxShadow: { card: '0 8px 24px rgba(0,0,0,0.08)' },
      borderRadius: { '2xl': '1rem' }
    }
  },
  plugins: []
} satisfies Config;

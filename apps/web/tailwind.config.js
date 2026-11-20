/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        page: 'var(--bg-page)',
        panel: 'var(--bg-surface)',
        'panel-2': 'var(--bg-surface-2)',
        fg: 'var(--text-primary)',
        muted: 'var(--text-secondary)',
        subtle: 'var(--border-subtle)',
        accent: 'var(--brand)',
        highlight: 'var(--highlight)',
        commerce: {
          DEFAULT: 'var(--amber)',
          hover: '#D97706',
        },
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          400: '#60a5fa',
          500: '#2563eb',
          600: '#2563eb',
          700: '#1d4ed8',
          900: '#0B1930',
        },
        ink: '#14233B',
        surface: '#EAF3FF',
        navy: '#0B1930',
        line: '#D4E2F4',
        electric: '#60A5FA',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-space-grotesk)', 'Space Grotesk', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        card: '12px',
        control: '10px',
      },
      boxShadow: {
        glass: '0 12px 32px -12px rgba(11, 25, 48, 0.16), 0 1px 2px rgba(11, 25, 48, 0.05)',
        elevated: '0 10px 24px -12px rgba(20, 35, 59, 0.14)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'badge-pop': {
          '0%': { transform: 'scale(0.85)' },
          '50%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.38s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        'badge-pop': 'badge-pop 0.28s cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};

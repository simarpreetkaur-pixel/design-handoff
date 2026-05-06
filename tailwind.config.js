/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    container: {
      center: true,
      padding: '1rem',
    },
    extend: {
      fontFamily: {
        sans: [
          'var(--font-omni-sans)',
          'Inter',
          'ui-sans-serif',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        omni: {
          n500: 'hsl(var(--omni-n500))',
          n600: 'hsl(var(--omni-n600))',
          n400: 'hsl(var(--omni-n400))',
          n200: 'hsl(var(--omni-n200))',
          n100: 'hsl(var(--omni-n100))',
          n0: 'hsl(var(--omni-n0))',
          profile: 'hsl(var(--omni-profile))',
          summary: 'hsl(var(--omni-summary))',
        },
      },
      boxShadow: {
        modal: '0 12px 40px rgba(4, 2, 34, 0.12)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'raise-claim-tick-pop': {
          '0%': { opacity: '0', transform: 'scale(0.35)' },
          '70%': { opacity: '1', transform: 'scale(1.06)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'raise-claim-msg-fade': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'raise-claim-tick-pop': 'raise-claim-tick-pop 0.55s cubic-bezier(0.34, 1.45, 0.64, 1) both',
        'raise-claim-msg-fade': 'raise-claim-msg-fade 0.5s ease-out 0.28s both',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

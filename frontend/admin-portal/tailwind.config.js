import tailwindcssAnimate from 'tailwindcss-animate';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: {
      center: true,
      padding: '1.5rem',
    },
    extend: {
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
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Semantic status colours — solid for fills, `subtle` for chip/callout backgrounds.
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
          subtle: 'hsl(var(--success-subtle))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
          subtle: 'hsl(var(--warning-subtle))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
          subtle: 'hsl(var(--info-subtle))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      // Type scale — one ramp, used by every screen.
      fontSize: {
        display: [
          '1.75rem',
          { lineHeight: '2.125rem', fontWeight: '700', letterSpacing: '-0.02em' },
        ],
        title: ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        section: ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        body: ['0.875rem', { lineHeight: '1.375rem' }],
        label: ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
        caption: ['0.75rem', { lineHeight: '1rem' }],
      },
      // Elevation — flat by default; depth only where it means "floating".
      boxShadow: {
        xs: '0 1px 2px 0 rgb(16 24 40 / 0.04)',
        sm: '0 1px 3px 0 rgb(16 24 40 / 0.08), 0 1px 2px -1px rgb(16 24 40 / 0.04)',
        md: '0 4px 12px -2px rgb(16 24 40 / 0.10), 0 2px 4px -2px rgb(16 24 40 / 0.04)',
        overlay: '0 16px 40px -8px rgb(16 24 40 / 0.24)',
      },
      transitionDuration: { DEFAULT: '150ms' },
    },
  },
  plugins: [tailwindcssAnimate],
};

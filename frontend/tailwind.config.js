/** @type {import('tailwindcss').Config} */
const c = (v) => `rgb(var(--c-${v}) / <alpha-value>)`;

module.exports = {
  blocklist: ['overline'],
  content: ['./src/**/*.{ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        canvas: c('canvas'), surface: c('surface'), soft: c('soft'), line: c('line'),
        ink: c('ink'), muted: c('muted'), apricot: c('apricot'), terracotta: c('terracotta'),
        sage: c('sage'), lavender: c('lavender'), butter: c('butter'), sky: c('sky'), mint: c('mint'),
        danger: c('danger'), 'on-accent': c('on-accent'), accent: c('accent'), 'accent-strong': c('accent-strong'),
      },
      fontFamily: {
        sans: ['Nunito', 'ui-rounded', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      borderRadius: { '4xl': '2rem' },
      boxShadow: { soft: 'var(--shadow-soft)', lift: 'var(--shadow-lift)' },
      maxWidth: { chat: '720px' },
      keyframes: {
        'accordion-down': { from: { height: '0' }, to: { height: 'var(--radix-accordion-content-height)' } },
        'accordion-up': { from: { height: 'var(--radix-accordion-content-height)' }, to: { height: '0' } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

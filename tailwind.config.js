/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        night: { 50: '#f4f6fb', 500: '#3d4a7a', 800: '#1b2140', 900: '#11152b' },
        ember: { 400: '#f6a55c', 500: '#e8842f', 600: '#c46618' },
        moss: { 400: '#7fae7a', 600: '#4d7a4a' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
      maxWidth: { content: '68rem' },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '1' },
        },
      },
      animation: { twinkle: 'twinkle 4s ease-in-out infinite' },
    },
  },
  plugins: [],
}

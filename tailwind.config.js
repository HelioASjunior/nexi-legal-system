/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0e1117',
          surface: '#161b22',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        glass: {
          bg: 'rgba(255, 255, 255, 0.05)',
          border: 'rgba(255, 255, 255, 0.1)',
        },
        accent: {
          blue: '#58a6ff',
          green: '#3fb950',
          red: '#f85149',
          orange: '#d29922',
        },
        text: {
          primary: '#f0f6fc',
          secondary: '#8b949e',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0, 0, 0, 0.2)',
        'glass-hover': '0 12px 40px rgba(0, 0, 0, 0.3)',
        'glow-blue': '0 0 20px rgba(88, 166, 255, 0.15)',
        'glow-green': '0 0 20px rgba(63, 185, 80, 0.15)',
        'glow-red': '0 0 20px rgba(248, 81, 73, 0.15)',
        'glow-orange': '0 0 20px rgba(210, 153, 34, 0.15)',
      },
    },
  },
  plugins: [],
}

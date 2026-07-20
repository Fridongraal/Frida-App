/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#121016',
        darkCard: '#221c30',
        darkText: '#f3effa',
        lavender: {
          50: '#f5f3ff',
          100: '#f0edff',
          200: '#e1dbff',
          300: '#cdbefa',
          400: '#b499f7',
          500: '#9b73f2', // Primary
          600: '#8454e9', // Primary hover
          700: '#6c36d7',
          800: '#5826b5',
          900: '#431793',
          950: '#1e074d', // Dark purple text contrast
        },
        warmgray: {
          50: '#fafaf9',
          100: '#f5f5f3',
          200: '#eae9e6',
          300: '#dbd8d3',
          400: '#a7a29a',
          900: '#2d2b2a',
        },
        'frida-primary': 'var(--color-accent)',
        'frida-secondary': 'var(--color-secondary)',
        'frida-accent': 'var(--color-accent-light)',
        'frida-success': '#D9F9DF',
        'light-bg': 'var(--color-bg)',
        'light-card': 'var(--color-card)',
        'light-text': 'var(--color-text)',
        'dark-bg': 'var(--color-bg)',
        'dark-card': 'var(--color-card)',
        'dark-muted': 'var(--color-muted)',
        'dark-text': 'var(--color-text)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'flip': 'flip 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      }
    },
  },
  plugins: [],
}

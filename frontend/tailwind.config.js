/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#080d08',
          800: '#0d1510',
          700: '#131f16',
          600: '#1a2a1e',
        },
        neon: {
          green: '#00ff88',
          lime: '#7fff00',
          mint: '#00ffa3',
          red: '#ff3b3b',
          pink: '#ff2d92',
          yellow: '#ffe135',
        },
        pump: {
          green: '#00ff88',
          dark: '#0d1512',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88, 0 0 20px #00ff88' },
          '100%': { boxShadow: '0 0 10px #7fff00, 0 0 20px #7fff00, 0 0 40px #7fff00' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}

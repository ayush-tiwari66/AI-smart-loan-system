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
          900: '#0B0F14',
          800: '#0F1419',
          700: '#141B22',
          600: '#1A2332',
          500: '#1E293B',
          400: '#243447',
        },
        neon: {
          green: '#00FFA3',
          'green-dim': '#00CC82',
          'green-glow': 'rgba(0, 255, 163, 0.15)',
        },
        gold: {
          DEFAULT: '#F5C542',
          dim: '#D4A52A',
          glow: 'rgba(245, 197, 66, 0.15)',
        },
        danger: '#FF4D6A',
        warning: '#FFAA33',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-green': '0 0 20px rgba(0, 255, 163, 0.3), 0 0 60px rgba(0, 255, 163, 0.1)',
        'glow-green-sm': '0 0 10px rgba(0, 255, 163, 0.2)',
        'glow-gold': '0 0 20px rgba(245, 197, 66, 0.3)',
        'glow-danger': '0 0 20px rgba(255, 77, 106, 0.3)',
        'glass': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(135deg, #0B0F14 0%, #0F1419 50%, #141B22 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.6s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'glow-border': 'glowBorder 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(0, 255, 163, 0.2)' },
          '50%': { boxShadow: '0 0 20px rgba(0, 255, 163, 0.5), 0 0 40px rgba(0, 255, 163, 0.2)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        glowBorder: {
          '0%, 100%': { borderColor: 'rgba(0, 255, 163, 0.3)' },
          '50%': { borderColor: 'rgba(0, 255, 163, 0.7)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

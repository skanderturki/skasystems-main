/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nadart: {
          bg: {
            primary: '#1a1a1a',
            secondary: '#2a2a2a',
            dark: '#000000',
          },
          text: {
            primary: '#f0f0f0',
            secondary: '#cccccc',
            muted: 'rgba(255, 255, 255, 0.8)',
          },
          accent: {
            DEFAULT: '#444444',
            hover: '#555555',
            success: '#4caf50',
            error: '#f44336',
            instagram: '#c46eb8',
          }
        }
      },
      fontFamily: {
        dancing: ['"Dancing Script"', 'cursive'],
        arizonia: ['Arizonia', 'cursive'],
        sans: ['Arial', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

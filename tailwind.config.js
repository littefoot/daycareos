/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff6900', // Tangerine Sun Primary
          600: '#ea580c', // Deep Tangerine
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        sun: {
          gold: '#fcb900',
          amber: '#f59e0b',
        },
        cwelcc: {
          mint: '#10b981',
          emerald: '#059669',
          light: '#ecfdf5',
        },
        canvas: {
          sand: '#fdfbf7',
          soft: '#f8fafc',
          card: '#ffffff',
          dark: '#0f172a',
        },
        ink: {
          slate: '#0f172a',
          body: '#1e293b',
          muted: '#64748b',
          border: '#e2e8f0',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        karla: ['Karla', 'sans-serif'],
        hand: ['"Dancing Script"', 'cursive'],
      },
      boxShadow: {
        'neo-sm': '2px 2px 0px 0px #0f172a',
        'neo': '3px 3px 0px 0px #0f172a',
        'neo-lg': '5px 5px 0px 0px #0f172a',
        'neo-xl': '8px 8px 0px 0px #0f172a',
        'card-soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'neo': '14px',
        'neo-lg': '18px',
        'neo-xl': '24px',
      }
    },
  },
  plugins: [],
}

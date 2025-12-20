/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Teacher Vibe: Soft Blue/Green
        seonbi: {
            blue: '#E3F2FD',
            darkblue: '#1565C0',
            green: '#E8F5E9',
            darkgreen: '#2E7D32',
            text: '#374151',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // We should likely add a font link
      }
    },
  },
  plugins: [],
}

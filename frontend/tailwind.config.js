/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        secondary: '#14B8A6',
        accent: '#F59E0B',
        background: '#F8FAFC',
        surface: '#FFFFFF',
        textMain: '#1F2937',
        textMuted: '#6B7280',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'hover': '0 10px 40px -4px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}

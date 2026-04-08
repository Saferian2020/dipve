/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wine: {
          DEFAULT: '#5C1A1A',
          light: '#7a2222',
          dark: '#3e1111',
        }
      }
    },
  },
  plugins: [],
}


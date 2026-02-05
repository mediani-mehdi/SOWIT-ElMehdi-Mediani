/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7CB342',
          dark: '#558B2F',
          light: '#9CCC65',
        },
      },
    },
  },
  plugins: [],
}

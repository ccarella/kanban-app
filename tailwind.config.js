/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        mono: ['var(--font-geist-mono)'],
      },
      colors: {
        accent: {
          primary: '#FF7A00',
          secondary: '#5D67FF',
        },
      },
    },
  },
  plugins: [],
}

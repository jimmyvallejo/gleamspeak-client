/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  corePlugins: {
    preflight: false, // This is crucial to prevent Tailwind from conflicting with Mantine
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
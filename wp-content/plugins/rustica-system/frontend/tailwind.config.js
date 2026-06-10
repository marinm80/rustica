/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rustica: {
          // Pastel warm palette — light restaurant theme
          gold:    '#9c6e2e',   // warm honey amber (readable on cream/white)
          dark:    '#faf7f2',   // warm cream — page background
          card:    '#ffffff',   // pure white — card surfaces
          light:   '#3a2510',   // dark espresso — primary text (was cream, now dark for light bg)
          border:  '#e2d9ce',   // warm beige border
          muted:   '#7a6050',   // warm brown — secondary text
          subtle:  '#f3ede4',   // very light warm — hover/secondary surfaces
        }
      }
    },
  },
  plugins: [],
}

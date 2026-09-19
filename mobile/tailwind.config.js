/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: '#231A15',
        linen: '#F6F1E4',
        wine: '#7A1F2B',
        gold: '#B08D3F',
        sage: '#3B4A34',
      },
    },
  },
  plugins: [],
}
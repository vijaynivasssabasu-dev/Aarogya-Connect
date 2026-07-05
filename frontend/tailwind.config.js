/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#eef7ff',100:'#d9edff',200:'#bce0ff',300:'#8eccff',400:'#59b0ff',500:'#338dff',600:'#1b6ff5',700:'#1459e1',800:'#1748b6',900:'#193f8f',950:'#142857' },
        accent: { 50:'#edfcf2',100:'#d4f7e0',200:'#aceec5',300:'#75dfa3',400:'#3ec97d',500:'#1aae62',600:'#0e8d4e',700:'#0b7141',800:'#0c5935',900:'#0a492d',950:'#05291a' },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

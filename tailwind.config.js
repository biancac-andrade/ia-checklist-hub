/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./apps/frontend/src/**/*.{html,ts}",
    "./libs/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-coral': '#FF9F82',
        'brand-lavender': '#D085E8',
        'brand-sky': '#9FCAFF',
        'brand-mint': '#85E8A5',
        'brand-yellow': '#FFFA93',
        'brand-dark': '#1E1B2E',
        'brand-surface': '#28233D',
      },
      fontFamily: {
        header: ['"Arima Madurai"', 'cursive', 'sans-serif'],
        body: ['"Mulish"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};


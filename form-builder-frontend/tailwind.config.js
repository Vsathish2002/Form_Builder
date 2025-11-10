/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class", // ✨ allows manual dark mode toggle via class
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Optional — you can keep your indigo theme consistent
        primary: {
          light: '#6366F1', // indigo-500
          dark: '#4338CA',  // indigo-700
        },
      },
    },
  },
  plugins: [],
};

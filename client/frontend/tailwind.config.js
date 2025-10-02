/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          start: "white",
          end: "Black ",
        },
        secondary: "#00BFA5",
        third:"red",
        para: "#6c87a3",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
        sora: ["Sora", "sans-serif"],
      },
      boxShadow: {
        'custom-color': '0 4px 24px 0 rgba(64, 224, 208, 0.20)',
      }
    },
  },
  plugins: [],
};

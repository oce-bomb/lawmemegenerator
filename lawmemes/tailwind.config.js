/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Times New Roman", "Georgia", "serif"],
      },
      colors: {
        "off-white": "#f8f8f5",
        "transparent-grey": "rgba(200, 200, 200, 0.3)",
        "less-transparent-grey": "rgba(200, 200, 200, 0.5)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "box-appear": {
          "0%": {
            opacity: "0",
            transform: "scale(0.9) translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },
        enlarge: {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0.5",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        shrink: {
          "0%": {
            transform: "scale(1.5)",
          },
          "100%": {
            transform: "scale(1)",
          },
        },
        "button-appear": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "box-appear": "box-appear 0.4s ease-out forwards",
        enlarge: "enlarge 0.3s ease-out forwards",
        shrink: "shrink 0.3s ease-out forwards",
        "button-appear": "button-appear 0.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};

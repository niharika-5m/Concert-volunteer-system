/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: "#1A1F3D", soft: "#5B6285" }, // text + primary actions
        haze: "#EEF0F6", // page background
        mist: "#DDE1EE", // borders
        beam: "#F2A900", // open crew slots
        go: "#1E8E5A", // staffed / confirmed
        alarm: "#C8402F", // short-staffed / errors
      },
      fontFamily: { sans: ["var(--font-sans)", "system-ui", "sans-serif"] },
    },
  },
  plugins: [],
};

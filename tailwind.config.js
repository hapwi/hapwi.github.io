module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      padding: {
        safe: "env(safe-area-inset-top)",
      },
    },
  },
  plugins: [],
};

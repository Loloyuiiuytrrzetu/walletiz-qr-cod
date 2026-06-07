import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bordeaux: {
          50: "#fdf2f4",
          100: "#fbe4e8",
          200: "#f6c2cc",
          300: "#ee94a6",
          400: "#e25f7a",
          500: "#d23a58",
          600: "#b32545",
          700: "#7B1E2B",
          800: "#5C1620",
          900: "#3e0e16",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;

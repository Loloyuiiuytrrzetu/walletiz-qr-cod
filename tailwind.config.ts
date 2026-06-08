import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#7a1232",
          dark: "#5a0d24",
          light: "#9a1a40",
        },
        brand: {
          DEFAULT: "#7a1232",
          dark: "#5a0d24",
          light: "#9a1a40",
        },
        ink: "#0f0f10",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["'Inter Tight'", "Inter", "ui-sans-serif"],
      },
      borderRadius: {
        xl: "18px",
        "2xl": "28px",
      },
      boxShadow: {
        soft: "0 4px 12px rgba(15,15,16,0.06), 0 12px 32px rgba(15,15,16,0.08)",
        lg2: "0 24px 60px rgba(15,15,16,0.16)",
      },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ucp: {
          rojo: "#881a1d",
          naranja: "#c55f23",
          amarillo: "#f4c222",
          amarillo2: "#fed800",
          gris: "#848fae",
          verde: "#177c4c",
          verde2: "#298e09",
          morado: "#88288b",
          dorado: "#c0b278",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

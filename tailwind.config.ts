import mdplugin from "@libnyanpasu/material-design-tailwind";
import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./node_modules/@libnyanpasu/material-design-react/**/*.js",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  plugins: [mdplugin],
} satisfies Config;

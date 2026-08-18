import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        satoshi: ["Satoshi", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },
      colors: {
        "primary-orange": "#FF5722",
      },
    },
  },
  // daisyUI was removed: a grep of every className in app/ and components/
  // matched zero daisyUI component classes — the site is set entirely in the
  // custom broadsheet system (styles/broadsheet.css, all `bs-` prefixed).
  // Its themes were still shipping ~85KB of render-blocking CSS on every
  // page, which is a direct First Contentful Paint cost on mobile.
  plugins: [],
};
export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    "./index.html",
    "./frontend/index.html",
    "./frontend/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
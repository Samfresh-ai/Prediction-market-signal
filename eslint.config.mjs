import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  {
    ignores: [".netlify/**"],
  },
  ...nextVitals,
];

export default config;

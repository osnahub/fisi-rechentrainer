import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "legacy/**",
      "playwright-report/**",
      "test-results/**",
    ],
  },
];

export default config;

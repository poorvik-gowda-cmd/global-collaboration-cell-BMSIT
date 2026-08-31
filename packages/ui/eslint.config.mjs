// @ts-check
import rootConfig from "../../eslint.config.mjs";

export default [
  ...rootConfig,
  // Relax test file rules
  {
    files: ["src/**/*.test.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
    },
  },
];

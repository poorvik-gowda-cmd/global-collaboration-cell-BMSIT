// @ts-check
import rootConfig from "../../eslint.config.mjs";

/**
 * ESLint config for apps/api (Cloudflare Worker).
 * Extends root config with Worker-specific relaxations.
 */
export default [
  ...rootConfig,
  {
    files: ["test/**"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];

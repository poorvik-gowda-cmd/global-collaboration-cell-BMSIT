// @ts-check
import rootConfig from "../../eslint.config.mjs";
import nextPlugin from "@next/eslint-plugin-next";

/**
 * ESLint config for apps/web.
 * Extends the root config and adds Next.js-specific rules via @next/eslint-plugin-next.
 */
export default [
  ...rootConfig,

  // ---- Next.js recommended rules ----
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // ---- Next.js App Router overrides ----
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      // RSC async components are valid
      "@typescript-eslint/require-await": "off",
    },
  },

  // ---- Relax type-checking rules for test files ----
  {
    files: ["src/test/**", "**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
    },
  },
];

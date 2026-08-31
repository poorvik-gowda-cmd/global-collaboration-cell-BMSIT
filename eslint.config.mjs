// @ts-check
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

/**
 * Root ESLint flat config (ESLint v9).
 * Each workspace package can extend or override these rules in its own eslint.config.mjs.
 */
export default tseslint.config(
  // ---- Global ignores ----
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.next/**",
      "**/.wrangler/**",
      "**/coverage/**",
      "**/.turbo/**",
      "**/*.d.ts",
    ],
  },

  // ---- Base JS recommended rules (no type information needed) ----
  eslint.configs.recommended,

  // ---- TypeScript strict rules for source files only ----
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: [
            "*.config.{js,mjs,ts,cjs}",
            "eslint.config.{js,mjs,ts,cjs}",
          ],
          defaultProject: "./tsconfig.base.json",
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Allow unused vars prefixed with _ (e.g. _unusedParam)
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      // Allow empty interfaces for forward-declaration stubs
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      // Prefer type imports for cleaner output
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  // ---- Config/script files — basic checking only, no type-aware rules ----
  {
    files: [
      "*.config.{js,mjs,ts,cjs}",
      "eslint.config.{js,mjs,ts,cjs}",
      "**/scripts/**",
    ],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    name: "google-adapters",
    environment: "node",
    include: ["src/**/*.{test,spec}.ts"],
    passWithNoTests: true,
  },
});

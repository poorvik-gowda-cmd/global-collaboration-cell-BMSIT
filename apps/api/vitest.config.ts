import { defineWorkersConfig } from "@cloudflare/vitest-pool-workers/config";

export default defineWorkersConfig({
  test: {
    name: "api",
    globals: true,
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.toml", environment: "development" },
      },
    },
    include: ["test/**/*.{test,spec}.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["src/**/*.ts"],
    },
  },
});

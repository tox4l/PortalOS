import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      provider: "v8",
      include: ["lib/**", "actions/**"],
      exclude: ["lib/dev-bypass.ts"],
      thresholds: {
        "lib/**": { statements: 60, branches: 50, functions: 60, lines: 60 },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname),
    },
  },
});

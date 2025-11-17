import path from "path"
import { defineConfig } from "vitest/config"

export default defineConfig({
  resolve: {
    alias: {
      "#test": path.resolve(import.meta.dirname, "test")
    }
  },
  test: {
    globals: true,
    environment: "node",
    include: ["test/**/*.test.ts"],
    exclude: ["node_modules", "dist"],
    setupFiles: ["test/setup.ts"],
    mockReset: true,
    restoreMocks: true,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      thresholds: {
        statements: 90,
        branches: 90,
        functions: 90,
        lines: 90
      },
      exclude: [
        "node_modules/",
        "test/",
        "vitest.config.ts",
        "src/bootstrap.sh",
        "*.config.js",
        "rc/filesystem/homeDirectory.ts"
      ]
    }
  },
  esbuild: {
    target: "node24"
  }
})

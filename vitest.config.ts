import { defineConfig } from "vitest/config"

export default defineConfig({
  test: {
    setupFiles: "./vitestSetup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "clover", "json"],
      // vitest 4 dropped `coverage.all` and reports only the files it loaded,
      // so scope the report explicitly or untested sources vanish from it
      include: ["src/**"],
      exclude: ["src/types-internal.ts", "src/types.ts", "src/index.ts"],
    },
  },
})

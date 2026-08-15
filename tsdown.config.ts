import { readFile, writeFile } from "node:fs/promises"
import { resolve } from "node:path"
import { defineConfig } from "tsdown"

// tsdown feeds the top-level `sourcemap` into the declaration output pass too:
// `resolveOutputOptions` special-cases `minify` for the dts build but not
// `sourcemap`. Rolldown therefore appends `//# sourceMappingURL=index.d.ts.map`
// to the declarations, while that map is never written -- declaration maps are
// a separate opt-in (`dts.sourcemap`, i.e. `declarationMap`) that we do not
// want, because they only bloat the package. The comment is left pointing at a
// file that does not exist, so strip it back off the declarations. The real JS
// maps keep their comments and are untouched.
const stripDanglingDtsSourcemapComment = /\s*\/\/# sourceMappingURL=[^\n]*\s*$/

export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  hooks: {
    "build:done": async ({ options, chunks }) => {
      await Promise.all(
        chunks
          .filter((chunk) => /\.d\.[cm]?ts$/.test(chunk.fileName))
          .map(async (chunk) => {
            const file = resolve(options.outDir, chunk.fileName)
            const code = await readFile(file, "utf8")
            const stripped = code.replace(
              stripDanglingDtsSourcemapComment,
              "\n",
            )

            if (stripped !== code) {
              await writeFile(file, stripped)
            }
          }),
      )
    },
  },
})

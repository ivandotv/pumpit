import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtemp, readFile, rm } from "node:fs/promises"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const packageJson = JSON.parse(
  await readFile(resolve(root, "package.json"), "utf8"),
)

const exportTargets = [
  packageJson.exports["."].import.default,
  packageJson.exports["."].import.types,
  packageJson.exports["."].require.default,
  packageJson.exports["."].require.types,
]

for (const target of exportTargets) {
  await readFile(resolve(root, target))
}

const esm = await import(packageJson.name)
const require = createRequire(import.meta.url)
const cjs = require(packageJson.name)

for (const module of [esm, cjs]) {
  assert.equal(typeof module.PumpIt, "function")
  const container = new module.PumpIt()
  container.bindValue("format", module === esm ? "esm" : "cjs")
  assert.equal(container.resolve("format"), module === esm ? "esm" : "cjs")
}

for (const declaration of [
  packageJson.types,
  packageJson.exports["."].require.types,
]) {
  const contents = await readFile(resolve(root, declaration), "utf8")
  assert.doesNotMatch(contents, /sourceMappingURL=/)
}

const npmCache = await mkdtemp(resolve(tmpdir(), "pumpit-npm-"))
let packed
try {
  packed = spawnSync(
    "npm",
    ["pack", "--dry-run", "--ignore-scripts", "--json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, npm_config_cache: npmCache },
    },
  )
} finally {
  await rm(npmCache, { recursive: true, force: true })
}

assert.equal(packed.status, 0, packed.stderr)
const [{ files }] = JSON.parse(packed.stdout)
const packedDistFiles = files
  .map(({ path }) => path)
  .filter((path) => path.startsWith("dist/"))
  .sort()

assert.deepEqual(packedDistFiles, [
  "dist/index.cjs",
  "dist/index.cjs.map",
  "dist/index.d.cts",
  "dist/index.d.ts",
  "dist/index.js",
  "dist/index.js.map",
])

console.log(
  "Package exports, runtime formats, declarations, and packed files are valid.",
)

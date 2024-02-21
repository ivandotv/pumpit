import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    // sourcemap: true,
    lib: {
      entry: './src/index.ts',
      name: 'Pumpit',
      fileName: 'pumpit'
    },
    minify: 'esbuild'
  },
  esbuild: {
    minifyWhitespace: true,
    legalComments: 'none'
  },
  plugins: [dts({ rollupTypes: true })]
})

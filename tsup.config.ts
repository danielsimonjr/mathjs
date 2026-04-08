import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    'index': 'src/defaultInstance.js',
    'number': 'src/number.js',
    'factoriesAny': 'src/factoriesAny.js',
    'factoriesNumber': 'src/factoriesNumber.js'
  },
  format: ['esm', 'cjs'],
  dts: false, // Disable for now - existing types/index.d.ts is used
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  target: 'es2020',
  treeshake: true,
  // Handle .ts imports by rewriting them to .js in output
  esbuildOptions(options) {
    options.resolveExtensions = ['.ts', '.js']
  }
})

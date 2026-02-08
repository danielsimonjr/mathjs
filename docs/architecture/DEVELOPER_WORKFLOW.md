# Math.js Developer Workflow Guide

This document bridges the gap between **architecture** and **practical development**, providing day-to-day guidance for developers working on Math.js.

For conceptual architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md). For high-level overview, see [OVERVIEW.md](./OVERVIEW.md).

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Build & Compilation Workflow](#build--compilation-workflow)
3. [Testing Strategy](#testing-strategy)
4. [TypeScript Migration Workflow](#typescript-migration-workflow)
5. [WASM Development](#wasm-development)
6. [Debugging Techniques](#debugging-techniques)
7. [Performance Profiling](#performance-profiling)
8. [Common Development Tasks](#common-development-tasks)

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- npm or yarn
- Git

### Initial Setup
```bash
git clone https://github.com/danielsimonjr/mathjs.git
cd mathjs
npm install
npm run build    # Full build (dist + lib + browser + WASM)
npm test         # Verify setup with tests
```

### Watch Mode for Active Development
```bash
# TypeScript only (fastest for development)
npm run watch:ts

# Or full build with watch
npm run watch
```

This compiles TypeScript to `dist/` automatically when files change, enabling rapid iteration.

### Typical Development Session
1. Start watch mode in one terminal: `npm run watch:ts`
2. Run tests in another: `npm test` or `npx mocha test/unit-tests/function/<category>/<name>.test.js`
3. Check linting: `npm run lint` or auto-fix with `npm run format`

---

## Build & Compilation Workflow

### Understanding the Build System

Math.js uses multiple build tools to produce different output formats:

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| **tsup** | `src/**/*.ts` | `dist/` | Main distribution bundle |
| **Gulp** | `dist/` | `lib/esm/`, `lib/cjs/` | CommonJS & ESM variants |
| **Webpack** | `lib/` | `lib/browser/` | Browser bundle (UMD) |
| **AssemblyScript** | `src/wasm/**/*.ts` | `lib/wasm/` | WebAssembly modules |

### Build Commands by Use Case

```bash
# Full build (everything)
npm run build

# Just recompile TypeScript to dist/
npm run compile:ts

# Watch TypeScript (recommended during dev)
npm run watch:ts

# Clean and rebuild
npm run build:clean && npm run build

# Build only browser bundle
npx gulp bundle

# Build only WASM
npm run build:wasm           # Production build
npm run build:wasm:debug     # Debug symbols
npm run validate:wasm        # Check syntax without building
```

### Build Output Structure

```
dist/                    # Primary output (tsup)
├── index.js            # Full library (ESM)
├── index.cjs           # Full library (CommonJS)
├── number.js           # Number-only (ESM)
├── number.cjs          # Number-only (CommonJS)
├── factoriesAny.js     # All 396 factories
└── factoriesNumber.js  # 280 number-only factories

lib/                     # Secondary formats (gulp)
├── esm/                # ES modules
├── cjs/                # CommonJS
├── browser/            # Browser bundle (UMD)
└── wasm/               # WASM modules
```

**Important:** Only commit changes in `src/`. Generated files in `dist/` and `lib/` are auto-built.

---

## Testing Strategy

### Test Organization

```
test/unit-tests/
├── function/           # Function-specific tests (mirrors src/)
│   ├── arithmetic/
│   ├── matrix/
│   └── ...
├── expression/         # Parser & evaluator tests
├── type/              # Data type tests
└── wasm/              # WASM unit tests (vitest)

test/
├── generated-code-tests/    # Generated entry file tests
├── node-tests/              # Node.js integration tests
├── typescript-tests/        # TypeScript type definition tests
└── benchmark/               # Performance benchmarks
```

### Running Tests

```bash
# Unit tests + lint (main workflow)
npm test

# Specific test file
npx mocha test/unit-tests/function/arithmetic/add.test.js

# All tests in category
npx mocha test/unit-tests/function/arithmetic/**/*.test.js

# All test suites
npm run test:all

# With coverage report
npm run coverage
# View at: ./coverage/lcov-report/index.html
```

### JavaScript vs TypeScript Test Isolation

**Critical Pattern:** TypeScript tests must create isolated math instances to avoid polluting global state:

```javascript
// WRONG - uses global state
import math from 'mathjs'
math.config({ number: 'BigNumber' })  // Affects other tests!

// RIGHT - create isolated instance
import { create } from 'mathjs'
const math = create()
math.config({ number: 'BigNumber' })  // Only affects this test
```

Add unique unit names to prevent conflicts:
```javascript
const uniqueUnitName = 'myUnit' + 'Ts' + Date.now()
math.createUnit(uniqueUnitName, { ... })
```

### WASM Testing

```bash
# Validate WASM syntax (no build)
npm run validate:wasm

# Build debug version with symbols
npm run build:wasm:debug

# Run WASM-specific tests
npm run test:wasm
```

---

## TypeScript Migration Workflow

### Tracking Progress with ts-inventory.json

The `ts-inventory.json` file tracks conversion status of all source files:

```json
[
  { "path": "src/function/arithmetic/add.ts", "converted": true },
  { "path": "src/function/arithmetic/subtract.js", "converted": false },
  ...
]
```

Check migration progress:
```bash
# Count converted files
node -e "const inv=require('./ts-inventory.json'); const conv=inv.filter(f=>f.converted).length; console.log(conv + '/' + inv.length + ' files converted');"

# Or with grep
grep -c '"converted": true' ts-inventory.json
```

### Converting a File to TypeScript

1. **Use the migration tool** (basic conversion):
   ```bash
   node tools/migrate-to-ts.js --file src/path/to/file.js
   ```

2. **Manually improve**:
   - Add proper type annotations
   - Replace `.js` imports with appropriate types
   - Update any dynamic imports

3. **Test thoroughly**:
   ```bash
   npm run compile:ts  # Verify compilation
   npm test           # Run tests
   npm run test:types # Verify type definitions
   ```

4. **Update TypeScript definitions** in `types/index.d.ts`:
   - Add instance method signature
   - Add chain method signature
   - Add static export signature
   - Add dependencies section
   - Write type tests in `test/typescript-tests/testTypes.ts`
   See `types/EXPLANATION.md` for detailed guidance.

5. **Update ts-inventory.json**:
   ```json
   { "path": "src/path/to/file.ts", "converted": true }
   ```

### Priority Conversion Order

Focus on high-impact conversions first:
1. **Plain number implementations** (largest speedup potential)
2. **Sparse matrix algorithms** (performance-critical)
3. **Combinatorics functions** (isolation from side effects)
4. **Numeric solvers** (complex algorithms benefit most from typing)

See `docs/refactoring/REFACTORING_TASKS.md` for the full task list.

---

## WASM Development

### When to Use WASM Acceleration

The library automatically uses WASM for:
- Matrix operations with >1000 elements
- Large array operations
- Repeated numerical computations

Performance gains: **2-10x speedup** for large operations.

### Building WASM Modules

WASM modules are in `src/wasm/` organized by category:

```
src/wasm/
├── algebra/          # Polynomial operations
├── arithmetic/       # Basic arithmetic
├── matrix/          # Matrix algorithms
├── statistics/      # Statistical functions
└── index.ts         # Main WASM entry point
```

```bash
# Development (with debug symbols)
npm run build:wasm:debug

# Production build
npm run build:wasm

# Check for syntax errors without building
npm run validate:wasm
```

### Writing WASM Modules

WASM modules use **AssemblyScript** syntax (TypeScript-like). Example:

```typescript
// src/wasm/arithmetic/multiply.ts
export function multiply(a: f64, b: f64): f64 {
  return a * b
}
```

**Key constraints:**
- Limited to numeric types (f64, i32, i64, etc.)
- No complex objects or inheritance
- Manual memory management for arrays
- See `docs/ASSEMBLYSCRIPT_STYLE_GUIDE.md` for conventions

---

## Debugging Techniques

### Debug TypeScript Compilation

```bash
# Check for TypeScript errors
npx tsc --noEmit

# Count errors
npx tsc --noEmit 2>&1 | grep -c "error TS"

# See all errors with context
npx tsc --noEmit --pretty false
```

### Debug ESLint Issues

```bash
# Show violations with details
npm run lint

# Auto-fix what you can
npm run format

# Check specific file
npx eslint src/function/arithmetic/add.ts
```

### Debug Test Failures

```bash
# Run single test with verbose output
npx mocha test/unit-tests/function/arithmetic/add.test.js --reporter spec

# With debugging enabled
node --inspect-brk ./node_modules/.bin/mocha test/unit-tests/function/arithmetic/add.test.js
# Then open chrome://inspect in Chrome to debug
```

### Debug Expression Parser Issues

```javascript
import math from 'mathjs'

// Parse and inspect AST
const expr = math.parse('x^2 + 1')
console.log(expr)                    // Full AST structure
console.log(expr.toString())         // Reconstructed expression
console.log(expr.compile().evaluate({x: 3}))  // Evaluate
```

---

## Performance Profiling

### Benchmark Suite

```bash
# Run all benchmarks
npm run benchmark

# Run specific benchmark
node test/benchmark/<name>.js
```

Benchmarks use `tinybench` for microsecond-level timing precision.

### Profile in Node.js

```bash
# CPU profiling
node --prof src/yourscript.js
node --prof-process isolate-*.log > profile.txt

# Memory profiling
node --expose-gc src/yourscript.js
```

### Identify Performance Bottlenecks

```javascript
// Time critical operations
const start = performance.now()
// ... operation ...
const elapsed = performance.now() - start
console.log(`Operation took ${elapsed.toFixed(3)}ms`)

// For matrices, check if WASM is being used
const matrix = math.matrix([[1,2],[3,4]])
console.log(matrix.type)  // "DenseMatrix" or "SparseMatrix"
```

---

## Common Development Tasks

### Add a New Function

1. Create function file: `src/function/<category>/<name>.ts`
2. Register in: `src/factoriesAny.ts` and `src/factoriesNumber.ts`
3. Add embedded docs: `src/expression/embeddedDocs/function/<category>/<name>.js`
4. Register docs in: `src/expression/embeddedDocs/embeddedDocs.js`
5. Write tests: `test/unit-tests/function/<category>/<name>.test.js`
6. Add TypeScript definitions: See `types/EXPLANATION.md`
7. Verify: `npm test && npm run test:types`

### Extend with Custom Type

```javascript
import { create } from 'mathjs'
import { typed } from '@danielsimonjr/typed-function'

const math = create()

// Add custom type to typed-function
typed.addType({
  name: 'MyDecimal',
  test: x => x instanceof MyDecimal,
  from: num => new MyDecimal(num)
})

// Now functions automatically support MyDecimal
```

### Fix Breaking Change in Dependency

1. Update `package.json`
2. Run `npm install`
3. Check `npm run test:all`
4. Update code if needed
5. Verify types: `npm run test:types`

### Deploy to npm

```bash
# Pre-publication check
npm run prepublishOnly  # Runs tests, linting, and builds

# If all pass, npm handles the rest
npm publish
```

---

## Related Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architectural patterns
- [COMPONENTS.md](./COMPONENTS.md) - Component reference
- [DATAFLOW.md](./DATAFLOW.md) - Data flow through system
- [OVERVIEW.md](./OVERVIEW.md) - High-level architecture
- ../CLAUDE.md - Quick reference guide for Claude Code

For TypeScript migration details, see:
- `docs/refactoring/REFACTORING_PLAN.md`
- `docs/refactoring/REFACTORING_TASKS.md`
- `types/EXPLANATION.md` - TypeScript definitions guide

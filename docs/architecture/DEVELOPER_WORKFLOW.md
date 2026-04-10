# Math.js Developer Workflow Guide

This document bridges the gap between **architecture** and **practical development**, providing day-to-day guidance for developers working on Math.js.

For conceptual architecture, see [ARCHITECTURE.md](./ARCHITECTURE.md). For high-level overview, see [OVERVIEW.md](./OVERVIEW.md).

For TypeScript and WASM-accelerated math, see [MathTS](https://github.com/danielsimonjr/MathTS).

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Build & Compilation Workflow](#build--compilation-workflow)
3. [Testing Strategy](#testing-strategy)
4. [Debugging Techniques](#debugging-techniques)
5. [Performance Profiling](#performance-profiling)
6. [Common Development Tasks](#common-development-tasks)

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
npm run build    # Full build (dist + lib + browser)
npm test         # Verify setup with tests
```

### Watch Mode for Active Development
```bash
npm run watch
```

### Typical Development Session
1. Start watch mode in one terminal: `npm run watch`
2. Run tests in another: `npm test` or `npx mocha test/unit-tests/function/<category>/<name>.test.js`
3. Check linting: `npm run lint` or auto-fix with `npm run format`

---

## Build & Compilation Workflow

### Understanding the Build System

Math.js uses multiple build tools to produce different output formats:

| Tool | Input | Output | Purpose |
|------|-------|--------|---------|
| **tsup** | `src/entry/*.js` | `dist/` | Main distribution bundle |
| **Gulp** | `dist/` | `lib/esm/`, `lib/cjs/` | CommonJS & ESM variants |
| **Webpack** | `lib/` | `lib/browser/` | Browser bundle (UMD) |

**Important**: tsup bundles from `.js` entry points. Do not change entry points to `.ts`.

### Build Commands by Use Case

```bash
# Full build (everything)
npm run build

# Watch for changes (recommended during dev)
npm run watch

# Clean and rebuild
npm run build:clean && npm run build

# Build only browser bundle
npx gulp bundle

# Generate documentation site
npx gulp docs
```

### Build Output Structure

```
dist/                    # Primary output (tsup)
├── index.js            # Full library (ESM)
├── index.cjs           # Full library (CommonJS)
├── number.js           # Number-only (ESM)
├── number.cjs          # Number-only (CommonJS)
├── factoriesAny.js     # All 545 factories
└── factoriesNumber.js  # 300+ number-only factories

lib/                     # Secondary formats (gulp)
├── esm/                # ES modules
├── cjs/                # CommonJS
└── browser/            # Browser bundle (UMD)
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

---

## Debugging Techniques

### Debug ESLint Issues

```bash
# Show violations with details
npm run lint

# Auto-fix what you can
npm run format

# Check specific file
npx eslint src/function/arithmetic/add.js
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

const matrix = math.matrix([[1,2],[3,4]])
console.log(matrix.type)  // "DenseMatrix" or "SparseMatrix"
```

---

## Common Development Tasks

### Add a New Function

1. Create function file: `src/function/<category>/<name>.js`
2. Register in: `src/factoriesAny.js` and `src/factoriesNumber.js`
3. Add embedded docs: `src/expression/embeddedDocs/function/<category>/<name>.js`
4. Register docs in: `src/expression/embeddedDocs/embeddedDocs.js`
5. Write tests: `test/unit-tests/function/<category>/<name>.test.js`
6. Add TypeScript definitions: See `types/EXPLANATION.md`
7. Verify: `npm test`

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
- [Function Reference](https://danielsimonjr.github.io/mathjs/) - Full online function reference
- ../CLAUDE.md - Quick reference guide for Claude Code
- `types/EXPLANATION.md` - TypeScript definitions guide

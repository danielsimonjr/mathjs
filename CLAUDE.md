# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Quick Reference

```bash
npm install                    # Install dependencies
npm run build                  # Full build (ESM, CJS, browser, WASM)
npm test                       # Run tests + lint
npm run format                 # Auto-fix code style
npm run compile:ts             # Compile TypeScript only
npx mocha test/unit-tests/function/<category>/<name>.test.js  # Run single test
```

## ⚠️ Critical: ES Module File Extensions

**All imports MUST include `.js` extensions** (even in TypeScript files):
- ✅ `import { foo } from './bar.js'`
- ❌ `import { foo } from './bar'`

Configure your IDE to add extensions on auto-import. This is enforced by ESLint.

## Project Overview

Math.js is an extensive math library for JavaScript and Node.js featuring:
- Flexible expression parser with symbolic computation support
- Large set of built-in functions and constants
- Support for multiple data types: numbers, big numbers, complex numbers, fractions, units, matrices
- 15 type classes: BigNumber, Complex, Fraction, Range, Matrix (Dense/Sparse/Immutable), Index, Unit, Parser, Help, Chain, FibonacciHeap, Spa
- ES modules codebase requiring all files to have real `.js` extensions
- Currently undergoing TypeScript + WASM + parallel computing refactoring
- Uses forked packages: `@danielsimonjr/typed-function` and `@danielsimonjr/workerpool` for WASM acceleration

## Build Commands

```bash
# Install dependencies
npm install

# Full build (ESM, CJS, browser bundle, WASM)
npm run build

# Clean build output
npm run build:clean

# Compile TypeScript files
npm run compile:ts

# Watch TypeScript changes
npm run watch:ts

# Build WASM modules
npm run build:wasm

# Build WASM in debug mode
npm run build:wasm:debug

# Compile JavaScript (without full build)
npm run compile

# Watch for changes
npm run watch
```

## Testing Commands

```bash
# Run unit tests and lint
npm test

# Run all tests (unit, generated, node, types)
npm run test:all

# Run only unit tests (src/)
npm run test:src

# Run generated code tests
npm run test:generated

# Run Node.js integration tests
npm run test:node

# Run TypeScript type tests
npm run test:types

# Run browser tests (Firefox headless)
npm run test:browser

# Run on LambdaTest (requires LT_USERNAME and LT_ACCESS_KEY env vars)
npm run test:lambdatest

# Code coverage with report
npm run coverage
# View report at: ./coverage/lcov-report/index.html
```

## Linting and Code Style

```bash
# Run eslint (also runs with npm test)
npm run lint

# Auto-fix linting issues
npm run format

# Validate ASCII characters
npm run validate:ascii
```

## Codebase Scale

Key architectural constants (see `ts-inventory.json` for current file counts):

| Component | Approximate Count |
|-----------|-------------------|
| Factory functions | ~400 |
| AST node types | 16 |
| Type classes | 15 |
| Matrix algorithms | 15 |
| Expression transforms | 25 |

**Most-used dependencies** in factory functions:
- `typed` - type dispatch system (used by nearly all functions)
- `matrix`, `DenseMatrix`, `SparseMatrix` - matrix operations
- `config` - configuration access
- `equalScalar` - equality checks

## Architecture Overview

### Core Dependency Injection System

Math.js uses a **factory function + dependency injection** architecture:

1. **Factory Functions**: Each function is created via an immutable factory function (e.g., `createAdd`, `createMultiply`)
2. **Typed Functions**: All functions use [`typed-function`](https://github.com/josdejong/typed-function/) to support multiple data types and automatic type conversions
3. **Dependency Injection**: Functions declare their dependencies, allowing automatic composition and customization
4. **Instance Creation**: `math.create(factories, config)` creates a MathJS instance from factory functions

**Example**: If you extend `multiply` to support a new data type `MyDecimal`, functions like `prod` that depend on `multiply` automatically support `MyDecimal` too.

### Directory Structure

```
src/
├── core/                    # Core system (create, config, typed-function)
│   └── function/            # Core functions like import.ts
├── entry/                   # Generated entry point files
│   ├── dependenciesAny/     # Dependency declarations for full version
│   ├── dependenciesNumber/  # Dependency declarations for number-only
│   ├── pureFunctionsAny.generated.ts
│   ├── pureFunctionsNumber.generated.ts
│   ├── impureFunctionsAny.generated.ts
│   └── impureFunctionsNumber.generated.ts
├── wasm/                    # WASM modules (AssemblyScript)
│   └── algebra/             # Algebra WASM (polynomial.ts)
└── version.js               # Version string

dist/                        # Built distribution files (main output)
├── factoriesAny.js          # All 396 factory functions (~1.3 MB)
├── factoriesNumber.js       # Number-only factories (~660 KB)
├── index.js                 # Main entry point
└── number.js                # Number-only entry point

lib/cjs/                     # CommonJS build output
├── function/                # All mathematical functions by category
│   ├── algebra/             # derivative, simplify, solver, etc.
│   ├── arithmetic/          # add, multiply, pow, sqrt, etc.
│   ├── matrix/              # det, inv, transpose, eigs, etc.
│   ├── trigonometry/        # sin, cos, tan, etc.
│   ├── statistics/          # mean, std, variance, etc.
│   ├── probability/         # combinations, permutations, etc.
│   ├── bitwise/             # bitAnd, bitOr, leftShift, etc.
│   ├── logical/             # and, or, not, xor
│   ├── relational/          # equal, larger, smaller, etc.
│   ├── set/                 # setUnion, setIntersect, etc.
│   ├── signal/              # fft, ifft
│   ├── special/             # erf, gamma, zeta
│   ├── string/              # format, print
│   ├── unit/                # unit operations
│   └── utils/               # utility functions
├── expression/              # Expression parser and evaluation
├── type/                    # Data type implementations
└── core/                    # Core system

test/
├── unit-tests/              # Unit tests organized by category
│   ├── function/            # Function tests (mirrors lib structure)
│   ├── expression/          # Parser tests
│   ├── type/                # Type tests
│   └── wasm/                # WASM unit tests
├── wasm/                    # WASM-specific tests (vitest)
├── generated-code-tests/    # Tests for generated entry files
├── node-tests/              # Node.js integration tests
├── typescript-tests/        # TypeScript type definition tests
├── browser-test-config/     # Browser test configurations
└── benchmark/               # Performance benchmarks

types/
├── index.d.ts               # TypeScript type definitions
└── EXPLANATION.md           # Guide for maintaining type definitions
```

### TypeScript + WASM Refactoring (In Progress)

The codebase is being gradually converted to TypeScript with WASM support:

- **Migration Tracking**: `ts-inventory.json` tracks all source files and conversion status
- **TypeScript Errors**: Run `npx tsc --noEmit 2>&1 | grep -c "error TS"` to check current count
- **Goal**: Type safety, 2-25x performance improvements, multi-core support
- **Strategy**: Incremental conversion with dual .ts/.js files, 100% backward compatible
- **Full Details**: `docs/architecture/README_TYPESCRIPT_WASM.md`, `docs/refactoring/REFACTORING_PLAN.md`

**Three-tier performance system**:
1. JavaScript fallback (always available)
2. WASM acceleration (2-10x faster for large operations)
3. Parallel/multicore execution (2-4x additional speedup)

**WASM modules** are in `src/wasm/` organized by category (algebra, matrix, arithmetic, signal, numeric, statistics, trigonometry, special, etc.)

### Build System

**Build tools**:
- **tsup** (`tsup.config.ts`) - Bundles TypeScript/JavaScript to `dist/`
- **Gulp** (`gulpfile.js`) - Compiles to CommonJS/ESM formats in `lib/`
- **Webpack** - Creates browser bundle
- **AssemblyScript** - Compiles WASM modules

**Primary outputs** (in `dist/`):
- `dist/factoriesAny.js` - All 396 factory functions (~1.3 MB)
- `dist/factoriesNumber.js` - Number-only factories (~660 KB)
- `dist/index.js` - Main entry point (~1.3 MB)
- `dist/number.js` - Lightweight number-only version (~1.4 MB)

**Secondary outputs** (in `lib/`):
- `lib/esm/` - ES modules
- `lib/cjs/` - CommonJS (with package.json type marker)
- `lib/browser/math.js` - UMD browser bundle
- `lib/wasm/` - WASM modules (when built)

## Implementing a New Function

Follow these steps when adding a new function:

1. **Create the function file**:
   - Location: `src/function/<category>/<functionName>.js` (or `.ts` if TypeScript)
   - Use factory function pattern with typed-function
   - Document with JSDoc (used for auto-generated docs)

2. **Register in factory index**:
   - Add to `src/factoriesAny.js`
   - Add to `src/factoriesNumber.js` if applicable (number-only version)

3. **Add embedded documentation**:
   - Create: `src/expression/embeddedDocs/function/<category>/<functionName>.js`
   - Register in: `src/expression/embeddedDocs/embeddedDocs.js`

4. **Write tests**:
   - Create: `test/unit-tests/function/<category>/<functionName>.test.js`
   - Use Mocha test framework

5. **Add TypeScript definitions** (in `types/index.d.ts`):
   - Add to `interface MathJsInstance` (instance method)
   - Add to `interface MathJsChain` (chained method)
   - Add to static exports section
   - Add to dependencies section (`<functionName>Dependencies`)
   - Write type tests in `test/typescript-tests/testTypes.ts`
   - See `types/EXPLANATION.md` for detailed guidance

6. **Verify**:
   ```bash
   npm run lint        # Check code style
   npm run format      # Auto-fix style issues
   npm test            # Run tests
   npm run test:types  # Test TypeScript definitions
   ```

## Key Patterns and Conventions

### Factory Function Pattern

```javascript
// Example: createAdd factory function
export const createAdd = /* #__PURE__ */ factory(
  'add',
  ['typed', 'matrix', 'equalScalar', 'addScalar'],
  ({ typed, matrix, equalScalar, addScalar }) => {
    return typed('add', {
      'number, number': (x, y) => x + y,
      'Complex, Complex': (x, y) => x.add(y),
      'BigNumber, BigNumber': (x, y) => x.plus(y),
      'Matrix, Matrix': (x, y) => algorithm13(x, y, addScalar),
      // ... more signatures
    })
  }
)
```

### Typed Function Pattern

Functions support multiple type signatures via `typed-function`:
- Automatically dispatches to correct implementation based on argument types
- Supports automatic type conversions
- Can be extended with new types dynamically

### Function Categories

The 396 factory functions are organized into these categories:

| Category | Count | Key Functions |
|----------|-------|---------------|
| Matrix | 54 | det, inv, transpose, eigs, qr, lup, svd, pinv, dot, cross |
| Arithmetic | 45 | add, subtract, multiply, divide, pow, sqrt, abs, exp, log |
| Expression | 32 | parse, evaluate, compile, simplify, derivative |
| Trigonometry | 27 | sin, cos, tan, asin, acos, atan, sinh, cosh, tanh |
| Statistics | 22 | mean, median, std, variance, sum, prod, min, max |
| Relational | 19 | equal, unequal, larger, smaller, compare, deepEqual |
| Algebra | 15 | simplify, derivative, rationalize, resolve, lsolve, lusolve |
| Probability | 12 | combinations, permutations, factorial, random, pickRandom |
| Bitwise | 8 | bitAnd, bitOr, bitXor, bitNot, leftShift, rightShift |
| Logical | 6 | and, or, not, xor |

### Matrix Algorithms

Math.js includes 15 specialized matrix algorithms for sparse/dense operations:
- `MatAlgo01xDSid` through `MatAlgo14xDs` - Various sparse/dense matrix operations
- These are internal and automatically selected based on matrix types

### Expression Parser Node Types

The expression parser uses 16 AST node types:
- `ConstantNode`, `SymbolNode`, `OperatorNode`, `FunctionNode`
- `ArrayNode`, `ObjectNode`, `IndexNode`, `AccessorNode`
- `AssignmentNode`, `FunctionAssignmentNode`, `BlockNode`
- `ConditionalNode`, `RangeNode`, `RelationalNode`, `ParenthesisNode`
- Base `Node` class

Plus 25 expression transforms for special handling (e.g., `MapTransform`, `FilterTransform`, `RangeTransform`)

### Code Style

- Follows [JavaScript Standard Style](https://standardjs.com/)
- Enforced via ESLint (`.eslintrc.cjs`)
- Auto-formatted via Prettier (`.prettierrc.cjs`)
- Use `npm run format` to auto-fix

### Test Organization

- Test files mirror source structure: `src/function/arithmetic/add.js` → `test/unit-tests/function/arithmetic/add.test.js`
- Both JS and TS test files run together (configured in `.mocharc.json` with `extension: ["js", "ts"]`)
- **TS test isolation**: TS tests must use `math.create()` to create isolated instances to avoid polluting global state used by JS tests
- Use unique suffixes (e.g., `'Ts' + Date.now()`) for custom unit names to prevent conflicts
- Use descriptive test names
- Test all type signatures
- Test edge cases and error conditions

## TypeScript Migration (for contributors)

**Converting a file to TypeScript**:

```bash
# Use migration tool (handles basic conversion)
node tools/migrate-to-ts.js --file src/path/to/file.js

# Then manually:
# 1. Add proper type annotations
# 2. Update imports to reference .ts files where applicable
# 3. Add TypeScript definitions to types/index.d.ts
# 4. Test thoroughly

npm run compile:ts  # Verify compilation
npm test            # Verify tests pass
npm run test:types  # Verify type definitions
```

**Priority files for WASM conversion**:
- See `REFACTORING_TASKS.md` for complete list
- Focus on: plain number implementations, sparse algorithms, combinatorics, numeric solvers

## Common Development Workflows

### Running a single test file

```bash
npx mocha test/unit-tests/function/arithmetic/add.test.js
```

### Building only browser bundle

```bash
npx gulp bundle
```

### Generating documentation

```bash
npm run build:docs
```

### Performance benchmarking

```bash
# Run benchmarks
npm run benchmark

# Or manually with tinybench
node test/benchmark/<specific-benchmark>.js
```

### Testing WASM modules

```bash
# Build WASM first
npm run build:wasm

# Run WASM-specific tests
npm run test:wasm  # (if available)

# Or test manually in Node
node -e "import('./lib/wasm/index.js').then(wasm => console.log(wasm))"
```

## Important Notes

### Key Dependencies

**Runtime dependencies**:
- `@danielsimonjr/typed-function` (v5.0.0-alpha.1) - Forked for WASM support
- `@danielsimonjr/workerpool` (v10.1.0) - Forked for parallel computing
- `decimal.js` (v10.4.3) - Arbitrary precision decimals (BigNumber)
- `complex.js` (v2.2.5) - Complex number support
- `fraction.js` (v5.2.1) - Exact fraction arithmetic

**Dev dependencies**:
- `typescript` (5.9.3), `tsup` (8.5.1) - TypeScript compilation
- `vitest` (4.0.15), `mocha` (11.7.5) - Testing
- `assemblyscript` (0.28.9) - WASM compilation
- `gulp` (5.0.1), `webpack` (5.102.1) - Build system

### Compatibility

- Requires Node.js >= 18
- Supports ES2020+ JavaScript engines
- Browser support: Chrome, Firefox, Safari, Edge (modern versions)

### Performance Considerations

- For large matrix operations (>1000×1000), WASM provides 5-25x speedup
- Parallel computing requires 4+ cores for significant benefit
- The library automatically selects optimal implementation based on operation size

### Common Gotchas

1. **File extensions required**: Always use `.js` in imports, even in TypeScript files (see warning at top)
2. **Factory dependencies**: When adding function dependencies, ensure they're declared in factory function parameters
3. **TypeScript definitions**: Must be added in **multiple** places (see `types/EXPLANATION.md`)
4. **Don't commit generated files**: Only commit changes in `src/`, not `lib/` or `dist/`
5. **Dual JS/TS tests**: When writing TS tests, always use isolated math instances to prevent state pollution between JS and TS test suites

### Pull Request Branches

| Repository | Target Branch |
|------------|---------------|
| **This fork** (danielsimonjr/mathjs) | `master` |
| **Upstream** (josdejong/mathjs) | `develop` |

## Documentation References

- **AssemblyScript Style Guide**: `docs/ASSEMBLYSCRIPT_STYLE_GUIDE.md` - Coding conventions for WASM modules
- **Main README**: `README.md` - Getting started, usage examples
- **TypeScript/WASM Guide**: `docs/architecture/README_TYPESCRIPT_WASM.md` - Complete refactoring overview
- **Refactoring Plan**: `docs/refactoring/REFACTORING_PLAN.md` - Detailed conversion strategy
- **Refactoring Tasks**: `docs/refactoring/REFACTORING_TASKS.md` - File-by-file task list
- **Type Definitions**: `types/EXPLANATION.md` - TypeScript type system guide
- **Migration Guide**: `docs/migration/MIGRATION_GUIDE.md` - User migration guide for TS/WASM
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **Online Docs**: https://mathjs.org/docs/ - Full user documentation

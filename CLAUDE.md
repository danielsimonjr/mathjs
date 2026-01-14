# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Math.js is an extensive math library for JavaScript and Node.js featuring:
- Flexible expression parser with symbolic computation support
- Large set of built-in functions and constants
- Support for multiple data types: numbers, big numbers, complex numbers, fractions, units, matrices
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
├── type/                    # Data type implementations (Complex, BigNumber, Matrix, etc.)
├── function/                # All mathematical functions organized by category
│   ├── arithmetic/          # Basic arithmetic (add, multiply, etc.)
│   ├── algebra/             # Algebraic functions (derivative, simplify, etc.)
│   ├── matrix/              # Matrix operations
│   ├── trigonometry/        # Trig functions
│   ├── statistics/          # Statistical functions
│   ├── probability/         # Probability functions
│   ├── utils/               # Utility functions (isInteger, typeOf, etc.)
│   └── [other categories]
├── expression/              # Expression parser and evaluation
│   ├── Parser.js            # Main expression parser
│   ├── embeddedDocs/        # Documentation for parser functions
│   ├── node/                # AST node types
│   └── transform/           # Expression transformations
├── parallel/                # Parallel computing (WorkerPool, ParallelMatrix)
├── wasm/                    # WASM integration layer (WasmLoader, MatrixWasmBridge)
├── factoriesAny.js          # All factory functions (full version)
├── factoriesNumber.js       # Number-only factory functions (lightweight)
└── defaultInstance.js       # Default math.js instance

src/wasm/                    # AssemblyScript WASM modules (compiled to lib/wasm/)
├── matrix/                  # Matrix operations for WASM
├── algebra/                 # Linear algebra for WASM
├── arithmetic/              # Arithmetic operations for WASM
├── trigonometry/            # Trig functions for WASM
├── signal/                  # Signal processing (FFT, etc.)
└── index.ts                 # WASM entry point

test/
├── unit-tests/              # Unit tests (main test suite)
├── wasm/                    # WASM-specific tests (vitest)
│   └── unit-tests/          # Direct WASM and pre-compile tests
├── generated-code-tests/    # Tests for generated entry files
├── node-tests/              # Node.js specific tests
├── typescript-tests/        # TypeScript type definition tests
├── browser-test-config/     # Browser test configurations
└── benchmark/               # Performance benchmarks

types/
├── index.d.ts               # TypeScript type definitions
└── EXPLANATION.md           # Guide for maintaining type definitions

tools/                       # Build and development tools
├── entryGenerator.js        # Generates entry point files
├── docgenerator.js          # Generates documentation
├── migrate-to-ts.js         # TypeScript migration tool
└── validateAsciiChars.js    # ASCII validation
```

### TypeScript + WASM Refactoring (In Progress)

The codebase is being gradually converted to TypeScript with WASM support:

- **Source Status**: ~692 TS / ~1256 JS (~36% converted)
- **TypeScript Errors**: ~11,600 remaining (run `npx tsc --noEmit 2>&1 | grep -c "error TS"` to check current count)
- **Goal**: Type safety, 2-25x performance improvements, multi-core support
- **Strategy**: Incremental conversion, 100% backward compatible
- **See**: `docs/architecture/README_TYPESCRIPT_WASM.md`, `docs/refactoring/REFACTORING_PLAN.md`

**Three-tier performance system**:
1. JavaScript fallback (always available)
2. WASM acceleration (2-10x faster for large operations)
3. Parallel/multicore execution (2-4x additional speedup)

### Build System

**Gulp-based build** (`gulpfile.js`):
- Compiles ES modules to CommonJS and ESM formats
- Creates browser bundle via Webpack
- Generates documentation from JSDoc comments
- Creates entry point files with dependency graphs

**Outputs** (in `lib/`):
- `lib/esm/` - ES modules
- `lib/cjs/` - CommonJS (with package.json type marker)
- `lib/browser/math.js` - UMD browser bundle
- `lib/typescript/` - Compiled TypeScript (when present)
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

### ES Module Requirements

- All import statements **must** include file extensions (`.js` or `.ts`)
- Configure your IDE to add extensions on auto-import
- Incorrect: `import { foo } from './bar'`
- Correct: `import { foo } from './bar.js'`

### Code Style

- Follows [JavaScript Standard Style](https://standardjs.com/)
- Enforced via ESLint (`.eslintrc.cjs`)
- Auto-formatted via Prettier (`.prettierrc.cjs`)
- Use `npm run format` to auto-fix

### Test Organization

- Test files mirror source structure: `src/function/arithmetic/add.js` → `test/unit-tests/function/arithmetic/add.test.js`
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

### Compatibility

- Requires Node.js >= 18
- Supports ES2020+ JavaScript engines
- Browser support: Chrome, Firefox, Safari, Edge (modern versions)

### Performance Considerations

- For large matrix operations (>1000×1000), WASM provides 5-25x speedup
- Parallel computing requires 4+ cores for significant benefit
- The library automatically selects optimal implementation based on operation size

### Common Gotchas

1. **File extensions required**: Always use `.js` in imports, even in TypeScript files during transition
2. **Factory dependencies**: When adding function dependencies, ensure they're declared in factory function parameters
3. **TypeScript definitions**: Must be added in **multiple** places (see `types/EXPLANATION.md`)
4. **Don't commit generated files**: Only commit changes in `src/`, not `lib/` or `dist/`
5. **Pull requests**: For the upstream josdejong/mathjs, PRs go to `develop` branch. For this fork (danielsimonjr/mathjs), PRs go to `master`

## MCP Servers (Environment-Specific)

If MCP servers are configured in `.mcp.json`, useful ones for this project include:

- **memory-mcp** - Persistent knowledge graph for maintaining context across sessions
- **everything-mcp** / **fzf-mcp** - Fast file system search
- **playwright** - Browser automation for testing

Check `.mcp.json` for the current configuration.

## Documentation References

- **Main README**: `README.md` - Getting started, usage examples
- **TypeScript/WASM Guide**: `docs/architecture/README_TYPESCRIPT_WASM.md` - Complete refactoring overview
- **Refactoring Plan**: `docs/refactoring/REFACTORING_PLAN.md` - Detailed conversion strategy
- **Refactoring Tasks**: `docs/refactoring/REFACTORING_TASKS.md` - File-by-file task list
- **Type Definitions**: `types/EXPLANATION.md` - TypeScript type system guide
- **Migration Guide**: `docs/migration/MIGRATION_GUIDE.md` - User migration guide for TS/WASM
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **Online Docs**: https://mathjs.org/docs/ - Full user documentation

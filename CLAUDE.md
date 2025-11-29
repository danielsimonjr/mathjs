# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Math.js is an extensive math library for JavaScript and Node.js featuring:
- Flexible expression parser with symbolic computation support
- Large set of built-in functions and constants
- Support for multiple data types: numbers, big numbers, complex numbers, fractions, units, matrices
- ES modules codebase requiring all files to have real `.js` extensions
- Currently undergoing TypeScript + WASM + parallel computing refactoring (9% complete)

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

src-wasm/                    # TypeScript/AssemblyScript WASM modules
├── matrix/                  # Matrix operations for WASM
├── algebra/                 # Linear algebra for WASM
├── arithmetic/              # Arithmetic operations for WASM
├── trigonometry/            # Trig functions for WASM
├── signal/                  # Signal processing (FFT, etc.)
└── index.ts                 # WASM entry point

test/
├── unit-tests/              # Unit tests (main test suite)
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

- **Status**: 61/673 files converted (9%)
- **Goal**: Type safety, 2-25x performance improvements, multi-core support
- **Strategy**: Incremental conversion, 100% backward compatible
- **See**: `docs/architecture/README_TYPESCRIPT_WASM.md`, `docs/refactoring/REFACTORING_PLAN.md`, `docs/refactoring/REFACTORING_TASKS.md`

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
- See `docs/refactoring/REFACTORING_TASKS.md` for complete list
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
5. **Pull requests go to `develop` branch**, not `master`

## MCP Servers Available

This project has access to several MCP (Model Context Protocol) servers configured in `.mcp.json`:

### Core Development Tools

- **sequential-thinking-mcp** - Structured reasoning and problem-solving
- **deepthinking-mcp** - 18 advanced reasoning modes with taxonomy-based classification
  - Use for complex theoretical physics, mathematical proofs, algorithm design
  - `mcp__deepthinking-mcp__deepthinking` tool with modes: sequential, mathematics, physics, hybrid, etc.

### Mathematical Tools

- **math-mcp** - WASM-accelerated mathematical operations server
  - Provides matrix operations, statistics, and symbolic math tools
  - Multi-tier acceleration: mathjs → WASM → WebWorkers
  - Use for performance testing and validation of math.js implementations

- **fermat-mcp** - Advanced mathematical theorem proving and symbolic computation

### Knowledge Management

- **memory-mcp** - Persistent knowledge graph with 45 tools
  - **Critical**: Use this to maintain context across sessions
  - Store project learnings, architectural decisions, refactoring progress
  - See "Memory Usage Guidelines" section below

### Search & Navigation

- **everything-mcp** - Fast file system search (Windows Everything integration)
- **fzf-mcp** - Fuzzy file finder

### Other Tools

- **playwright** - Browser automation and testing
- **time** - Time and date utilities
- **substack-mcp** - Substack API integration for documentation publishing

## Memory Usage Guidelines

**IMPORTANT**: Use `memory-mcp` tools to maintain continuity across sessions and prevent context loss.

### Session Start Workflow

```bash
# 1. Search for existing context about mathjs
mcp__memory-mcp__search_nodes with query "mathjs" or "Math.js"

# 2. Review graph statistics
mcp__memory-mcp__get_graph_stats

# 3. Search for specific topics if working on focused areas
mcp__memory-mcp__search_nodes with query "TypeScript refactoring"
mcp__memory-mcp__search_nodes with query "WASM acceleration"
```

### During Development

Store important discoveries and decisions:

```bash
# Create entity for new architectural patterns discovered
mcp__memory-mcp__create_entities
  entities: [{
    name: "Math.js Factory Pattern Extension",
    entityType: "architectural-pattern",
    observations: ["Details about the pattern..."],
    tags: ["mathjs", "architecture", "factory-pattern"]
  }]

# Add observations to existing "Math.js" entity
mcp__memory-mcp__add_observations
  entityName: "Math.js"
  observations: ["Converted 5 more arithmetic functions to TypeScript", "WASM build now includes FFT operations"]

# Create relations between concepts
mcp__memory-mcp__create_relations
  relations: [{
    from: "Math.js WASM Integration",
    to: "AssemblyScript Best Practices",
    relationType: "implements"
  }]
```

### Session End Workflow

```bash
# 1. Summarize accomplishments
mcp__memory-mcp__add_observations
  entityName: "Math.js TypeScript Refactoring"
  observations: ["Session 2025-11-28: Converted 10 matrix operations to TS", "All unit tests passing"]

# 2. Record next steps
mcp__memory-mcp__add_observations
  entityName: "Math.js Development Tasks"
  observations: ["TODO: Convert sparse matrix algorithms", "TODO: Add WASM benchmarks"]

# 3. Set importance for critical learnings
mcp__memory-mcp__set_importance
  entityName: "Math.js Build Pipeline"
  importance: 9
```

### Recommended Memory Entities

Create/update these entities for mathjs project:

1. **"Math.js"** (importance: 10, tags: mathjs, library, mathematics, active-project)
   - Main project entity with high-level observations

2. **"Math.js TypeScript Refactoring"** (importance: 9, tags: mathjs, typescript, refactoring)
   - Track refactoring progress, files converted, issues encountered

3. **"Math.js WASM Integration"** (importance: 8, tags: mathjs, wasm, performance)
   - WASM-specific learnings, performance metrics, build issues

4. **"Math.js Factory Pattern"** (importance: 7, tags: mathjs, architecture, design-pattern)
   - Document how dependency injection works, examples, gotchas

5. **"Math.js Development Environment"** (importance: 6, tags: mathjs, development, tooling)
   - Build commands, test workflows, common issues and solutions

## Advanced Development Patterns

### Using deepthinking-mcp for Complex Problems

When working on complex architectural decisions or mathematical implementations:

```bash
# For theoretical physics or advanced math
mcp__deepthinking-mcp__deepthinking
  mode: "mathematics" or "physics"
  prompt: "Design optimal WASM memory layout for sparse matrix operations"

# For multi-faceted problems
mcp__deepthinking-mcp__deepthinking
  mode: "hybrid"
  prompt: "Analyze trade-offs between WASM binary size and performance for matrix operations"

# For step-by-step reasoning
mcp__deepthinking-mcp__deepthinking
  mode: "sequential"
  prompt: "Design migration strategy for converting expression parser to TypeScript"
```

### Using math-mcp for Validation

Cross-validate math.js implementations against the WASM-accelerated math-mcp server:

```bash
# Test matrix operations
mcp__math-mcp__matrix_multiply with your test matrices

# Compare performance characteristics
# Use math-mcp results to validate your WASM implementations

# Test statistical functions
mcp__math-mcp__statistics with sample data
```

## Important Behavioral Guidelines

### Summary Files and Documentation

**CRITICAL**: Do NOT create summary files (like `.note.txt`, `SUMMARY.md`, etc.) unless explicitly requested by the user.

- ❌ **Never create**: Unsolicited summary files, recap documents, or session notes
- ✅ **Only create when**: User explicitly asks for a summary file or documentation
- ✅ **Exception**: Project documentation files that are part of the normal workflow (like updating existing docs, adding to existing guides, etc.)

**Rationale**: Summary files clutter the project directory and can become outdated. Users prefer to request summaries when needed rather than have them created proactively.

### File Management

- Only create files that are permanent project artifacts (tools, documentation, tests, source code)
- Temporary or informational content should be communicated directly to the user, not written to files
- Before creating any new file, verify it serves a long-term purpose for the project

## Documentation References

- **Main README**: `README.md` - Getting started, usage examples
- **TypeScript/WASM Guide**: `docs/architecture/README_TYPESCRIPT_WASM.md` - Complete refactoring overview
- **Refactoring Plan**: `docs/refactoring/REFACTORING_PLAN.md` - Detailed conversion strategy
- **Refactoring Summary**: `docs/refactoring/REFACTORING_SUMMARY.md` - Infrastructure overview
- **Refactoring Tasks**: `docs/refactoring/REFACTORING_TASKS.md` - File-by-file task list
- **TypeScript Conversion**: `docs/refactoring/TYPESCRIPT_CONVERSION_SUMMARY.md` - Conversion details
- **Architecture Guide**: `docs/architecture/TYPESCRIPT_WASM_ARCHITECTURE.md` - Technical architecture
- **Type Definitions**: `types/EXPLANATION.md` - TypeScript type system guide
- **Migration Guide**: `docs/migration/MIGRATION_GUIDE.md` - User migration guide for TS/WASM
- **History**: `docs/migration/HISTORY.md` - Historical changes
- **Contributing**: `CONTRIBUTING.md` - Contribution guidelines
- **Online Docs**: https://mathjs.org/docs/ - Full user documentation

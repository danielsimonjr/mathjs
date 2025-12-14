# Corrective Action Plan: Math.js TypeScript + WASM Dual Build System

**Date:** December 14, 2025
**Branch:** `claude/fix-mathjs-build-system-d2DXI`
**Status:** Critical - Build System Non-Functional

---

## Executive Summary

The math.js fork intended to create a dual build system producing:
1. **Efficient JavaScript** compiled from AssemblyScript-friendly TypeScript
2. **WebAssembly (WASM)** modules for parallel computing via worker pooling

**Current State:** The build system is completely non-functional. The architecture has fundamental design issues that prevent the intended dual-build approach from working.

### Critical Findings

| Issue | Severity | Impact |
|-------|----------|--------|
| Dependencies not installed (`node_modules` missing) | **CRITICAL** | All npm scripts fail |
| Fundamental AssemblyScript/TypeScript confusion | **CRITICAL** | Architecture won't work as designed |
| TypeScript type visibility errors (25+ files) | **HIGH** | TypeScript compilation fails |
| ESLint configuration incompatible with ESLint 9.x | **MEDIUM** | Linting fails |
| WASM build tooling not installed | **HIGH** | WASM compilation fails |

---

## Part 1: Root Cause Analysis

### 1.1 The Fundamental Misconception

**The core problem:** The project assumes AssemblyScript is "AssemblyScript-friendly TypeScript" that can be compiled to both JavaScript AND WebAssembly. **This is incorrect.**

#### What AssemblyScript Actually Is

```
AssemblyScript ≠ TypeScript

AssemblyScript:
- TypeScript-LIKE syntax (looks similar)
- Compiles ONLY to WebAssembly
- Has its own type system: i32, i64, f32, f64, bool
- Cannot use JavaScript built-ins (Map, Set, Promise, etc.)
- Cannot compile to JavaScript

TypeScript:
- Strict superset of JavaScript
- Compiles to JavaScript only
- Full access to JavaScript/Node.js APIs
- Cannot compile to WebAssembly directly
```

#### What the Project Tried to Do (Won't Work)

```
src/**/*.ts (TypeScript)
    ├─→ tsc → JavaScript (works)
    └─→ asc → WebAssembly (WILL NOT WORK)

src-wasm/**/*.ts (AssemblyScript)
    ├─→ asc → WebAssembly (works)
    └─→ tsc → JavaScript (PARTIAL - types differ)
```

#### What Should Happen Instead

```
src/**/*.ts (TypeScript)
    └─→ tsc/babel → JavaScript (for normal use)

src-wasm/**/*.ts (AssemblyScript)
    └─→ asc → WebAssembly (for WASM acceleration)

Runtime Integration:
    JavaScript ←→ WasmLoader ←→ WASM module
```

### 1.2 Current Build Output State

```
lib/
├── typescript/     ✅ Populated (declaration files only)
├── esm/            ❌ EMPTY (should have ES modules)
├── cjs/            ❌ EMPTY (should have CommonJS)
├── browser/        ❌ EMPTY (should have UMD bundle)
└── wasm/           ❌ MISSING (should have .wasm binary)
```

**Reason:** `node_modules/` does not exist - no dependencies installed.

### 1.3 TypeScript Compilation Errors

Running `npm run compile:ts` produces **25+ type errors**:

| Error Code | Count | Description | Root Cause |
|------------|-------|-------------|------------|
| TS2688 | 1 | Cannot find type definition for 'node' | @types/node not installed |
| TS4023 | ~20 | Exported variable uses unexported type | Internal types not exported |
| TS4094 | 5 | Private property on exported class | Factory pattern + strict mode conflict |

#### Key Type Visibility Issues

**Problem:** Factory functions return objects that reference internal types.

```typescript
// src/expression/node/Node.ts (lines 11-22)
interface CompiledExpression { ... }  // NOT exported
interface StringOptions { ... }       // NOT exported

// src/expression/node/AccessorNode.ts
export const createAccessorNode = factory(...)
// Returns type that includes CompiledExpression, StringOptions
// Error: Types are used but not publicly visible
```

**Files Affected:**
- `src/expression/node/AccessorNode.ts`
- `src/expression/node/ArrayNode.ts`
- `src/expression/node/AssignmentNode.ts`
- `src/expression/node/BlockNode.ts`
- `src/expression/node/ConditionalNode.ts`
- `src/expression/node/ConstantNode.ts`
- `src/expression/node/FunctionAssignmentNode.ts`
- `src/expression/node/FunctionNode.ts`
- `src/type/matrix/ImmutableDenseMatrix.ts`
- `src/type/matrix/MatrixIndex.ts`
- `src/utils/bignumber/constants.ts`

### 1.4 ESLint Version Mismatch

```
package.json specifies: "eslint": "8.57.1"
Global installation used: ESLint 9.39.1 (based on error message)
Config file: .eslintrc.cjs (v8 format)
Required for v9: eslint.config.js (flat config)
```

---

## Part 2: Corrective Actions

### Phase 1: Immediate Fixes (Get Build Working)

#### Action 1.1: Install Dependencies

```bash
npm install
```

**Expected Result:** All devDependencies installed including:
- `gulp`, `babel`, `webpack` (build tools)
- `typescript`, `assemblyscript` (compilers)
- `mocha` (testing)
- `eslint` (linting)

#### Action 1.2: Fix ESLint Configuration

**Option A: Pin ESLint to v8 (Quick Fix)**

Ensure local ESLint 8.57.1 is used, not global ESLint 9.x:

```bash
npx eslint --cache --max-warnings 0 src/ test/ types/
```

**Option B: Migrate to ESLint 9 Flat Config (Recommended)**

Create `eslint.config.js`:

```javascript
import js from '@eslint/js'
import typescript from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': typescript
    },
    rules: {
      // Port rules from .eslintrc.cjs
    }
  }
]
```

Then update `package.json`:
```json
"devDependencies": {
  "eslint": "^9.0.0",
  "@eslint/js": "^9.0.0"
}
```

#### Action 1.3: Fix TypeScript Type Exports

**File: `src/expression/node/Node.ts`**

Change from:
```typescript
interface CompiledExpression { ... }
interface StringOptions { ... }
```

To:
```typescript
export interface CompiledExpression { ... }
export interface StringOptions { ... }
```

**File: `src/utils/function.ts`**

Export the `MemoizedFunction` type:
```typescript
export interface MemoizedFunction<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T>
  cache: Map<string, ReturnType<T>>
  clear: () => void
}
```

**Files: `src/type/matrix/ImmutableDenseMatrix.ts`, `src/type/matrix/MatrixIndex.ts`**

Change private properties to use TypeScript's private modifier correctly:

```typescript
// From:
class ImmutableDenseMatrix {
  private _max: number  // Error: can't be private on exported anonymous class

// To:
class ImmutableDenseMatrix {
  #max: number  // ES private field (hidden from type system)
  // OR
  readonly _max: number  // Make public but conventionally private
}
```

#### Action 1.4: Fix tsconfig.build.json

Current config is too strict for the factory function pattern. Adjust:

```json
{
  "compilerOptions": {
    // Keep these strict
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,

    // Relax these for factory pattern
    "declaration": true,
    "emitDeclarationOnly": false,  // Change from true - emit JS too
    "stripInternal": true,         // Add this - strip @internal types

    // Consider relaxing
    "noUnusedLocals": false,       // Many factory patterns have intentional unused
    "noUnusedParameters": false
  }
}
```

### Phase 2: Architecture Correction

#### Action 2.1: Clarify the Dual-Build Strategy

The correct architecture is **NOT** "compile same TypeScript to both JS and WASM."

It **IS** "maintain two separate source trees with shared interfaces."

```
CORRECT ARCHITECTURE:

┌─────────────────────────────────────────────────────────────┐
│                     src/ (TypeScript)                       │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Core      │    │  Functions  │    │   Expression    │ │
│  │  (create,   │    │  (add, mul, │    │   (parser,      │ │
│  │  typed-fn)  │    │   matrix)   │    │    nodes)       │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                    │           │
│         └────────┬─────────┴────────────────────┘           │
│                  ▼                                          │
│         ┌───────────────┐                                   │
│         │   tsc/babel   │                                   │
│         └───────┬───────┘                                   │
│                 ▼                                           │
│    ┌────────────────────────────────┐                       │
│    │  lib/esm/  │  lib/cjs/  │  lib/browser/               │
│    └────────────────────────────────┘                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              src-wasm/ (AssemblyScript)                     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Matrix    │    │   Algebra   │    │     Signal      │ │
│  │ (multiply,  │    │ (LU, QR,    │    │   (FFT, conv)   │ │
│  │  transpose) │    │  Cholesky)  │    │                 │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│         │                  │                    │           │
│         └────────┬─────────┴────────────────────┘           │
│                  ▼                                          │
│         ┌───────────────┐                                   │
│         │   asc (WASM)  │                                   │
│         └───────┬───────┘                                   │
│                 ▼                                           │
│         ┌───────────────┐                                   │
│         │  lib/wasm/    │                                   │
│         │  index.wasm   │                                   │
│         │  index.js     │ (ESM bindings)                    │
│         └───────────────┘                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  Runtime Integration                        │
│                                                             │
│    JavaScript code (src/) uses WasmLoader to:               │
│    1. Check if WASM is available                            │
│    2. Fall back to JS implementation if not                 │
│    3. Route large operations to WASM for performance        │
│                                                             │
│    ┌───────────────────────────────────────────────────┐    │
│    │               MatrixWasmBridge.ts                 │    │
│    │                                                   │    │
│    │   if (size > threshold && wasmAvailable) {       │    │
│    │     return wasmMultiply(a, b)                    │    │
│    │   } else {                                       │    │
│    │     return jsMultiply(a, b)                      │    │
│    │   }                                              │    │
│    └───────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

#### Action 2.2: Remove "AssemblyScript-Friendly TypeScript" Concept

The term "AssemblyScript-friendly TypeScript" is misleading. There are two separate concerns:

1. **TypeScript in `src/`** - Standard TypeScript that compiles to JavaScript
2. **AssemblyScript in `src-wasm/`** - AssemblyScript that compiles to WebAssembly

These share:
- Similar syntax (both TypeScript-like)
- Conceptual interfaces (both implement matrix multiply, etc.)

These do NOT share:
- Type definitions (`i32` vs `number`)
- Runtime APIs (WASM memory vs JS objects)
- Compilation toolchain

**Recommendation:** Remove all references to "AssemblyScript-friendly TypeScript" from documentation. Instead document:
- "TypeScript source code" for `src/`
- "AssemblyScript WASM modules" for `src-wasm/`

#### Action 2.3: Create Shared Interface Definitions

To ensure TypeScript and AssemblyScript implementations stay in sync, create interface documentation (NOT shared code):

```markdown
# docs/api/WASM_INTERFACE_CONTRACT.md

## Matrix Operations

### multiplyDense
JavaScript signature:
  (a: number[][], b: number[][]) => number[][]

WASM signature (AssemblyScript):
  (a: Float64Array, aRows: i32, aCols: i32,
   b: Float64Array, bRows: i32, bCols: i32) => Float64Array

Bridge responsibility: Convert between formats
```

### Phase 3: Build System Fixes

#### Action 3.1: Fix WASM Build Script

Current `package.json`:
```json
"build:wasm": "asc src-wasm/index.ts --config asconfig.json --target release"
```

Problem: `asc` command not found (not installed or not in PATH).

**Fix:** Ensure `npx` is used:
```json
"build:wasm": "npx asc src-wasm/index.ts --config asconfig.json --target release"
```

Or ensure `node_modules/.bin` is in PATH during npm scripts (default behavior when deps installed).

#### Action 3.2: Fix Gulp Build Pipeline

The gulpfile.js only compiles `.js` files:

```javascript
// Line 20 in gulpfile.js
const COMPILE_SRC = `${SRC_DIR}/**/*.?(c)js`
```

This ignores `.ts` files. The build pipeline needs updating:

**Option A: Compile TypeScript First, Then Babel**

```javascript
// Add to gulpfile.js
import gulpTypescript from 'gulp-typescript'

const tsProject = gulpTypescript.createProject('tsconfig.build.json')

function compileTypescript() {
  return gulp.src('src/**/*.ts')
    .pipe(tsProject())
    .pipe(gulp.dest('lib/typescript'))
}

// Update compile task to include TS
const COMPILE_SRC = `${SRC_DIR}/**/*.{js,cjs,ts}`
```

**Option B: Let TypeScript Emit JS, Babel Only for Browser Bundle**

1. Change `tsconfig.build.json`:
   ```json
   "emitDeclarationOnly": false,
   "outDir": "./lib/esm"
   ```

2. Generate CJS from ESM using separate transform

#### Action 3.3: Fix asconfig.json Runtime Setting

Recent commit changed runtime from `"stub"` to `"incremental"`. Verify this is correct:

```json
{
  "targets": {
    "release": {
      "runtime": "incremental",  // GC-enabled runtime
      "exportRuntime": true,     // Export __new, __pin, __unpin
      "exportMemory": true       // Export memory for direct access
    }
  }
}
```

**Consideration:** The incremental runtime adds ~2KB to WASM binary but enables proper garbage collection. This is correct for complex data structures.

### Phase 4: Dependency Audit

#### Action 4.1: Audit Custom Forks

The project uses custom forks:

```json
"@danielsimonjr/typed-function": "^5.0.0-alpha.1",
"@danielsimonjr/workerpool": "^10.0.1"
```

**Risk:** These are alpha/unpublished packages. If unavailable on npm, build will fail.

**Verification:**
```bash
npm view @danielsimonjr/typed-function
npm view @danielsimonjr/workerpool
```

**If packages don't exist:**
1. Publish them to npm
2. Or use git URLs: `"@danielsimonjr/typed-function": "github:danielsimonjr/typed-function#v5.0.0-alpha.1"`
3. Or revert to upstream packages with patches

#### Action 4.2: Verify AssemblyScript Version Compatibility

```json
"assemblyscript": "^0.28.9"
```

AssemblyScript 0.28+ uses the modern compiler API. Ensure `asconfig.json` uses correct format.

**Verify:**
```bash
npx asc --version
npx asc src-wasm/index.ts --config asconfig.json --target release --validate
```

---

## Part 3: Implementation Checklist

### Immediate (Day 1)

- [ ] Run `npm install` to install dependencies
- [ ] Verify dependencies installed: `ls node_modules/.bin/`
- [ ] Test TypeScript compilation: `npm run compile:ts`
- [ ] Test WASM compilation: `npm run build:wasm`
- [ ] Test linting: `npm run lint`

### Short-Term (Week 1)

- [ ] Export internal types in `src/expression/node/Node.ts`
- [ ] Export `MemoizedFunction` from `src/utils/function.ts`
- [ ] Fix private property issues in matrix classes
- [ ] Migrate ESLint config to flat format (or pin to v8)
- [ ] Verify full build: `npm run build`
- [ ] Run test suite: `npm test`

### Medium-Term (Week 2-3)

- [ ] Update documentation to remove "AssemblyScript-friendly TypeScript" concept
- [ ] Create WASM interface contract documentation
- [ ] Audit and verify custom fork dependencies
- [ ] Set up CI/CD to catch build failures early
- [ ] Create integration tests for WASM ↔ JS bridge

### Long-Term (Month 1+)

- [ ] Continue TypeScript conversion (currently 9%)
- [ ] Add performance benchmarks comparing JS vs WASM
- [ ] Document optimal thresholds for WASM routing
- [ ] Consider publishing WASM modules separately for tree-shaking

---

## Part 4: Verification Commands

After applying fixes, verify each component:

```bash
# 1. Dependencies
npm install
npm ls --depth=0

# 2. TypeScript compilation
npm run compile:ts
# Should complete with 0 errors

# 3. WASM compilation
npm run build:wasm
ls -la lib/wasm/
# Should show: index.wasm, index.js, index.wat

# 4. Full JavaScript build
npm run compile
ls -la lib/esm/ lib/cjs/
# Should show compiled JS files

# 5. Browser bundle
npx gulp bundle
ls -la lib/browser/
# Should show: math.js, math.js.map

# 6. Linting
npm run lint
# Should complete with 0 warnings

# 7. Tests
npm run test:src
# Should pass all tests

# 8. Full build
npm run build
# Should complete successfully
```

---

## Part 5: Alternative Architecture (If Current Approach Abandoned)

If the dual-build complexity proves too difficult, consider these alternatives:

### Option A: JavaScript-Only with Optional WASM Plugins

```
mathjs (core)
├── Pure JavaScript implementation
├── No TypeScript (or minimal)
└── Standard npm package

@mathjs/wasm-accelerator (separate package)
├── AssemblyScript WASM modules
├── Monkey-patches mathjs for acceleration
└── Optional dependency
```

**Pros:** Simpler, cleaner separation
**Cons:** Two packages to maintain

### Option B: Use Existing WASM Math Libraries

Instead of custom AssemblyScript, use established WASM math libraries:

```javascript
import * as ndarray from 'ndarray'
import gemm from 'ndarray-gemm'  // BLAS-like operations

// Or use WebGPU for GPU acceleration (newer alternative)
```

**Pros:** Battle-tested, maintained by others
**Cons:** Less control, dependency on external projects

### Option C: WebGPU for Parallel Computing

Modern alternative to WASM for compute-intensive operations:

```javascript
const adapter = await navigator.gpu.requestAdapter()
const device = await adapter.requestDevice()
// Use compute shaders for matrix operations
```

**Pros:** GPU acceleration, no compilation step
**Cons:** Browser support still emerging, different API

---

## Appendix A: File-by-File Fix List

### TypeScript Type Export Fixes

| File | Line | Fix |
|------|------|-----|
| `src/expression/node/Node.ts` | 11-22 | Export `CompiledExpression`, `StringOptions`, `CompileFunction` |
| `src/utils/function.ts` | (find) | Export `MemoizedFunction` type |
| `src/type/matrix/ImmutableDenseMatrix.ts` | 73 | Change `private _max` to `readonly _max` |
| `src/type/matrix/ImmutableDenseMatrix.ts` | 73 | Change `private _min` to `readonly _min` |
| `src/type/matrix/MatrixIndex.ts` | 50 | Change `private _dimensions` to `readonly _dimensions` |
| `src/type/matrix/MatrixIndex.ts` | 50 | Change `private _isScalar` to `readonly _isScalar` |
| `src/type/matrix/MatrixIndex.ts` | 50 | Change `private _sourceSize` to `readonly _sourceSize` |

### Build Configuration Fixes

| File | Issue | Fix |
|------|-------|-----|
| `tsconfig.build.json` | `emitDeclarationOnly: true` | Change to `false` or add separate emit step |
| `tsconfig.build.json` | Missing types | Remove `"types": ["node"]` or ensure @types/node installed |
| `.eslintrc.cjs` | Wrong format for ESLint 9 | Migrate to `eslint.config.js` |
| `gulpfile.js` | Only compiles `.js` | Add `.ts` to glob pattern |
| `package.json` | build:wasm uses bare `asc` | Use `npx asc` or ensure PATH correct |

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **AssemblyScript** | A TypeScript-like language that compiles to WebAssembly. NOT TypeScript. |
| **TypeScript** | A typed superset of JavaScript that compiles to JavaScript. |
| **WASM** | WebAssembly - a binary instruction format for stack-based virtual machines |
| **Factory Function** | Math.js pattern where functions are created via dependency injection |
| **typed-function** | Library used by math.js for function overloading based on argument types |
| **Dual Build** | Strategy to produce both JavaScript and WASM outputs from source code |
| **ESM** | ECMAScript Modules - modern JavaScript module format |
| **CJS** | CommonJS - Node.js module format using `require()` |
| **UMD** | Universal Module Definition - works in browsers and Node.js |

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-12-14 | Claude | Initial corrective action plan |

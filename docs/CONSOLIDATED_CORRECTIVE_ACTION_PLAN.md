# MathJS Dual Build System: Consolidated Corrective Action Plan

**Version:** 2.0 (Consolidated)  
**Date:** December 14, 2025  
**Target:** Claude Code Implementation  
**Branch:** `claude/fix-mathjs-build-system-d2DXI`

-----

## Document Purpose

This document consolidates and clarifies two previous corrective action plans into a single, implementation-ready guide for Claude Code. It resolves contradictions, provides verified current state information, and presents a clear execution path.

-----

## Part 1: Verified Current State (As of December 14, 2025)

### 1.1 Project Metrics

|Metric                       |Verified Value                  |Source                         |
|-----------------------------|--------------------------------|-------------------------------|
|TypeScript files in `src/`   |686                             |`find src -name "*.ts" | wc -l`|
|JavaScript files in `src/`   |673                             |`find src -name "*.js" | wc -l`|
|TypeScript coverage          |~50.5% (686 of 1359 total files)|File count                     |
|TypeScript compilation errors|~347 errors across ~100+ files  |`npm run compile:ts`           |
|WASM build status            |**WORKING**                     |`npm run build:wasm` succeeds  |
|Dependencies installable     |**YES**                         |`npm install` succeeds         |

### 1.2 Error Distribution (TypeScript Compilation)

|Error Code|Count|Description                                      |Severity  |
|----------|-----|-------------------------------------------------|----------|
|TS6133    |201  |Declared but never read (unused variables/params)|LOW       |
|TS6196    |44   |Declared but never used (unused type imports)    |LOW       |
|TS2322    |33   |Type not assignable                              |MEDIUM    |
|TS4023    |20   |Exported variable uses unexported type           |**HIGH**  |
|TS18047   |20   |Value is possibly ‘null’                         |MEDIUM    |
|TS2345    |6    |Argument type mismatch                           |MEDIUM    |
|TS4094    |5    |Private property on exported anonymous class     |**HIGH**  |
|TS2454    |4    |Variable used before assignment                  |MEDIUM    |
|TS2564    |3    |Property not initialized                         |MEDIUM    |
|TS2538    |3    |Type cannot be used as index                     |MEDIUM    |
|Other     |~8   |Various                                          |LOW-MEDIUM|

### 1.3 Build Outputs Status

```
lib/
├── wasm/
│   ├── index.wasm        ✅ EXISTS (25KB)
│   ├── index.wat         ✅ EXISTS (246KB)  
│   ├── index.js          ✅ EXISTS (20KB) - ESM bindings
│   └── index.d.ts        ✅ EXISTS (13KB) - TypeScript defs
├── typescript/           ❓ EMPTY (declaration-only mode)
├── esm/                  ❓ Needs verification
├── cjs/                  ❓ Needs verification
└── browser/              ❓ Needs verification
```

### 1.4 Key Clarification: WASM Build Works

**IMPORTANT:** The previous plans stated WASM build was non-functional. This is **INCORRECT**. The WASM build successfully compiles:

```bash
$ npm run build:wasm
> asc src-wasm/index.ts --config asconfig.json --target release
Last converge was suboptimal.  # Warning only, not an error
```

Output files are correctly generated in `lib/wasm/`.

-----

## Part 2: Architecture Clarification

### 2.1 What the Project IS Doing (Correctly)

The project has **correctly** implemented the dual-build architecture:

1. **`src/`** - TypeScript/JavaScript source that compiles to JavaScript
1. **`src-wasm/`** - AssemblyScript source that compiles to WebAssembly
1. **`src/wasm/`** - Bridge layer connecting JS and WASM
1. **`src/parallel/`** - Worker pool infrastructure for parallel computing

### 2.2 The “AssemblyScript-Friendly TypeScript” Misconception

The previous plans incorrectly criticized the concept. Here’s the **correct understanding**:

**The `src-wasm/` directory contains pure AssemblyScript**, not “TypeScript that compiles to both targets.” This is the correct approach. The term “AssemblyScript-friendly” in documentation likely meant:

- Code written in AssemblyScript (TypeScript-like syntax)
- Uses AssemblyScript-compatible types (`i32`, `f64`, `Float64Array`)
- Compiles **only** to WASM

**No code changes needed to the architecture concept** - only documentation clarification.

### 2.3 Runtime Integration Architecture (Already Implemented)

```
┌─────────────────────────────────────────────────────────────────────┐
│                        User API (mathjs)                            │
│                           math.multiply(A, B)                       │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│                    MatrixWasmBridge.ts                              │
│    - Size threshold check (default: 100 elements for WASM)          │
│    - WASM availability check                                        │
│    - Automatic fallback to JS if WASM unavailable                   │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
           ┌────────────────────┼────────────────────┐
           │                    │                    │
           ▼                    ▼                    ▼
    ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
    │  WASM SIMD  │     │  Standard   │     │ JavaScript  │
    │  (Fastest)  │     │    WASM     │     │  (Fallback) │
    └─────────────┘     └─────────────┘     └─────────────┘
```

-----

## Part 3: Corrective Actions (Prioritized)

### Phase 1: Critical Fixes (Estimated: 2-4 hours)

These must be completed first as they block other work.

#### Action 1.1: Export Internal Types in Node.ts

**File:** `src/expression/node/Node.ts`  
**Lines:** 10-22  
**Error Codes:** TS4023 (20 occurrences)

**Current Code:**

```typescript
interface CompiledExpression {
  evaluate: (scope?: Record<string, any>) => any
}

type CompileFunction = (scope: Scope, args: Record<string, any>, context: any) => any

interface StringOptions {
  handler?: ((node: Node, options?: StringOptions) => string) | Record<string, (node: Node, options?: StringOptions) => string>
  parenthesis?: 'keep' | 'auto' | 'all'
  implicit?: 'hide' | 'show'
  [key: string]: any
}
```

**Required Change:** Add `export` to all three type definitions:

```typescript
export interface CompiledExpression {
  evaluate: (scope?: Record<string, any>) => any
}

export type CompileFunction = (scope: Scope, args: Record<string, any>, context: any) => any

export interface StringOptions {
  handler?: ((node: Node, options?: StringOptions) => string) | Record<string, (node: Node, options?: StringOptions) => string>
  parenthesis?: 'keep' | 'auto' | 'all'
  implicit?: 'hide' | 'show'
  [key: string]: any
}
```

**Impact:** Resolves 20 TS4023 errors across expression node files.

#### Action 1.2: Fix Null Safety Issues

**Error Code:** TS18047 (20 occurrences) - “is possibly ‘null’”

**Files affected:**

- `src/expression/node/AssignmentNode.ts` (line 39)
- `src/expression/node/ConditionalNode.ts` (lines 156, 165, 174, 231, 243, 255)
- `src/expression/node/FunctionAssignmentNode.ts` (line 38)
- `src/expression/node/FunctionNode.ts` (line 70)
- `src/expression/node/OperatorNode.ts` (lines 132, 160, 182, 240)
- `src/expression/node/RangeNode.ts` (lines 54, 59, 64)
- `src/expression/node/RelationalNode.ts` (lines 156, 209, 242)
- `src/expression/operators.ts` (line 313)

**Pattern Fix:** Where `precedence` is possibly null, add null check or non-null assertion:

```typescript
// Option A: Non-null assertion (if logically guaranteed)
precedence!

// Option B: Null check (safer)
if (precedence !== null) {
  // use precedence
}

// Option C: Default value
const safePrecedence = precedence ?? 0
```

**Recommended approach:** Review each instance and apply Option B or C based on context.

#### Action 1.3: Fix Variable Assignment Issues

**Error Code:** TS2454 (4 occurrences) - “used before being assigned”

**File:** `src/expression/node/OperatorNode.ts` (lines 256, 257, 259, 264)

**Pattern:** Variable `result` is used before being assigned. Initialize with a default value:

```typescript
// Before
let result
// ... some conditional logic that may not assign result
return result  // Error: may be undefined

// After
let result = ''  // or appropriate default
// ... conditional logic
return result
```

#### Action 1.4: Fix Index Type Issues

**Error Code:** TS2538 (3 occurrences) - “Type ‘null’ cannot be used as an index type”

**File:** `src/expression/node/OperatorNode.ts` (lines 115, 205, 215)

**Fix:** Add null check before using value as index:

```typescript
// Before
const value = associativity[op]  // op may be null

// After
const value = op !== null ? associativity[op] : undefined
```

### Phase 2: Type Visibility Fixes (Estimated: 1-2 hours)

#### Action 2.1: Fix Private Property Issues

**Error Code:** TS4094 (5 occurrences) - “Property cannot be private/protected in anonymous exported class”

**Files:**

- `src/type/matrix/ImmutableDenseMatrix.ts` (line 73 - `_max`, `_min`)
- `src/type/matrix/MatrixIndex.ts` (line 50 - `_dimensions`, `_isScalar`, `_sourceSize`)

**Fix Options:**

**Option A (Recommended):** Use ES private fields:

```typescript
// Before
class ImmutableDenseMatrix {
  private _max: number
  private _min: number
}

// After  
class ImmutableDenseMatrix {
  #max: number  // True private - not visible in type definitions
  #min: number
}
```

**Option B:** Make conventionally private (underscore convention):

```typescript
class ImmutableDenseMatrix {
  readonly _max: number  // Public but conventionally private
  readonly _min: number
}
```

#### Action 2.2: Fix Type Assignment Issues

**Error Code:** TS2322 (33 occurrences) - “Type X is not assignable to type Y”

**Key instance in `src/core/create.ts` (line 368):**

```typescript
// Current error: Factory function signature mismatch
// Need to verify the exact type mismatch and adjust signature
```

**Fix:** Review each TS2322 error individually. Most require:

1. Adding proper type annotations
1. Using type assertions where safe
1. Adjusting function signatures to match expected types

### Phase 3: Cleanup Low-Priority Issues (Estimated: 2-3 hours)

#### Action 3.1: Fix Unused Variables (TS6133 - 201 occurrences)

**Strategy:** Use underscore prefix convention for intentionally unused parameters:

```typescript
// Before - Error: 'options' is declared but never used
function toString(options: StringOptions): string {
  return this.value.toString()
}

// After - No error (TypeScript convention)
function toString(_options: StringOptions): string {
  return this.value.toString()
}
```

**Batch script approach:**

```bash
# Find all TS6133 errors
npm run compile:ts 2>&1 | grep "TS6133" | \
  sed -E "s/.*'(\w+)'.*/\1/" | sort | uniq -c | sort -rn
```

Common patterns to fix:

- `options` → `_options`
- `callback` → `_callback`
- `args` → `_args`
- `context` → `_context`
- `math` → `_math`
- `scope` → `_scope`

#### Action 3.2: Fix Unused Type Imports (TS6196 - 44 occurrences)

**Files with unused type imports:**

- `src/expression/node/SymbolNode.ts` - `Unit`
- `src/expression/transform/concat.transform.ts` - `BigNumber`
- `src/expression/transform/cumsum.transform.ts` - `BigNumber`
- `src/expression/transform/index.transform.ts` - `Range`, `BigNumber`, `Matrix`
- `src/expression/transform/mapSlices.transform.ts` - `BigNumber`

**Fix:** Remove unused imports or use `type` import syntax:

```typescript
// Before
import { BigNumber, Matrix, Range } from '../types'

// After (if truly unused)
// import { BigNumber, Matrix, Range } from '../types'

// Or if used only as types
import type { BigNumber, Matrix, Range } from '../types'
```

### Phase 4: Build System Verification (Estimated: 1-2 hours)

#### Action 4.1: Verify Full Build Pipeline

After fixing TypeScript errors, verify the complete build:

```bash
# Step 1: Clean previous builds
npm run build:clean

# Step 2: TypeScript compilation (should produce 0 errors)
npm run compile:ts

# Step 3: Full JavaScript build
npm run compile

# Step 4: WASM build (already working)
npm run build:wasm

# Step 5: Complete build
npm run build

# Step 6: Test suite
npm test
```

#### Action 4.2: Verify Output Directories

After successful build, verify:

```bash
# Check ESM output
ls -la lib/esm/

# Check CJS output  
ls -la lib/cjs/

# Check browser bundle
ls -la lib/browser/

# Check WASM (should already be populated)
ls -la lib/wasm/

# Check TypeScript declarations
ls -la lib/typescript/
```

#### Action 4.3: Fix tsconfig.build.json if Needed

Current configuration emits declarations only. If JavaScript output is needed:

```json
{
  "compilerOptions": {
    "emitDeclarationOnly": false,  // Change from true
    "declaration": true,
    "outDir": "./lib/esm"
  }
}
```

**Note:** The current setup may rely on Babel/Gulp for JavaScript transformation rather than `tsc`. Verify the gulp pipeline before changing.

### Phase 5: Integration Testing (Estimated: 2-4 hours)

#### Action 5.1: Test WASM Integration

Create test file `test/wasm-integration.test.ts`:

```typescript
import { WasmLoader, initWasm } from '../src/wasm/WasmLoader'
import { MatrixWasmBridge } from '../src/wasm/MatrixWasmBridge'

describe('WASM Integration', () => {
  beforeAll(async () => {
    await initWasm('./lib/wasm/index.wasm')
  })

  it('should load WASM module', () => {
    const loader = WasmLoader.getInstance()
    expect(loader.isLoaded()).toBe(true)
  })

  it('should multiply matrices via WASM', async () => {
    const a = [1, 2, 3, 4]  // 2x2 matrix
    const b = [5, 6, 7, 8]  // 2x2 matrix
    const result = await MatrixWasmBridge.multiply(a, 2, 2, b, 2, 2)
    
    // [1,2] × [5,6] = [1*5+2*7, 1*6+2*8] = [19, 22]
    // [3,4]   [7,8]   [3*5+4*7, 3*6+4*8]   [43, 50]
    expect(Array.from(result)).toEqual([19, 22, 43, 50])
  })
})
```

#### Action 5.2: Test Parallel Infrastructure

```typescript
import { WorkerPool } from '../src/parallel/WorkerPool'
import { ParallelMatrix } from '../src/parallel/ParallelMatrix'

describe('Parallel Computing', () => {
  let pool: WorkerPool

  beforeAll(() => {
    pool = new WorkerPool(4)
  })

  afterAll(() => {
    pool.terminate()
  })

  it('should distribute matrix operations across workers', async () => {
    // Test implementation
  })
})
```

-----

## Part 4: Implementation Checklist

### Immediate Priority (Day 1)

- [ ] **1.1** Export `CompiledExpression`, `CompileFunction`, `StringOptions` in `Node.ts`
- [ ] **1.2** Fix TS18047 null safety issues (20 occurrences)
- [ ] **1.3** Fix TS2454 variable assignment issues (4 occurrences)
- [ ] **1.4** Fix TS2538 index type issues (3 occurrences)
- [ ] Verify TypeScript compilation: `npm run compile:ts`

### Short-Term (Day 2-3)

- [ ] **2.1** Fix TS4094 private property issues (5 occurrences)
- [ ] **2.2** Fix TS2322 type assignment issues (33 occurrences)
- [ ] **3.1** Batch fix unused variables (prefix with `_`)
- [ ] **3.2** Clean up unused type imports
- [ ] Verify: TypeScript compilation produces 0 errors

### Medium-Term (Day 4-5)

- [ ] **4.1** Run full build pipeline
- [ ] **4.2** Verify all output directories populated
- [ ] **4.3** Adjust tsconfig if JS output needed
- [ ] **5.1** Create and run WASM integration tests
- [ ] **5.2** Create and run parallel computing tests

### Final Verification

- [ ] `npm run build` completes without errors
- [ ] `npm test` passes all tests
- [ ] `npm run lint` passes (or acceptable warnings only)
- [ ] WASM module loads and executes correctly
- [ ] Parallel operations function correctly

-----

## Part 5: File-by-File Fix Reference

### Critical Fixes (Must Complete)

|File                                     |Line(s)    |Error |Fix                    |
|-----------------------------------------|-----------|------|-----------------------|
|`src/expression/node/Node.ts`            |10-22      |TS4023|Export interfaces      |
|`src/expression/node/OperatorNode.ts`    |256-264    |TS2454|Initialize `result`    |
|`src/expression/node/OperatorNode.ts`    |115,205,215|TS2538|Null check before index|
|`src/type/matrix/ImmutableDenseMatrix.ts`|73         |TS4094|Use `#` private fields |
|`src/type/matrix/MatrixIndex.ts`         |50         |TS4094|Use `#` private fields |

### Null Safety Fixes (TS18047)

|File                                           |Line                   |Variable    |Fix           |
|-----------------------------------------------|-----------------------|------------|--------------|
|`src/expression/node/AssignmentNode.ts`        |39                     |`precedence`|Add null check|
|`src/expression/node/ConditionalNode.ts`       |156,165,174,231,243,255|`precedence`|Add null check|
|`src/expression/node/FunctionAssignmentNode.ts`|38                     |`precedence`|Add null check|
|`src/expression/node/FunctionNode.ts`          |70                     |`match`     |Add null check|
|`src/expression/node/OperatorNode.ts`          |132,160,182,240        |`precedence`|Add null check|
|`src/expression/node/RangeNode.ts`             |54,59,64               |`precedence`|Add null check|
|`src/expression/node/RelationalNode.ts`        |156,209,242            |`precedence`|Add null check|
|`src/expression/operators.ts`                  |313                    |`precedence`|Add null check|

-----

## Part 6: Commands Reference

### Build Commands

```bash
# Install dependencies
npm install

# TypeScript compilation (declarations only)
npm run compile:ts

# Full JavaScript compilation via Gulp/Babel
npm run compile

# WASM compilation
npm run build:wasm

# Complete build
npm run build

# Clean build artifacts
npm run build:clean
```

### Test Commands

```bash
# Run unit tests
npm run test:src

# Run all tests
npm run test:all

# Run with coverage
npm run coverage
```

### Linting Commands

```bash
# Lint check
npm run lint

# Auto-fix lint issues
npm run format
```

### Diagnostic Commands

```bash
# Count TypeScript errors by type
npm run compile:ts 2>&1 | grep "error TS" | \
  sed 's/.*error \(TS[0-9]*\).*/\1/' | sort | uniq -c | sort -rn

# List files with specific error
npm run compile:ts 2>&1 | grep "TS4023" | cut -d'(' -f1 | sort -u

# Check WASM output
ls -la lib/wasm/

# Verify package exports
node -e "import('./lib/esm/index.js').then(m => console.log(Object.keys(m)))"
```

-----

## Part 7: Success Criteria

### Build Success

1. `npm run compile:ts` produces **0 errors**
1. `npm run build` completes without error
1. All `lib/` subdirectories contain expected output
1. WASM binary is functional and loadable

### Test Success

1. All existing unit tests pass
1. WASM integration tests pass
1. Parallel computing tests pass
1. No regression in JavaScript-only functionality

### Code Quality

1. No TypeScript errors (strict mode)
1. ESLint passes with 0 warnings (or documented exceptions)
1. All exported types are properly visible
1. No runtime errors from type mismatches

-----

## Appendix A: Glossary of Error Codes

|Code   |Name                      |Description                                              |
|-------|--------------------------|---------------------------------------------------------|
|TS2322 |Type not assignable       |Value of type X cannot be assigned to type Y             |
|TS2345 |Argument type mismatch    |Function argument doesn’t match parameter type           |
|TS2454 |Used before assigned      |Variable may be used before a value is assigned          |
|TS2538 |Invalid index type        |Type cannot be used as an index (usually null/undefined) |
|TS2564 |Not initialized           |Property declared but not assigned in constructor        |
|TS4023 |Unexported type in export |Exported item references type not exported               |
|TS4094 |Private in anonymous class|Cannot have private/protected in exported anonymous class|
|TS6133 |Unused declaration        |Variable/parameter declared but never read               |
|TS6196 |Unused import             |Type imported but never used                             |
|TS7029 |Fallthrough in switch     |Switch case falls through to next case                   |
|TS7030 |Not all paths return      |Function doesn’t return value in all code paths          |
|TS18047|Possibly null             |Value might be null when used                            |
|TS18048|Possibly undefined        |Value might be undefined when used                       |

-----

## Appendix B: Version History

|Version|Date          |Changes                                          |
|-------|--------------|-------------------------------------------------|
|1.0    |2025-12-14    |Initial corrective action plan                   |
|1.1    |2025-12-14    |Second detailed plan with code examples          |
|**2.0**|**2025-12-14**|**Consolidated plan with verified current state**|

-----

## Appendix C: Key Corrections from Previous Plans

|Previous Claim                         |Correction                                 |
|---------------------------------------|-------------------------------------------|
|“WASM build non-functional”            |WASM build works correctly                 |
|“~1,046 TypeScript errors”             |~347 errors (verified)                     |
|“node_modules missing”                 |Dependencies install correctly             |
|“TypeScript coverage 9%”               |Coverage ~50.5%                            |
|“Architecture fundamentally flawed”    |Architecture is correct, just incomplete   |
|“AssemblyScript ≠ TypeScript confusion”|src-wasm correctly uses pure AssemblyScript|

-----

*This consolidated plan supersedes CORRECTIVE_ACTION_PLAN.md and MathJS_Dual_Build_System_-_Corrective_Action_Plan.md*
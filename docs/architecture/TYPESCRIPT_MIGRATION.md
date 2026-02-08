# TypeScript & WASM Migration Guide

This document describes the ongoing migration of Math.js from JavaScript to TypeScript with WebAssembly acceleration for performance-critical operations.

**Status:** In-Progress | **Tracking:** `ts-inventory.json`

## Overview

The migration has three strategic goals:

1. **Type Safety**: Catch errors at compile-time; improve IDE support
2. **Performance**: 2-10x speedup via WASM for large operations; 2-4x additional speedup via parallelization
3. **Maintainability**: Clearer code intent; easier refactoring; better documentation

## Migration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        SOURCE (src/)                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │  TypeScript .ts  │  │  JavaScript .js  │  │  WASM .ts    │  │
│  │  (new)           │  │  (legacy)        │  │  (optimized) │  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 ▼                                │
│                      tsup Compilation                            │
│                                 │                                │
│                                 ▼                                │
├─────────────────────────────────────────────────────────────────┤
│                     DISTRIBUTION (dist/)                         │
│           JavaScript with type definitions (.d.ts)              │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  dist/index.js, dist/number.js                         │    │
│  │  + types/index.d.ts (TypeScript definitions)           │    │
│  │  + lib/wasm/*.js (WASM bridges)                        │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Conversion Strategy

### Incremental, Backward-Compatible Approach

- **Dual support**: TypeScript and JavaScript files coexist
- **No breaking changes**: All outputs remain identical
- **Priority-driven**: Convert high-impact files first
- **Type-safe**: Full TypeScript definitions in `types/`

### File Conversion Pattern

Each file conversion follows the **3-phase approach**:

```
Phase 1: Convert                 Phase 2: Type                  Phase 3: Test
────────────────────────────────────────────────────────────────────────────
1. Rename .js → .ts             4. Add type annotations        7. npm test
2. Run basic migration tool      5. Resolve type errors         8. npm run test:types
3. Fix syntax errors            6. Update ts-inventory.json    9. Verify definitions
```

## Tracking with ts-inventory.json

The `ts-inventory.json` file tracks conversion status:

```json
[
  {
    "path": "src/function/arithmetic/add.ts",
    "converted": true,
    "category": "arithmetic",
    "lines": 45,
    "dependencies": ["typed", "addScalar", "matrix"]
  },
  {
    "path": "src/function/arithmetic/subtract.js",
    "converted": false,
    "category": "arithmetic",
    "lines": 42,
    "dependencies": ["typed", "subtractScalar", "matrix"]
  }
]
```

### Querying Conversion Status

```bash
# Total conversion progress
node -e "const inv=require('./ts-inventory.json'); const c=inv.filter(f=>f.converted).length; console.log(c+'/'+inv.length+' = '+(100*c/inv.length).toFixed(1)+'%')"

# By category
node -e "const inv=require('./ts-inventory.json'); const cats={}; inv.forEach(f=>{const c=f.category; cats[c]=(cats[c]||0)+(f.converted?1:0)+'/'+((cats[c]?.split('/')?.[1]||0)+1)}); Object.entries(cats).forEach(([k,v])=>console.log(k+': '+v))"

# Pending files
grep '"converted": false' ts-inventory.json | grep -o '"path": "[^"]*"' | head -20
```

## Priority Conversion Order

Files should be converted in this order (high-impact first):

### Tier 1: Foundation & Most-Used (High Impact)
- `src/core/function/typed.ts` - Type dispatch system
- `src/function/arithmetic/{add,multiply,divide,pow,sqrt}.ts` - Core operations
- `src/type/*.ts` - Number, BigNumber, Complex, etc.

### Tier 2: Frequently Used (Medium Impact)
- `src/function/matrix/{det,inv,transpose,multiply}.ts` - Linear algebra
- `src/function/statistics/{mean,std,variance}.ts` - Statistics
- `src/expression/{parser,evaluator}.ts` - Expression evaluation

### Tier 3: Specialized (Lower Priority)
- Special functions: erf, gamma, bessel, etc.
- Bitwise operations
- Set operations

### Tier 4: Low-Impact (Nice-to-Have)
- Utility functions
- Constants
- Format/string operations

## How to Convert a File

### Step 1: Prepare the File

```bash
# 1. Ensure all tests pass for the file
npx mocha test/unit-tests/function/arithmetic/add.test.js

# 2. Run the automated migration tool
node tools/migrate-to-ts.js --file src/function/arithmetic/add.js
# Result: src/function/arithmetic/add.ts (new file)
```

### Step 2: Fix TypeScript Errors

```bash
# Check for compilation errors
npx tsc --noEmit

# Fix errors in the converted file:
# - Add missing type annotations
# - Fix import paths (must include .js extension)
# - Resolve type conflicts
```

### Step 3: Update Dependencies

For factory functions, ensure dependencies are properly typed:

```typescript
// src/function/arithmetic/add.ts
import { createTypedFunction } from '../../core/function/typed.js'
import type { Typed, Config } from '../../types/index.js'

export const createAdd = factory(
  'add',
  ['typed', 'matrix', 'equalScalar', 'addScalar'] as const,
  ({ typed, matrix, equalScalar, addScalar }: {
    typed: Typed,
    matrix: any,
    equalScalar: any,
    addScalar: any
  }) => {
    return typed('add', { /* ... */ })
  }
)
```

### Step 4: Update Type Definitions

Add/update signatures in `types/index.d.ts`:

```typescript
// Add instance method
interface MathJsInstance {
  add(x: number, y: number): number
  add(x: BigNumber, y: BigNumber): BigNumber
  // ... more overloads
}

// Add dependencies type
interface AddDependencies {
  typed: Typed
  matrix: any
  equalScalar: any
  addScalar: any
}

// Export the factory
export function add(
  x: number | BigNumber,
  y: number | BigNumber
): number | BigNumber
```

See `types/EXPLANATION.md` for complete guidance.

### Step 5: Test Everything

```bash
# Verify compilation
npm run compile:ts

# Run the specific test
npx mocha test/unit-tests/function/arithmetic/add.test.js

# Run all tests
npm test

# Verify type definitions
npm run test:types

# Check linting
npm run lint
npm run format  # Auto-fix if needed
```

### Step 6: Update ts-inventory.json

```json
{
  "path": "src/function/arithmetic/add.ts",
  "converted": true,
  "category": "arithmetic",
  "lines": 45,
  "dependencies": ["typed", "addScalar", "matrix"]
}
```

## Test Isolation Pattern (Critical)

When writing TypeScript tests, **always create isolated math instances** to avoid polluting global state:

```typescript
// WRONG - pollutes global state
import math from 'mathjs'
math.config({ number: 'BigNumber' })
test('add with BigNumber', () => {
  // Affects other tests!
})

// RIGHT - isolated instance
import { create } from 'mathjs'
test('add with BigNumber', () => {
  const math = create()
  math.config({ number: 'BigNumber' })
  const result = math.add(1, 2)
  // Only affects this test
})
```

Add unique unit names:
```typescript
const uniqueName = 'myUnit' + 'Ts' + Date.now()
math.createUnit(uniqueName, { ... })
```

## WASM Integration

WASM modules (in `src/wasm/`) provide performance acceleration:

### Structure
```
src/wasm/
├── index.ts              # Main entry point
├── algebra/              # Polynomial operations
├── arithmetic/           # Basic math (add, multiply, etc.)
├── matrix/              # Matrix algorithms (det, inv, etc.)
├── statistics/          # Statistical functions
└── trigonometry/        # Trig function lookups
```

### Writing WASM

WASM modules use AssemblyScript (TypeScript-like syntax):

```typescript
// src/wasm/arithmetic/add.ts
export function add(a: f64, b: f64): f64 {
  return a + b
}

// For arrays, use pointer-based access
export function addArrays(
  aPtr: usize,
  bPtr: usize,
  resultPtr: usize,
  length: usize
): void {
  for (let i = 0; i < length; i++) {
    store<f64>(
      resultPtr + (i as usize) * 8,
      load<f64>(aPtr + (i as usize) * 8) + load<f64>(bPtr + (i as usize) * 8)
    )
  }
}
```

**Key Constraints:**
- Limited to numeric types (f64, i32, i64, etc.)
- No objects, classes, or inheritance
- Manual memory management
- See `docs/ASSEMBLYSCRIPT_STYLE_GUIDE.md` for conventions

### Building WASM

```bash
# Development build with debug info
npm run build:wasm:debug

# Production build
npm run build:wasm

# Validate syntax without building
npm run validate:wasm

# Run WASM tests
npm run test:wasm
```

## Migration Metrics

### Current Status

Track using ts-inventory.json:

```bash
# Summary
grep -c '"converted": true' ts-inventory.json   # Converted files
grep -c '"converted": false' ts-inventory.json  # Remaining files

# By size
jq '[.[] | select(.converted) | .lines] | add' ts-inventory.json  # Converted lines
jq '[.[] | select(!.converted) | .lines] | add' ts-inventory.json  # Remaining lines
```

### Expected Outcomes

| Milestone | TypeScript % | Performance | Status |
|-----------|-------------|-------------|--------|
| Phase 1 (Foundation) | 20% | +2-5% | In Progress |
| Phase 2 (Core Functions) | 50% | +10-15% | Not Started |
| Phase 3 (Complete) | 100% | +15-25% | Planned |

## Common Issues & Solutions

### Import Extension Errors

**Problem:** `Cannot find module './foo'`

**Solution:** Add `.js` extension (required for ES modules):
```typescript
// WRONG
import { add } from './add'

// RIGHT
import { add } from './add.js'
```

### Type Definition Conflicts

**Problem:** Multiple definitions for same function

**Solution:** Update `types/index.d.ts` in all required places:
1. Instance method signature
2. Chain method signature
3. Static export signature
4. Dependencies interface
5. Type tests in `test/typescript-tests/testTypes.ts`

### Test Isolation Issues

**Problem:** Tests pass individually but fail when run together

**Solution:** Create isolated math instances in TS tests:
```typescript
const math = create()  // Isolated instance
math.config({ ... })   // Only affects this test
```

## References

- [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md) - Development practical guide
- `docs/refactoring/REFACTORING_PLAN.md` - Original refactoring strategy
- `docs/refactoring/REFACTORING_TASKS.md` - File-by-file task list
- `types/EXPLANATION.md` - TypeScript definitions guide
- `docs/ASSEMBLYSCRIPT_STYLE_GUIDE.md` - WASM coding conventions
- `ts-inventory.json` - Current conversion tracking

## See Also

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Architectural patterns
- [COMPONENTS.md](./COMPONENTS.md) - Component reference
- ../CLAUDE.md - Developer quick reference

# Refactoring Plan: Matrix Module TypeScript Typing

## Overview

**Target**: `src/type/matrix/` - 287 `any` usages across 27 files
**Goal**: Reduce `any` by ~140 while preserving intentional `any` (~147) for typed-function compatibility
**Approach**: 5 phases, low-risk first, with verification after each phase

---

## Phase 1: Create Shared Type Definitions (Low Risk)

**Create**: `src/type/matrix/types.ts`

```typescript
// Value types for matrix elements
export type MathNumericValue = number | BigNumber | Complex | Fraction
export type MatrixValue = MathNumericValue | unknown

// Callback signatures (intentional any for typed-function)
export type MatrixCallback = (a: any, b: any) => any
export type EqualScalarFunction = (a: any, b: any) => boolean

// Data structures
export type NestedArray<T> = T | NestedArray<T>[]
export type DenseMatrixData<T = MatrixValue> = NestedArray<T>

// typed-function interface
export interface TypedFunction {
  find(fn: Function, signature: string[]): Function | null
  convert(value: any, datatype: string): any
  referToSelf<T>(fn: (self: T) => any): any
}

// Format options
export interface MatrixFormatOptions {
  precision?: number
  notation?: 'fixed' | 'exponential' | 'engineering' | 'auto'
  [key: string]: unknown
}
```

**Update**: All 14 `matAlgo*.ts` files to import from shared types

**Reduction**: ~30 `any` (eliminates duplicated aliases)

---

## Phase 2: Improve Core Matrix Classes (Medium Risk)

**Files**: `Matrix.ts`, `DenseMatrix.ts`, `SparseMatrix.ts`

**Changes**:

| File | Current `any` | Target Reduction | Key Changes |
|------|---------------|------------------|-------------|
| Matrix.ts | 12 | 8 | Type `MatrixData<T>`, improve `Index` interface |
| DenseMatrix.ts | 57 | 25 | Type `_data` generically, improve callbacks |
| SparseMatrix.ts | 25 | 10 | Use shared types, type internal arrays |

**Key improvements**:
- `MatrixData = any[][]` → `MatrixData<T> = NestedArray<T>`
- `Index.dimension(): any` → `Index.dimension(): number | Range | ImmutableDenseMatrix`
- Callback matrix params: `matrix: any` → `matrix: Matrix<T>`

**Reduction**: ~40 `any`

---

## Phase 3: Type Helper Classes (Low-Medium Risk)

**Files**: `Range.ts`, `MatrixIndex.ts`, `FibonacciHeap.ts`, `Spa.ts`, `ImmutableDenseMatrix.ts`

| File | Changes |
|------|---------|
| Range.ts | `range: any` → `range: Range` in callbacks |
| MatrixIndex.ts | `IndexDimension = any` → `number \| string \| Range \| ImmutableDenseMatrix` |
| Spa.ts | `SpaValue = any` → `MatrixValue` |
| ImmutableDenseMatrix.ts | `_min: any, _max: any` → `_min: T, _max: T` |

**Reduction**: ~25 `any`

---

## Phase 4: Standardize Algorithm Files (Medium Risk)

**Files**: 14 algorithm files (`matAlgo01xDSid.ts` through `matAlgo14xDs.ts`)

**Pattern**:
```typescript
// BEFORE (duplicated in each file)
type MatrixValue = any
type MatrixCallback = (a: any, b: any) => any

// AFTER (import from shared)
import type { MatrixValue, MatrixCallback, TypedFunction } from '../types.ts'
```

**Add JSDoc** documenting intentional `any`:
```typescript
/**
 * MatrixCallback uses 'any' intentionally for typed-function runtime dispatch.
 * Actual types resolved based on matrix._datatype at runtime.
 */
```

**Reduction**: ~30 `any` (consolidation)

---

## Phase 5: Improve matrixAlgorithmSuite.ts (Higher Risk)

**File**: `src/type/matrix/utils/matrixAlgorithmSuite.ts` (50+ `any`)

**Changes**:
- Type `MatrixAlgorithmSuiteOptions` interface
- Document which `any` must remain (typed-function API)
- Add type constraints where possible

**Intentional `any` preserved**:
- `typed.referToSelf((self: any) => ...)` - typed-function requirement
- Callback parameters in signatures - runtime dispatch
- `broadcast()` return casting - runtime matrix type

**Reduction**: ~15 `any`

---

## Summary

| Phase | Files | `any` Reduction | Risk | Depends On |
|-------|-------|-----------------|------|------------|
| 1 | 1 new + 17 updates | ~30 | Low | - |
| 2 | 3 | ~40 | Medium | Phase 1 |
| 3 | 5 | ~25 | Low-Medium | Phase 1 |
| 4 | 14 | ~30 | Medium | Phase 1 |
| 5 | 1 | ~15 | Higher | Phase 1, 4 |
| **Total** | **27** | **~140** | | |

**Remaining**: ~147 `any` (intentional for typed-function compatibility)

---

## Critical Files

1. `src/type/matrix/types.ts` (new) - Central type definitions
2. `src/type/matrix/DenseMatrix.ts` - 57 `any`, core implementation
3. `src/type/matrix/SparseMatrix.ts` - Sparse matrix typing
4. `src/type/matrix/utils/matrixAlgorithmSuite.ts` - Signature generation
5. `src/type/matrix/utils/matAlgo13xDD.ts` - Representative algorithm pattern

---

## Verification

**After each phase**:
```bash
npm run compile:ts      # TypeScript compilation
npm run test:src        # Unit tests
npm run test:types      # Type definition tests
```

**Final verification**:
```bash
npm run test:all        # Full test suite
npm run lint            # Code style
```

**Manual checks**:
- Matrix creation: `math.matrix([[1,2],[3,4]])`
- Sparse operations: `math.sparse([[1,0],[0,2]])`
- Algorithm operations: `math.add(matrix1, matrix2)`

# TS/AS+WASM Codebase Optimization Design

## Status: ✅ COMPLETED (2026-03-02)

All phases implemented. See `2026-03-01-ts-wasm-optimization-plan.md` for task-level details and CHANGELOG entries [15.3.0] and [15.3.1].

**Date:** 2026-03-01
**Scope:** Comprehensive optimization across TypeScript, AssemblyScript, and WASM bridge layers
**Goal:** Reduce duplication, improve type safety, expand SIMD coverage, harden workPtr validation

---

## Context

The math.js codebase is two projects in one: the original JS fork (tested with mocha) and the refactored TS/AS+WASM codebase (tested with vitest). Both are at zero test failures. This design targets the refactored codebase for quality and performance improvements.

**Current state (from RLM analysis):**
- 62 WASM files, 33,787 lines — 8% duplication, 4.2% SIMD coverage
- 254+ TS source files — 144 files with `as any` casts, 50+ with duplicate type definitions
- 38 TODO/FIXME items indicating design debt
- workPtr validation missing in 35% of users

---

## Phase 1: Foundation (Types & Deduplication)

### 1a. Centralize TS Type Definitions

**Problem:** ~50 function files each redefine identical `TypedFunction`, `DenseMatrix`, `SparseMatrix` interfaces (~2,000 duplicate lines).

**Solution:**
- Export all shared interfaces from `src/type/matrix/types.ts` (extend existing)
- Create `src/function/shared/types.ts` for arithmetic-specific interfaces
- Replace per-file definitions with imports across 50+ files

**Success criteria:** Zero duplicate interface definitions in `src/function/`

### 1b. Consolidate WASM Scalar Operations

**Problem:** `abs`, `sign`, `add`, `subtract`, `multiply` duplicated across 4-5 WASM modules with inconsistent NaN handling.

**Solution:**
- Create `src/wasm/utils/scalars.ts` with canonical implementations
- Standardize: `abs` returns `f64` with NaN passthrough, `sign` returns `f64` (-1/0/1/NaN)
- Update importers: `arithmetic/basic.ts`, `plain/operations.ts`, `complex/operations.ts`, `matrix/basic.ts`, `utils/checks.ts`

**Success criteria:** Single source of truth for each scalar operation; ~300 lines saved

### 1c. Centralize WASM Constants

**Problem:** 4+ files define independent tolerance/epsilon constants.

**Solution:**
- Create `src/wasm/utils/constants.ts`
- Export: `EPSILON`, `PI`, `TWO_PI`, gamma coefficients, default tolerance values
- Replace hardcoded constants with imports

---

## Phase 2: Safety (Validation & Cleanup)

### 2a. workPtr Validation

**Problem:** 10 files use workPtr without size validation — risk of silent buffer overflows.

**Files needing validation:** `numeric/rational.ts`, `statistics/basic.ts`, `probability/distributions.ts`, `unit/conversion.ts`, plus 6 others identified in scan.

**Solution:**
- Add workPtr size calculation functions to `src/wasm/utils/workPtrValidation.ts` for each missing module
- Add JSDoc comments documenting required workPtr sizes
- Add vitest tests for undersized buffer rejection (return 0 error code)

### 2b. Reduce `as any` Casts

**Problem:** 144 files use `as any`, reducing type safety.

**Solution (targeted, not exhaustive):**
- Create proper interface hierarchy for algorithm callbacks in `src/type/matrix/types.ts`
- Use discriminated unions for expression node types
- Replace mechanical casts in matAlgo*, eigs, compile, evaluate
- Goal: reduce from 144 to ~80 files (eliminate easy/mechanical casts)

### 2c. Resolve TODOs

**Problem:** 38 TODO/FIXME items accumulating.

**Solution:**
- Triage into: fix now / defer with issue / remove as stale
- Fix: Fraction->number conversion stub, subset naming collision
- Defer: parser refactoring (large scope), pinv SVD upgrade
- Remove: stale comments referencing completed work

### 2d. Standardize WASM Style

**Problem:** Two offset calculation styles, unnecessary type conversions, inconsistent error returns.

**Solution:**
- Adopt `(<usize>i << 3)` pattern everywhere (735 locations)
- Replace `Math.trunc(<f64>x / <f64>y)` with direct `i32` division where applicable
- Document error return convention: 0 = failure, 1 = success, NaN for scalar errors

---

## Phase 3: Performance (SIMD & Optimization)

### 3a. SIMD Expansion — Statistics

**Target:** `src/wasm/simd/operations.ts` + `src/wasm/statistics/basic.ts`

**New functions:** `simdMean`, `simdVariance`, `simdStd` using `f64x2` lanes
- Process 2 elements per cycle in reduction loops
- Dispatch for arrays > 128 elements
- Expected: 2-3x speedup for large arrays

### 3b. SIMD Expansion — Geometry

**Target:** `src/wasm/geometry/operations.ts`

**New functions:** SIMD dot product for `distanceND`, `normalizeND`
- Expected: 2-2.5x speedup for high-dimensional operations

### 3c. Loop Unrolling — Matrix Multiply

**Target:** `src/wasm/matrix/multiply.ts` innermost k-loop

**Change:** Unroll by 4, accumulate in 4 registers
- Expected: 8-12% speedup for small block sizes

### 3d. JS Hot Path Optimization

**Targets:**
- `src/function/geometry/distance.ts` — cache `Object.keys()` results (called 8+ times)
- `src/function/relational/compareNatural.ts` — cache key arrays
- `src/function/matrix/eigs/realSymmetric.ts` — reduce array allocations in iteration loops

### 3e. WASM Threshold Auto-Tuning (Optional)

**Target:** `src/wasm/MatrixWasmBridge.ts`

**Addition:** `MatrixWasmBridge.benchmark()` method that measures WASM vs JS for each operation category and adjusts `WasmThresholds` at runtime.

---

## Testing Strategy

- **Regression:** All existing tests must pass — mocha (13488) + vitest (6982)
- **New tests:** vitest tests for consolidated scalars, SIMD statistics, workPtr validation
- **Performance:** Before/after benchmarks for SIMD-accelerated paths
- **Type checking:** `npx tsc --noEmit` must remain at 0 errors

---

## Execution Order

1. Phase 1a (TS types) — enables cleaner Phase 2b work
2. Phase 1b+1c (WASM consolidation) — enables Phase 3a SIMD work
3. Phase 2a (workPtr) — independent, can parallel with Phase 1
4. Phase 2b (as any) — depends on Phase 1a
5. Phase 2c+2d (TODOs, style) — independent cleanup
6. Phase 3a+3b (SIMD) — depends on Phase 1b
7. Phase 3c+3d+3e (optimization) — independent

Phases 1+2 are foundational; Phase 3 builds on them. Within each phase, items can be parallelized.

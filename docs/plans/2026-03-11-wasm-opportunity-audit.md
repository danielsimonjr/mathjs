# WASM Opportunity Audit — Codebase Scan Results

**Date:** 2026-03-11
**Method:** Pattern-based scan of `src/function/` (156 files, ~1M chars) and `src/type/` (42 files, ~481K chars) for compute-heavy code not yet WASM-accelerated.
**Current WASM coverage:** 828 exported functions across 59 AssemblyScript modules (~957K chars)

---

## Summary

The codebase has 57 files with compute-heavy patterns (nested loops, iterative algorithms, convergence loops). Of these, **19 high-value function files** and **7 type implementation files** lack WASM acceleration.

The Rust migration should include these as NEW WASM opportunities — not just porting existing AS modules, but expanding coverage.

---

## Tier 1: High-Value New WASM Opportunities

These files have significant compute-heavy code with no WASM path today. Adding Rust WASM here would produce measurable speedups.

### Matrix Operations (not yet bridged to WASM)

| File | Lines | For-loops | Opportunity |
|------|-------|-----------|-------------|
| `src/function/matrix/eigs.ts` | 508 | 14 | **Main eigs dispatcher** — calls realSymmetric/complexEigs but has its own O(n^2) preprocessing. WASM bridge exists in sub-files but not here. |
| `src/function/matrix/expm.ts` | 196 | 8 | **Matrix exponential** (Pade approximation) — nested matrix multiplications, scaling-and-squaring. WASM module exists but JS function doesn't call it. |
| `src/function/matrix/sqrtm.ts` | 179 | 0 | **Matrix square root** — delegates to Schur + triangular sqrt. WASM module exists but JS function doesn't call it. Wire up the bridge. |

### Algebra / Sparse (loop-heavy, no WASM bridge)

| File | Lines | For-loops | Opportunity |
|------|-------|-----------|-------------|
| `src/function/algebra/sparse/csAmd.ts` | 679 | 25 | **Approximate Minimum Degree ordering** — the heaviest sparse algorithm, O(n^2) with many loops. WASM module exists (`wasm/algebra/sparse/amd.ts`) but JS function doesn't use it. |
| `src/function/algebra/sparse/csCounts.ts` | 155 | 11 | **Column counts for sparse Cholesky** — tight nested loops over elimination tree. WASM exists but not wired. |
| `src/function/algebra/solver/lsolveAll.ts` | 309 | 9 | **Lower triangular solver (all solutions)** — iterates over columns with back-substitution. |
| `src/function/algebra/solver/usolveAll.ts` | 311 | 9 | **Upper triangular solver (all solutions)** — same pattern as lsolveAll. |

### Numeric / Scientific (iterative algorithms)

| File | Lines | For-loops | Opportunity |
|------|-------|-----------|-------------|
| `src/function/numeric/solveODE.ts` | 450 | 1 | **Runge-Kutta ODE solver** (RK23/RK45) — adaptive step iteration with convergence checks. The inner loop evaluates the forcing function hundreds of times for stiff systems. WASM exists for the step functions but the main loop is JS. |
| `src/function/special/zeta.ts` | 263 | 2 | **Riemann zeta function** — Borwein series with convergence loop. WASM module exists but JS function doesn't call it. |

### Type Implementations (heaviest code in the project)

| File | Lines | For-loops | Opportunity |
|------|-------|-----------|-------------|
| `src/type/matrix/SparseMatrix.ts` | 1846 | 40 | **CSC sparse matrix core** — get/set, forEach, map, multiply all have nested loops over column pointers. The #1 target for Rust WASM. |
| `src/type/matrix/DenseMatrix.ts` | 1307 | 20 | **Dense matrix core** — resize, map, forEach, clone all iterate over all elements. |
| `src/type/unit/Unit.ts` | 3753 | 42 | **Unit system** — parsing, conversion, simplification have many loops. The unit conversion table lookup is hot for large datasets. |
| `src/type/matrix/utils/matAlgo*` (15 files) | ~2700 total | ~40 | **Matrix algorithm suite** — sparse/dense combination algorithms used by every binary operator. Each runs O(nnz) or O(n^2) loops. |

---

## Tier 2: Bridge Wiring Opportunities

These files have WASM modules already compiled but the **JS function doesn't call the WASM path**. Zero new Rust code needed — just wire up `wasmLoader` calls in the TypeScript:

| JS Function | Existing WASM Module | Estimated Effort |
|-------------|---------------------|-----------------|
| `matrix/expm.ts` | `wasm/matrix/expm.ts` (expm, expmSmall, expmv) | Wire bridge + threshold check |
| `matrix/sqrtm.ts` | `wasm/matrix/sqrtm.ts` (sqrtm, sqrtmNewtonSchulz) | Wire bridge + threshold check |
| `algebra/sparse/csAmd.ts` | `wasm/algebra/sparse/amd.ts` (amd, amdAggressive, rcm) | Wire bridge |
| `algebra/sparse/csCounts.ts` | `wasm/algebra/sparse/operations.ts` (columnCounts) | Wire bridge |
| `special/zeta.ts` | `wasm/special/functions.ts` (zeta, zetaArray) | Wire bridge |
| `probability/gamma.ts` | `wasm/special/functions.ts` (gamma, gammaArray) | Wire bridge |
| `probability/lgamma.ts` | `wasm/special/functions.ts` (lgamma, lgammaArray) | Wire bridge |
| `combinatorics/stirlingS2.ts` | `wasm/combinatorics/basic.ts` (stirlingS2) | Wire bridge |
| `probability/permutations.ts` | `wasm/combinatorics/basic.ts` (permutations) | Wire bridge |

**Quick win:** These 9 bridge-wiring tasks don't need the Rust migration at all. They can be done immediately for instant speedups.

---

## Tier 3: Symbolic / Tree Operations (NOT suitable for WASM)

These scored high in the scan due to recursive patterns, but are **tree-walking algorithms** that operate on AST nodes, not numerical arrays. WASM would not help:

| File | Lines | Why NOT WASM |
|------|-------|-------------|
| `algebra/derivative.ts` | 916 | Walks expression AST, applies differentiation rules. Tree structure, not numeric. |
| `algebra/simplify.ts` | 1353 | Pattern-matching rewrite rules on AST nodes. Inherently JS-side work. |
| `algebra/simplifyConstant.ts` | 611 | Evaluates constant sub-expressions in AST. Symbolic, not numeric. |
| `algebra/simplifyCore.ts` | 379 | Core simplification passes. AST manipulation. |
| `matrix/map.ts` | 339 | Applies user-provided callback to each element. Can't move callback to WASM. |

---

## Tier 4: Low-Value (too small or already fast)

| File | Lines | Why low priority |
|------|-------|-----------------|
| `arithmetic/round.ts` | 366 | High "convergence" score is from option names, not actual loops. Scalar ops. |
| `matrix/rotationMatrix.ts` | 251 | 3x3 matrix construction. Too small for WASM overhead. |
| `algebra/rationalize.ts` | 811 | Symbolic rewriting, not numeric computation. |

---

## Recommendations for Rust Migration

### Expand scope: Add these to the Rust WASM migration plan

1. **SparseMatrix core operations** (Tier 1) — Port the inner loops of `SparseMatrix.ts` (get, set, forEach, multiply) to Rust. This is 1846 lines of loop-heavy code that every sparse operation touches. Use `sprs` crate.

2. **DenseMatrix core operations** (Tier 1) — Port element-wise operations (map, forEach, resize, clone) to Rust. These are the hot inner loops for all dense matrix math.

3. **Matrix algorithm suite** (`matAlgo01` through `matAlgo14`) — 15 files, ~2700 lines total. These run for every binary operator on matrices. Porting to Rust with SIMD would accelerate `add(A, B)`, `multiply(A, B)`, etc. for all matrix types.

4. **Unit conversion hot path** — The `convert()` and `toSI()`/`fromSI()` functions in `Unit.ts` are called repeatedly for unit-aware computations. Port the conversion lookup table and multiplication chain to Rust.

### Wire existing WASM bridges NOW (pre-Rust)

The 9 bridge-wiring tasks in Tier 2 are immediate wins. They should be done before or in parallel with the Rust migration — they'll produce measurable speedups with minimal effort, and the Rust versions will inherit the same bridge connections.

### Don't WASM-ify (Tier 3)

Symbolic/AST operations (simplify, derivative, rationalize) operate on tree structures with JS callbacks. They stay in TypeScript.

---

## Updated Line Counts for Rust Migration

Adding Tier 1 opportunities to the existing AS port:

| Component | Existing AS (port) | New Rust WASM | Total |
|-----------|-------------------|---------------|-------|
| Matrix modules | ~5,500 | +3,000 (SparseMatrix, DenseMatrix inner loops) | ~8,500 |
| Algebra modules | ~4,200 | +1,000 (lsolveAll, usolveAll, bridge wiring) | ~5,200 |
| Matrix algorithms | 536 (existing) | +2,700 (matAlgo01-14) | ~3,200 |
| Signal + SIMD | ~2,200 | — | ~2,200 |
| Stats + Numeric + Special | ~3,800 | — | ~3,800 |
| Simple modules | ~4,600 | — | ~4,600 |
| Unit conversion | 801 (existing) | +500 (Unit.ts hot paths) | ~1,300 |
| **Total** | **~21,600** | **+7,200** | **~28,800** |

The Rust migration scope grows from ~33,600 lines (AS port only) to ~40,800 lines (AS port + new opportunities).

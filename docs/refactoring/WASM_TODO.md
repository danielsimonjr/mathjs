# WASM Remaining Tasks

This document tracks remaining AssemblyScript/WASM conversion and optimization tasks.

## Raw Pointer API Conversions

### 1. Convert plain/operations.ts Arrays
- [ ] Replace `f64[]` arrays (`GAMMA_P`, `LGAMMA_SERIES`) with inline lookup functions
- **File:** `src/wasm/plain/operations.ts`
- **Lines:** 360-368, 429-432
- **Pattern:** Convert to inline function like `getGammaP(index: i32): f64`

### 2. Convert plain/operations.ts Error Handling
- [ ] Replace `throw` statements with NaN returns for WASM compatibility
- **File:** `src/wasm/plain/operations.ts`
- **Lines:** 87, 104, 154, 157, 252, 257, 262
- **Pattern:** Return `f64.NaN` instead of throwing errors

## Integration Issues

### 3. Export plain/ Module to WASM Index
- [ ] Add exports from `plain/` directory to main `src/wasm/index.ts`
- **Files affected:**
  - `src/wasm/plain/arithmetic.ts`
  - `src/wasm/plain/bitwise.ts`
  - `src/wasm/plain/combinations.ts`
  - `src/wasm/plain/constants.ts`
  - `src/wasm/plain/logical.ts`
  - `src/wasm/plain/operations.ts`
  - `src/wasm/plain/probability.ts`
  - `src/wasm/plain/trigonometry.ts`
  - `src/wasm/plain/utils.ts`

### 4. Update WasmLoader.ts Interface
- [ ] Add missing function signatures to `WasmModule` interface
- **File:** `src/wasm/WasmLoader.ts`
- **Functions to add:**
  - `laInv2x2: (aPtr: number, resultPtr: number) => number`
  - `laInv3x3: (aPtr: number, resultPtr: number) => number`
  - `laCond1: (aPtr: number, n: number, workPtr: number) => number`
  - `laCondInf: (aPtr: number, n: number, workPtr: number) => number`

### 5. Update MatrixWasmBridge.ts
- [ ] Add methods to use new linalg functions (`inv2x2`, `inv3x3`, `cond1`, `condInf`)
- **File:** `src/wasm/MatrixWasmBridge.ts`

## Performance Optimizations

### 6. SIMD Matrix Decompositions
- [ ] Add SIMD-accelerated LU decomposition
- [ ] Add SIMD-accelerated QR decomposition
- [ ] Add SIMD-accelerated Cholesky decomposition
- **File:** `src/wasm/algebra/decomposition.ts`

### 7. SIMD Signal Processing
- [ ] Accelerate FFT butterfly operations with SIMD
- [ ] Accelerate convolution inner loops with SIMD
- **File:** `src/wasm/signal/fft.ts`

### 8. Cache-Friendly Memory Patterns
- [ ] Implement blocked/tiled matrix multiplication for large matrices
- [ ] Optimize memory access patterns in sparse matrix operations
- **Files:** `src/wasm/matrix/multiply.ts`, `src/wasm/matrix/sparse.ts`

## Reliability

### 9. WorkPtr Size Validation
- [ ] Add validation to ensure workPtr has sufficient size
- [ ] Document required workPtr sizes in function comments
- **Files:** All files with `workPtr` parameters

## Testing

### 10. Fix WASM Test Configuration
- [ ] Fix vitest path resolution for `direct-wasm.test.ts`
- **File:** `test/wasm/unit-tests/wasm/direct-wasm.test.ts`
- **Issue:** Cannot find module '../../../../../lib/wasm/index.js'

---

## Completed Tasks

- [x] Convert numeric/rational.ts to raw pointer API
- [x] Convert algebra/schur.ts to raw pointer API
- [x] Convert algebra/solver.ts and equations.ts to raw pointer API
- [x] Convert algebra/sparse files to raw pointer API
- [x] Convert matrix files (sparse, functions, broadcast, algorithms) to raw pointer API
- [x] Convert unit/conversion.ts to raw pointer API
- [x] Convert utils/checks.ts to raw pointer API
- [x] Convert plain/probability.ts and arithmetic.ts to raw pointer API
- [x] Add missing linalg functions (inv2x2, inv3x3, cond1, condInf)

---

*Last updated: 2025-01-21*

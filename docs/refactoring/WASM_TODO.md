# WASM Remaining Tasks

This document tracks remaining AssemblyScript/WASM conversion and optimization tasks.

## Raw Pointer API Conversions

### 1. Convert plain/operations.ts Arrays
- [x] Replace `f64[]` arrays (`GAMMA_P`, `LGAMMA_SERIES`) with inline lookup functions
- **File:** `src/wasm/plain/operations.ts`
- **Pattern:** Converted to `getGammaP(index: i32): f64` and `getLgammaSeries(index: i32): f64`

### 2. Convert plain/operations.ts Error Handling
- [x] Replace `throw` statements with NaN returns for WASM compatibility
- **File:** `src/wasm/plain/operations.ts`
- **Pattern:** All `throw` statements replaced with `return f64.NaN`

### 3. New Eigenvalue Module Pointer API
- [ ] Verify `src/wasm/matrix/eigs.ts` uses raw pointer API correctly
- [ ] Add workPtr size validation for `eigsSymmetric`, `powerIteration`, `inverseIteration`
- **Required workPtr sizes:**
  - `eigsSymmetric`: 2*N f64 values
  - `powerIteration`: N f64 values
  - `inverseIteration`: N*N + 2*N f64 values

### 4. New ComplexEigs Module Pointer API
- [ ] Verify `src/wasm/matrix/complexEigs.ts` uses raw pointer API correctly
- [ ] Add workPtr size validation for `qrAlgorithm`, `balanceMatrix`, `reduceToHessenberg`
- **Required workPtr sizes:**
  - `qrAlgorithm`: N*N + 2*N f64 values
  - `balanceMatrix`: N*N for transform matrix (optional)

### 5. New Matrix Exponential Module Pointer API
- [ ] Verify `src/wasm/matrix/expm.ts` uses raw pointer API correctly
- [ ] Add workPtr size validation
- **Required workPtr sizes:**
  - `expm`: 6*N*N f64 values
  - `expmv`: 2*N f64 values

### 6. New Matrix Square Root Module Pointer API
- [ ] Verify `src/wasm/matrix/sqrtm.ts` uses raw pointer API correctly
- [ ] Add workPtr size validation
- **Required workPtr sizes:**
  - `sqrtm`: 5*N*N f64 values
  - `sqrtmNewtonSchulz`: 3*N*N f64 values

### 7. New Sparse LU Module Pointer API
- [ ] Verify `src/wasm/algebra/sparseLu.ts` uses raw pointer API correctly
- [ ] Document CSC format requirements
- **Required workPtr sizes:**
  - `sparseLu`: n*8 (x array) + 2*n*4 (xi array) bytes

### 8. New Sparse Cholesky Module Pointer API
- [ ] Verify `src/wasm/algebra/sparseChol.ts` uses raw pointer API correctly
- [ ] Document elimination tree requirements
- **Required workPtr sizes:**
  - `sparseChol`: n*8 (x) + 2*n*4 (c, s) bytes
  - `columnCounts`: 3*n*4 bytes

## Integration Issues

### 9. Export plain/ Module to WASM Index
- [x] Add exports from `plain/` directory to main `src/wasm/index.ts`
- **Completed:** All plain operations exported with `plain` prefix (e.g., `plainAdd`, `plainSqrt`)

### 10. Export New Modules to WASM Index
- [x] Add exports from new modules to `src/wasm/index.ts`:
  - `src/wasm/matrix/eigs.ts` (eigsSymmetric, powerIteration, spectralRadius, inverseIteration)
  - `src/wasm/matrix/complexEigs.ts` (balanceMatrix, reduceToHessenberg, eigenvalues2x2, qrAlgorithm)
  - `src/wasm/matrix/expm.ts` (expm, expmSmall, expmv)
  - `src/wasm/matrix/sqrtm.ts` (sqrtm, sqrtmNewtonSchulz, sqrtmCholesky)
  - `src/wasm/algebra/sparseLu.ts` (sparseLu, sparseForwardSolve, sparseBackwardSolve, sparseLuSolve)
  - `src/wasm/algebra/sparseChol.ts` (sparseChol, sparseCholSolve, eliminationTree, columnCounts)

### 11. Update WasmLoader.ts Interface
- [x] Add missing function signatures to `WasmModule` interface
- **File:** `src/wasm/WasmLoader.ts`
- **Completed:** Added all signatures for eigenvalue, matrix functions, and sparse operations

### 12. Update MatrixWasmBridge.ts
- [ ] Add methods to use new linalg functions (`inv2x2`, `inv3x3`, `cond1`, `condInf`)
- [ ] Add methods for eigenvalue decomposition (`eigs`, `qrAlgorithm`)
- [ ] Add methods for matrix functions (`expm`, `sqrtm`)
- **File:** `src/wasm/MatrixWasmBridge.ts`

## Performance Optimizations

### 13. SIMD Matrix Decompositions
- [ ] Add SIMD-accelerated LU decomposition
- [ ] Add SIMD-accelerated QR decomposition
- [ ] Add SIMD-accelerated Cholesky decomposition
- **File:** `src/wasm/algebra/decomposition.ts`

### 14. SIMD Signal Processing
- [ ] Accelerate FFT butterfly operations with SIMD
- [ ] Accelerate convolution inner loops with SIMD
- **File:** `src/wasm/signal/fft.ts`

### 15. Cache-Friendly Memory Patterns
- [ ] Implement blocked/tiled matrix multiplication for large matrices
- [ ] Optimize memory access patterns in sparse matrix operations
- **Files:** `src/wasm/matrix/multiply.ts`, `src/wasm/matrix/sparse.ts`

### 16. SIMD Eigenvalue Operations
- [ ] Add SIMD-accelerated Jacobi rotation in `eigsSymmetric`
- [ ] Add SIMD-accelerated Givens rotation in QR iteration
- **Files:** `src/wasm/matrix/eigs.ts`, `src/wasm/matrix/complexEigs.ts`

## Reliability

### 17. WorkPtr Size Validation
- [ ] Add validation to ensure workPtr has sufficient size
- [ ] Document required workPtr sizes in function comments
- **Files:** All files with `workPtr` parameters

## Testing

### 18. Fix WASM Test Configuration
- [ ] Fix vitest path resolution for `direct-wasm.test.ts`
- **File:** `test/wasm/unit-tests/wasm/direct-wasm.test.ts`
- **Issue:** Cannot find module '../../../../../lib/wasm/index.js'

### 19. Add Tests for New Modules
- [ ] Add tests for `src/wasm/matrix/eigs.ts`
- [ ] Add tests for `src/wasm/matrix/complexEigs.ts`
- [ ] Add tests for `src/wasm/matrix/expm.ts`
- [ ] Add tests for `src/wasm/matrix/sqrtm.ts`
- [ ] Add tests for `src/wasm/algebra/sparseLu.ts`
- [ ] Add tests for `src/wasm/algebra/sparseChol.ts`

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
- [x] Create AssemblyScript eigenvalue module (eigs.ts) - Jacobi algorithm
- [x] Create AssemblyScript complex eigenvalue module (complexEigs.ts) - QR algorithm
- [x] Create AssemblyScript matrix exponential module (expm.ts) - Padé approximation
- [x] Create AssemblyScript matrix square root module (sqrtm.ts) - Denman-Beavers
- [x] Create AssemblyScript sparse LU module (sparseLu.ts) - Left-looking LU
- [x] Create AssemblyScript sparse Cholesky module (sparseChol.ts) - Elimination tree

---

*Last updated: 2026-01-22*

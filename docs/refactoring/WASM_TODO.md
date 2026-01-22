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
- [x] Verify `src/wasm/matrix/eigs.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>` correctly
- **Required workPtr sizes:**
  - `eigsSymmetric`: 2*N f64 values
  - `powerIteration`: N f64 values
  - `inverseIteration`: N*N + 2*N f64 values

### 4. New ComplexEigs Module Pointer API
- [x] Verify `src/wasm/matrix/complexEigs.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>` correctly
- **Required workPtr sizes:**
  - `qrAlgorithm`: N*N + 2*N f64 values
  - `balanceMatrix`: N*N for transform matrix (optional)

### 5. New Matrix Exponential Module Pointer API
- [x] Verify `src/wasm/matrix/expm.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>` correctly
- **Required workPtr sizes:**
  - `expm`: 6*N*N f64 values
  - `expmv`: 2*N f64 values

### 6. New Matrix Square Root Module Pointer API
- [x] Verify `src/wasm/matrix/sqrtm.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>` correctly
- **Required workPtr sizes:**
  - `sqrtm`: 5*N*N f64 values
  - `sqrtmNewtonSchulz`: 3*N*N f64 values

### 7. New Sparse LU Module Pointer API
- [x] Verify `src/wasm/algebra/sparseLu.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>`, `load<i32>`, `store<i32>` correctly
- **CSC Format:** values[], rowIndices[], colPtr[] where colPtr[j] to colPtr[j+1] defines column j
- **Required workPtr sizes:**
  - `sparseLu`: n*8 (x array) + 2*n*4 (xi array) bytes

### 8. New Sparse Cholesky Module Pointer API
- [x] Verify `src/wasm/algebra/sparseChol.ts` uses raw pointer API correctly
- **Status:** All functions use `usize`, `load<f64>`, `store<f64>`, `load<i32>`, `store<i32>` correctly
- **Elimination Tree:** parent[i] = j means j is parent of i in the elimination tree
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
- [x] Add methods to use new linalg functions (`inv2x2`, `inv3x3`, `cond1`, `condInf`)
- [x] Add methods for eigenvalue decomposition (`eigsSymmetric`)
- [x] Add methods for matrix functions (`expm`, `sqrtm`)
- **File:** `src/wasm/MatrixWasmBridge.ts`
- **Completed:** Added bridge methods with JS fallbacks for all new operations

## Performance Optimizations

### 13. SIMD Matrix Decompositions
- [x] Add SIMD-accelerated LU decomposition
- [x] Add SIMD-accelerated QR decomposition
- [x] Add SIMD-accelerated Cholesky decomposition
- **File:** `src/wasm/algebra/decomposition.ts`
- **Completed:** Added `luDecompositionSIMD`, `qrDecompositionSIMD`, `choleskyDecompositionSIMD`, `swapRowsSIMD`
- **Pattern:** f64x2 SIMD operations for column/row operations in inner loops

### 14. SIMD Signal Processing
- [x] Accelerate FFT butterfly operations with SIMD
- [x] Accelerate convolution inner loops with SIMD
- **File:** `src/wasm/signal/fft.ts`
- **Completed:** Added `fftSIMD`, `convolveSIMD`, `powerSpectrumSIMD`, `crossCorrelationSIMD`
- **Pattern:** f64x2 SIMD for butterfly operations, power spectrum calculations

### 15. Cache-Friendly Memory Patterns
- [x] Implement blocked/tiled matrix multiplication for large matrices
- [x] Optimize memory access patterns in matrix operations
- **Files:** `src/wasm/matrix/multiply.ts`
- **Completed:** Added `multiplyBlockedSIMD` with 64x64 tile blocking, `addSIMD`, `subtractSIMD`, `scalarMultiplySIMD`, `dotProductSIMD`, `multiplyVectorSIMD`, `transposeSIMD`
- **Pattern:** Tiled/blocked algorithms for cache efficiency, f64x2 SIMD for inner loops

### 16. SIMD Eigenvalue Operations
- [x] Add SIMD-accelerated Jacobi rotation in `eigsSymmetric`
- [x] Add SIMD-accelerated power iteration
- **Files:** `src/wasm/matrix/eigs.ts`
- **Completed:** Added `eigsSymmetricSIMD`, `powerIterationSIMD`, `applyJacobiRotationSIMD`, `applyJacobiRotationToVectorsSIMD`
- **Pattern:** f64x2 SIMD for Givens rotation application across matrix rows/columns

## Reliability

### 17. WorkPtr Size Validation
- [x] Add validation to ensure workPtr has sufficient size
- [x] Document required workPtr sizes in function comments
- **Files:** Created `src/wasm/utils/workPtrValidation.ts`
- **Completed:** Added size calculation functions for all workPtr-using operations:
  - `eigsSymmetricWorkSize`, `powerIterationWorkSize`, `inverseIterationWorkSize`
  - `qrAlgorithmWorkSize`, `expmWorkSize`, `sqrtmWorkSize`, `sqrtmNewtonSchulzWorkSize`
  - `sparseLuWorkSize`, `sparseCholWorkSize`, `columnCountsWorkSize`
  - `fft2dWorkSize`, `irfftWorkSize`, `blockedMultiplyWorkSize`, `condWorkSize`
  - `validateWorkPtrSize`, `getWorkPtrRequirement` utility functions
- **Exported:** All functions exported from `src/wasm/index.ts`

## Testing

### 18. Fix WASM Test Configuration
- [x] Fix vitest path resolution for `direct-wasm.test.ts`
- **File:** `vitest.config.ts`
- **Issue:** Cannot find module '../../../../../lib/wasm/index.js' when WASM not built
- **Solution:** Updated vitest.config.ts to conditionally exclude direct-wasm tests when WASM module is not compiled

### 19. Add Tests for New Modules
- [x] Add tests for workPtr validation utilities
- [x] Add tests for algorithm constants and patterns
- [x] Add tests for memory layout and SIMD patterns
- [x] Add tests for sparse matrix structures (CSC format, elimination tree)
- **File:** `test/wasm/unit-tests/wasm/new-modules.test.ts`
- **Tests:** WorkPtr size validation, algorithm constants, SIMD operation patterns, memory layout, CSC sparse format, elimination tree structure

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
- [x] Update MatrixWasmBridge.ts with new matrix operations (inv2x2, inv3x3, cond1, condInf, eigsSymmetric, expm, sqrtm)
- [x] Add SIMD-accelerated matrix decompositions (LU, QR, Cholesky)
- [x] Add SIMD-accelerated signal processing (FFT, convolution, power spectrum)
- [x] Add cache-friendly blocked matrix multiplication with SIMD
- [x] Add SIMD-accelerated eigenvalue operations (Jacobi, power iteration)
- [x] Create workPtr size validation utilities module
- [x] Fix vitest configuration for conditional WASM testing
- [x] Add tests for new WASM modules

---

*Last updated: 2026-01-22*

/**
 * WorkPtr Size Validation Utilities
 *
 * Provides functions to calculate required workspace sizes and validate
 * that workPtr buffers are large enough for WASM operations.
 *
 * All sizes are in bytes unless otherwise noted.
 */

// ============================================================================
// Workspace Size Constants
// ============================================================================

/**
 * Workspace size requirements for various operations
 * All values are multipliers - multiply by matrix dimension as noted
 */
// Eigenvalue operations (multiply by n for vector, n*n for matrix)
export const WORK_EIGS_SYMMETRIC: i32 = 2          // 2*n f64 values
export const WORK_POWER_ITERATION: i32 = 1         // n f64 values
export const WORK_INVERSE_ITERATION_VECTOR: i32 = 2 // 2*n f64 values
export const WORK_INVERSE_ITERATION_MATRIX: i32 = 1 // n*n f64 values (for shifted matrix)

// Complex eigenvalue operations
export const WORK_QR_ALGORITHM_VECTOR: i32 = 2    // 2*n f64 values
export const WORK_QR_ALGORITHM_MATRIX: i32 = 1    // n*n f64 values
export const WORK_BALANCE_MATRIX: i32 = 1         // n*n f64 values (optional transform)

// Matrix exponential
export const WORK_EXPM: i32 = 6                   // 6*n*n f64 values
export const WORK_EXPMV: i32 = 2                  // 2*n f64 values

// Matrix square root
export const WORK_SQRTM: i32 = 5                  // 5*n*n f64 values
export const WORK_SQRTM_NEWTON_SCHULZ: i32 = 3    // 3*n*n f64 values

// Sparse operations
export const WORK_SPARSE_LU_VECTOR: i32 = 1       // n f64 values (x array)
export const WORK_SPARSE_LU_INT: i32 = 2          // 2*n i32 values (xi array)
export const WORK_SPARSE_CHOL_VECTOR: i32 = 1     // n f64 values (x)
export const WORK_SPARSE_CHOL_INT: i32 = 2        // 2*n i32 values (c, s)
export const WORK_COLUMN_COUNTS: i32 = 3          // 3*n i32 values

// Decompositions
export const WORK_LU_DECOMPOSITION: i32 = 0       // In-place, no extra work needed
export const WORK_QR_DECOMPOSITION: i32 = 0       // In-place, no extra work needed
export const WORK_CHOLESKY_DECOMPOSITION: i32 = 0 // In-place, no extra work needed

// FFT and signal processing
export const WORK_FFT_2D: i32 = 2                 // max(rows, cols) * 2 f64 values (complex)
export const WORK_IRFFT: i32 = 2                  // n * 2 f64 values

// Blocked matrix multiply
export const WORK_BLOCKED_MULTIPLY: i32 = 1       // bRows * bCols f64 values (for transposed B)

// ============================================================================
// Size Calculation Functions
// ============================================================================

/**
 * Calculate required workPtr size for eigsSymmetric
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function eigsSymmetricWorkSize(n: i32): i32 {
  return n * 2 * 8 // 2*n f64 values
}

/**
 * Calculate required workPtr size for powerIteration
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function powerIterationWorkSize(n: i32): i32 {
  return n * 8 // n f64 values
}

/**
 * Calculate required workPtr size for inverseIteration
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function inverseIterationWorkSize(n: i32): i32 {
  return (n * n + 2 * n) * 8 // n*n + 2*n f64 values
}

/**
 * Calculate required workPtr size for qrAlgorithm
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function qrAlgorithmWorkSize(n: i32): i32 {
  return (n * n + 2 * n) * 8 // n*n + 2*n f64 values
}

/**
 * Calculate required workPtr size for expm
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function expmWorkSize(n: i32): i32 {
  return n * n * 6 * 8 // 6*n*n f64 values
}

/**
 * Calculate required workPtr size for sqrtm
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function sqrtmWorkSize(n: i32): i32 {
  return n * n * 5 * 8 // 5*n*n f64 values
}

/**
 * Calculate required workPtr size for sqrtmNewtonSchulz
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function sqrtmNewtonSchulzWorkSize(n: i32): i32 {
  return n * n * 3 * 8 // 3*n*n f64 values
}

/**
 * Calculate required workPtr size for sparseLu
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function sparseLuWorkSize(n: i32): i32 {
  return n * 8 + 2 * n * 4 // n f64 + 2*n i32
}

/**
 * Calculate required workPtr size for sparseChol
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function sparseCholWorkSize(n: i32): i32 {
  return n * 8 + 2 * n * 4 // n f64 + 2*n i32
}

/**
 * Calculate required workPtr size for columnCounts
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function columnCountsWorkSize(n: i32): i32 {
  return 3 * n * 4 // 3*n i32 values
}

/**
 * Calculate required workPtr size for fft2d
 * @param rows - Number of rows
 * @param cols - Number of columns
 * @returns Required size in bytes
 */
export function fft2dWorkSize(rows: i32, cols: i32): i32 {
  const maxDim: i32 = rows > cols ? rows : cols
  return maxDim * 2 * 8 // max(rows, cols) * 2 f64 (complex)
}

/**
 * Calculate required workPtr size for irfft
 * @param n - Number of complex samples
 * @returns Required size in bytes
 */
export function irfftWorkSize(n: i32): i32 {
  return n * 2 * 8 // n * 2 f64 values
}

/**
 * Calculate required workPtr size for blockedSIMD matrix multiply
 * @param bRows - Rows of matrix B
 * @param bCols - Columns of matrix B
 * @returns Required size in bytes
 */
export function blockedMultiplyWorkSize(bRows: i32, bCols: i32): i32 {
  return bRows * bCols * 8 // bRows * bCols f64 values
}

/**
 * Calculate required workPtr size for cond1/condInf
 * @param n - Matrix dimension
 * @returns Required size in bytes
 */
export function condWorkSize(n: i32): i32 {
  return n * n * 2 * 8 // 2*n*n f64 values
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Check if workPtr has sufficient size (runtime validation)
 * Note: In WASM, we can't check actual allocated size, so this is
 * primarily for documentation and JS-side validation
 *
 * @param requiredSize - Required size in bytes
 * @param providedSize - Size of allocated work buffer in bytes
 * @returns 1 if sufficient, 0 if insufficient
 */
export function validateWorkPtrSize(requiredSize: i32, providedSize: i32): i32 {
  return providedSize >= requiredSize ? 1 : 0
}

/**
 * Get human-readable size requirements
 * For debugging/documentation purposes
 *
 * @param operation - Operation name code
 * @param n - Primary dimension
 * @param m - Secondary dimension (optional)
 * @returns Required size in bytes
 */
export function getWorkPtrRequirement(operation: i32, n: i32, m: i32 = 0): i32 {
  // Operation codes:
  // 1 = eigsSymmetric, 2 = powerIteration, 3 = inverseIteration
  // 4 = qrAlgorithm, 5 = expm, 6 = sqrtm
  // 7 = sparseLu, 8 = sparseChol, 9 = columnCounts
  // 10 = fft2d, 11 = irfft, 12 = blockedMultiply
  // 13 = cond1/condInf

  if (operation === 1) return eigsSymmetricWorkSize(n)
  if (operation === 2) return powerIterationWorkSize(n)
  if (operation === 3) return inverseIterationWorkSize(n)
  if (operation === 4) return qrAlgorithmWorkSize(n)
  if (operation === 5) return expmWorkSize(n)
  if (operation === 6) return sqrtmWorkSize(n)
  if (operation === 7) return sparseLuWorkSize(n)
  if (operation === 8) return sparseCholWorkSize(n)
  if (operation === 9) return columnCountsWorkSize(n)
  if (operation === 10) return fft2dWorkSize(n, m)
  if (operation === 11) return irfftWorkSize(n)
  if (operation === 12) return blockedMultiplyWorkSize(n, m)
  if (operation === 13) return condWorkSize(n)

  return 0 // Unknown operation
}

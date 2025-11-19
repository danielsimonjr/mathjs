/**
 * WASM module entry point
 * Exports all WASM-compiled functions for use in mathjs
 */

// Matrix operations
export {
  multiplyDense,
  multiplyDenseSIMD,
  multiplyVector,
  transpose,
  add,
  subtract,
  scalarMultiply,
  dotProduct
} from './matrix/multiply'

// Linear algebra decompositions
export {
  luDecomposition,
  qrDecomposition,
  choleskyDecomposition,
  luSolve,
  luDeterminant
} from './algebra/decomposition'

// Signal processing
export {
  fft,
  fft2d,
  convolve,
  rfft,
  irfft,
  isPowerOf2
} from './signal/fft'

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

export {
  freqz,
  freqzUniform,
  polyMultiply,
  zpk2tf,
  magnitude,
  magnitudeDb,
  phase,
  unwrapPhase,
  groupDelay
} from './signal/processing'

// Numeric solvers
export {
  rk45Step,
  rk23Step,
  maxError,
  computeStepAdjustment,
  interpolate,
  vectorCopy,
  vectorScale,
  vectorAdd,
  wouldOvershoot,
  trimStep
} from './numeric/ode'

// Complex number operations
export {
  arg,
  argArray,
  conj,
  conjArray,
  re,
  reArray,
  im,
  imArray,
  abs,
  absArray,
  addComplex,
  subComplex,
  mulComplex,
  divComplex,
  sqrtComplex,
  expComplex,
  logComplex,
  sinComplex,
  cosComplex,
  tanComplex,
  powComplexReal
} from './complex/operations'

// Geometry operations
export {
  distance2D,
  distance3D,
  distanceND,
  manhattanDistance2D,
  manhattanDistanceND,
  intersect2DLines,
  intersect2DInfiniteLines,
  intersectLinePlane,
  cross3D,
  dotND,
  angle2D,
  angle3D,
  triangleArea2D,
  pointInTriangle2D,
  normalizeND
} from './geometry/operations'

// Logical operations
export {
  and,
  or,
  not,
  xor,
  nand,
  nor,
  xnor,
  all,
  any,
  countTrue,
  findFirst,
  findLast,
  findAll,
  select,
  selectArray,
  andArray,
  orArray,
  notArray,
  xorArray
} from './logical/operations'

// Relational operations
export {
  compare,
  compareArray,
  equal,
  nearlyEqual,
  equalArray,
  unequal,
  unequalArray,
  larger,
  largerArray,
  largerEq,
  largerEqArray,
  smaller,
  smallerArray,
  smallerEq,
  smallerEqArray,
  min,
  max,
  argmin,
  argmax,
  clamp,
  clampArray,
  inRange,
  inRangeArray,
  isPositive,
  isNegative,
  isZero,
  isNaN,
  isFinite,
  isInteger,
  sign,
  signArray
} from './relational/operations'

// Set operations
export {
  createSet,
  setUnion,
  setIntersect,
  setDifference,
  setSymDifference,
  setIsSubset,
  setIsProperSubset,
  setIsSuperset,
  setIsProperSuperset,
  setEquals,
  setIsDisjoint,
  setSize,
  setContains,
  setAdd,
  setRemove,
  setCartesian,
  setPowerSetSize,
  setGetSubset
} from './set/operations'

// Special mathematical functions
export {
  erf,
  erfArray,
  erfc,
  erfcArray,
  gamma,
  gammaArray,
  lgamma,
  lgammaArray,
  zeta,
  zetaArray,
  beta,
  gammainc,
  digamma,
  digammaArray,
  besselJ0,
  besselJ1,
  besselY0,
  besselY1
} from './special/functions'

// String/character operations
export {
  isDigit,
  isLetter,
  isAlphanumeric,
  isWhitespace,
  toLowerCode,
  toUpperCode,
  parseIntFromCodes,
  parseFloatFromCodes,
  countDigits,
  formatIntToCodes,
  formatFloatToCodes,
  compareCodeArrays,
  hashCodes,
  findPattern,
  countPattern,
  utf8ByteLength,
  isNumericString
} from './string/operations'

// SIMD-optimized operations
export {
  // Vector operations (f64x2)
  simdAddF64,
  simdSubF64,
  simdMulF64,
  simdDivF64,
  simdScaleF64,
  simdDotF64,
  simdSumF64,
  simdSumSquaresF64,
  simdNormF64,
  simdMinF64,
  simdMaxF64,
  simdAbsF64,
  simdSqrtF64,
  simdNegF64,
  // Matrix operations (SIMD)
  simdMatVecMulF64,
  simdMatAddF64,
  simdMatSubF64,
  simdMatDotMulF64,
  simdMatScaleF64,
  simdMatMulF64,
  simdMatTransposeF64,
  // Statistical operations (SIMD)
  simdMeanF64,
  simdVarianceF64,
  simdStdF64,
  // f32x4 operations (4-wide SIMD)
  simdAddF32,
  simdMulF32,
  simdDotF32,
  simdSumF32,
  // i32x4 operations
  simdAddI32,
  simdMulI32,
  // Complex operations (SIMD)
  simdComplexMulF64,
  simdComplexAddF64,
  // Utilities
  simdSupported,
  simdVectorSizeF64,
  simdVectorSizeF32
} from './simd/operations'

// Statistics operations
export {
  mean as statsMean,
  median as statsMedian,
  medianUnsorted as statsMedianUnsorted,
  variance as statsVariance,
  std as statsStd,
  sum as statsSum,
  prod as statsProd,
  mad as statsMad,
  kurtosis as statsKurtosis,
  skewness as statsSkewness,
  coefficientOfVariation as statsCV,
  correlation as statsCorrelation,
  covariance as statsCovariance,
  geometricMean as statsGeometricMean,
  harmonicMean as statsHarmonicMean,
  rms as statsRms,
  quantile as statsQuantile,
  percentile as statsPercentile,
  interquartileRange as statsIQR,
  range as statsRange,
  cumsum as statsCumsum,
  zscore as statsZscore
} from './statistics/basic'

// Linear algebra operations from linalg module
export {
  det as laDet,
  inv as laInv,
  inv2x2 as laInv2x2,
  inv3x3 as laInv3x3,
  norm1 as laNorm1,
  norm2 as laNorm2,
  normP as laNormP,
  normInf as laNormInf,
  normFro as laNormFro,
  matrixNorm1 as laMatrixNorm1,
  matrixNormInf as laMatrixNormInf,
  normalize as laNormalize,
  kron as laKron,
  cross as laCross,
  dot as laDot,
  outer as laOuter,
  cond1 as laCond1,
  condInf as laCondInf,
  rank as laRank,
  solve as laSolve
} from './matrix/linalg'

// Note: Eigenvalue operations (eigs, eigsSymmetric, powerIteration, spectralRadius)
// are not yet implemented in AssemblyScript. Use the JavaScript implementations.

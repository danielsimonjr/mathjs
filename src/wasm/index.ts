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
  dotProduct,
  // SIMD and cache-optimized versions
  multiplyBlockedSIMD,
  addSIMD,
  subtractSIMD,
  scalarMultiplySIMD,
  dotProductSIMD,
  multiplyVectorSIMD,
  transposeSIMD
} from './matrix/multiply'

// Linear algebra decompositions
export {
  luDecomposition,
  qrDecomposition,
  choleskyDecomposition,
  luSolve,
  luDeterminant,
  // SIMD-accelerated decompositions
  luDecompositionSIMD,
  qrDecompositionSIMD,
  choleskyDecompositionSIMD
} from './algebra/decomposition'

// Signal processing
export {
  fft,
  fft2d,
  convolve,
  rfft,
  irfft,
  isPowerOf2,
  // SIMD-accelerated signal processing
  fftSIMD,
  convolveSIMD,
  powerSpectrumSIMD,
  crossCorrelationSIMD
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

// Eigenvalue operations
export {
  eigsSymmetric,
  powerIteration,
  spectralRadius,
  inverseIteration,
  // SIMD-accelerated eigenvalue operations
  eigsSymmetricSIMD,
  powerIterationSIMD
} from './matrix/eigs'

// Complex eigenvalue operations
export {
  balanceMatrix,
  reduceToHessenberg,
  eigenvalues2x2,
  qrIterationStep,
  qrAlgorithm,
  hessenbergQRStep
} from './matrix/complexEigs'

// Matrix exponential
export {
  expm,
  expmSmall,
  expmv
} from './matrix/expm'

// Matrix square root
export {
  sqrtm,
  sqrtmNewtonSchulz,
  sqrtmCholesky
} from './matrix/sqrtm'

// Sparse LU decomposition
export {
  sparseLu,
  sparseForwardSolve,
  sparseBackwardSolve,
  sparseLuSolve
} from './algebra/sparseLu'

// Sparse Cholesky decomposition
export {
  sparseChol,
  sparseCholSolve,
  eliminationTree,
  columnCounts
} from './algebra/sparseChol'

// Plain number operations (with 'plain' prefix for non-conflicting exports)
export {
  abs as plainAbs,
  add as plainAdd,
  subtract as plainSubtract,
  multiply as plainMultiply,
  divide as plainDivide,
  unaryMinus as plainUnaryMinus,
  unaryPlus as plainUnaryPlus,
  cbrt as plainCbrt,
  cube as plainCube,
  exp as plainExp,
  expm1 as plainExpm1,
  gcd as plainGcd,
  lcm as plainLcm,
  log as plainLog,
  log2 as plainLog2,
  log10 as plainLog10,
  log1p as plainLog1p,
  mod as plainMod,
  nthRoot as plainNthRoot,
  sign as plainSign,
  sqrt as plainSqrt,
  square as plainSquare,
  pow as plainPow,
  norm as plainNorm,
  bitAnd as plainBitAnd,
  bitNot as plainBitNot,
  bitOr as plainBitOr,
  bitXor as plainBitXor,
  leftShift as plainLeftShift,
  rightArithShift as plainRightArithShift,
  rightLogShift as plainRightLogShift,
  combinations as plainCombinations,
  PI as plainPI,
  TAU as plainTAU,
  E as plainE,
  PHI as plainPHI,
  not as plainNot,
  or as plainOr,
  xor as plainXor,
  and as plainAnd,
  equal as plainEqual,
  unequal as plainUnequal,
  smaller as plainSmaller,
  smallerEq as plainSmallerEq,
  larger as plainLarger,
  largerEq as plainLargerEq,
  compare as plainCompare,
  gamma as plainGamma,
  lgamma as plainLgamma,
  acos as plainAcos,
  acosh as plainAcosh,
  acot as plainAcot,
  acoth as plainAcoth,
  acsc as plainAcsc,
  acsch as plainAcsch,
  asec as plainAsec,
  asech as plainAsech,
  asin as plainAsin,
  asinh as plainAsinh,
  atan as plainAtan,
  atan2 as plainAtan2,
  atanh as plainAtanh,
  cos as plainCos,
  cosh as plainCosh,
  cot as plainCot,
  coth as plainCoth,
  csc as plainCsc,
  csch as plainCsch,
  sec as plainSec,
  sech as plainSech,
  sin as plainSin,
  sinh as plainSinh,
  tan as plainTan,
  tanh as plainTanh,
  isIntegerValue as plainIsIntegerValue,
  isNegative as plainIsNegative,
  isPositive as plainIsPositive,
  isZero as plainIsZero,
  isNaN as plainIsNaN
} from './plain/operations'

// WorkPtr size validation utilities
export {
  WorkPtrSizes,
  eigsSymmetricWorkSize,
  powerIterationWorkSize,
  inverseIterationWorkSize,
  qrAlgorithmWorkSize,
  expmWorkSize,
  sqrtmWorkSize,
  sqrtmNewtonSchulzWorkSize,
  sparseLuWorkSize,
  sparseCholWorkSize,
  columnCountsWorkSize,
  fft2dWorkSize,
  irfftWorkSize,
  blockedMultiplyWorkSize,
  condWorkSize,
  validateWorkPtrSize,
  getWorkPtrRequirement
} from './utils/workPtrValidation'

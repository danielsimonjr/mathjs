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

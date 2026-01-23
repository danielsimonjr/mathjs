/**
 * THIS FILE IS AUTO-GENERATED
 * DON'T MAKE CHANGES HERE
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { config } from './configReadonly.js'
import {
  createBigNumberClass,
  createComplexClass,
  createE,
  createFalse,
  createFineStructure,
  createFractionClass,
  createI,
  createInfinity,
  createLN10,
  createLOG10E,
  createMatrixClass,
  createNaN,
  createNull,
  createPhi,
  createRangeClass,
  createResultSet,
  createSQRT1_2, // eslint-disable-line camelcase
  createSackurTetrode,
  createTau,
  createTrue,
  createVersion,
  createDenseMatrixClass,
  createEfimovFactor,
  createLN2,
  createPi,
  createReplacer,
  createSQRT2,
  createTyped,
  createWeakMixingAngle,
  createAbs,
  createAcos,
  createAcot,
  createAcsc,
  createAddScalar,
  createArg,
  createAsech,
  createAsinh,
  createAtan,
  createAtanh,
  createBigint,
  createBitNot,
  createBoolean,
  createClone,
  createCombinations,
  createComplex,
  createConj,
  createCos,
  createCot,
  createCsc,
  createCube,
  createEqualScalar,
  createErf,
  createExp,
  createExpm1,
  createFilter,
  createFlatten,
  createForEach,
  createFormat,
  createGetMatrixDataType,
  createHex,
  createIm,
  createIsBounded,
  createIsNaN,
  createIsNumeric,
  createIsPrime,
  createLOG2E,
  createLgamma,
  createLog10,
  createLog2,
  createMap,
  createMode,
  createMultiplyScalar,
  createNot,
  createNumber,
  createOct,
  createPickRandom,
  createPrint,
  createRandom,
  createRe,
  createSec,
  createSign,
  createSin,
  createSize,
  createSparseMatrixClass,
  createSplitUnit,
  createSquare,
  createString,
  createSubtractScalar,
  createTan,
  createToBest,
  createTypeOf,
  createAcosh,
  createAcsch,
  createAsec,
  createBignumber,
  createCombinationsWithRep,
  createCosh,
  createCsch,
  createDot,
  createHasNumericValue,
  createIsFinite,
  createIsNegative,
  createIsZero,
  createMatrix,
  createMatrixFromFunction,
  createMultiply,
  createOnes,
  createParseNumberWithConfig,
  createRandomInt,
  createResize,
  createSech,
  createSinh,
  createSparse,
  createSqrt,
  createSqueeze,
  createTanh,
  createTranspose,
  createXgcd,
  createZeros,
  createAcoth,
  createAsin,
  createBin,
  createCoth,
  createCtranspose,
  createDiag,
  createEqual,
  createFraction,
  createIdentity,
  createIsInteger,
  createKron,
  createMapSlices,
  createMatrixFromColumns,
  createNumeric,
  createProd,
  createReshape,
  createRound,
  createUnaryMinus,
  createBernoulli,
  createCbrt,
  createConcat,
  createCount,
  createDeepEqual,
  createDivideScalar,
  createDotMultiply,
  createFloor,
  createGcd,
  createIsPositive,
  createLarger,
  createLcm,
  createLeftShift,
  createLsolve,
  createMax,
  createMod,
  createNthRoot,
  createNullish,
  createOr,
  createQr,
  createRightArithShift,
  createSmaller,
  createSubtract,
  createTo,
  createUnaryPlus,
  createUsolve,
  createXor,
  createAdd,
  createAtan2,
  createBitAnd,
  createBitOr,
  createBitXor,
  createCatalan,
  createCompare,
  createCompareText,
  createComposition,
  createCross,
  createDet,
  createDiff,
  createDistance,
  createDotDivide,
  createEqualText,
  createFibonacciHeapClass,
  createHypot,
  createImmutableDenseMatrixClass,
  createIndexClass,
  createIntersect,
  createInvmod,
  createLargerEq,
  createLog,
  createLsolveAll,
  createMatrixFromRows,
  createMin,
  createNthRoots,
  createPartitionSelect,
  createRightLogShift,
  createSlu,
  createSpaClass,
  createSubset,
  createSum,
  createTrace,
  createUsolveAll,
  createZpk2tf,
  createCeil,
  createCompareNatural,
  createCumSum,
  createFix,
  createIndex,
  createInv,
  createLog1p,
  createLup,
  createPinv,
  createPow,
  createSetCartesian,
  createSetDistinct,
  createSetIsSubset,
  createSetPowerset,
  createSmallerEq,
  createSort,
  createSqrtm,
  createUnequal,
  createAnd,
  createDivide,
  createExpm,
  createFft,
  createFreqz,
  createGamma,
  createIfft,
  createKldivergence,
  createLusolve,
  createMean,
  createMedian,
  createPolynomialRoot,
  createQuantileSeq,
  createRange,
  createRow,
  createSetDifference,
  createSetMultiplicity,
  createSetSymDifference,
  createSolveODE,
  createUnitClass,
  createVacuumImpedance,
  createAtomicMass,
  createBohrMagneton,
  createBoltzmann,
  createColumn,
  createConductanceQuantum,
  createCoulomb,
  createCreateUnit,
  createDeuteronMass,
  createEigs,
  createElectronMass,
  createFactorial,
  createFermiCoupling,
  createGasConstant,
  createGravity,
  createKlitzing,
  createLoschmidt,
  createMad,
  createMagneticFluxQuantum,
  createMolarMass,
  createMolarPlanckConstant,
  createMultinomial,
  createNorm,
  createPermutations,
  createPlanckConstant,
  createPlanckMass,
  createPlanckTime,
  createReducedPlanckConstant,
  createRotationMatrix,
  createRydberg,
  createSecondRadiation,
  createSetSize,
  createSpeedOfLight,
  createStefanBoltzmann,
  createThomsonCrossSection,
  createVariance,
  createZeta,
  createAvogadro,
  createBohrRadius,
  createCorr,
  createDotPow,
  createElementaryCharge,
  createFaraday,
  createHartreeEnergy,
  createInverseConductanceQuantum,
  createMagneticConstant,
  createMolarMassC12,
  createNeutronMass,
  createPlanckCharge,
  createPlanckTemperature,
  createQuantumOfCirculation,
  createSetIntersect,
  createStd,
  createStirlingS2,
  createUnitFunction,
  createBellNumbers,
  createElectricConstant,
  createFirstRadiation,
  createNuclearMagneton,
  createPlanckLength,
  createRotate,
  createSetUnion,
  createWienDisplacement,
  createClassicalElectronRadius,
  createMolarVolume,
  createSchur,
  createCoulombConstant,
  createGravitationConstant,
  createProtonMass,
  createSylvester,
  createLyap
} from '../factoriesAny.js'

export const BigNumber: any = /* #__PURE__ */ createBigNumberClass({ config })
export const Complex: any = /* #__PURE__ */ createComplexClass({})
export const e: any = /* #__PURE__ */ createE({ BigNumber, config })
export const _false: any = /* #__PURE__ */ createFalse({})
export const fineStructure: any = /* #__PURE__ */ createFineStructure({
  BigNumber,
  config
})
export const Fraction: any = /* #__PURE__ */ createFractionClass({})
export const i: any = /* #__PURE__ */ createI({ Complex })
export const _Infinity: any = /* #__PURE__ */ createInfinity({
  BigNumber,
  config
})
export const LN10: any = /* #__PURE__ */ createLN10({ BigNumber, config })
export const LOG10E: any = /* #__PURE__ */ createLOG10E({ BigNumber, config })
export const Matrix: any = /* #__PURE__ */ createMatrixClass({})
export const _NaN: any = /* #__PURE__ */ createNaN({ BigNumber, config })
export const _null: any = /* #__PURE__ */ createNull({})
export const phi: any = /* #__PURE__ */ createPhi({ BigNumber, config })
export const Range: any = /* #__PURE__ */ createRangeClass({})
export const ResultSet: any = /* #__PURE__ */ createResultSet({})
export const SQRT1_2: any = /* #__PURE__ */ createSQRT1_2({ BigNumber, config })
export const sackurTetrode: any = /* #__PURE__ */ createSackurTetrode({
  BigNumber,
  config
})
export const tau: any = /* #__PURE__ */ createTau({ BigNumber, config })
export const _true: any = /* #__PURE__ */ createTrue({})
export const version: any = /* #__PURE__ */ createVersion({})
export const DenseMatrix: any = /* #__PURE__ */ createDenseMatrixClass({
  Matrix,
  config
})
export const efimovFactor: any = /* #__PURE__ */ createEfimovFactor({
  BigNumber,
  config
})
export const LN2: any = /* #__PURE__ */ createLN2({ BigNumber, config })
export const pi: any = /* #__PURE__ */ createPi({ BigNumber, config })
export const replacer: any = /* #__PURE__ */ createReplacer({})
export const SQRT2: any = /* #__PURE__ */ createSQRT2({ BigNumber, config })
export const typed: any = /* #__PURE__ */ createTyped({
  BigNumber,
  Complex,
  DenseMatrix,
  Fraction
})
export const weakMixingAngle: any = /* #__PURE__ */ createWeakMixingAngle({
  BigNumber,
  config
})
export const abs: any = /* #__PURE__ */ createAbs({ typed })
export const acos: any = /* #__PURE__ */ createAcos({ Complex, config, typed })
export const acot: any = /* #__PURE__ */ createAcot({ BigNumber, typed })
export const acsc: any = /* #__PURE__ */ createAcsc({
  BigNumber,
  Complex,
  config,
  typed
})
export const addScalar: any = /* #__PURE__ */ createAddScalar({ typed })
export const arg: any = /* #__PURE__ */ createArg({ typed })
export const asech: any = /* #__PURE__ */ createAsech({
  BigNumber,
  Complex,
  config,
  typed
})
export const asinh: any = /* #__PURE__ */ createAsinh({ typed })
export const atan: any = /* #__PURE__ */ createAtan({ typed })
export const atanh: any = /* #__PURE__ */ createAtanh({
  Complex,
  config,
  typed
})
export const bigint: any = /* #__PURE__ */ createBigint({ typed })
export const bitNot: any = /* #__PURE__ */ createBitNot({ typed })
export const boolean: any = /* #__PURE__ */ createBoolean({ typed })
export const clone: any = /* #__PURE__ */ createClone({ typed })
export const combinations: any = /* #__PURE__ */ createCombinations({ typed })
export const complex: any = /* #__PURE__ */ createComplex({ Complex, typed })
export const conj: any = /* #__PURE__ */ createConj({ typed })
export const cos: any = /* #__PURE__ */ createCos({ typed })
export const cot: any = /* #__PURE__ */ createCot({ BigNumber, typed })
export const csc: any = /* #__PURE__ */ createCsc({ BigNumber, typed })
export const cube: any = /* #__PURE__ */ createCube({ typed })
export const equalScalar: any = /* #__PURE__ */ createEqualScalar({
  config,
  typed
})
export const erf: any = /* #__PURE__ */ createErf({ typed })
export const exp: any = /* #__PURE__ */ createExp({ typed })
export const expm1: any = /* #__PURE__ */ createExpm1({ Complex, typed })
export const filter: any = /* #__PURE__ */ createFilter({ typed })
export const flatten: any = /* #__PURE__ */ createFlatten({ typed })
export const forEach: any = /* #__PURE__ */ createForEach({ typed })
export const format: any = /* #__PURE__ */ createFormat({ typed })
export const getMatrixDataType: any = /* #__PURE__ */ createGetMatrixDataType({
  typed
})
export const hex: any = /* #__PURE__ */ createHex({ format, typed })
export const im: any = /* #__PURE__ */ createIm({ typed })
export const isBounded: any = /* #__PURE__ */ createIsBounded({ typed })
export const isNaN: any = /* #__PURE__ */ createIsNaN({ typed })
export const isNumeric: any = /* #__PURE__ */ createIsNumeric({ typed })
export const isPrime: any = /* #__PURE__ */ createIsPrime({ typed })
export const LOG2E: any = /* #__PURE__ */ createLOG2E({ BigNumber, config })
export const lgamma: any = /* #__PURE__ */ createLgamma({ Complex, typed })
export const log10: any = /* #__PURE__ */ createLog10({
  Complex,
  config,
  typed
})
export const log2: any = /* #__PURE__ */ createLog2({ Complex, config, typed })
export const map: any = /* #__PURE__ */ createMap({ typed })
export const mode: any = /* #__PURE__ */ createMode({ isNaN, isNumeric, typed })
export const multiplyScalar: any = /* #__PURE__ */ createMultiplyScalar({
  typed
})
export const not: any = /* #__PURE__ */ createNot({ typed })
export const number: any = /* #__PURE__ */ createNumber({ typed })
export const oct: any = /* #__PURE__ */ createOct({ format, typed })
export const pickRandom: any = /* #__PURE__ */ createPickRandom({
  config,
  typed
})
export const print: any = /* #__PURE__ */ createPrint({ typed })
export const random: any = /* #__PURE__ */ createRandom({ config, typed })
export const re: any = /* #__PURE__ */ createRe({ typed })
export const sec: any = /* #__PURE__ */ createSec({ BigNumber, typed })
export const sign: any = /* #__PURE__ */ createSign({
  BigNumber,
  Fraction,
  complex,
  typed
})
export const sin: any = /* #__PURE__ */ createSin({ typed })
export const size: any = /* #__PURE__ */ createSize({ typed })
export const SparseMatrix: any = /* #__PURE__ */ createSparseMatrixClass({
  Matrix,
  equalScalar,
  typed
})
export const splitUnit: any = /* #__PURE__ */ createSplitUnit({ typed })
export const square: any = /* #__PURE__ */ createSquare({ typed })
export const string: any = /* #__PURE__ */ createString({ typed })
export const subtractScalar: any = /* #__PURE__ */ createSubtractScalar({
  typed
})
export const tan: any = /* #__PURE__ */ createTan({ typed })
export const toBest: any = /* #__PURE__ */ createToBest({ typed })
export const typeOf: any = /* #__PURE__ */ createTypeOf({ typed })
export const acosh: any = /* #__PURE__ */ createAcosh({
  Complex,
  config,
  typed
})
export const acsch: any = /* #__PURE__ */ createAcsch({ BigNumber, typed })
export const asec: any = /* #__PURE__ */ createAsec({
  BigNumber,
  Complex,
  config,
  typed
})
export const bignumber: any = /* #__PURE__ */ createBignumber({
  BigNumber,
  typed
})
export const combinationsWithRep: any =
  /* #__PURE__ */ createCombinationsWithRep({ typed })
export const cosh: any = /* #__PURE__ */ createCosh({ typed })
export const csch: any = /* #__PURE__ */ createCsch({ BigNumber, typed })
export const dot: any = /* #__PURE__ */ createDot({
  addScalar,
  conj,
  multiplyScalar,
  size,
  typed
})
export const hasNumericValue: any = /* #__PURE__ */ createHasNumericValue({
  isNumeric,
  typed
})
export const isFinite: any = /* #__PURE__ */ createIsFinite({
  isBounded,
  map,
  typed
})
export const isNegative: any = /* #__PURE__ */ createIsNegative({
  config,
  typed
})
export const isZero: any = /* #__PURE__ */ createIsZero({ equalScalar, typed })
export const matrix: any = /* #__PURE__ */ createMatrix({
  DenseMatrix,
  Matrix,
  SparseMatrix,
  typed
})
export const matrixFromFunction: any = /* #__PURE__ */ createMatrixFromFunction(
  { isZero, matrix, typed }
)
export const multiply: any = /* #__PURE__ */ createMultiply({
  addScalar,
  dot,
  equalScalar,
  matrix,
  multiplyScalar,
  typed
})
export const ones: any = /* #__PURE__ */ createOnes({
  BigNumber,
  config,
  matrix,
  typed
})
export const parseNumberWithConfig: any =
  /* #__PURE__ */ createParseNumberWithConfig({ bignumber, config })
export const randomInt: any = /* #__PURE__ */ createRandomInt({
  config,
  log2,
  typed
})
export const resize: any = /* #__PURE__ */ createResize({ config, matrix })
export const sech: any = /* #__PURE__ */ createSech({ BigNumber, typed })
export const sinh: any = /* #__PURE__ */ createSinh({ typed })
export const sparse: any = /* #__PURE__ */ createSparse({ SparseMatrix, typed })
export const sqrt: any = /* #__PURE__ */ createSqrt({ Complex, config, typed })
export const squeeze: any = /* #__PURE__ */ createSqueeze({ typed })
export const tanh: any = /* #__PURE__ */ createTanh({ typed })
export const transpose: any = /* #__PURE__ */ createTranspose({ matrix, typed })
export const xgcd: any = /* #__PURE__ */ createXgcd({
  BigNumber,
  config,
  matrix,
  typed
})
export const zeros: any = /* #__PURE__ */ createZeros({
  BigNumber,
  config,
  matrix,
  typed
})
export const acoth: any = /* #__PURE__ */ createAcoth({
  BigNumber,
  Complex,
  config,
  typed
})
export const asin: any = /* #__PURE__ */ createAsin({ Complex, config, typed })
export const bin: any = /* #__PURE__ */ createBin({ format, typed })
export const coth: any = /* #__PURE__ */ createCoth({ BigNumber, typed })
export const ctranspose: any = /* #__PURE__ */ createCtranspose({
  conj,
  transpose,
  typed
})
export const diag: any = /* #__PURE__ */ createDiag({
  DenseMatrix,
  SparseMatrix,
  matrix,
  typed
})
export const equal: any = /* #__PURE__ */ createEqual({
  DenseMatrix,
  SparseMatrix,
  equalScalar,
  matrix,
  typed
})
export const fraction: any = /* #__PURE__ */ createFraction({ Fraction, typed })
export const identity: any = /* #__PURE__ */ createIdentity({
  BigNumber,
  DenseMatrix,
  SparseMatrix,
  config,
  matrix,
  typed
})
export const isInteger: any = /* #__PURE__ */ createIsInteger({ equal, typed })
export const kron: any = /* #__PURE__ */ createKron({
  matrix,
  multiplyScalar,
  typed
})
export const mapSlices: any = /* #__PURE__ */ createMapSlices({
  isInteger,
  typed
})
export const apply: any = mapSlices
export const matrixFromColumns: any = /* #__PURE__ */ createMatrixFromColumns({
  flatten,
  matrix,
  size,
  typed
})
export const numeric: any = /* #__PURE__ */ createNumeric({
  bignumber,
  fraction,
  number
})
export const prod: any = /* #__PURE__ */ createProd({
  config,
  multiplyScalar,
  numeric,
  parseNumberWithConfig,
  typed
})
export const reshape: any = /* #__PURE__ */ createReshape({
  isInteger,
  matrix,
  typed
})
export const round: any = /* #__PURE__ */ createRound({
  BigNumber,
  DenseMatrix,
  config,
  equalScalar,
  matrix,
  typed,
  zeros
})
export const unaryMinus: any = /* #__PURE__ */ createUnaryMinus({
  bignumber,
  config,
  typed
})
export const bernoulli: any = /* #__PURE__ */ createBernoulli({
  BigNumber,
  Fraction,
  config,
  isInteger,
  number,
  typed
})
export const cbrt: any = /* #__PURE__ */ createCbrt({
  BigNumber,
  Complex,
  Fraction,
  config,
  isNegative,
  matrix,
  typed,
  unaryMinus
})
export const concat: any = /* #__PURE__ */ createConcat({
  isInteger,
  matrix,
  typed
})
export const count: any = /* #__PURE__ */ createCount({ prod, size, typed })
export const deepEqual: any = /* #__PURE__ */ createDeepEqual({ equal, typed })
export const divideScalar: any = /* #__PURE__ */ createDivideScalar({
  numeric,
  typed
})
export const dotMultiply: any = /* #__PURE__ */ createDotMultiply({
  concat,
  equalScalar,
  matrix,
  multiplyScalar,
  typed
})
export const floor: any = /* #__PURE__ */ createFloor({
  DenseMatrix,
  config,
  equalScalar,
  matrix,
  round,
  typed,
  zeros
})
export const gcd: any = /* #__PURE__ */ createGcd({
  BigNumber,
  DenseMatrix,
  concat,
  config,
  equalScalar,
  matrix,
  round,
  typed,
  zeros
})
export const isPositive: any = /* #__PURE__ */ createIsPositive({
  config,
  typed
})
export const larger: any = /* #__PURE__ */ createLarger({
  DenseMatrix,
  SparseMatrix,
  bignumber,
  concat,
  config,
  matrix,
  typed
})
export const lcm: any = /* #__PURE__ */ createLcm({
  concat,
  equalScalar,
  matrix,
  typed
})
export const leftShift: any = /* #__PURE__ */ createLeftShift({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed,
  zeros
})
export const lsolve: any = /* #__PURE__ */ createLsolve({
  DenseMatrix,
  divideScalar,
  equalScalar,
  matrix,
  multiplyScalar,
  subtractScalar,
  typed
})
export const max: any = /* #__PURE__ */ createMax({
  config,
  isNaN,
  larger,
  numeric,
  typed
})
export const mod: any = /* #__PURE__ */ createMod({
  DenseMatrix,
  concat,
  config,
  equalScalar,
  matrix,
  round,
  typed,
  zeros
})
export const nthRoot: any = /* #__PURE__ */ createNthRoot({
  BigNumber,
  concat,
  equalScalar,
  matrix,
  typed
})
export const nullish: any = /* #__PURE__ */ createNullish({
  deepEqual,
  flatten,
  matrix,
  size,
  typed
})
export const or: any = /* #__PURE__ */ createOr({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed
})
export const qr: any = /* #__PURE__ */ createQr({
  addScalar,
  complex,
  conj,
  divideScalar,
  equal,
  identity,
  isZero,
  matrix,
  multiplyScalar,
  sign,
  sqrt,
  subtractScalar,
  typed,
  unaryMinus,
  zeros
})
export const rightArithShift: any = /* #__PURE__ */ createRightArithShift({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed,
  zeros
})
export const smaller: any = /* #__PURE__ */ createSmaller({
  DenseMatrix,
  SparseMatrix,
  bignumber,
  concat,
  config,
  matrix,
  typed
})
export const subtract: any = /* #__PURE__ */ createSubtract({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  subtractScalar,
  typed,
  unaryMinus
})
export const to: any = /* #__PURE__ */ createTo({ concat, matrix, typed })
export const unaryPlus: any = /* #__PURE__ */ createUnaryPlus({
  config,
  numeric,
  typed
})
export const usolve: any = /* #__PURE__ */ createUsolve({
  DenseMatrix,
  divideScalar,
  equalScalar,
  matrix,
  multiplyScalar,
  subtractScalar,
  typed
})
export const xor: any = /* #__PURE__ */ createXor({
  DenseMatrix,
  SparseMatrix,
  concat,
  matrix,
  typed
})
export const add: any = /* #__PURE__ */ createAdd({
  DenseMatrix,
  SparseMatrix,
  addScalar,
  concat,
  equalScalar,
  matrix,
  typed
})
export const atan2: any = /* #__PURE__ */ createAtan2({
  BigNumber,
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed
})
export const bitAnd: any = /* #__PURE__ */ createBitAnd({
  concat,
  equalScalar,
  matrix,
  typed
})
export const bitOr: any = /* #__PURE__ */ createBitOr({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed
})
export const bitXor: any = /* #__PURE__ */ createBitXor({
  DenseMatrix,
  SparseMatrix,
  concat,
  matrix,
  typed
})
export const catalan: any = /* #__PURE__ */ createCatalan({
  addScalar,
  combinations,
  divideScalar,
  isInteger,
  isNegative,
  multiplyScalar,
  typed
})
export const compare: any = /* #__PURE__ */ createCompare({
  BigNumber,
  DenseMatrix,
  Fraction,
  concat,
  config,
  equalScalar,
  matrix,
  typed
})
export const compareText: any = /* #__PURE__ */ createCompareText({
  concat,
  matrix,
  typed
})
export const composition: any = /* #__PURE__ */ createComposition({
  addScalar,
  combinations,
  isInteger,
  isNegative,
  isPositive,
  larger,
  typed
})
export const cross: any = /* #__PURE__ */ createCross({
  matrix,
  multiply,
  subtract,
  typed
})
export const det: any = /* #__PURE__ */ createDet({
  divideScalar,
  isZero,
  matrix,
  multiply,
  subtractScalar,
  typed,
  unaryMinus
})
export const diff: any = /* #__PURE__ */ createDiff({
  matrix,
  number,
  subtract,
  typed
})
export const distance: any = /* #__PURE__ */ createDistance({
  abs,
  addScalar,
  deepEqual,
  divideScalar,
  multiplyScalar,
  sqrt,
  subtractScalar,
  typed
})
export const dotDivide: any = /* #__PURE__ */ createDotDivide({
  DenseMatrix,
  SparseMatrix,
  concat,
  divideScalar,
  equalScalar,
  matrix,
  typed
})
export const equalText: any = /* #__PURE__ */ createEqualText({
  compareText,
  isZero,
  typed
})
export const FibonacciHeap: any = /* #__PURE__ */ createFibonacciHeapClass({
  larger,
  smaller
})
export const hypot: any = /* #__PURE__ */ createHypot({
  abs,
  addScalar,
  divideScalar,
  isPositive,
  multiplyScalar,
  smaller,
  sqrt,
  typed
})
export const ImmutableDenseMatrix: any =
  /* #__PURE__ */ createImmutableDenseMatrixClass({ DenseMatrix, smaller })
export const Index: any = /* #__PURE__ */ createIndexClass({
  ImmutableDenseMatrix,
  getMatrixDataType
})
export const intersect: any = /* #__PURE__ */ createIntersect({
  abs,
  add,
  addScalar,
  config,
  divideScalar,
  equalScalar,
  flatten,
  isNumeric,
  isZero,
  matrix,
  multiply,
  multiplyScalar,
  smaller,
  subtract,
  typed
})
export const invmod: any = /* #__PURE__ */ createInvmod({
  BigNumber,
  add,
  config,
  equal,
  isInteger,
  mod,
  smaller,
  typed,
  xgcd
})
export const largerEq: any = /* #__PURE__ */ createLargerEq({
  DenseMatrix,
  SparseMatrix,
  concat,
  config,
  matrix,
  typed
})
export const log: any = /* #__PURE__ */ createLog({
  Complex,
  config,
  divideScalar,
  typeOf,
  typed
})
export const lsolveAll: any = /* #__PURE__ */ createLsolveAll({
  DenseMatrix,
  divideScalar,
  equalScalar,
  matrix,
  multiplyScalar,
  subtractScalar,
  typed
})
export const matrixFromRows: any = /* #__PURE__ */ createMatrixFromRows({
  flatten,
  matrix,
  size,
  typed
})
export const min: any = /* #__PURE__ */ createMin({
  config,
  isNaN,
  numeric,
  smaller,
  typed
})
export const nthRoots: any = /* #__PURE__ */ createNthRoots({
  Complex,
  config,
  divideScalar,
  typed
})
export const partitionSelect: any = /* #__PURE__ */ createPartitionSelect({
  compare,
  isNaN,
  isNumeric,
  typed
})
export const rightLogShift: any = /* #__PURE__ */ createRightLogShift({
  DenseMatrix,
  concat,
  equalScalar,
  matrix,
  typed,
  zeros
})
export const slu: any = /* #__PURE__ */ createSlu({
  SparseMatrix,
  abs,
  add,
  divideScalar,
  larger,
  largerEq,
  multiply,
  subtract,
  transpose,
  typed
})
export const Spa: any = /* #__PURE__ */ createSpaClass({
  FibonacciHeap,
  addScalar,
  equalScalar
})
export const subset: any = /* #__PURE__ */ createSubset({
  add,
  matrix,
  typed,
  zeros
})
export const sum: any = /* #__PURE__ */ createSum({
  add,
  config,
  numeric,
  parseNumberWithConfig,
  typed
})
export const trace: any = /* #__PURE__ */ createTrace({ add, matrix, typed })
export const usolveAll: any = /* #__PURE__ */ createUsolveAll({
  DenseMatrix,
  divideScalar,
  equalScalar,
  matrix,
  multiplyScalar,
  subtractScalar,
  typed
})
export const zpk2tf: any = /* #__PURE__ */ createZpk2tf({
  Complex,
  add,
  multiply,
  number,
  typed
})
export const ceil: any = /* #__PURE__ */ createCeil({
  DenseMatrix,
  config,
  equalScalar,
  matrix,
  round,
  typed,
  zeros
})
export const compareNatural: any = /* #__PURE__ */ createCompareNatural({
  compare,
  typed
})
export const cumsum: any = /* #__PURE__ */ createCumSum({
  add,
  typed,
  unaryPlus
})
export const fix: any = /* #__PURE__ */ createFix({
  Complex,
  DenseMatrix,
  ceil,
  equalScalar,
  floor,
  matrix,
  typed,
  zeros
})
export const index: any = /* #__PURE__ */ createIndex({ Index, typed })
export const inv: any = /* #__PURE__ */ createInv({
  abs,
  addScalar,
  det,
  divideScalar,
  identity,
  matrix,
  multiply,
  typed,
  unaryMinus
})
export const log1p: any = /* #__PURE__ */ createLog1p({
  Complex,
  config,
  divideScalar,
  log,
  typed
})
export const lup: any = /* #__PURE__ */ createLup({
  DenseMatrix,
  Spa,
  SparseMatrix,
  abs,
  addScalar,
  divideScalar,
  equalScalar,
  larger,
  matrix,
  multiplyScalar,
  subtractScalar,
  typed,
  unaryMinus
})
export const pinv: any = /* #__PURE__ */ createPinv({
  Complex,
  add,
  ctranspose,
  deepEqual,
  divideScalar,
  dot,
  dotDivide,
  equal,
  inv,
  matrix,
  multiply,
  typed
})
export const pow: any = /* #__PURE__ */ createPow({
  Complex,
  config,
  fraction,
  identity,
  inv,
  matrix,
  multiply,
  number,
  typed
})
export const setCartesian: any = /* #__PURE__ */ createSetCartesian({
  DenseMatrix,
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const setDistinct: any = /* #__PURE__ */ createSetDistinct({
  DenseMatrix,
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const setIsSubset: any = /* #__PURE__ */ createSetIsSubset({
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const setPowerset: any = /* #__PURE__ */ createSetPowerset({
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const smallerEq: any = /* #__PURE__ */ createSmallerEq({
  DenseMatrix,
  SparseMatrix,
  concat,
  config,
  matrix,
  typed
})
export const sort: any = /* #__PURE__ */ createSort({
  compare,
  compareNatural,
  matrix,
  typed
})
export const sqrtm: any = /* #__PURE__ */ createSqrtm({
  abs,
  add,
  identity,
  inv,
  map,
  max,
  multiply,
  size,
  sqrt,
  subtract,
  typed
})
export const unequal: any = /* #__PURE__ */ createUnequal({
  DenseMatrix,
  SparseMatrix,
  concat,
  config,
  equalScalar,
  matrix,
  typed
})
export const and: any = /* #__PURE__ */ createAnd({
  concat,
  equalScalar,
  matrix,
  not,
  typed,
  zeros
})
export const divide: any = /* #__PURE__ */ createDivide({
  divideScalar,
  equalScalar,
  inv,
  matrix,
  multiply,
  typed
})
export const expm: any = /* #__PURE__ */ createExpm({
  abs,
  add,
  identity,
  inv,
  multiply,
  typed
})
export const fft: any = /* #__PURE__ */ createFft({
  addScalar,
  ceil,
  conj,
  divideScalar,
  dotDivide,
  exp,
  i,
  log2,
  matrix,
  multiplyScalar,
  pow,
  tau,
  typed
})
export const freqz: any = /* #__PURE__ */ createFreqz({
  Complex,
  add,
  divide,
  matrix,
  multiply,
  typed
})
export const gamma: any = /* #__PURE__ */ createGamma({
  BigNumber,
  Complex,
  config,
  multiplyScalar,
  pow,
  typed
})
export const ifft: any = /* #__PURE__ */ createIfft({
  conj,
  dotDivide,
  fft,
  typed
})
export const kldivergence: any = /* #__PURE__ */ createKldivergence({
  divide,
  dotDivide,
  isNumeric,
  log,
  map,
  matrix,
  multiply,
  sum,
  typed
})
export const lusolve: any = /* #__PURE__ */ createLusolve({
  DenseMatrix,
  lsolve,
  lup,
  matrix,
  slu,
  typed,
  usolve
})
export const mean: any = /* #__PURE__ */ createMean({ add, divide, typed })
export const median: any = /* #__PURE__ */ createMedian({
  add,
  compare,
  divide,
  partitionSelect,
  typed
})
export const polynomialRoot: any = /* #__PURE__ */ createPolynomialRoot({
  add,
  cbrt,
  divide,
  equalScalar,
  im,
  isZero,
  multiply,
  re,
  sqrt,
  subtract,
  typeOf,
  typed,
  unaryMinus
})
export const quantileSeq: any = /* #__PURE__ */ createQuantileSeq({
  bignumber,
  add,
  compare,
  divide,
  isInteger,
  larger,
  mapSlices,
  multiply,
  partitionSelect,
  smaller,
  smallerEq,
  subtract,
  typed
})
export const range: any = /* #__PURE__ */ createRange({
  bignumber,
  matrix,
  add,
  config,
  equal,
  isPositive,
  isZero,
  larger,
  largerEq,
  smaller,
  smallerEq,
  typed
})
export const row: any = /* #__PURE__ */ createRow({
  Index,
  matrix,
  range,
  typed
})
export const setDifference: any = /* #__PURE__ */ createSetDifference({
  DenseMatrix,
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const setMultiplicity: any = /* #__PURE__ */ createSetMultiplicity({
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const setSymDifference: any = /* #__PURE__ */ createSetSymDifference({
  Index,
  concat,
  setDifference,
  size,
  subset,
  typed
})
export const solveODE: any = /* #__PURE__ */ createSolveODE({
  abs,
  add,
  bignumber,
  divide,
  isNegative,
  isPositive,
  larger,
  map,
  matrix,
  max,
  multiply,
  smaller,
  subtract,
  typed,
  unaryMinus
})
export const Unit: any = /* #__PURE__ */ createUnitClass({
  BigNumber,
  Complex,
  Fraction,
  abs,
  addScalar,
  config,
  divideScalar,
  equal,
  fix,
  format,
  isNumeric,
  multiplyScalar,
  number,
  pow,
  round,
  subtractScalar
})
export const vacuumImpedance: any = /* #__PURE__ */ createVacuumImpedance({
  BigNumber,
  Unit,
  config
})
export const atomicMass: any = /* #__PURE__ */ createAtomicMass({
  BigNumber,
  Unit,
  config
})
export const bohrMagneton: any = /* #__PURE__ */ createBohrMagneton({
  BigNumber,
  Unit,
  config
})
export const boltzmann: any = /* #__PURE__ */ createBoltzmann({
  BigNumber,
  Unit,
  config
})
export const column: any = /* #__PURE__ */ createColumn({
  Index,
  matrix,
  range,
  typed
})
export const conductanceQuantum: any = /* #__PURE__ */ createConductanceQuantum(
  { BigNumber, Unit, config }
)
export const coulomb: any = /* #__PURE__ */ createCoulomb({
  BigNumber,
  Unit,
  config
})
export const createUnit: any = /* #__PURE__ */ createCreateUnit({ Unit, typed })
export const deuteronMass: any = /* #__PURE__ */ createDeuteronMass({
  BigNumber,
  Unit,
  config
})
export const eigs: any = /* #__PURE__ */ createEigs({
  abs,
  add,
  addScalar,
  atan,
  bignumber,
  column,
  complex,
  config,
  cos,
  diag,
  divideScalar,
  dot,
  equal,
  flatten,
  im,
  inv,
  larger,
  matrix,
  matrixFromColumns,
  multiply,
  multiplyScalar,
  number,
  qr,
  re,
  reshape,
  sin,
  size,
  smaller,
  sqrt,
  subtract,
  typed,
  usolve,
  usolveAll
})
export const electronMass: any = /* #__PURE__ */ createElectronMass({
  BigNumber,
  Unit,
  config
})
export const factorial: any = /* #__PURE__ */ createFactorial({ gamma, typed })
export const fermiCoupling: any = /* #__PURE__ */ createFermiCoupling({
  BigNumber,
  Unit,
  config
})
export const gasConstant: any = /* #__PURE__ */ createGasConstant({
  BigNumber,
  Unit,
  config
})
export const gravity: any = /* #__PURE__ */ createGravity({
  BigNumber,
  Unit,
  config
})
export const klitzing: any = /* #__PURE__ */ createKlitzing({
  BigNumber,
  Unit,
  config
})
export const loschmidt: any = /* #__PURE__ */ createLoschmidt({
  BigNumber,
  Unit,
  config
})
export const mad: any = /* #__PURE__ */ createMad({
  abs,
  map,
  median,
  subtract,
  typed
})
export const magneticFluxQuantum: any =
  /* #__PURE__ */ createMagneticFluxQuantum({ BigNumber, Unit, config })
export const molarMass: any = /* #__PURE__ */ createMolarMass({
  BigNumber,
  Unit,
  config
})
export const molarPlanckConstant: any =
  /* #__PURE__ */ createMolarPlanckConstant({ BigNumber, Unit, config })
export const multinomial: any = /* #__PURE__ */ createMultinomial({
  add,
  divide,
  factorial,
  isInteger,
  isPositive,
  multiply,
  typed
})
export const norm: any = /* #__PURE__ */ createNorm({
  abs,
  add,
  conj,
  ctranspose,
  eigs,
  equalScalar,
  larger,
  matrix,
  multiply,
  pow,
  smaller,
  sqrt,
  typed
})
export const permutations: any = /* #__PURE__ */ createPermutations({
  factorial,
  typed
})
export const planckConstant: any = /* #__PURE__ */ createPlanckConstant({
  BigNumber,
  Unit,
  config
})
export const planckMass: any = /* #__PURE__ */ createPlanckMass({
  BigNumber,
  Unit,
  config
})
export const planckTime: any = /* #__PURE__ */ createPlanckTime({
  BigNumber,
  Unit,
  config
})
export const reducedPlanckConstant: any =
  /* #__PURE__ */ createReducedPlanckConstant({ BigNumber, Unit, config })
export const rotationMatrix: any = /* #__PURE__ */ createRotationMatrix({
  BigNumber,
  DenseMatrix,
  SparseMatrix,
  addScalar,
  config,
  cos,
  matrix,
  multiplyScalar,
  norm,
  sin,
  typed,
  unaryMinus
})
export const rydberg: any = /* #__PURE__ */ createRydberg({
  BigNumber,
  Unit,
  config
})
export const secondRadiation: any = /* #__PURE__ */ createSecondRadiation({
  BigNumber,
  Unit,
  config
})
export const setSize: any = /* #__PURE__ */ createSetSize({
  compareNatural,
  typed
})
export const speedOfLight: any = /* #__PURE__ */ createSpeedOfLight({
  BigNumber,
  Unit,
  config
})
export const stefanBoltzmann: any = /* #__PURE__ */ createStefanBoltzmann({
  BigNumber,
  Unit,
  config
})
export const thomsonCrossSection: any =
  /* #__PURE__ */ createThomsonCrossSection({ BigNumber, Unit, config })
export const variance: any = /* #__PURE__ */ createVariance({
  add,
  divide,
  isNaN,
  mapSlices,
  multiply,
  subtract,
  typed
})
export const zeta: any = /* #__PURE__ */ createZeta({
  BigNumber,
  Complex,
  add,
  config,
  divide,
  equal,
  factorial,
  gamma,
  isBounded,
  isNegative,
  multiply,
  pi,
  pow,
  sin,
  smallerEq,
  subtract,
  typed
})
export const avogadro: any = /* #__PURE__ */ createAvogadro({
  BigNumber,
  Unit,
  config
})
export const bohrRadius: any = /* #__PURE__ */ createBohrRadius({
  BigNumber,
  Unit,
  config
})
export const corr: any = /* #__PURE__ */ createCorr({
  add,
  divide,
  matrix,
  mean,
  multiply,
  pow,
  sqrt,
  subtract,
  sum,
  typed
})
export const dotPow: any = /* #__PURE__ */ createDotPow({
  DenseMatrix,
  SparseMatrix,
  concat,
  equalScalar,
  matrix,
  pow,
  typed
})
export const elementaryCharge: any = /* #__PURE__ */ createElementaryCharge({
  BigNumber,
  Unit,
  config
})
export const faraday: any = /* #__PURE__ */ createFaraday({
  BigNumber,
  Unit,
  config
})
export const hartreeEnergy: any = /* #__PURE__ */ createHartreeEnergy({
  BigNumber,
  Unit,
  config
})
export const inverseConductanceQuantum: any =
  /* #__PURE__ */ createInverseConductanceQuantum({ BigNumber, Unit, config })
export const magneticConstant: any = /* #__PURE__ */ createMagneticConstant({
  BigNumber,
  Unit,
  config
})
export const molarMassC12: any = /* #__PURE__ */ createMolarMassC12({
  BigNumber,
  Unit,
  config
})
export const neutronMass: any = /* #__PURE__ */ createNeutronMass({
  BigNumber,
  Unit,
  config
})
export const planckCharge: any = /* #__PURE__ */ createPlanckCharge({
  BigNumber,
  Unit,
  config
})
export const planckTemperature: any = /* #__PURE__ */ createPlanckTemperature({
  BigNumber,
  Unit,
  config
})
export const quantumOfCirculation: any =
  /* #__PURE__ */ createQuantumOfCirculation({ BigNumber, Unit, config })
export const setIntersect: any = /* #__PURE__ */ createSetIntersect({
  DenseMatrix,
  Index,
  compareNatural,
  size,
  subset,
  typed
})
export const std: any = /* #__PURE__ */ createStd({
  map,
  sqrt,
  typed,
  variance
})
export const stirlingS2: any = /* #__PURE__ */ createStirlingS2({
  bignumber,
  addScalar,
  combinations,
  divideScalar,
  factorial,
  isInteger,
  isNegative,
  larger,
  multiplyScalar,
  number,
  pow,
  subtractScalar,
  typed
})
export const unit: any = /* #__PURE__ */ createUnitFunction({ Unit, typed })
export const bellNumbers: any = /* #__PURE__ */ createBellNumbers({
  addScalar,
  isInteger,
  isNegative,
  stirlingS2,
  typed
})
export const electricConstant: any = /* #__PURE__ */ createElectricConstant({
  BigNumber,
  Unit,
  config
})
export const firstRadiation: any = /* #__PURE__ */ createFirstRadiation({
  BigNumber,
  Unit,
  config
})
export const nuclearMagneton: any = /* #__PURE__ */ createNuclearMagneton({
  BigNumber,
  Unit,
  config
})
export const planckLength: any = /* #__PURE__ */ createPlanckLength({
  BigNumber,
  Unit,
  config
})
export const rotate: any = /* #__PURE__ */ createRotate({
  multiply,
  rotationMatrix,
  typed
})
export const setUnion: any = /* #__PURE__ */ createSetUnion({
  Index,
  concat,
  setIntersect,
  setSymDifference,
  size,
  subset,
  typed
})
export const wienDisplacement: any = /* #__PURE__ */ createWienDisplacement({
  BigNumber,
  Unit,
  config
})
export const classicalElectronRadius: any =
  /* #__PURE__ */ createClassicalElectronRadius({ BigNumber, Unit, config })
export const molarVolume: any = /* #__PURE__ */ createMolarVolume({
  BigNumber,
  Unit,
  config
})
export const schur: any = /* #__PURE__ */ createSchur({
  identity,
  matrix,
  multiply,
  norm,
  qr,
  subtract,
  typed
})
export const coulombConstant: any = /* #__PURE__ */ createCoulombConstant({
  BigNumber,
  Unit,
  config
})
export const gravitationConstant: any =
  /* #__PURE__ */ createGravitationConstant({ BigNumber, Unit, config })
export const protonMass: any = /* #__PURE__ */ createProtonMass({
  BigNumber,
  Unit,
  config
})
export const sylvester: any = /* #__PURE__ */ createSylvester({
  abs,
  add,
  concat,
  identity,
  index,
  lusolve,
  matrix,
  matrixFromColumns,
  multiply,
  range,
  schur,
  subset,
  subtract,
  transpose,
  typed
})
export const lyap: any = /* #__PURE__ */ createLyap({
  matrix,
  multiply,
  sylvester,
  transpose,
  typed
})

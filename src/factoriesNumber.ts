import {
  absNumber,
  acoshNumber,
  acosNumber,
  acothNumber,
  acotNumber,
  acschNumber,
  acscNumber,
  addNumber,
  andNumber,
  asechNumber,
  asecNumber,
  asinhNumber,
  asinNumber,
  atan2Number,
  atanhNumber,
  atanNumber,
  bitAndNumber,
  bitNotNumber,
  bitOrNumber,
  bitXorNumber,
  cbrtNumber,
  combinationsNumber,
  coshNumber,
  cosNumber,
  cothNumber,
  cotNumber,
  cschNumber,
  cscNumber,
  cubeNumber,
  divideNumber,
  expm1Number,
  expNumber,
  gammaNumber,
  gcdNumber,
  isIntegerNumber,
  isNaNNumber,
  isNegativeNumber,
  isPositiveNumber,
  isZeroNumber,
  lcmNumber,
  leftShiftNumber,
  lgammaNumber,
  log10Number,
  log1pNumber,
  log2Number,
  logNumber,
  modNumber,
  multiplyNumber,
  normNumber,
  notNumber,
  nthRootNumber,
  orNumber,
  powNumber,
  rightArithShiftNumber,
  rightLogShiftNumber,
  roundNumber,
  sechNumber,
  secNumber,
  signNumber,
  sinhNumber,
  sinNumber,
  sqrtNumber,
  squareNumber,
  subtractNumber,
  tanhNumber,
  tanNumber,
  unaryMinusNumber,
  unaryPlusNumber,
  xgcdNumber,
  xorNumber
} from './plain/number/index.ts'

import { factory } from './utils/factory.ts'
import { noIndex, noMatrix, noSubset } from './utils/noop.ts'
import type { TypedFunction } from './core/function/typed.ts'

// ----------------------------------------------------------------------------
// classes and functions

// core
export { createTyped } from './core/function/typed.ts'

// classes
export { createResultSet } from './type/resultset/ResultSet.ts'
export { createRangeClass } from './type/matrix/Range.ts'
export { createHelpClass } from './expression/Help.ts'
export { createChainClass } from './type/chain/Chain.ts'
export { createHelp } from './expression/function/help.ts'
export { createChain } from './type/chain/function/chain.ts'

// algebra
export { createResolve } from './function/algebra/resolve.ts'
export { createSimplify } from './function/algebra/simplify.ts'
export { createSimplifyConstant } from './function/algebra/simplifyConstant.ts'
export { createSimplifyCore } from './function/algebra/simplifyCore.ts'
export { createDerivative } from './function/algebra/derivative.ts'
export { createRationalize } from './function/algebra/rationalize.ts'

// arithmetic
export const createUnaryMinus = /* #__PURE__ */ createNumberFactory(
  'unaryMinus',
  unaryMinusNumber
)
export const createUnaryPlus = /* #__PURE__ */ createNumberFactory(
  'unaryPlus',
  unaryPlusNumber
)
export const createAbs = /* #__PURE__ */ createNumberFactory('abs', absNumber)
export const createAddScalar = /* #__PURE__ */ createNumberFactory(
  'addScalar',
  addNumber
)
export const createSubtractScalar = /* #__PURE__ */ createNumberFactory(
  'subtractScalar',
  subtractNumber
)
export const createCbrt = /* #__PURE__ */ createNumberFactory(
  'cbrt',
  cbrtNumber
)
export { createCeilNumber as createCeil } from './function/arithmetic/ceil.ts'
export const createCube = /* #__PURE__ */ createNumberFactory(
  'cube',
  cubeNumber
)
export const createExp = /* #__PURE__ */ createNumberFactory('exp', expNumber)
export const createExpm1 = /* #__PURE__ */ createNumberFactory(
  'expm1',
  expm1Number
)
export { createFixNumber as createFix } from './function/arithmetic/fix.ts'
export { createFloorNumber as createFloor } from './function/arithmetic/floor.ts'
export const createGcd = /* #__PURE__ */ createNumberFactory('gcd', gcdNumber)
export const createLcm = /* #__PURE__ */ createNumberFactory('lcm', lcmNumber)
export const createLog10 = /* #__PURE__ */ createNumberFactory(
  'log10',
  log10Number
)
export const createLog2 = /* #__PURE__ */ createNumberFactory(
  'log2',
  log2Number
)
export const createMod = /* #__PURE__ */ createNumberFactory('mod', modNumber)
export const createMultiplyScalar = /* #__PURE__ */ createNumberFactory(
  'multiplyScalar',
  multiplyNumber
)
export const createMultiply = /* #__PURE__ */ createNumberFactory(
  'multiply',
  multiplyNumber
)
export const createNthRoot =
  /* #__PURE__ */
  createNumberOptionalSecondArgFactory('nthRoot', nthRootNumber)
export const createSign = /* #__PURE__ */ createNumberFactory(
  'sign',
  signNumber
)
export const createSqrt = /* #__PURE__ */ createNumberFactory(
  'sqrt',
  sqrtNumber
)
export const createSquare = /* #__PURE__ */ createNumberFactory(
  'square',
  squareNumber
)
export const createSubtract = /* #__PURE__ */ createNumberFactory(
  'subtract',
  subtractNumber
)
export const createXgcd = /* #__PURE__ */ createNumberFactory(
  'xgcd',
  xgcdNumber
)
export const createDivideScalar = /* #__PURE__ */ createNumberFactory(
  'divideScalar',
  divideNumber
)
export const createPow = /* #__PURE__ */ createNumberFactory('pow', powNumber)
export const createRound =
  /* #__PURE__ */
  createNumberOptionalSecondArgFactory('round', roundNumber)
export const createLog =
  /* #__PURE__ */
  createNumberOptionalSecondArgFactory('log', logNumber)
export const createLog1p = /* #__PURE__ */ createNumberFactory(
  'log1p',
  log1pNumber
)
export const createAdd = /* #__PURE__ */ createNumberFactory('add', addNumber)
export { createHypot } from './function/arithmetic/hypot.ts'
export const createNorm = /* #__PURE__ */ createNumberFactory(
  'norm',
  normNumber
)
export const createDivide = /* #__PURE__ */ createNumberFactory(
  'divide',
  divideNumber
)

// bitwise
export const createBitAnd = /* #__PURE__ */ createNumberFactory(
  'bitAnd',
  bitAndNumber
)
export const createBitNot = /* #__PURE__ */ createNumberFactory(
  'bitNot',
  bitNotNumber
)
export const createBitOr = /* #__PURE__ */ createNumberFactory(
  'bitOr',
  bitOrNumber
)
export const createBitXor = /* #__PURE__ */ createNumberFactory(
  'bitXor',
  bitXorNumber
)
export const createLeftShift = /* #__PURE__ */ createNumberFactory(
  'leftShift',
  leftShiftNumber
)
export const createRightArithShift = /* #__PURE__ */ createNumberFactory(
  'rightArithShift',
  rightArithShiftNumber
)
export const createRightLogShift = /* #__PURE__ */ createNumberFactory(
  'rightLogShift',
  rightLogShiftNumber
)

// combinatorics
export { createStirlingS2 } from './function/combinatorics/stirlingS2.ts'
export { createBellNumbers } from './function/combinatorics/bellNumbers.ts'
export { createCatalan } from './function/combinatorics/catalan.ts'
export { createComposition } from './function/combinatorics/composition.ts'

// constants
export {
  createE,
  createUppercaseE,
  createFalse,
  // createI,
  createInfinity,
  createLN10,
  createLN2,
  createLOG10E,
  createLOG2E,
  createNaN,
  createNull,
  createPhi,
  createPi,
  createUppercasePi,
  createSQRT1_2, // eslint-disable-line camelcase
  createSQRT2,
  createTau,
  createTrue,
  createVersion
} from './constants.ts'

// create
export { createNumber } from './type/number.ts'
export { createBigint } from './type/bigint.ts'
export { createString } from './type/string.ts'
export { createBoolean } from './type/boolean.ts'
export { createParser } from './expression/function/parser.ts'

// expression
export { createNode } from './expression/node/Node.ts'
export { createAccessorNode } from './expression/node/AccessorNode.ts'
export { createArrayNode } from './expression/node/ArrayNode.ts'
export { createAssignmentNode } from './expression/node/AssignmentNode.ts'
export { createBlockNode } from './expression/node/BlockNode.ts'
export { createConditionalNode } from './expression/node/ConditionalNode.ts'
export { createConstantNode } from './expression/node/ConstantNode.ts'
export { createFunctionAssignmentNode } from './expression/node/FunctionAssignmentNode.ts'
export { createIndexNode } from './expression/node/IndexNode.ts'
export { createObjectNode } from './expression/node/ObjectNode.ts'
export { createOperatorNode } from './expression/node/OperatorNode.ts'
export { createParenthesisNode } from './expression/node/ParenthesisNode.ts'
export { createRangeNode } from './expression/node/RangeNode.ts'
export { createRelationalNode } from './expression/node/RelationalNode.ts'
export { createSymbolNode } from './expression/node/SymbolNode.ts'
export { createFunctionNode } from './expression/node/FunctionNode.ts'
export { createParse } from './expression/parse.ts'
export { createCompile } from './expression/function/compile.ts'
export { createEvaluate } from './expression/function/evaluate.ts'
export { createParserClass } from './expression/Parser.ts'

// logical
export const createAnd = /* #__PURE__ */ createNumberFactory('and', andNumber)
export const createNot = /* #__PURE__ */ createNumberFactory('not', notNumber)
export const createOr = /* #__PURE__ */ createNumberFactory('or', orNumber)
export const createXor = /* #__PURE__ */ createNumberFactory('xor', xorNumber)

// matrix
export { createMapSlices } from './function/matrix/mapSlices.ts'
export { createFilter } from './function/matrix/filter.ts'
export { createForEach } from './function/matrix/forEach.ts'
export { createMap } from './function/matrix/map.ts'
export { createRange } from './function/matrix/range.ts'
export { createSize } from './function/matrix/size.ts'
// FIXME: create a lightweight "number" implementation of subset only supporting plain objects/arrays
export const createIndex = /* #__PURE__ */ factory('index', [], () => noIndex)
export const createMatrix = /* #__PURE__ */ factory(
  'matrix',
  [],
  () => noMatrix
) // FIXME: needed now because subset transform needs it. Remove the need for it in subset
export const createSubset = /* #__PURE__ */ factory(
  'subset',
  [],
  () => noSubset
)
// TODO: provide number+array implementations for map, filter, forEach, zeros, ...?
// TODO: create range implementation for range?
export { createPartitionSelect } from './function/matrix/partitionSelect.ts'

// probability
export { createBernoulli } from './function/probability/bernoulli.ts'
export const createCombinations = createNumberFactory(
  'combinations',
  combinationsNumber
)
export const createGamma = createNumberFactory('gamma', gammaNumber)
export const createLgamma = createNumberFactory('lgamma', lgammaNumber)
export { createCombinationsWithRep } from './function/probability/combinationsWithRep.ts'
export { createFactorial } from './function/probability/factorial.ts'
export { createMultinomial } from './function/probability/multinomial.ts'
export { createPermutations } from './function/probability/permutations.ts'
export { createPickRandom } from './function/probability/pickRandom.ts'
export { createRandomNumber as createRandom } from './function/probability/random.ts'
export { createRandomInt } from './function/probability/randomInt.ts'

// relational
export { createEqualScalarNumber as createEqualScalar } from './function/relational/equalScalar.ts'
export { createCompareNumber as createCompare } from './function/relational/compare.ts'
export { createCompareNatural } from './function/relational/compareNatural.ts'
export { createCompareTextNumber as createCompareText } from './function/relational/compareText.ts'
export { createEqualNumber as createEqual } from './function/relational/equal.ts'
export { createEqualText } from './function/relational/equalText.ts'
export { createSmallerNumber as createSmaller } from './function/relational/smaller.ts'
export { createSmallerEqNumber as createSmallerEq } from './function/relational/smallerEq.ts'
export { createLargerNumber as createLarger } from './function/relational/larger.ts'
export { createLargerEqNumber as createLargerEq } from './function/relational/largerEq.ts'
export { createDeepEqual } from './function/relational/deepEqual.ts'
export { createUnequalNumber as createUnequal } from './function/relational/unequal.ts'

// special
export { createErf } from './function/special/erf.ts'
export { createZeta } from './function/special/zeta.ts'
// statistics
export { createMode } from './function/statistics/mode.ts'
export { createProd } from './function/statistics/prod.ts'
export { createMax } from './function/statistics/max.ts'
export { createMin } from './function/statistics/min.ts'
export { createSum } from './function/statistics/sum.ts'
export { createCumSum } from './function/statistics/cumsum.ts'
export { createMean } from './function/statistics/mean.ts'
export { createMedian } from './function/statistics/median.ts'
export { createMad } from './function/statistics/mad.ts'
export { createVariance } from './function/statistics/variance.ts'
export { createQuantileSeq } from './function/statistics/quantileSeq.ts'
export { createStd } from './function/statistics/std.ts'
export { createCorr } from './function/statistics/corr.ts'

// string
export { createFormat } from './function/string/format.ts'
export { createPrint } from './function/string/print.ts'

// trigonometry
export const createAcos = /* #__PURE__ */ createNumberFactory(
  'acos',
  acosNumber
)
export const createAcosh = /* #__PURE__ */ createNumberFactory(
  'acosh',
  acoshNumber
)
export const createAcot = /* #__PURE__ */ createNumberFactory(
  'acot',
  acotNumber
)
export const createAcoth = /* #__PURE__ */ createNumberFactory(
  'acoth',
  acothNumber
)
export const createAcsc = /* #__PURE__ */ createNumberFactory(
  'acsc',
  acscNumber
)
export const createAcsch = /* #__PURE__ */ createNumberFactory(
  'acsch',
  acschNumber
)
export const createAsec = /* #__PURE__ */ createNumberFactory(
  'asec',
  asecNumber
)
export const createAsech = /* #__PURE__ */ createNumberFactory(
  'asech',
  asechNumber
)
export const createAsin = /* #__PURE__ */ createNumberFactory(
  'asin',
  asinNumber
)
export const createAsinh = /* #__PURE__ */ createNumberFactory(
  'asinh',
  asinhNumber
)
export const createAtan = /* #__PURE__ */ createNumberFactory(
  'atan',
  atanNumber
)
export const createAtan2 = /* #__PURE__ */ createNumberFactory(
  'atan2',
  atan2Number
)
export const createAtanh = /* #__PURE__ */ createNumberFactory(
  'atanh',
  atanhNumber
)
export const createCos = /* #__PURE__ */ createNumberFactory('cos', cosNumber)
export const createCosh = /* #__PURE__ */ createNumberFactory(
  'cosh',
  coshNumber
)
export const createCot = /* #__PURE__ */ createNumberFactory('cot', cotNumber)
export const createCoth = /* #__PURE__ */ createNumberFactory(
  'coth',
  cothNumber
)
export const createCsc = /* #__PURE__ */ createNumberFactory('csc', cscNumber)
export const createCsch = /* #__PURE__ */ createNumberFactory(
  'csch',
  cschNumber
)
export const createSec = /* #__PURE__ */ createNumberFactory('sec', secNumber)
export const createSech = /* #__PURE__ */ createNumberFactory(
  'sech',
  sechNumber
)
export const createSin = /* #__PURE__ */ createNumberFactory('sin', sinNumber)
export const createSinh = /* #__PURE__ */ createNumberFactory(
  'sinh',
  sinhNumber
)
export const createTan = /* #__PURE__ */ createNumberFactory('tan', tanNumber)
export const createTanh = /* #__PURE__ */ createNumberFactory(
  'tanh',
  tanhNumber
)

// transforms
export { createMapSlicesTransform } from './expression/transform/mapSlices.transform.ts'
export { createFilterTransform } from './expression/transform/filter.transform.ts'
export { createForEachTransform } from './expression/transform/forEach.transform.ts'
export { createMapTransform } from './expression/transform/map.transform.ts'
export { createMaxTransform } from './expression/transform/max.transform.ts'
export { createMeanTransform } from './expression/transform/mean.transform.ts'
export { createMinTransform } from './expression/transform/min.transform.ts'
export { createRangeTransform } from './expression/transform/range.transform.ts'
export const createSubsetTransform = /* #__PURE__ */ factory(
  'subset',
  [],
  () => noSubset,
  { isTransformFunction: true }
)
export { createStdTransform } from './expression/transform/std.transform.ts'
export { createSumTransform } from './expression/transform/sum.transform.ts'
export { createCumSumTransform } from './expression/transform/cumsum.transform.ts'
export { createVarianceTransform } from './expression/transform/variance.transform.ts'

// utils
export { createClone } from './function/utils/clone.ts'
export const createIsInteger = /* #__PURE__ */ createNumberFactory(
  'isInteger',
  isIntegerNumber
)
export const createIsNegative = /* #__PURE__ */ createNumberFactory(
  'isNegative',
  isNegativeNumber
)
export { createIsNumeric } from './function/utils/isNumeric.ts'
export { createHasNumericValue } from './function/utils/hasNumericValue.ts'
export const createIsPositive = /* #__PURE__ */ createNumberFactory(
  'isPositive',
  isPositiveNumber
)
export const createIsZero = /* #__PURE__ */ createNumberFactory(
  'isZero',
  isZeroNumber
)
export const createIsNaN = /* #__PURE__ */ createNumberFactory(
  'isNaN',
  isNaNNumber
)
export { createIsBounded } from './function/utils/isBounded.ts'
export { createIsFinite } from './function/utils/isFinite.ts'
export { createTypeOf } from './function/utils/typeOf.ts'
export { createIsPrime } from './function/utils/isPrime.ts'
export { createNumeric } from './function/utils/numeric.ts'
export { createParseNumberWithConfig } from './utils/parseNumber.ts'

// json
export { createReviver } from './json/reviver.ts'
export { createReplacer } from './json/replacer.ts'

// helper functions to create a factory function for a function which only needs typed-function
function createNumberFactory(name: any, fn: any) {
  return factory(name, ['typed'], ({ typed }: { typed: TypedFunction }) =>
    typed(fn)
  )
}
function createNumberOptionalSecondArgFactory(name: any, fn: any) {
  return factory(name, ['typed'], ({ typed }: { typed: TypedFunction }) =>
    typed({ number: fn, 'number,number': fn })
  )
}

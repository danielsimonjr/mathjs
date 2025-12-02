import { compareText as _compareText } from '../../utils/string.js'
import { factory } from '../../utils/factory.js'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.js'

const name = 'compareText'
const dependencies = [
  'typed',
  'matrix',
  'concat'
]

;(_compareText as any).signature = 'any, any'

export const createCompareText = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, concat }: { typed: any; matrix: any; concat: any }) => {
  const matrixAlgorithmSuite = createMatrixAlgorithmSuite({ typed, matrix, concat })

  /**
   * Compare two strings lexically. Comparison is case sensitive.
   * Returns 1 when x > y, -1 when x < y, and 0 when x == y.
   *
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.compareText(x, y)
   *
   * Examples:
   *
   *    math.compareText('B', 'A')     // returns 1
   *    math.compareText('2', '10')    // returns 1
   *    math.compare('2', '10')        // returns -1
   *    math.compareNatural('2', '10') // returns -1
   *
   *    math.compareText('B', ['A', 'B', 'C']) // returns [1, 0, -1]
   *
   * See also:
   *
   *    equal, equalText, compare, compareNatural
   *
   * @param  {string | Array | DenseMatrix} x First string to compare
   * @param  {string | Array | DenseMatrix} y Second string to compare
   * @return {number | Array | DenseMatrix} Returns the result of the comparison:
   *                                        1 when x > y, -1 when x < y, and 0 when x == y.
   */
  return typed(name, _compareText, matrixAlgorithmSuite({
    elop: _compareText,
    Ds: true
  } as any))
})

export const createCompareTextNumber = /* #__PURE__ */ factory(
<<<<<<< HEAD
  name, ['typed'], ({ typed }: any) => typed(name, _compareText)
=======
  name, ['typed'], ({ typed }: { typed: TypedFunction }) => typed(name, _compareText)
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
)

import { compareText as _compareText } from '../../utils/string.ts'
import { factory } from '../../utils/factory.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for compareText
interface MatrixFactory {
  (...args: unknown[]): unknown
}

interface CompareTextDependencies {
  typed: TypedFunction
  matrix: MatrixFactory
  concat: TypedFunction
}

const name = 'compareText'
const dependencies = ['typed', 'matrix', 'concat']

;(_compareText as unknown as { signature: string }).signature = 'any, any'

export const createCompareText = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, concat }: CompareTextDependencies) => {
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

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
    return typed(
      name,
      _compareText,
      matrixAlgorithmSuite({
        elop: _compareText,
        Ds: true as unknown as boolean
      })
    )
  }
)

export const createCompareTextNumber = /* #__PURE__ */ factory(
  name,
  ['typed'],
  ({ typed }: { typed: TypedFunction }) => typed(name, _compareText)
)

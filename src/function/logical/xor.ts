import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.js'
import { createMatAlgo07xSSf } from '../../type/matrix/utils/matAlgo07xSSf.js'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.js'
import { factory } from '../../utils/factory.js'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.js'
import { xorNumber } from '../../plain/number/index.js'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  referToSelf(fn: (self: any) => any): any
}

interface Complex {
  re: number
  im: number
}

interface BigNumber {
  isZero(): boolean
  isNaN(): boolean
}

interface Unit {
  value: any
}

interface Dependencies {
  typed: TypedFunction
  matrix: any
  DenseMatrix: any
  concat: any
  SparseMatrix: any
}

const name = 'xor'
const dependencies = [
  'typed',
  'matrix',
  'DenseMatrix',
  'concat',
  'SparseMatrix'
]

export const createXor = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, DenseMatrix, concat, SparseMatrix }: Dependencies) => {
  const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
  const matAlgo07xSSf = createMatAlgo07xSSf({ typed, SparseMatrix })
  const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
  const matrixAlgorithmSuite = createMatrixAlgorithmSuite({ typed, matrix, concat })

  /**
   * Logical `xor`. Test whether one and only one value is defined with a nonzero/nonempty value.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.xor(x, y)
   *
   * Examples:
   *
   *    math.xor(2, 4)   // returns false
   *
   *    a = [2, 0, 0]
   *    b = [2, 7, 0]
   *    c = 0
   *
   *    math.xor(a, b)   // returns [false, true, false]
   *    math.xor(a, c)   // returns [true, false, false]
   *
   * See also:
   *
   *    and, not, or
   *
   * @param  {number | BigNumber | bigint | Complex | Unit | Array | Matrix} x First value to check
   * @param  {number | BigNumber | bigint | Complex | Unit | Array | Matrix} y Second value to check
   * @return {boolean | Array | Matrix}
   *            Returns true when one and only one input is defined with a nonzero/nonempty value.
   */
  return typed(
    name,
    {
      'number, number': xorNumber,

      'Complex, Complex': function (x: Complex, y: Complex): boolean {
        return ((x.re !== 0 || x.im !== 0) !== (y.re !== 0 || y.im !== 0))
      },

      'bigint, bigint': xorNumber,

      'BigNumber, BigNumber': function (x: BigNumber, y: BigNumber): boolean {
        return ((!x.isZero() && !x.isNaN()) !== (!y.isZero() && !y.isNaN()))
      },

      'Unit, Unit': typed.referToSelf(self =>
        (x: Unit, y: Unit): any => self(x.value || 0, y.value || 0))
    },
    matrixAlgorithmSuite({
      SS: matAlgo07xSSf,
      DS: matAlgo03xDSf,
      Ss: matAlgo12xSfs
    })
  )
})

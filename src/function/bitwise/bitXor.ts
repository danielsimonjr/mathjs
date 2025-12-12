import { bitXor as bigBitXor } from '../../utils/bignumber/bitwise.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo07xSSf } from '../../type/matrix/utils/matAlgo07xSSf.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { factory } from '../../utils/factory.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'
import { bitXorNumber } from '../../plain/number/index.ts'
import type { MathJsChain } from '../../../types/index.js'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'

const name = 'bitXor'
const dependencies = [
  'typed',
  'matrix',
  'DenseMatrix',
  'concat',
  'SparseMatrix'
]

export const createBitXor = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, DenseMatrix, concat, SparseMatrix }) => {
  const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
  const matAlgo07xSSf = createMatAlgo07xSSf({ typed, SparseMatrix })
  const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
  const matrixAlgorithmSuite = createMatrixAlgorithmSuite({ typed, matrix, concat })

  /**
   * Bitwise XOR two values, `x ^ y`.
   * For matrices, the function is evaluated element wise.
   *
   * Syntax:
   *
   *    math.bitXor(x, y)
   *
   * Examples:
   *
   *    math.bitXor(1, 2)               // returns number 3
   *
   *    math.bitXor([2, 3, 4], 4)       // returns Array [6, 7, 0]
   *
   * See also:
   *
   *    bitAnd, bitNot, bitOr, leftShift, rightArithShift, rightLogShift
   *
   * @param  {number | BigNumber | bigint | Array | Matrix} x First value to xor
   * @param  {number | BigNumber | bigint | Array | Matrix} y Second value to xor
   * @return {number | BigNumber | bigint | Array | Matrix} XOR of `x` and `y`
   */
  return typed(
    name,
    {
      'number, number': bitXorNumber,
      'BigNumber, BigNumber': bigBitXor,
      'bigint, bigint': (x: bigint, y: bigint): bigint => x ^ y
    },
    matrixAlgorithmSuite({
      SS: matAlgo07xSSf,
      DS: matAlgo03xDSf,
      Ss: matAlgo12xSfs
    })
  )
})

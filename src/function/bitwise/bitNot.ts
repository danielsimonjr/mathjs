import { bitNotBigNumber } from '../../utils/bignumber/bitwise.ts'
import { deepMap } from '../../utils/collection.ts'
import { factory } from '../../utils/factory.ts'
import { bitNotNumber } from '../../plain/number/index.ts'
import type { MathJsChain } from '../../../types/index.js'
import type { BigNumber } from '../../type/bignumber/BigNumber.ts'

const name = 'bitNot'
const dependencies = ['typed']

export const createBitNot = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Bitwise NOT value, `~x`.
   * For matrices, the function is evaluated element wise.
   * For units, the function is evaluated on the best prefix base.
   *
   * Syntax:
   *
   *    math.bitNot(x)
   *
   * Examples:
   *
   *    math.bitNot(1)               // returns number -2
   *
   *    math.bitNot([2, -3, 4])      // returns Array [-3, 2, -5]
   *
   * See also:
   *
   *    bitAnd, bitOr, bitXor, leftShift, rightArithShift, rightLogShift
   *
   * @param  {number | BigNumber | bigint | Array | Matrix} x Value to not
   * @return {number | BigNumber | bigint | Array | Matrix} NOT of `x`
   */
  return typed(name, {
    number: bitNotNumber,
    BigNumber: bitNotBigNumber,
    bigint: (x: bigint): bigint => ~x,
    'Array | Matrix': typed.referToSelf((self: any) => (x: any) => deepMap(x, self))
  })
})

import { factory } from '../../utils/factory.ts'
import { deepMap } from '../../utils/collection.ts'
import { unaryMinusNumber } from '../../plain/number/index.ts'

const name = 'unaryMinus'
const dependencies = ['typed', 'config', '?bignumber']

export const createUnaryMinus = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, bignumber }: { typed: any; config: any; bignumber?: any }) => {
    /**
     * Inverse the sign of a value, apply a unary minus operation.
     *
     * For matrices, the function is evaluated element wise. Boolean values and
     * strings will be converted to a number. For complex numbers, both real and
     * complex value are inverted.
     *
     * Syntax:
     *
     *    math.unaryMinus(x)
     *
     * Examples:
     *
     *    math.unaryMinus(3.5)      // returns -3.5
     *    math.unaryMinus(-4.2)     // returns 4.2
     *
     * See also:
     *
     *    add, subtract, unaryPlus
     *
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x Number to be inverted.
     * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} Returns the value with inverted sign.
     */
    return typed(name, {
      number: unaryMinusNumber,

      'Complex | BigNumber | Fraction': (x: any) => x.neg(),

      bigint: (x: bigint): bigint => -x,

      Unit: typed.referToSelf((self: any) => (x: any) => {
        const res = x.clone()
        res.value = typed.find(self, res.valueType())(x.value)
        return res
      }),

      boolean: function (x: boolean): number | any {
        // Convert boolean to number: true→1, false→0
        const numValue = x ? 1 : 0
        const negValue = -numValue

        // Return in configured number type
        const numberType = config?.number || 'number'

        switch (numberType) {
          case 'BigNumber':
            if (!bignumber) {
              throw new Error(
                'BigNumber not available. Configure mathjs with BigNumber support.'
              )
            }
            return bignumber(negValue)

          case 'bigint':
            return BigInt(negValue)

          case 'Fraction':
            // TODO: Add Fraction support when dependency available
            return negValue

          case 'number':
          default:
            return negValue
        }
      },

      // deep map collection, skip zeros since unaryMinus(0) = 0
      'Array | Matrix': typed.referToSelf(
        (self: any) => (x: any) => deepMap(x, self, true)
      )

      // TODO: add support for string
    })
  }
)

import { factory } from '../utils/factory.ts'
import { deepMap } from '../utils/collection.ts'
import { format } from '../utils/number.ts'

const name = 'string'
const dependencies = ['typed']

export const createString = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: { typed: any }) => {
    /**
     * Create a string or convert any object into a string.
     * Elements of Arrays and Matrices are processed element wise.
     *
     * Syntax:
     *
     *    math.string(value)
     *
     * Examples:
     *
     *    math.string(4.2)                // returns string '4.2'
     *    math.string(math.complex(3, 2)) // returns string '3 + 2i'
     *
     *    const u = math.unit(5, 'km')
     *    math.string(u.to('m'))          // returns string '5000 m'
     *
     *    math.string([true, false])      // returns ['true', 'false']
     *
     * See also:
     *
     *    bignumber, boolean, complex, index, matrix, number, unit
     *
     * @param {* | Array | Matrix | null} [value]  A value to convert to a string
     * @return {string | Array | Matrix} The created string
     */
    return typed(name, {
      '': function (): string {
        return ''
      },

      number: format,

      null: function (_x: null): string {
        return 'null'
      },

      boolean: function (x: boolean): string {
        return x + ''
      },

      string: function (x: string): string {
        return x
      },

      'Array | Matrix': typed.referToSelf(
        (self: (x: any) => any) => (x: any) => deepMap(x, self)
      ),

      any: function (x: any): string {
        return String(x)
      }
    })
  }
)

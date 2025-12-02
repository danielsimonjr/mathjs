import { factory, FactoryFunction } from '../../utils/factory.js'

const name = 'count'
const dependencies = ['typed', 'size', 'prod']

export const createCount: FactoryFunction<'typed' | 'size' | 'prod', typeof name> = /* #__PURE__ */ factory(name, dependencies, ({ typed, size, prod }) => {
  /**
   * Count the number of elements of a matrix, array or string.
   *
   * Syntax:
   *
   *     math.count(x)
   *
   * Examples:
   *
   *     math.count('hello world')        // returns 11
   *     const A = [[1, 2, 3], [4, 5, 6]]
   *     math.count(A)                    // returns 6
   *     math.count(math.range(1,6))      // returns 5
   *
   * See also:
   *
   *     size
   *
   * @param {string | Array | Matrix} x  A matrix or string
   * @return {number} An integer with the elements in `x`.
   */
  return typed(name, {
    string: function (x: string): number {
      return x.length
    },

    'Matrix | Array': function (x: any): number {
      return prod(size(x))
    }
  })
})

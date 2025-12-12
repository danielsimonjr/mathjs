import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'

// Type definitions for statistical operations
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
}

interface Matrix {
  valueOf(): any[] | any[][]
}

interface Dependencies {
  typed: TypedFunction
  isNaN: TypedFunction
  isNumeric: TypedFunction
}

const name = 'mode'
const dependencies = ['typed', 'isNaN', 'isNumeric']

export const createMode = /* #__PURE__ */ factory(name, dependencies, ({ typed, isNaN: mathIsNaN, isNumeric }: Dependencies) => {
  /**
  * Computes the mode of a set of numbers or a list with values(numbers or characters).
  * If there are multiple modes, it returns a list of those values.
  *
  * Syntax:
  *
  *     math.mode(a, b, c, ...)
  *     math.mode(A)
  *
  * Examples:
  *
  *     math.mode(2, 1, 4, 3, 1)                            // returns [1]
  *     math.mode([1, 2.7, 3.2, 4, 2.7])                    // returns [2.7]
  *     math.mode(1, 4, 6, 1, 6)                             // returns [1, 6]
  *     math.mode('a','a','b','c')                           // returns ["a"]
  *     math.mode(1, 1.5, 'abc')                             // returns [1, 1.5, "abc"]
  *
  * See also:
  *
  *     median,
  *     mean
  *
  * @param {... *} args  A single matrix
  * @return {*} The mode of all values
  */
  return typed(name, {
    'Array | Matrix': _mode,

    '...': function (args: any[]): any {
      return _mode(args)
    }
  })

  /**
   * Calculates the mode in an 1-dimensional array
   * @param {Array | Matrix} values - Input values
   * @return {Array} mode
   * @private
   */
  function _mode (values: any[] | Matrix): any[] {
    values = flatten(values.valueOf())
    const num = values.length
    if (num === 0) {
      throw new Error('Cannot calculate mode of an empty array')
    }

    const count: Record<string, number> = {}
    let mode: any[] = []
    let max = 0
    for (let i = 0; i < values.length; i++) {
      const value = values[i]

      if (isNumeric(value) && mathIsNaN(value)) {
        throw new Error('Cannot calculate mode of an array containing NaN values')
      }

      if (!(value in count)) {
        count[value] = 0
      }

      count[value]++

      if (count[value] === max) {
        mode.push(value)
      } else if (count[value] > max) {
        max = count[value]
        mode = [value]
      }
    }
    return mode
  }
})

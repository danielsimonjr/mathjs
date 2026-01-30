import { format } from '../../utils/string.ts'
import { isString } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { printTemplate } from '../../utils/print.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for print function
interface PrintDependencies {
  typed: TypedFunction
}

const name = 'print'
const dependencies = ['typed']

export const createPrint = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: PrintDependencies) => {
    /**
     * Interpolate values into a string template.
     *
     * Syntax:
     *
     *     math.print(template, values)
     *     math.print(template, values, precision)
     *     math.print(template, values, options)
     *
     * Example usage:
     *
     *     // the following outputs: 'Lucy is 5 years old'
     *     math.print('Lucy is $age years old', {age: 5})
     *
     *     // the following outputs: 'The value of pi is 3.141592654'
     *     math.print('The value of pi is $pi', {pi: math.pi}, 10)
     *
     *     // the following outputs: 'Hello Mary! The date is 2013-03-23'
     *     math.print('Hello $user.name! The date is $date', {
     *       user: {
     *         name: 'Mary',
     *       },
     *       date: '2013-03-23'
     *     })
     *
     *     // the following outputs: 'My favorite fruits are apples and bananas !'
     *     math.print('My favorite fruits are $0 and $1 !', [
     *       'apples',
     *       'bananas'
     *     ])
     *
     * See also:
     *
     *     format
     *
     * @param {string} template           A string containing variable placeholders.
     * @param {Object | Array | Matrix}   values An object or array containing variables
     *                                    which will be filled in in the template.
     * @param {number | Object} [options] Formatting options,
     *                                    or the number of digits to format numbers.
     *                                    See function math.format for a description
     *                                    of all options.
     * @return {string} Interpolated string
     */
    return typed(name, {
      // note: Matrix will be converted automatically to an Array
      'string, Object | Array': _print,
      'string, Object | Array, number | Object': _print
    })
  }
)

/**
 * Interpolate values into a string template.
 * @param {string} template
 * @param {Object} values
 * @param {number | Object} [options]
 * @returns {string} Interpolated string
 * @private
 */
function _print(
  template: string,
  values: Record<string, any> | any[],
  options?: number | Record<string, any>
): string {
  return template.replace(
    printTemplate,
    function (original: string, key: string): string {
      const keys = key.split('.')
      let value: any = (values as any)[keys.shift()!]
      if (value !== undefined && value.isMatrix) {
        value = value.toArray()
      }
      while (keys.length && value !== undefined) {
        const k = keys.shift()
        value = k ? value[k] : value + '.'
      }

      if (value !== undefined) {
        if (!isString(value)) {
          return format(value, options)
        } else {
          return value
        }
      }

      return original
    }
  )
}

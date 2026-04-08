import { factory } from '../../utils/factory.js'

const name = 'integerDigits'
const dependencies = ['typed']

export const createIntegerDigits = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Return the digits of a non-negative integer in a given base,
   * most significant digit first.
   *
   * Syntax:
   *
   *   math.integerDigits(n)
   *   math.integerDigits(n, base)
   *
   * Examples:
   *
   *    math.integerDigits(123)       // returns [1, 2, 3]
   *    math.integerDigits(255, 16)   // returns [15, 15]
   *    math.integerDigits(10, 2)     // returns [1, 0, 1, 0]
   *    math.integerDigits(0)         // returns [0]
   *
   * See also:
   *
   *    primePi, prime, primeFactors
   *
   * @param {number} n      Non-negative integer
   * @param {number} [base] Base for the digit representation (default: 10)
   * @return {number[]}     Array of digits, most significant first
   */
  return typed(name, {
    number: function (n) {
      return _integerDigits(n, 10)
    },
    'number, number': function (n, base) {
      return _integerDigits(n, base)
    }
  })

  function _integerDigits (n, base) {
    if (!Number.isInteger(n) || n < 0) {
      throw new TypeError(
        'Non-negative integer value expected for n in function integerDigits'
      )
    }
    if (!Number.isInteger(base) || base < 2) {
      throw new TypeError(
        'Integer >= 2 expected for base in function integerDigits'
      )
    }

    if (n === 0) return [0]

    const digits = []
    let remaining = n

    while (remaining > 0) {
      digits.push(remaining % base)
      remaining = Math.floor(remaining / base)
    }

    digits.reverse()
    return digits
  }
})

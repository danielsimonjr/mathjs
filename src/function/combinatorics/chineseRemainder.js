import { factory } from '../../utils/factory.js'

const name = 'chineseRemainder'
const dependencies = ['typed']

export const createChineseRemainder = /* #__PURE__ */ factory(name, dependencies, ({ typed }) => {
  /**
   * Solve a system of congruences using the Chinese Remainder Theorem (CRT).
   *
   * Given remainders [r0, r1, ..., rk] and pairwise coprime moduli [m0, m1, ..., mk],
   * find the unique x in [0, M) such that x ≡ ri (mod mi) for all i,
   * where M = m0 * m1 * ... * mk.
   *
   * Syntax:
   *
   *   math.chineseRemainder(remainders, moduli)
   *
   * Examples:
   *
   *    math.chineseRemainder([2, 3, 2], [3, 5, 7])   // returns 23
   *    math.chineseRemainder([1, 2], [3, 5])          // returns 7
   *    math.chineseRemainder([0], [7])                // returns 0
   *
   * See also:
   *
   *    gcd, lcm, mod
   *
   * @param {number[]} remainders  Array of remainders [r0, r1, ..., rk]
   * @param {number[]} moduli      Array of pairwise coprime moduli [m0, m1, ..., mk]
   * @return {number}              Unique solution x in [0, M)
   */
  return typed(name, {
    'Array, Array': function (remainders, moduli) {
      if (remainders.length !== moduli.length) {
        throw new Error('remainders and moduli arrays must have the same length in function chineseRemainder')
      }
      if (remainders.length === 0) {
        throw new Error('At least one congruence is required in function chineseRemainder')
      }

      for (let i = 0; i < moduli.length; i++) {
        if (!Number.isInteger(moduli[i]) || moduli[i] < 1) {
          throw new TypeError('All moduli must be positive integers in function chineseRemainder')
        }
      }

      // Compute M = product of all moduli
      let M = 1
      for (let i = 0; i < moduli.length; i++) {
        M *= moduli[i]
      }

      let x = 0
      for (let i = 0; i < moduli.length; i++) {
        const mi = moduli[i]
        const ri = remainders[i]
        const Mi = M / mi
        const inv = _modInverse(Mi, mi)
        x += ri * Mi * inv
      }

      // Return canonical representative in [0, M)
      return ((x % M) + M) % M
    }
  })

  /**
   * Compute the modular inverse of a mod m using extended Euclidean algorithm.
   * Requires gcd(a, m) === 1.
   */
  function _modInverse (a, m) {
    let [old_r, r] = [a, m]
    let [old_s, s] = [1, 0]

    while (r !== 0) {
      const q = Math.floor(old_r / r)
      ;[old_r, r] = [r, old_r - q * r]
      ;[old_s, s] = [s, old_s - q * s]
    }

    if (old_r !== 1) {
      throw new Error('Moduli are not pairwise coprime in function chineseRemainder')
    }

    return ((old_s % m) + m) % m
  }
})

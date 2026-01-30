import { factory } from '../../utils/factory.ts'
import { isInteger } from '../../utils/number.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for bernoulli
// Generic type for numeric values that support arithmetic operations
type NumericValue<T> = T

// Cache entry type: [cotangent coefficient, prefactor, Bernoulli number]
type CacheEntry<T> = [T, T, T] | undefined

interface BigNumberConstructor {
  new (value: number): unknown
}

interface FractionConstructor {
  new (value: number): unknown
}

interface BernoulliDependencies {
  typed: TypedFunction
  config: ConfigOptions
  number: (value: unknown) => number
  BigNumber?: BigNumberConstructor
  Fraction?: FractionConstructor
}

const name = 'bernoulli'
const dependencies = [
  'typed',
  'config',
  'isInteger',
  'number',
  '?BigNumber',
  '?Fraction'
]

export const createBernoulli = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    number,
    BigNumber,
    Fraction
  }: BernoulliDependencies): TypedFunction => {
    /**
     * Return the `n`th Bernoulli number, for positive integers `n`
     *
     * Syntax:
     *
     *     math.bernoulli(n)
     *
     * Examples:
     *
     *     math.bernoulli(1)                  // returns -0.5
     *     // All other odd Bernoulli numbers are 0:
     *     math.bernoulli(7)                  // returns 0
     *     math.bernoulli(math.bignumber(6))  // value bignumber(1).div(42)
     *     // Produces exact rationals for bigint or fraction input:
     *     math.bernoulli(8n)                 // Fraction -1,30
     *     math.bernoulli(math.fraction(10))  // Fraction 5,66
     *
     * See also:
     *
     *     combinations, gamma, stirlingS2
     *
     * @param {number | BigNumber | bigint | Fraction} n
     *    Index of the Bernoulli number
     * @return {number | BigNumber | Fraction}
     *    nth Bernoulli number, of a type corresponding to the argument n
     */

    const numberCache: CacheEntry<number>[] = [undefined]
    const fractionCache: CacheEntry<unknown>[] = [undefined]
    let bigCache: CacheEntry<unknown>[] = [undefined]
    let cachedPrecision = 50
    return typed(name, {
      number: (index: number): number =>
        _bernoulli<number>(
          index,
          (n: number) => n,
          numberCache,
          (a: number, b: number) => a + b,
          (a: number, b: number) => a * b,
          (a: number, b: number) => a / b
        ),
      'bigint | Fraction': (index: bigint | unknown): unknown =>
        _bernoulli<unknown>(
          number(index),
          (n: number) => new (Fraction as FractionConstructor)(n),
          fractionCache,
          (a: unknown, b: unknown) => (a as { add(b: unknown): unknown }).add(b),
          (a: unknown, b: unknown) => (a as { mul(b: unknown): unknown }).mul(b),
          (a: unknown, b: unknown) => (a as { div(b: unknown): unknown }).div(b)
        ),
      BigNumber: (index: unknown): unknown => {
        if (config.precision !== cachedPrecision) {
          bigCache = [undefined]
          cachedPrecision = config.precision
        }
        return _bernoulli<unknown>(
          number(index),
          (n: number) => new (BigNumber as BigNumberConstructor)(n),
          bigCache,
          (a: unknown, b: unknown) => (a as { add(b: unknown): unknown }).add(b),
          (a: unknown, b: unknown) => (a as { mul(b: unknown): unknown }).mul(b),
          (a: unknown, b: unknown) => (a as { div(b: unknown): unknown }).div(b)
        )
      }
    })
  }
)

/**
 * Underlying implementation, with all operations passed in.
 * Parameters:
 * 1. index: a (positive integer) number specifying which Bernoulli number
 *    to compute.
 * 2. promote: a function that takes an integer number and returns
 *    the desired type for the Bernoulli number values.
 * 3. A: a cache array of partial computation data that _bernoulli should use.
 *    Different cache arrays should be provided for different types.
 * 4. plus: a function that adds two values of the desired type.
 * 5. times: a function that multiplies two values of the desired type.
 * 6. divide: a function that divides one value of the desired type by another.
 */
function _bernoulli<T>(
  index: number,
  promote: (n: number) => T,
  A: (CacheEntry<T>)[],
  plus: (a: T, b: T) => T,
  times: (a: T, b: T) => T,
  divide: (a: T, b: T) => T
): T {
  if (index < 0 || !isInteger(index)) {
    throw new RangeError('Bernoulli index must be nonnegative integer')
  }
  if (index === 0) return promote(1)
  if (index === 1) return divide(promote(-1), promote(2))
  if (index % 2 === 1) return promote(0)
  // We proceed as in https://math.stackexchange.com/a/2844337
  // (by no means the most efficient, but very simple to implement)
  // A cache entry consists of a triple
  // [cotangent coefficient a_n, prefactor, Bernouilli number B_2n]
  const one = promote(1)
  if (A.length === 1) {
    A.push([
      divide(one, promote(-3)),
      divide(one, promote(-2)),
      divide(one, promote(6))
    ])
  }
  const half = index / 2
  const zero = promote(0)
  const two = promote(2)
  while (A.length <= half) {
    const i = A.length // next cotangent coefficient to compute
    const lim = Math.floor((i + 1) / 2)
    let a = zero
    for (let m = 1; m < lim; ++m) {
      const entry_m = A[m] as [T, T, T]
      const entry_i_m = A[i - m] as [T, T, T]
      a = plus(a, times(entry_m[0], entry_i_m[0]))
    }
    a = times(a, two)
    if (i % 2 === 0) {
      const entry_lim = A[lim] as [T, T, T]
      a = plus(a, times(entry_lim[0], entry_lim[0]))
    }
    a = divide(a, promote(-(2 * i + 1)))
    const entry_i_1 = A[i - 1] as [T, T, T]
    const prefactor = divide(times(entry_i_1[1], promote(-i * (2 * i - 1))), two)
    A.push([a, prefactor, times(prefactor, a)])
  }
  const entry_half = A[half] as [T, T, T]
  return entry_half[2]
}

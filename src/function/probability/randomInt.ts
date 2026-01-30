import { factory } from '../../utils/factory.ts'
import { randomMatrix } from './util/randomMatrix.ts'
import { createRng } from './util/seededRNG.ts'
import { isMatrix } from '../../utils/is.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for randomInt
interface MatrixType {
  create(data: unknown[], datatype?: string): MatrixType
  valueOf(): number[]
}

interface RandomIntDependencies {
  typed: TypedFunction
  config: ConfigOptions
  log2: (n: bigint) => number
  on?: (event: string, callback: (curr: ConfigOptions, prev: ConfigOptions) => void) => void
}

const name = 'randomInt'
const dependencies = ['typed', 'config', 'log2', '?on']

export const createRandomInt = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    log2,
    on
  }: RandomIntDependencies) => {
    // seeded pseudo random number generator
    let rng = createRng(config.randomSeed)

    if (on) {
      on('config', function (curr: ConfigOptions, prev: ConfigOptions) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed)
        }
      })
    }

    /**
     * Return a random integer number larger or equal to `min` and smaller than `max`
     * using a uniform distribution.
     *
     * Syntax:
     *
     *     math.randomInt()                // generate either 0 or 1, randomly
     *     math.randomInt(max)             // generate a random integer between 0 and max
     *     math.randomInt(min, max)        // generate a random integer between min and max
     *     math.randomInt(size)            // generate a matrix with random integer between 0 and 1
     *     math.randomInt(size, max)       // generate a matrix with random integer between 0 and max
     *     math.randomInt(size, min, max)  // generate a matrix with random integer between min and max
     *
     * Examples:
     *
     *     math.randomInt(100)    // returns a random integer between 0 and 100
     *     math.randomInt(30, 40) // returns a random integer between 30 and 40
     *     math.randomInt([2, 3]) // returns a 2x3 matrix with random integers between 0 and 1
     *
     * See also:
     *
     *     random, pickRandom
     *
     * @param {Array | Matrix} [size] If provided, an array or matrix with given
     *                                size and filled with random values is returned
     * @param {number} [min]  Minimum boundary for the random value, included
     * @param {number} [max]  Maximum boundary for the random value, excluded
     * @return {number | Array | Matrix} A random integer value
     */
    return typed(name, {
      '': () => _randomInt(0, 2),
      number: (max: number) => _randomInt(0, max),
      'number, number': (min: number, max: number) => _randomInt(min, max),
      bigint: (max: bigint) => _randomBigint(0n, max),
      'bigint, bigint': _randomBigint,
      'Array | Matrix': (size: number[] | MatrixType) => _randomIntMatrix(size, 0, 1),
      'Array | Matrix, number': (size: number[] | MatrixType, max: number) =>
        _randomIntMatrix(size, 0, max),
      'Array | Matrix, number, number': (size: number[] | MatrixType, min: number, max: number) =>
        _randomIntMatrix(size, min, max)
    })

    function _randomIntMatrix(size: number[] | MatrixType, min: number, max: number): number[] | MatrixType {
      const res = randomMatrix((size as { valueOf(): number[] }).valueOf(), () => _randomInt(min, max))
      return isMatrix(size) ? (size as MatrixType).create(res, 'number') : res
    }

    function _randomInt(min: number, max: number): number {
      return Math.floor(min + rng() * (max - min))
    }

    function _randomBigint(min: bigint, max: bigint): bigint {
      const simpleCutoff = 2n ** 30n
      const width = max - min // number of choices
      if (width <= simpleCutoff) {
        // do it with number type
        return min + BigInt(_randomInt(0, Number(width)))
      }
      // Too big to choose accurately that way. Instead, choose the correct
      // number of random bits to cover the width, and repeat until the
      // resulting number falls within the width
      const bits = log2(width)
      let picked = width
      while (picked >= width) {
        picked = 0n
        for (let i = 0; i < bits; ++i) {
          picked = 2n * picked + (rng() < 0.5 ? 0n : 1n)
        }
      }
      return min + picked
    }
  }
)

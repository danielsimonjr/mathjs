import { factory } from '../../utils/factory.ts'
import { isMatrix } from '../../utils/is.ts'
import { createRng } from './util/seededRNG.ts'
import { randomMatrix } from './util/randomMatrix.ts'

const name = 'random'
const dependencies = ['typed', 'config', '?on']

export const createRandom = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, on }: { typed: any; config: any; on: any }) => {
    // seeded pseudo random number generator
    let rng = createRng(config.randomSeed)

    if (on) {
      on('config', function (curr: any, prev: any) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed)
        }
      })
    }

    /**
     * Return a random number larger or equal to `min` and smaller than `max`
     * using a uniform distribution.
     *
     * Syntax:
     *
     *     math.random()                // generate a random number between 0 and 1
     *     math.random(max)             // generate a random number between 0 and max
     *     math.random(min, max)        // generate a random number between min and max
     *     math.random(size)            // generate a matrix with random numbers between 0 and 1
     *     math.random(size, max)       // generate a matrix with random numbers between 0 and max
     *     math.random(size, min, max)  // generate a matrix with random numbers between min and max
     *
     * Examples:
     *
     *     math.random()       // returns a random number between 0 and 1
     *     math.random(100)    // returns a random number between 0 and 100
     *     math.random(30, 40) // returns a random number between 30 and 40
     *     math.random([2, 3]) // returns a 2x3 matrix with random numbers between 0 and 1
     *
     * See also:
     *
     *     randomInt, pickRandom
     *
     * @param {Array | Matrix} [size] If provided, an array or matrix with given
     *                                size and filled with random values is returned
     * @param {number} [min]  Minimum boundary for the random value, included
     * @param {number} [max]  Maximum boundary for the random value, excluded
     * @return {number | Array | Matrix} A random number
     */
    return typed(name, {
      '': () => _random(0, 1),
      number: (max: number) => _random(0, max),
      'number, number': (min: number, max: number) => _random(min, max),
      'Array | Matrix': (size: any) => _randomMatrix(size, 0, 1),
      'Array | Matrix, number': (size: any, max: number) =>
        _randomMatrix(size, 0, max),
      'Array | Matrix, number, number': (size: any, min: number, max: number) =>
        _randomMatrix(size, min, max)
    })

    function _randomMatrix(size: any, min: number, max: number): any {
      const res = randomMatrix(size.valueOf(), () => _random(min, max))
      return isMatrix(size) ? (size as any).create(res, 'number') : res
    }

    function _random(min: number, max: number): number {
      return min + rng() * (max - min)
    }
  }
)

// number only implementation of random, no matrix support
// TODO: there is quite some duplicate code in both createRandom and createRandomNumber, can we improve that?
export const createRandomNumber = /* #__PURE__ */ factory(
  name,
  ['typed', 'config', '?on'],
  ({ typed, config, on, matrix: _matrix }: any) => {
    // seeded pseudo random number generator1
    let rng = createRng(config.randomSeed)

    if (on) {
      on('config', function (curr: any, prev: any) {
        if (curr.randomSeed !== prev.randomSeed) {
          rng = createRng(curr.randomSeed)
        }
      })
    }

    return typed(name, {
      '': () => _random(0, 1),
      number: (max: number) => _random(0, max),
      'number, number': (min: number, max: number) => _random(min, max)
    })

    function _random(min: number, max: number): number {
      return min + rng() * (max - min)
    }
  }
)

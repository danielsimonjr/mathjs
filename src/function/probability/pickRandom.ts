import { flatten } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { isMatrix, isNumber } from '../../utils/is.ts'
import { createRng } from './util/seededRNG.ts'
import type { TypedFunction } from '../../core/function/typed.ts'
import type { ConfigOptions } from '../../core/config.ts'

// Type definitions for pickRandom
interface MatrixType {
  create(data: unknown[], datatype?: string): MatrixType
  valueOf(): unknown[]
}

interface PickRandomOptions {
  number?: number
  weights?: unknown[] | MatrixType
  elementWise?: boolean
}

interface PickRandomDependencies {
  typed: TypedFunction
  config: ConfigOptions
  on?: (
    event: string,
    callback: (curr: ConfigOptions, prev: ConfigOptions) => void
  ) => void
}

const name = 'pickRandom'
const dependencies = ['typed', 'config', '?on']

export const createPickRandom = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, on }: PickRandomDependencies) => {
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
     * Random pick one or more values from a one dimensional array.
     * Array elements are picked using a random function with uniform or weighted distribution.
     *
     * Syntax:
     *
     *     math.pickRandom(array)
     *     math.pickRandom(array, number)
     *     math.pickRandom(array, weights)
     *     math.pickRandom(array, number, weights)
     *     math.pickRandom(array, weights, number)
     *     math.pickRandom(array, { weights, number, elementWise })
     *
     * Examples:
     *
     *     math.pickRandom([3, 6, 12, 2])                  // returns one of the values in the array
     *     math.pickRandom([3, 6, 12, 2], 2)               // returns an array of two of the values in the array
     *     math.pickRandom([3, 6, 12, 2], { number: 2 })   // returns an array of two of the values in the array
     *     math.pickRandom([3, 6, 12, 2], [1, 3, 2, 1])    // returns one of the values in the array with weighted distribution
     *     math.pickRandom([3, 6, 12, 2], 2, [1, 3, 2, 1]) // returns an array of two of the values in the array with weighted distribution
     *     math.pickRandom([3, 6, 12, 2], [1, 3, 2, 1], 2) // returns an array of two of the values in the array with weighted distribution
     *
     *     math.pickRandom([{x: 1.0, y: 2.0}, {x: 1.1, y: 2.0}], { elementWise: false })
     *         // returns one of the items in the array
     *
     * See also:
     *
     *     random, randomInt
     *
     * @param {Array | Matrix} array     A one dimensional array
     * @param {Int} number               An int or float
     * @param {Array | Matrix} weights   An array of ints or floats
     * @return {number | Array}          Returns a single random value from array when number is undefined.
     *                                   Returns an array with the configured number of elements when number is defined.
     */
    return typed(name, {
      'Array | Matrix': function (possibles: unknown[] | MatrixType): unknown {
        return _pickRandom(possibles, {})
      },

      'Array | Matrix, Object': function (
        possibles: unknown[] | MatrixType,
        options: PickRandomOptions
      ): unknown {
        return _pickRandom(possibles, options)
      },

      'Array | Matrix, number': function (
        possibles: unknown[] | MatrixType,
        number: number
      ): unknown {
        return _pickRandom(possibles, { number })
      },

      'Array | Matrix, Array | Matrix': function (
        possibles: unknown[] | MatrixType,
        weights: unknown[] | MatrixType
      ): unknown {
        return _pickRandom(possibles, { weights })
      },

      'Array | Matrix, Array | Matrix, number': function (
        possibles: unknown[] | MatrixType,
        weights: unknown[] | MatrixType,
        number: number
      ): unknown {
        return _pickRandom(possibles, { number, weights })
      },

      'Array | Matrix, number, Array | Matrix': function (
        possibles: unknown[] | MatrixType,
        number: number,
        weights: unknown[] | MatrixType
      ): unknown {
        return _pickRandom(possibles, { number, weights })
      }
    })

    /**
     * @param {Array | Matrix} possibles
     * @param {{
     *   number?: number,
     *   weights?: Array | Matrix,
     *   elementWise: boolean
     * }} options
     * @returns {number | Array}
     * @private
     */
    function _pickRandom(
      possibles: unknown[] | MatrixType,
      { number, weights, elementWise = true }: PickRandomOptions
    ): unknown {
      const single = typeof number === 'undefined'
      if (single) {
        number = 1
      }

      const createMatrix = isMatrix(possibles)
        ? (possibles as MatrixType).create
        : isMatrix(weights)
          ? (weights as MatrixType).create
          : null

      let possiblesArr = (possibles as { valueOf(): unknown[] }).valueOf() // get Array
      let weightsArr: number[] | undefined
      if (weights) {
        weightsArr = (weights as { valueOf(): number[] }).valueOf() // get Array
      }

      if (elementWise === true) {
        possiblesArr = flatten(possiblesArr) as unknown[]
        weightsArr = weightsArr ? (flatten(weightsArr) as number[]) : undefined
      }

      let totalWeights = 0

      if (typeof weightsArr !== 'undefined') {
        if (weightsArr.length !== possiblesArr.length) {
          throw new Error('Weights must have the same length as possibles')
        }

        for (let i = 0, len = weightsArr.length; i < len; i++) {
          if (!isNumber(weightsArr[i]) || weightsArr[i] < 0) {
            throw new Error('Weights must be an array of positive numbers')
          }

          totalWeights += weightsArr[i]
        }
      }

      const length = possiblesArr.length

      const result: unknown[] = []
      let pick: unknown

      while (result.length < (number as number)) {
        if (typeof weightsArr === 'undefined') {
          pick = possiblesArr[Math.floor(rng() * length)]
        } else {
          let randKey = rng() * totalWeights

          for (let i = 0, len = possiblesArr.length; i < len; i++) {
            randKey -= weightsArr[i]

            if (randKey < 0) {
              pick = possiblesArr[i]
              break
            }
          }
        }

        result.push(pick)
      }

      return single ? result[0] : createMatrix ? createMatrix(result) : result
    }
  }
)

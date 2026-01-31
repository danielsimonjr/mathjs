import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createVariance } from '../../function/statistics/variance.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type { TypedFunction, MathFunction, VariadicArgs } from './types.ts'

interface VarianceDependencies {
  typed: TypedFunction
  add: TypedFunction
  subtract: TypedFunction
  multiply: TypedFunction
  divide: TypedFunction
  mapSlices: TypedFunction
  isNaN: (x: unknown) => boolean
}

const name = 'variance'
const dependencies = [
  'typed',
  'add',
  'subtract',
  'multiply',
  'divide',
  'mapSlices',
  'isNaN'
]

/**
 * Attach a transform function to math.var
 * Adds a property transform containing the transform function.
 *
 * This transform changed the `dim` parameter of function var
 * from one-based to zero based
 */
export const createVarianceTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    add,
    subtract,
    multiply,
    divide,
    mapSlices,
    isNaN: mathIsNaN
  }: VarianceDependencies) => {
    const variance = createVariance({
      typed,
      add,
      subtract,
      multiply,
      divide,
      mapSlices,
      isNaN: mathIsNaN
    })

    return typed(name, {
      '...any': function (args: VariadicArgs): unknown {
        args = lastDimToZeroBase(args)

        try {
          return variance.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

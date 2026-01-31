import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createMean } from '../../function/statistics/mean.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type { TypedFunction, VariadicArgs } from './types.ts'

interface MeanDependencies {
  typed: TypedFunction
  add: TypedFunction
  divide: TypedFunction
}

const name = 'mean'
const dependencies = ['typed', 'add', 'divide']

export const createMeanTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, add, divide }: MeanDependencies) => {
    const mean = createMean({ typed, add, divide })

    /**
     * Attach a transform function to math.mean
     * Adds a property transform containing the transform function.
     *
     * This transform changed the last `dim` parameter of function mean
     * from one-based to zero based
     */
    return typed('mean', {
      '...any': function (args: VariadicArgs): unknown {
        args = lastDimToZeroBase(args)

        try {
          return mean.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

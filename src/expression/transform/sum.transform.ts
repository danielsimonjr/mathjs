import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createSum } from '../../function/statistics/sum.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type {
  TypedFunction,
  MathFunction,
  MathJsConfig,
  VariadicArgs
} from './types.ts'

interface SumDependencies {
  typed: TypedFunction
  config: MathJsConfig
  add: MathFunction
  numeric: MathFunction
}

/**
 * Attach a transform function to math.sum
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `dim` parameter of function sum
 * from one-based to zero based
 */
const name = 'sum'
const dependencies = ['typed', 'config', 'add', 'numeric']

export const createSumTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, add, numeric }: SumDependencies) => {
    const sum = createSum({ typed, config, add, numeric })

    return typed(name, {
      '...any': function (args: VariadicArgs): unknown {
        args = lastDimToZeroBase(args)

        try {
          return sum.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

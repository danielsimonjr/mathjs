import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createMin } from '../../function/statistics/min.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type { TypedFunction, MathFunction, MathJsConfig, VariadicArgs } from './types.ts'

interface MinDependencies {
  typed: TypedFunction
  config: MathJsConfig
  numeric: MathFunction
  smaller: MathFunction<boolean>
  isNaN: (x: unknown) => boolean
}

const name = 'min'
const dependencies = ['typed', 'config', 'numeric', 'smaller', 'isNaN']

export const createMinTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, numeric, smaller, isNaN: mathIsNaN }: MinDependencies) => {
    const min = createMin({ typed, config, numeric, smaller, isNaN: mathIsNaN })

    /**
     * Attach a transform function to math.min
     * Adds a property transform containing the transform function.
     *
     * This transform changed the last `dim` parameter of function min
     * from one-based to zero based
     */
    return typed('min', {
      '...any': function (args: VariadicArgs): unknown {
        args = lastDimToZeroBase(args)

        try {
          return min.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

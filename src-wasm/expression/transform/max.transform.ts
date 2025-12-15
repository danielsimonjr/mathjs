import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createMax } from '../../function/statistics/max.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  config: any
  numeric: TypedFunction
  larger: TypedFunction
  isNaN: (x: any) => boolean
}

const name = 'max'
const dependencies = ['typed', 'config', 'numeric', 'larger', 'isNaN']

export const createMaxTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, config, numeric, larger, isNaN: mathIsNaN }: Dependencies) => {
    const max = createMax({ typed, config, numeric, larger, isNaN: mathIsNaN })

    /**
     * Attach a transform function to math.max
     * Adds a property transform containing the transform function.
     *
     * This transform changed the last `dim` parameter of function max
     * from one-based to zero based
     */
    return typed('max', {
      '...any': function (args: any[]): any {
        args = lastDimToZeroBase(args)

        try {
          return max.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

import { factory } from '../../utils/factory.ts'
import { createStd } from '../../function/statistics/std.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  map: TypedFunction
  sqrt: TypedFunction
  variance: TypedFunction
}

const name = 'std'
const dependencies = ['typed', 'map', 'sqrt', 'variance']

/**
 * Attach a transform function to math.std
 * Adds a property transform containing the transform function.
 *
 * This transform changed the `dim` parameter of function std
 * from one-based to zero based
 */
export const createStdTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, map, sqrt, variance }: Dependencies) => {
  const std = createStd({ typed, map, sqrt, variance })

  return typed('std', {
    '...any': function (args: any[]): any {
      args = lastDimToZeroBase(args)

      try {
        return std.apply(null, args)
      } catch (err) {
        throw errorTransform(err as Error)
      }
    }
  })
}, { isTransformFunction: true })

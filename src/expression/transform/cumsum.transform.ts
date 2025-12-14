import { isBigNumber, isCollection, isNumber } from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createCumSum } from '../../function/statistics/cumsum.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  add: (...args: any[]) => any
  unaryPlus: (...args: any[]) => any
}

/**
 * Attach a transform function to math.sum
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `dim` parameter of function sum
 * from one-based to zero based
 */
const name = 'cumsum'
const dependencies = ['typed', 'add', 'unaryPlus']

export const createCumSumTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, add, unaryPlus }: Dependencies) => {
    const cumsum = createCumSum({ typed, add, unaryPlus })

    return typed(name, {
      '...any': function (args: any[]): any {
        // change last argument dim from one-based to zero-based
        if (args.length === 2 && isCollection(args[0])) {
          const dim = args[1]
          if (isNumber(dim)) {
            args[1] = dim - 1
          } else if (isBigNumber(dim)) {
            args[1] = (dim as any).minus(1)
          }
        }

        try {
          return cumsum.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

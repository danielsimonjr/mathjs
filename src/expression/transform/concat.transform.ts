import { isBigNumber, isNumber } from '../../utils/is.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { factory } from '../../utils/factory.ts'
import { createConcat } from '../../function/matrix/concat.ts'
import type { TypedFunction, MathFunction, BigNumberLike, VariadicArgs } from './types.ts'

interface ConcatDependencies {
  typed: TypedFunction
  matrix: MathFunction
  isInteger: (x: unknown) => boolean
}

const name = 'concat'
const dependencies = ['typed', 'matrix', 'isInteger']

export const createConcatTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, isInteger }: ConcatDependencies) => {
    const concat = createConcat({ typed, matrix, isInteger })

    /**
     * Attach a transform function to math.range
     * Adds a property transform containing the transform function.
     *
     * This transform changed the last `dim` parameter of function concat
     * from one-based to zero based
     */
    return typed('concat', {
      '...any': function (args: VariadicArgs): unknown {
        // change last argument from one-based to zero-based
        const lastIndex = args.length - 1
        const last = args[lastIndex]
        if (isNumber(last)) {
          args[lastIndex] = last - 1
        } else if (isBigNumber(last)) {
          args[lastIndex] = (last as BigNumberLike).minus(1)
        }

        try {
          return concat.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

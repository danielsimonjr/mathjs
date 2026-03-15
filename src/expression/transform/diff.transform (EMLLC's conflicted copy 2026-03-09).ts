import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createDiff } from '../../function/matrix/diff.ts'
import { lastDimToZeroBase } from './utils/lastDimToZeroBase.ts'
import type { TypedFunction, MathFunction, VariadicArgs } from './types.ts'

interface DiffDependencies {
  typed: TypedFunction
  matrix: MathFunction
  subtract: MathFunction
  number: MathFunction<number>
  bignumber: MathFunction
}

const name = 'diff'
const dependencies = ['typed', 'matrix', 'subtract', 'number', 'bignumber']

export const createDiffTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, subtract, number, bignumber }: DiffDependencies) => {
    const diff = createDiff({ typed, matrix, subtract, number, bignumber })

    /**
     * Attach a transform function to math.diff
     * Adds a property transform containing the transform function.
     *
     * This transform creates a range which includes the end value
     */
    return typed(name, {
      '...any': function (args: VariadicArgs): unknown {
        args = lastDimToZeroBase(args)

        try {
          return diff.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

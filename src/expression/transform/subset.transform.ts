import { factory } from '../../utils/factory.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { createSubset } from '../../function/matrix/subset.ts'
import type { TypedFunction, MathFunction, VariadicArgs } from './types.ts'

interface SubsetDependencies {
  typed: TypedFunction
  matrix: MathFunction
  zeros: MathFunction
  add: TypedFunction
}

const name = 'subset'
const dependencies = ['typed', 'matrix', 'zeros', 'add']

export const createSubsetTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, zeros, add }: SubsetDependencies) => {
    const subset = createSubset({ typed, matrix, zeros, add })

    /**
     * Attach a transform function to math.subset
     * Adds a property transform containing the transform function.
     *
     * This transform creates a range which includes the end value
     */
    return typed('subset', {
      '...any': function (args: VariadicArgs): unknown {
        try {
          return subset.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

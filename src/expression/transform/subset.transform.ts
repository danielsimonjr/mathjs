import { factory } from '../../utils/factory.js'
import { errorTransform } from './utils/errorTransform.js'
import { createSubset } from '../../function/matrix/subset.js'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  matrix: (...args: any[]) => any
  zeros: (...args: any[]) => any
  add: TypedFunction
}

const name = 'subset'
const dependencies = ['typed', 'matrix', 'zeros', 'add']

export const createSubsetTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, zeros, add }: Dependencies) => {
  const subset = createSubset({ typed, matrix, zeros, add })

  /**
   * Attach a transform function to math.subset
   * Adds a property transform containing the transform function.
   *
   * This transform creates a range which includes the end value
   */
  return typed('subset', {
    '...any': function (args: any[]): any {
      try {
        return (subset as any).apply(null, args)
      } catch (err) {
        throw errorTransform(err as Error)
      }
    }
  })
}, { isTransformFunction: true })

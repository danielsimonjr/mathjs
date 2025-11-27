import { isBigNumber, isNumber } from '../../utils/is.js'
import { errorTransform } from './utils/errorTransform.js'
import { factory } from '../../utils/factory.js'
import { createConcat } from '../../function/matrix/concat.js'

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
}

interface BigNumber {
  minus(x: number): BigNumber
}

interface Dependencies {
  typed: TypedFunction
  matrix: (...args: any[]) => any
  isInteger: (x: any) => boolean
}

const name = 'concat'
const dependencies = ['typed', 'matrix', 'isInteger']

export const createConcatTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, isInteger }: Dependencies) => {
  const concat = createConcat({ typed, matrix, isInteger })

  /**
   * Attach a transform function to math.range
   * Adds a property transform containing the transform function.
   *
   * This transform changed the last `dim` parameter of function concat
   * from one-based to zero based
   */
  return typed('concat', {
    '...any': function (args: any[]): any {
      // change last argument from one-based to zero-based
      const lastIndex = args.length - 1
      const last = args[lastIndex]
      if (isNumber(last)) {
        args[lastIndex] = last - 1
      } else if (isBigNumber(last)) {
        args[lastIndex] = (last as BigNumber).minus(1)
      }

      try {
        return concat.apply(null, args)
      } catch (err) {
        throw errorTransform(err as Error)
      }
    }
  })
}, { isTransformFunction: true })

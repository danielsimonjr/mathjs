import { factory } from '../../utils/factory.js'
import { createRange } from '../../function/matrix/range.js'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  config: any
  matrix?: (...args: any[]) => any
  bignumber?: (...args: any[]) => any
  equal: TypedFunction
  smaller: TypedFunction
  smallerEq: TypedFunction
  larger: TypedFunction
  largerEq: TypedFunction
  add: TypedFunction
  isZero: (x: any) => boolean
  isPositive: (x: any) => boolean
}

const name = 'range'
const dependencies = ['typed', 'config', '?matrix', '?bignumber', 'equal', 'smaller', 'smallerEq', 'larger', 'largerEq', 'add', 'isZero', 'isPositive']

export const createRangeTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, config, matrix, bignumber, equal, smaller, smallerEq, larger, largerEq, add, isZero, isPositive }: Dependencies) => {
  const range = createRange({ typed, config, matrix, bignumber, equal, smaller, smallerEq, larger, largerEq, add, isZero, isPositive })

  /**
   * Attach a transform function to math.range
   * Adds a property transform containing the transform function.
   *
   * This transform creates a range which includes the end value
   */
  return typed('range', {
    '...any': function (args: any[]): any {
      const lastIndex = args.length - 1
      const last = args[lastIndex]
      if (typeof last !== 'boolean') {
        // append a parameter includeEnd=true
        args.push(true)
      }

      return range.apply(null, args)
    }
  })
}, { isTransformFunction: true })

import { factory } from '../../utils/factory.ts'
import { createRange } from '../../function/matrix/range.ts'
import type {
  TypedFunction,
  MathFunction,
  MathJsConfig,
  VariadicArgs
} from './types.ts'

interface RangeDependencies {
  typed: TypedFunction
  config: MathJsConfig
  matrix?: MathFunction
  bignumber?: MathFunction
  equal: TypedFunction
  smaller: TypedFunction
  smallerEq: TypedFunction
  larger: TypedFunction
  largerEq: TypedFunction
  add: TypedFunction
  isZero: (x: unknown) => boolean
  isPositive: (x: unknown) => boolean
}

const name = 'range'
const dependencies = [
  'typed',
  'config',
  '?matrix',
  '?bignumber',
  'equal',
  'smaller',
  'smallerEq',
  'larger',
  'largerEq',
  'add',
  'isZero',
  'isPositive'
]

export const createRangeTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    config,
    matrix,
    bignumber,
    equal,
    smaller,
    smallerEq,
    larger,
    largerEq,
    add,
    isZero,
    isPositive
  }: RangeDependencies) => {
    const range = createRange({
      typed,
      config,
      matrix,
      bignumber,
      equal,
      smaller,
      smallerEq,
      larger,
      largerEq,
      add,
      isZero,
      isPositive
    })

    /**
     * Attach a transform function to math.range
     * Adds a property transform containing the transform function.
     *
     * This transform creates a range which includes the end value
     */
    return typed('range', {
      '...any': function (args: VariadicArgs): unknown {
        const lastIndex = args.length - 1
        const last = args[lastIndex]
        if (typeof last !== 'boolean') {
          // append a parameter includeEnd=true
          args.push(true)
        }

        return range.apply(null, args)
      }
    })
  },
  { isTransformFunction: true }
)

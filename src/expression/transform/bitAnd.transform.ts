import { createBitAnd } from '../../function/bitwise/bitAnd.ts'
import { factory } from '../../utils/factory.ts'
import { isCollection } from '../../utils/is.ts'
import type {
  TypedFunction,
  MathFunction,
  ExpressionNode,
  EvaluationScope,
  MathJsLike,
  RawArgsTransformFunction
} from './types.ts'

interface BitAndDependencies {
  typed: TypedFunction
  matrix: MathFunction
  equalScalar: MathFunction<boolean>
  zeros: MathFunction
  not: MathFunction<boolean>
  concat: MathFunction
}

const name = 'bitAnd'
const dependencies = [
  'typed',
  'matrix',
  'zeros',
  'add',
  'equalScalar',
  'not',
  'concat'
]

export const createBitAndTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, zeros, not, concat }: BitAndDependencies) => {
    const bitAnd = createBitAnd({
      typed,
      matrix,
      equalScalar,
      zeros,
      not,
      concat
    })

    function bitAndTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1)) {
        if (isNaN(condition1 as number)) {
          return NaN
        }
        if (condition1 === 0 || condition1 === false) {
          return 0
        }
      }
      const condition2 = args[1].compile().evaluate(scope)
      return bitAnd(condition1, condition2)
    }

    bitAndTransform.rawArgs = true as const

    return bitAndTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

import { createAnd } from '../../function/logical/and.ts'
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

interface AndDependencies {
  typed: TypedFunction
  matrix: MathFunction
  equalScalar: MathFunction<boolean>
  zeros: MathFunction
  not: MathFunction<boolean>
  concat: MathFunction
}

const name = 'and'
const dependencies = [
  'typed',
  'matrix',
  'zeros',
  'add',
  'equalScalar',
  'not',
  'concat'
]

export const createAndTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, zeros, not, concat }: AndDependencies) => {
    const and = createAnd({ typed, matrix, equalScalar, zeros, not, concat })

    function andTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1) && !and(condition1, true)) {
        return false
      }
      const condition2 = args[1].compile().evaluate(scope)
      return and(condition1, condition2)
    }

    andTransform.rawArgs = true as const

    return andTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

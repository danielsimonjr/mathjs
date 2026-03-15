import { createOr } from '../../function/logical/or.ts'
import { factory } from '../../utils/factory.ts'
import { isCollection } from '../../utils/is.ts'
import type {
  TypedFunction,
  MathFunction,
  ExpressionNode,
  EvaluationScope,
  MathJsLike,
  DenseMatrixConstructor,
  RawArgsTransformFunction
} from './types.ts'

interface OrDependencies {
  typed: TypedFunction
  matrix: MathFunction
  equalScalar: MathFunction<boolean>
  DenseMatrix: DenseMatrixConstructor
  concat: MathFunction
}

const name = 'or'
const dependencies = ['typed', 'matrix', 'equalScalar', 'DenseMatrix', 'concat']

export const createOrTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, DenseMatrix, concat }: OrDependencies) => {
    const or = createOr({ typed, matrix, equalScalar, DenseMatrix, concat })

    function orTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1) && or(condition1, false)) {
        return true
      }
      const condition2 = args[1].compile().evaluate(scope)
      return or(condition1, condition2)
    }

    orTransform.rawArgs = true as const

    return orTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

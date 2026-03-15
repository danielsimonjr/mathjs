import { createBitOr } from '../../function/bitwise/bitOr.ts'
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

interface BitOrDependencies {
  typed: TypedFunction
  matrix: MathFunction
  equalScalar: MathFunction<boolean>
  DenseMatrix: DenseMatrixConstructor
  concat: MathFunction
}

const name = 'bitOr'
const dependencies = ['typed', 'matrix', 'equalScalar', 'DenseMatrix', 'concat']

export const createBitOrTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, DenseMatrix, concat }: BitOrDependencies) => {
    const bitOr = createBitOr({
      typed,
      matrix,
      equalScalar,
      DenseMatrix,
      concat
    })

    function bitOrTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1)) {
        if (isNaN(condition1 as number)) {
          return NaN
        }
        if (condition1 === -1) {
          return -1
        }
        if (condition1 === true) {
          return 1
        }
      }
      const condition2 = args[1].compile().evaluate(scope)
      return bitOr(condition1, condition2)
    }

    bitOrTransform.rawArgs = true as const

    return bitOrTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

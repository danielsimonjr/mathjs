import { createNullish } from '../../function/logical/nullish.ts'
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

interface NullishDependencies {
  typed: TypedFunction
  matrix: MathFunction
  size: MathFunction<number[]>
  flatten: MathFunction
  deepEqual: MathFunction<boolean>
}

const name = 'nullish'
const dependencies = ['typed', 'matrix', 'size', 'flatten', 'deepEqual']

export const createNullishTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, size, flatten, deepEqual }: NullishDependencies) => {
    const nullish = createNullish({ typed, matrix, size, flatten, deepEqual })

    function nullishTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const left = args[0].compile().evaluate(scope)

      // If left is not a collection and not nullish, short-circuit and return it
      if (!isCollection(left) && left != null && left !== undefined) {
        return left
      }

      // Otherwise evaluate right and apply full nullish semantics (incl. element-wise)
      const right = args[1].compile().evaluate(scope)
      return nullish(left, right)
    }

    nullishTransform.rawArgs = true as const

    return nullishTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

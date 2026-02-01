import { createFilter } from '../../function/matrix/filter.ts'
import { factory } from '../../utils/factory.ts'
import { isFunctionAssignmentNode, isSymbolNode } from '../../utils/is.ts'
import { compileInlineExpression } from './utils/compileInlineExpression.ts'
import { createTransformCallback } from './utils/transformCallback.ts'
import type {
  TypedFunction,
  ExpressionNode,
  EvaluationScope,
  MathJsLike,
  CallbackFunction,
  RawArgsTransformFunction
} from './types.ts'

interface FilterDependencies {
  typed: TypedFunction
}

const name = 'filter'
const dependencies = ['typed']

export const createFilterTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: FilterDependencies) => {
    /**
     * Attach a transform function to math.filter
     * Adds a property transform containing the transform function.
     *
     * This transform adds support for equations as test function for math.filter,
     * so you can do something like 'filter([3, -2, 5], x > 0)'.
     */
    function filterTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      const filter = createFilter({ typed })
      const transformCallback = createTransformCallback({ typed })

      if (args.length === 0) {
        return filter()
      }
      let x: unknown = args[0]

      if (args.length === 1) {
        return filter(x)
      }

      const N = args.length - 1
      let callback: CallbackFunction | ExpressionNode = args[N]

      if (x) {
        x = _compileAndEvaluate(x as ExpressionNode, scope)
      }

      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          // a function pointer, like filter([3, -2, 5], myTestFunction)
          callback = _compileAndEvaluate(
            callback as ExpressionNode,
            scope
          ) as CallbackFunction
        } else {
          // an expression like filter([3, -2, 5], x > 0)
          callback = compileInlineExpression(
            callback as ExpressionNode,
            math,
            scope
          )
        }
      }

      return filter(x, transformCallback(callback as CallbackFunction, N))
    }
    filterTransform.rawArgs = true as const

    function _compileAndEvaluate(
      arg: ExpressionNode,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      return arg.compile().evaluate(scope)
    }

    return filterTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

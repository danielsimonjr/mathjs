import { createForEach } from '../../function/matrix/forEach.ts'
import { createTransformCallback } from './utils/transformCallback.ts'
import { factory } from '../../utils/factory.ts'
import { isFunctionAssignmentNode, isSymbolNode } from '../../utils/is.ts'
import { compileInlineExpression } from './utils/compileInlineExpression.ts'
import type {
  TypedFunction,
  ExpressionNode,
  EvaluationScope,
  MathJsLike,
  CallbackFunction,
  RawArgsTransformFunction
} from './types.ts'

interface ForEachDependencies {
  typed: TypedFunction
}

const name = 'forEach'
const dependencies = ['typed']

export const createForEachTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: ForEachDependencies) => {
    /**
     * Attach a transform function to math.forEach
     * Adds a property transform containing the transform function.
     *
     * This transform creates a one-based index instead of a zero-based index
     */
    const forEach = createForEach({ typed })
    const transformCallback = createTransformCallback({ typed })

    function forEachTransform(
      args: ExpressionNode[],
      math: MathJsLike,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      if (args.length === 0) {
        return forEach()
      }
      let x: unknown = args[0]

      if (args.length === 1) {
        return forEach(x)
      }

      const N = args.length - 1
      let callback: CallbackFunction | ExpressionNode = args[N]

      if (x) {
        x = _compileAndEvaluate(x as ExpressionNode, scope)
      }

      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          // a function pointer, like filter([3, -2, 5], myTestFunction)
          callback = _compileAndEvaluate(callback as ExpressionNode, scope) as CallbackFunction
        } else {
          // an expression like filter([3, -2, 5], x > 0)
          callback = compileInlineExpression(callback as ExpressionNode, math, scope)
        }
      }

      return forEach(x, transformCallback(callback as CallbackFunction, N))
    }
    forEachTransform.rawArgs = true as const

    function _compileAndEvaluate(
      arg: ExpressionNode,
      scope: EvaluationScope | Map<string, unknown>
    ): unknown {
      return arg.compile().evaluate(scope)
    }

    return forEachTransform as RawArgsTransformFunction
  },
  { isTransformFunction: true }
)

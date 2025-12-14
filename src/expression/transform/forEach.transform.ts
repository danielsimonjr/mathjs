import { createForEach } from '../../function/matrix/forEach.ts'
import { createTransformCallback } from './utils/transformCallback.ts'
import { factory } from '../../utils/factory.ts'
import { isFunctionAssignmentNode, isSymbolNode } from '../../utils/is.ts'
import { compileInlineExpression } from './utils/compileInlineExpression.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Node {
  compile(): CompiledExpression
}

interface CompiledExpression {
  evaluate(scope: any): any
}

interface TransformFunction {
  (args: Node[], math: any, scope: any): any
  rawArgs?: boolean
}

interface Dependencies {
  typed: TypedFunction
}

const name = 'forEach'
const dependencies = ['typed']

export const createForEachTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: Dependencies) => {
    /**
     * Attach a transform function to math.forEach
     * Adds a property transform containing the transform function.
     *
     * This transform creates a one-based index instead of a zero-based index
     */
    const forEach = createForEach({ typed })
    const transformCallback = createTransformCallback({ typed })
    function forEachTransform(args: Node[], math: any, scope: any): any {
      if (args.length === 0) {
        return forEach()
      }
      let x = args[0]

      if (args.length === 1) {
        return forEach(x)
      }

      const N = args.length - 1
      let callback: any = args[N]

      if (x) {
        x = _compileAndEvaluate(x, scope)
      }

      if (callback) {
        if (isSymbolNode(callback) || isFunctionAssignmentNode(callback)) {
          // a function pointer, like filter([3, -2, 5], myTestFunction)
          callback = _compileAndEvaluate(callback as unknown as Node, scope)
        } else {
          // an expression like filter([3, -2, 5], x > 0)
          callback = compileInlineExpression(callback, math, scope)
        }
      }

      return forEach(x, transformCallback(callback, N))
    }
    forEachTransform.rawArgs = true

    function _compileAndEvaluate(arg: Node, scope: any): any {
      return arg.compile().evaluate(scope)
    }
    return forEachTransform as TransformFunction
  },
  { isTransformFunction: true }
)

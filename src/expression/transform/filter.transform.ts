import { createFilter } from '../../function/matrix/filter.ts'
import { factory } from '../../utils/factory.ts'
import { isFunctionAssignmentNode, isSymbolNode } from '../../utils/is.ts'
import { compileInlineExpression } from './utils/compileInlineExpression.ts'
import { createTransformCallback } from './utils/transformCallback.ts'

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

const name = 'filter'
const dependencies = ['typed']

export const createFilterTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: Dependencies) => {
    /**
     * Attach a transform function to math.filter
     * Adds a property transform containing the transform function.
     *
     * This transform adds support for equations as test function for math.filter,
     * so you can do something like 'filter([3, -2, 5], x > 0)'.
     */
    function filterTransform(args: Node[], math: any, scope: any): any {
      const filter = createFilter({ typed })
      const transformCallback = createTransformCallback({ typed })

      if (args.length === 0) {
        return filter()
      }
      let x = args[0]

      if (args.length === 1) {
        return filter(x)
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

      return filter(x, transformCallback(callback, N))
    }
    filterTransform.rawArgs = true

    function _compileAndEvaluate(arg: Node, scope: any): any {
      return arg.compile().evaluate(scope)
    }

    return filterTransform as TransformFunction
  },
  { isTransformFunction: true }
)

import { createNullish } from '../../function/logical/nullish.ts'
import { factory } from '../../utils/factory.ts'
import { isCollection } from '../../utils/is.ts'

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
  matrix: (...args: any[]) => any
  size: (...args: any[]) => any
  flatten: (...args: any[]) => any
  deepEqual: (...args: any[]) => any
}

const name = 'nullish'
const dependencies = ['typed', 'matrix', 'size', 'flatten', 'deepEqual']

export const createNullishTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, size, flatten, deepEqual }: Dependencies) => {
  const nullish = createNullish({ typed, matrix, size, flatten, deepEqual })

  function nullishTransform(args: Node[], math: any, scope: any): any {
    const left = args[0].compile().evaluate(scope)

    // If left is not a collection and not nullish, short-circuit and return it
    if (!isCollection(left) && left != null && left !== undefined) {
      return left
    }

    // Otherwise evaluate right and apply full nullish semantics (incl. element-wise)
    const right = args[1].compile().evaluate(scope)
    return nullish(left, right)
  }

  nullishTransform.rawArgs = true

  return nullishTransform as TransformFunction
}, { isTransformFunction: true })

import { createAnd } from '../../function/logical/and.ts'
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
  equalScalar: (...args: any[]) => any
  zeros: (...args: any[]) => any
  not: (...args: any[]) => any
  concat: (...args: any[]) => any
}

const name = 'and'
const dependencies = ['typed', 'matrix', 'zeros', 'add', 'equalScalar', 'not', 'concat']

export const createAndTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, equalScalar, zeros, not, concat }: Dependencies) => {
  const and = createAnd({ typed, matrix, equalScalar, zeros, not, concat })

  function andTransform(args: Node[], math: any, scope: any): any {
    const condition1 = args[0].compile().evaluate(scope)
    if (!isCollection(condition1) && !and(condition1, true)) {
      return false
    }
    const condition2 = args[1].compile().evaluate(scope)
    return and(condition1, condition2)
  }

  andTransform.rawArgs = true

  return andTransform as TransformFunction
}, { isTransformFunction: true })

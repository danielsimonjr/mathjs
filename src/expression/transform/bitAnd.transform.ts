import { createBitAnd } from '../../function/bitwise/bitAnd.ts'
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

const name = 'bitAnd'
const dependencies = ['typed', 'matrix', 'zeros', 'add', 'equalScalar', 'not', 'concat']

export const createBitAndTransform = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, equalScalar, zeros, not, concat }: Dependencies) => {
  const bitAnd = createBitAnd({ typed, matrix, equalScalar, zeros, not, concat })

  function bitAndTransform(args: Node[], math: any, scope: any): any {
    const condition1 = args[0].compile().evaluate(scope)
    if (!isCollection(condition1)) {
      if (isNaN(condition1)) {
        return NaN
      }
      if (condition1 === 0 || condition1 === false) {
        return 0
      }
    }
    const condition2 = args[1].compile().evaluate(scope)
    return bitAnd(condition1, condition2)
  }

  bitAndTransform.rawArgs = true

  return bitAndTransform as TransformFunction
}, { isTransformFunction: true })

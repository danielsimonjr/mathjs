import { createOr } from '../../function/logical/or.ts'
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
  DenseMatrix: any
  concat: (...args: any[]) => any
}

const name = 'or'
const dependencies = ['typed', 'matrix', 'equalScalar', 'DenseMatrix', 'concat']

export const createOrTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, DenseMatrix, concat }: Dependencies) => {
    const or = createOr({ typed, matrix, equalScalar, DenseMatrix, concat })

    function orTransform(args: Node[], math: any, scope: any): any {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1) && or(condition1, false)) {
        return true
      }
      const condition2 = args[1].compile().evaluate(scope)
      return or(condition1, condition2)
    }

    orTransform.rawArgs = true

    return orTransform as TransformFunction
  },
  { isTransformFunction: true }
)

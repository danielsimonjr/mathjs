import { createBitOr } from '../../function/bitwise/bitOr.ts'
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

const name = 'bitOr'
const dependencies = ['typed', 'matrix', 'equalScalar', 'DenseMatrix', 'concat']

export const createBitOrTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, equalScalar, DenseMatrix, concat }: Dependencies) => {
    const bitOr = createBitOr({
      typed,
      matrix,
      equalScalar,
      DenseMatrix,
      concat
    })

    function bitOrTransform(args: Node[], math: any, scope: any): any {
      const condition1 = args[0].compile().evaluate(scope)
      if (!isCollection(condition1)) {
        if (isNaN(condition1)) {
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

    bitOrTransform.rawArgs = true

    return bitOrTransform as TransformFunction
  },
  { isTransformFunction: true }
)

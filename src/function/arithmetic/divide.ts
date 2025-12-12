import { factory } from '../../utils/factory.ts'
import { extend } from '../../utils/object.ts'
import { createMatAlgo11xS0s } from '../../type/matrix/utils/matAlgo11xS0s.ts'
import { createMatAlgo14xDs } from '../../type/matrix/utils/matAlgo14xDs.ts'

// Type definitions
interface TypedFunction<T = any> {
  (...args: any[]): T
  signatures?: Record<string, Function>
}

interface MatrixData {
  data?: any[] | any[][]
  values?: any[]
  index?: number[]
  ptr?: number[]
  size: number[]
  datatype?: string
}

interface DenseMatrix {
  _data: any[] | any[][]
  _size: number[]
  _datatype?: string
  storage(): 'dense'
  size(): number[]
  valueOf(): any[] | any[][]
}

interface SparseMatrix {
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  storage(): 'sparse'
  size(): number[]
  valueOf(): any[] | any[][]
}

type Matrix = DenseMatrix | SparseMatrix

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  multiply: TypedFunction
  equalScalar: TypedFunction
  divideScalar: TypedFunction
  inv: TypedFunction
}

const name = 'divide'
const dependencies = [
  'typed',
  'matrix',
  'multiply',
  'equalScalar',
  'divideScalar',
  'inv'
]

export const createDivide = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, multiply, equalScalar, divideScalar, inv }: Dependencies) => {
  const matAlgo11xS0s = createMatAlgo11xS0s({ typed, equalScalar })
  const matAlgo14xDs = createMatAlgo14xDs({ typed })

  /**
   * Divide two values, `x / y`.
   * To divide matrices, `x` is multiplied with the inverse of `y`: `x * inv(y)`.
   *
   * Syntax:
   *
   *    math.divide(x, y)
   *
   * Examples:
   *
   *    math.divide(2, 3)            // returns number 0.6666666666666666
   *
   *    const a = math.complex(5, 14)
   *    const b = math.complex(4, 1)
   *    math.divide(a, b)            // returns Complex 2 + 3i
   *
   *    const c = [[7, -6], [13, -4]]
   *    const d = [[1, 2], [4, 3]]
   *    math.divide(c, d)            // returns Array [[-9, 4], [-11, 6]]
   *
   *    const e = math.unit('18 km')
   *    math.divide(e, 4.5)          // returns Unit 4 km
   *
   * See also:
   *
   *    multiply
   *
   * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x   Numerator
   * @param  {number | BigNumber | bigint | Fraction | Complex | Array | Matrix} y          Denominator
   * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix}                      Quotient, `x / y`
   */
  return typed('divide', extend({
    // we extend the signatures of divideScalar with signatures dealing with matrices

    'Array | Matrix, Array | Matrix': function (x: any[] | Matrix, y: any[] | Matrix): any[] | Matrix {
      // TODO: implement matrix right division using pseudo inverse
      // https://www.mathworks.nl/help/matlab/ref/mrdivide.html
      // https://www.gnu.org/software/octave/doc/interpreter/Arithmetic-Ops.html
      // https://stackoverflow.com/questions/12263932/how-does-gnu-octave-matrix-division-work-getting-unexpected-behaviour
      return multiply(x, inv(y))
    },

    'DenseMatrix, any': function (x: DenseMatrix, y: any): DenseMatrix {
      return matAlgo14xDs(x as any, y, divideScalar, false) as unknown as DenseMatrix
    },

    'SparseMatrix, any': function (x: SparseMatrix, y: any): SparseMatrix {
      return matAlgo11xS0s(x as any, y, divideScalar, false) as unknown as SparseMatrix
    },

    'Array, any': function (x: any[], y: any): any[] {
      // use matrix implementation
      return matAlgo14xDs(matrix(x) as any, y, divideScalar, false).valueOf() as any[]
    },

    'any, Array | Matrix': function (x: any, y: any[] | Matrix): any[] | Matrix {
      return multiply(x, inv(y))
    }
  }, divideScalar.signatures))
})

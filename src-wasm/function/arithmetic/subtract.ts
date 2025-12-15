import { factory } from '../../utils/factory.ts'
import { createMatAlgo01xDSid } from '../../type/matrix/utils/matAlgo01xDSid.ts'
import { createMatAlgo03xDSf } from '../../type/matrix/utils/matAlgo03xDSf.ts'
import { createMatAlgo05xSfSf } from '../../type/matrix/utils/matAlgo05xSfSf.ts'
import { createMatAlgo10xSids } from '../../type/matrix/utils/matAlgo10xSids.ts'
import { createMatAlgo12xSfs } from '../../type/matrix/utils/matAlgo12xSfs.ts'
import { createMatrixAlgorithmSuite } from '../../type/matrix/utils/matrixAlgorithmSuite.ts'

// Type definitions for better WASM integration and type safety
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(
    signature: string,
    fn: (ref: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
  referToSelf<U>(
    fn: (self: TypedFunction<U>) => TypedFunction<U>
  ): TypedFunction<U>
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
  getDataType(): string
  createDenseMatrix(data: MatrixData): DenseMatrix
  valueOf(): any[] | any[][]
}

interface SparseMatrix {
  _values?: any[]
  _index?: number[]
  _ptr?: number[]
  _size: number[]
  _datatype?: string
  _data?: any
  storage(): 'sparse'
  size(): number[]
  getDataType(): string
  createSparseMatrix(data: MatrixData): SparseMatrix
  valueOf(): any[] | any[][]
}

type Matrix = DenseMatrix | SparseMatrix

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  equalScalar: TypedFunction
  subtractScalar: TypedFunction
  unaryMinus: TypedFunction
  DenseMatrix: any
  concat: TypedFunction
}

const name = 'subtract'
const dependencies = [
  'typed',
  'matrix',
  'equalScalar',
  'subtractScalar',
  'unaryMinus',
  'DenseMatrix',
  'concat'
]

export const createSubtract = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    equalScalar,
    subtractScalar,
    unaryMinus: _unaryMinus,
    DenseMatrix,
    concat
  }: Dependencies) => {
    // TODO: split function subtract in two: subtract and subtractScalar

    const matAlgo01xDSid = createMatAlgo01xDSid({ typed })
    const matAlgo03xDSf = createMatAlgo03xDSf({ typed })
    const matAlgo05xSfSf = createMatAlgo05xSfSf({ typed, equalScalar })
    const matAlgo10xSids = createMatAlgo10xSids({ typed, DenseMatrix })
    const matAlgo12xSfs = createMatAlgo12xSfs({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })

    /**
     * Subtract two values, `x - y`.
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.subtract(x, y)
     *
     * Examples:
     *
     *    math.subtract(5.3, 2)        // returns number 3.3
     *
     *    const a = math.complex(2, 3)
     *    const b = math.complex(4, 1)
     *    math.subtract(a, b)          // returns Complex -2 + 2i
     *
     *    math.subtract([5, 7, 4], 4)  // returns Array [1, 3, 0]
     *
     *    const c = math.unit('2.1 km')
     *    const d = math.unit('500m')
     *    math.subtract(c, d)          // returns Unit 1.6 km
     *
     * See also:
     *
     *    add
     *
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x Initial value
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} y Value to subtract from `x`
     * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} Subtraction of `x` and `y`
     */
    return typed(
      name,
      {
        'any, any': subtractScalar
      },
      matrixAlgorithmSuite({
        elop: subtractScalar,
        SS: matAlgo05xSfSf,
        DS: matAlgo01xDSid,
        SD: matAlgo03xDSf,
        Ss: matAlgo12xSfs,
        sS: matAlgo10xSids
      })
    )
  }
)

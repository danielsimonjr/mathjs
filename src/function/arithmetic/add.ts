import { factory } from '../../utils/factory.ts'
import { createMatAlgo01xDSid } from '../../type/matrix/utils/matAlgo01xDSid.ts'
import { createMatAlgo04xSidSid } from '../../type/matrix/utils/matAlgo04xSidSid.ts'
import { createMatAlgo10xSids } from '../../type/matrix/utils/matAlgo10xSids.ts'
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
  addScalar: TypedFunction
  equalScalar: TypedFunction
  DenseMatrix: any
  SparseMatrix: any
  concat: TypedFunction
}

const name = 'add'
const dependencies = [
  'typed',
  'matrix',
  'addScalar',
  'equalScalar',
  'DenseMatrix',
  'SparseMatrix',
  'concat'
]

export const createAdd = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    addScalar,
    equalScalar,
    DenseMatrix,
    SparseMatrix: _SparseMatrix,
    concat
  }: Dependencies) => {
    const matAlgo01xDSid = createMatAlgo01xDSid({ typed })
    const matAlgo04xSidSid = createMatAlgo04xSidSid({ typed, equalScalar })
    const matAlgo10xSids = createMatAlgo10xSids({ typed, DenseMatrix })
    const matrixAlgorithmSuite = createMatrixAlgorithmSuite({
      typed,
      matrix,
      concat
    })
    /**
     * Add two or more values, `x + y`.
     * For matrices, the function is evaluated element wise.
     *
     * Syntax:
     *
     *    math.add(x, y)
     *    math.add(x, y, z, ...)
     *
     * Examples:
     *
     *    math.add(2, 3)               // returns number 5
     *    math.add(2, 3, 4)            // returns number 9
     *
     *    const a = math.complex(2, 3)
     *    const b = math.complex(-4, 1)
     *    math.add(a, b)               // returns Complex -2 + 4i
     *
     *    math.add([1, 2, 3], 4)       // returns Array [5, 6, 7]
     *
     *    const c = math.unit('5 cm')
     *    const d = math.unit('2.1 mm')
     *    math.add(c, d)               // returns Unit 52.1 mm
     *
     *    math.add("2.3", "4")         // returns number 6.3
     *
     * See also:
     *
     *    subtract, sum
     *
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} x First value to add
     * @param  {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} y Second value to add
     * @return {number | BigNumber | bigint | Fraction | Complex | Unit | Array | Matrix} Sum of `x` and `y`
     */
    return typed(
      name,
      {
        'any, any': addScalar,

        'any, any, ...any': typed.referToSelf(
          (self: TypedFunction): any =>
            (x: any, y: any, rest: any[]) => {
              let result = self(x, y)

              for (let i = 0; i < rest.length; i++) {
                result = self(result, rest[i])
              }

              return result
            }
        )
      },
      matrixAlgorithmSuite({
        elop: addScalar,
        DS: matAlgo01xDSid,
        SS: matAlgo04xSidSid,
        Ss: matAlgo10xSids
      })
    )
  }
)

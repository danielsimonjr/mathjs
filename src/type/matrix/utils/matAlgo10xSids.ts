import { factory } from '../../../utils/factory.js'

// Type definitions
type DataType = string | undefined
type MatrixValue = any
type MatrixData = any[][]

interface TypedFunction {
  find(fn: Function, signature: string[]): Function
  convert(value: any, datatype: string): any
}

interface DenseMatrixConstructor {
  new(data: { data: MatrixData; size: number[]; datatype?: DataType }): DenseMatrix
}

interface DenseMatrix {
  _data: MatrixData
  _size: number[]
  _datatype?: DataType
}

interface SparseMatrix {
  _values?: MatrixValue[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _datatype?: DataType
}

type CallbackFunction = (a: any, b: any) => any

const name = 'matAlgo10xSids'
const dependencies = ['typed', 'DenseMatrix']

export const createMatAlgo10xSids = /* #__PURE__ */ factory(name, dependencies, ({ typed, DenseMatrix }: {
  typed: TypedFunction
  DenseMatrix: DenseMatrixConstructor
}) => {
  /**
   * Iterates over SparseMatrix S nonzero items and invokes the callback function f(Sij, b).
   * Callback function invoked NZ times (number of nonzero items in S).
   *
   *
   *          ┌  f(Sij, b)  ; S(i,j) !== 0
   * C(i,j) = ┤
   *          └  b          ; otherwise
   *
   *
   * @param {Matrix}   s                 The SparseMatrix instance (S)
   * @param {Scalar}   b                 The Scalar value
   * @param {Function} callback          The f(Aij,b) operation to invoke
   * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Sij)
   *
   * @return {Matrix}                    DenseMatrix (C)
   *
   * https://github.com/josdejong/mathjs/pull/346#issuecomment-97626813
   */
  return function matAlgo10xSids(s: SparseMatrix, b: any, callback: CallbackFunction, inverse: boolean): DenseMatrix {
    // sparse matrix arrays
    const avalues = s._values
    const aindex = s._index
    const aptr = s._ptr
    const asize = s._size
    const adt: DataType = s._datatype

    // sparse matrix cannot be a Pattern matrix
    if (!avalues) {
      throw new Error('Cannot perform operation on Pattern Sparse Matrix and Scalar value')
    }

    // rows & columns
    const rows = asize[0]
    const columns = asize[1]

    // datatype
    let dt: DataType
    // callback signature to use
    let cf: CallbackFunction = callback

    // process data types
    if (typeof adt === 'string') {
      // datatype
      dt = adt
      // convert b to the same datatype
      b = typed.convert(b, dt)
      // callback
      cf = typed.find(callback, [dt, dt]) as CallbackFunction
    }

    // result arrays
    const cdata: MatrixData = []

    // workspaces
    const x: MatrixValue[] = []
    // marks indicating we have a value in x for a given column
    const w: number[] = []

    // loop columns
    for (let j = 0; j < columns; j++) {
      // columns mark
      const mark = j + 1
      // values in j
      for (let k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
        // row
        const r = aindex[k]
        // update workspace
        x[r] = avalues[k]
        w[r] = mark
      }
      // loop rows
      for (let i = 0; i < rows; i++) {
        // initialize C on first column
        if (j === 0) {
          // create row array
          cdata[i] = []
        }
        // check sparse matrix has a value @ i,j
        if (w[i] === mark) {
          // invoke callback, update C
          cdata[i][j] = inverse ? cf(b, x[i]) : cf(x[i], b)
        } else {
          // dense matrix value @ i, j
          cdata[i][j] = b
        }
      }
    }

    // return dense matrix
    return new DenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: dt
    })
  }
})

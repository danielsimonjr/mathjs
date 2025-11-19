import { clone } from '../../utils/object.js'
import { format } from '../../utils/string.js'
import { factory } from '../../utils/factory.js'

// Type definitions for better WASM integration and type safety
interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
  convert(value: any, type: string): any
  referTo<U>(signature: string, fn: (ref: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
  referToSelf<U>(fn: (self: TypedFunction<U>) => TypedFunction<U>): TypedFunction<U>
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
  clone(): DenseMatrix
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
  clone(): SparseMatrix
}

type Matrix = DenseMatrix | SparseMatrix

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
}

const name = 'transpose'
const dependencies = ['typed', 'matrix']

export const createTranspose = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix }: Dependencies) => {
  /**
   * Transpose a matrix. All values of the matrix are reflected over its
   * main diagonal. Only applicable to two dimensional matrices containing
   * a vector (i.e. having size `[1,n]` or `[n,1]`). One dimensional
   * vectors and scalars return the input unchanged.
   *
   * Syntax:
   *
   *     math.transpose(x)
   *
   * Examples:
   *
   *     const A = [[1, 2, 3], [4, 5, 6]]
   *     math.transpose(A)               // returns [[1, 4], [2, 5], [3, 6]]
   *
   * See also:
   *
   *     diag, inv, subset, squeeze
   *
   * @param {Array | Matrix} x  Matrix to be transposed
   * @return {Array | Matrix}   The transposed matrix
   */
  return typed(name, {
    Array: (x: any[]): any[] => transposeMatrix(matrix(x)).valueOf() as any[],
    Matrix: transposeMatrix,
    any: clone // scalars
  })

  /**
   * Transpose a matrix
   * @param x - Matrix to transpose
   * @returns Transposed matrix
   */
  function transposeMatrix(x: Matrix): Matrix {
    // matrix size
    const size = x.size()

    // result
    let c: Matrix

    // process dimensions
    switch (size.length) {
      case 1:
        // vector
        c = x.clone()
        break

      case 2:
        {
          // rows and columns
          const rows = size[0]
          const columns = size[1]

          // check columns
          if (columns === 0) {
            // throw exception
            throw new RangeError('Cannot transpose a 2D matrix with no columns (size: ' + format(size) + ')')
          }

          // process storage format
          switch (x.storage()) {
            case 'dense':
              c = _denseTranspose(x as DenseMatrix, rows, columns)
              break
            case 'sparse':
              c = _sparseTranspose(x as SparseMatrix, rows, columns)
              break
          }
        }
        break

      default:
        // multi dimensional
        throw new RangeError('Matrix must be a vector or two dimensional (size: ' + format(size) + ')')
    }
    return c
  }

  /**
   * Transpose a dense matrix
   * @param m - Dense matrix to transpose
   * @param rows - Number of rows
   * @param columns - Number of columns
   * @returns Transposed dense matrix
   */
  function _denseTranspose(m: DenseMatrix, rows: number, columns: number): DenseMatrix {
    // matrix array
    const data = m._data as any[][]
    // transposed matrix data
    const transposed: any[][] = []
    let transposedRow: any[]
    // loop columns
    for (let j = 0; j < columns; j++) {
      // initialize row
      transposedRow = transposed[j] = []
      // loop rows
      for (let i = 0; i < rows; i++) {
        // set data
        transposedRow[i] = clone(data[i][j])
      }
    }
    // return matrix
    return m.createDenseMatrix({
      data: transposed,
      size: [columns, rows],
      datatype: m._datatype
    })
  }

  /**
   * Transpose a sparse matrix
   * @param m - Sparse matrix to transpose
   * @param rows - Number of rows
   * @param columns - Number of columns
   * @returns Transposed sparse matrix
   */
  function _sparseTranspose(m: SparseMatrix, rows: number, columns: number): SparseMatrix {
    // matrix arrays
    const values = m._values
    const index = m._index!
    const ptr = m._ptr!
    // result matrices
    const cvalues: any[] | undefined = values ? [] : undefined
    const cindex: number[] = []
    const cptr: number[] = []
    // row counts
    const w: number[] = []
    for (let x = 0; x < rows; x++) { w[x] = 0 }
    // vars
    let p: number, l: number, j: number
    // loop values in matrix
    for (p = 0, l = index.length; p < l; p++) {
      // number of values in row
      w[index[p]]++
    }
    // cumulative sum
    let sum = 0
    // initialize cptr with the cummulative sum of row counts
    for (let i = 0; i < rows; i++) {
      // update cptr
      cptr.push(sum)
      // update sum
      sum += w[i]
      // update w
      w[i] = cptr[i]
    }
    // update cptr
    cptr.push(sum)
    // loop columns
    for (j = 0; j < columns; j++) {
      // values & index in column
      for (let k0 = ptr[j], k1 = ptr[j + 1], k = k0; k < k1; k++) {
        // C values & index
        const q = w[index[k]]++
        // C[j, i] = A[i, j]
        cindex[q] = j
        // check we need to process values (pattern matrix)
        if (values) { cvalues![q] = clone(values[k]) }
      }
    }
    // return matrix
    return m.createSparseMatrix({
      values: cvalues,
      index: cindex,
      ptr: cptr,
      size: [columns, rows],
      datatype: m._datatype
    })
  }
})

import { factory } from '../../../utils/factory.ts'
import { DimensionError } from '../../../error/DimensionError.ts'

// Type definitions
type DataType = string | undefined
type MatrixValue = any

interface SparseMatrix {
  _values?: MatrixValue[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _data?: any
  _datatype?: DataType
  getDataType(): DataType
}

interface SparseMatrixConstructor {
  new (config: {
    values: MatrixValue[]
    index: number[]
    ptr: number[]
    size: number[]
    datatype?: DataType
  }): SparseMatrix
}

interface TypedFunction {
  find(fn: Function, signature: string[]): Function
  convert(value: any, datatype: string): any
}

type MatrixCallback = (a: any, b: any) => any

const name = 'matAlgo07xSSf'
const dependencies = ['typed', 'SparseMatrix']

export const createMatAlgo07xSSf = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, SparseMatrix }: { typed: TypedFunction; SparseMatrix: SparseMatrixConstructor }) => {
    /**
     * Iterates over SparseMatrix A and SparseMatrix B items (zero and nonzero) and invokes the callback function f(Aij, Bij).
     * Callback function invoked MxN times.
     *
     * C(i,j) = f(Aij, Bij)
     *
     * @param {Matrix}   a                 The SparseMatrix instance (A)
     * @param {Matrix}   b                 The SparseMatrix instance (B)
     * @param {Function} callback          The f(Aij,Bij) operation to invoke
     *
     * @return {Matrix}                    SparseMatrix (C)
     *
     * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97620294
     */
    return function matAlgo07xSSf(
      a: SparseMatrix,
      b: SparseMatrix,
      callback: MatrixCallback
    ): SparseMatrix {
      // sparse matrix arrays
      const asize: number[] = a._size
      const adt: DataType = a._datatype || a._data === undefined ? a._datatype : a.getDataType()
      const bsize: number[] = b._size
      const bdt: DataType = b._datatype || b._data === undefined ? b._datatype : b.getDataType()

      // validate dimensions
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length)
      }
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')')
      }

      // rows & columns
      const rows: number = asize[0]
      const columns: number = asize[1]

      // datatype
      let dt: DataType
      let zero: any = 0
      let cf: MatrixCallback = callback

      // process data types
      if (typeof adt === 'string' && adt === bdt && adt !== 'mixed') {
        dt = adt
        zero = typed.convert(0, dt)
        cf = typed.find(callback, [dt, dt]) as any as any
      }

      // result arrays for sparse format
      const cvalues: MatrixValue[] = []
      const cindex: number[] = []
      const cptr: number[] = new Array(columns + 1).fill(0) // Start with column pointer array

      // workspaces
      const xa: MatrixValue[] = []
      const xb: MatrixValue[] = []
      const wa: number[] = []
      const wb: number[] = []

      // loop columns
      for (let j = 0; j < columns; j++) {
        const mark: number = j + 1
        let nonZeroCount: number = 0

        _scatter(a, j, wa, xa, mark)
        _scatter(b, j, wb, xb, mark)

        // loop rows
        for (let i = 0; i < rows; i++) {
          const va: MatrixValue = wa[i] === mark ? xa[i] : zero
          const vb: MatrixValue = wb[i] === mark ? xb[i] : zero

          // invoke callback
          const cij: MatrixValue = cf(va, vb)
          // Store all non zero and true values
          if (cij !== 0 && cij !== false) {
            cindex.push(i) // row index
            cvalues.push(cij) // computed value
            nonZeroCount++
          }
        }

        // Update column pointer with cumulative count of non-zero values
        cptr[j + 1] = cptr[j] + nonZeroCount
      }

      // Return the result as a sparse matrix
      return new SparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
      })
    }

    function _scatter(
      m: SparseMatrix,
      j: number,
      w: number[],
      x: MatrixValue[],
      mark: number
    ): void {
      // a arrays
      const values: MatrixValue[] | undefined = m._values
      const index: number[] = m._index
      const ptr: number[] = m._ptr
      // loop values in column j
      for (let k = ptr[j], k1 = ptr[j + 1]; k < k1; k++) {
        // row
        const i: number = index[k]
        // update workspace
        w[i] = mark
        if (values) {
          x[i] = values[k]
        }
      }
    }
  }
)

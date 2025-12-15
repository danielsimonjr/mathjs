import { factory } from '../../../utils/factory.ts'
import { DimensionError } from '../../../error/DimensionError.ts'

// Type definitions
type DataType = string | undefined
type MatrixValue = any
type MatrixData = any[][]

interface DenseMatrix {
  _data: MatrixData
  _size: number[]
  _datatype?: DataType
  getDataType(): DataType
  createDenseMatrix(config: {
    data: MatrixData
    size: number[]
    datatype?: DataType
  }): DenseMatrix
}

interface SparseMatrix {
  _values?: MatrixValue[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _data?: any
  _datatype?: DataType
  getDataType(): DataType
}

interface _TypedFunction {
  find(fn: Function, signature: string[]): Function
  convert(value: any, datatype: string): any
}

type MatrixCallback = (a: any, b: any) => any

const name = 'matAlgo03xDSf'
const dependencies = ['typed']

export const createMatAlgo03xDSf = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: any) => {
    /**
     * Iterates over SparseMatrix items and invokes the callback function f(Dij, Sij).
     * Callback function invoked M*N times.
     *
     *
     *          ┌  f(Dij, Sij)  ; S(i,j) !== 0
     * C(i,j) = ┤
     *          └  f(Dij, 0)    ; otherwise
     *
     *
     * @param {Matrix}   denseMatrix       The DenseMatrix instance (D)
     * @param {Matrix}   sparseMatrix      The SparseMatrix instance (C)
     * @param {Function} callback          The f(Dij,Sij) operation to invoke, where Dij = DenseMatrix(i,j) and Sij = SparseMatrix(i,j)
     * @param {boolean}  inverse           A true value indicates callback should be invoked f(Sij,Dij)
     *
     * @return {Matrix}                    DenseMatrix (C)
     *
     * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97477571
     */
    return function matAlgo03xDSf(
      denseMatrix: DenseMatrix,
      sparseMatrix: SparseMatrix,
      callback: MatrixCallback,
      inverse: boolean
    ): DenseMatrix {
      // dense matrix arrays
      const adata: MatrixData = denseMatrix._data
      const asize: number[] = denseMatrix._size
      const adt: DataType = denseMatrix._datatype || denseMatrix.getDataType()

      // sparse matrix arrays
      const bvalues: MatrixValue[] | undefined = sparseMatrix._values
      const bindex: number[] = sparseMatrix._index
      const bptr: number[] = sparseMatrix._ptr
      const bsize: number[] = sparseMatrix._size
      const bdt: DataType =
        sparseMatrix._datatype || sparseMatrix._data === undefined
          ? sparseMatrix._datatype
          : sparseMatrix.getDataType()

      // validate dimensions
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length)
      }

      // check rows & columns
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError(
          'Dimension mismatch. Matrix A (' +
            asize +
            ') must match Matrix B (' +
            bsize +
            ')'
        )
      }

      // sparse matrix cannot be a Pattern matrix
      if (!bvalues) {
        throw new Error(
          'Cannot perform operation on Dense Matrix and Pattern Sparse Matrix'
        )
      }

      // rows & columns
      const rows: number = asize[0]
      const columns: number = asize[1]

      // datatype
      let dt: DataType
      // zero value
      let zero: any = 0
      // callback signature to use
      let cf: MatrixCallback = callback

      // process data types
      if (typeof adt === 'string' && adt === bdt && adt !== 'mixed') {
        // datatype
        dt = adt
        // convert 0 to the same datatype
        zero = typed.convert(0, dt)
        // callback
        cf = typed.find(callback, [dt, dt]) as any as any as any
      }

      // result (DenseMatrix)
      const cdata: MatrixData = []

      // initialize dense matrix
      for (let z = 0; z < rows; z++) {
        // initialize row
        cdata[z] = []
      }

      // workspace
      const x: MatrixValue[] = []
      // marks indicating we have a value in x for a given column
      const w: number[] = []

      // loop columns in b
      for (let j = 0; j < columns; j++) {
        // column mark
        const mark: number = j + 1
        // values in column j
        for (let k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          // row
          const i: number = bindex[k]
          // update workspace
          x[i] = inverse
            ? cf(bvalues[k], adata[i][j])
            : cf(adata[i][j], bvalues[k])
          w[i] = mark
        }
        // process workspace
        for (let y = 0; y < rows; y++) {
          // check we have a calculated value for current row
          if (w[y] === mark) {
            // use calculated value
            cdata[y][j] = x[y]
          } else {
            // calculate value
            cdata[y][j] = inverse
              ? cf(zero, adata[y][j])
              : cf(adata[y][j], zero)
          }
        }
      }

      // return dense matrix
      return denseMatrix.createDenseMatrix({
        data: cdata,
        size: [rows, columns],
        datatype:
          adt === denseMatrix._datatype && bdt === sparseMatrix._datatype
            ? dt
            : undefined
      })
    }
  }
)

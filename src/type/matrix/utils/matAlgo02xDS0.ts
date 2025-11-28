import { factory } from '../../../utils/factory.js'
import { DimensionError } from '../../../error/DimensionError.js'

// Type definitions
type DataType = string | undefined
type MatrixValue = any
type MatrixData = any[][]

interface DenseMatrix {
  _data: MatrixData
  _size: number[]
  _datatype?: DataType
  getDataType(): DataType
}

interface SparseMatrix {
  _values?: MatrixValue[]
  _index: number[]
  _ptr: number[]
  _size: number[]
  _data?: any
  _datatype?: DataType
  getDataType(): DataType
  createSparseMatrix(config: {
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

interface EqualScalarFunction {
  (a: any, b: any): boolean
}

type MatrixCallback = (a: any, b: any) => any

const name = 'matAlgo02xDS0'
const dependencies = ['typed', 'equalScalar']

export const createMatAlgo02xDS0 = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, equalScalar }: { typed: TypedFunction; equalScalar: EqualScalarFunction }) => {
    /**
     * Iterates over SparseMatrix nonzero items and invokes the callback function f(Dij, Sij).
     * Callback function invoked NNZ times (number of nonzero items in SparseMatrix).
     *
     *
     *          ┌  f(Dij, Sij)  ; S(i,j) !== 0
     * C(i,j) = ┤
     *          └  0            ; otherwise
     *
     *
     * @param {Matrix}   denseMatrix       The DenseMatrix instance (D)
     * @param {Matrix}   sparseMatrix      The SparseMatrix instance (S)
     * @param {Function} callback          The f(Dij,Sij) operation to invoke, where Dij = DenseMatrix(i,j) and Sij = SparseMatrix(i,j)
     * @param {boolean}  inverse           A true value indicates callback should be invoked f(Sij,Dij)
     *
     * @return {Matrix}                    SparseMatrix (C)
     *
     * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97477571
     */
    return function matAlgo02xDS0(
      denseMatrix: DenseMatrix,
      sparseMatrix: SparseMatrix,
      callback: MatrixCallback,
      inverse: boolean
    ): SparseMatrix {
      // dense matrix arrays
      const adata: MatrixData = denseMatrix._data
      const asize: number[] = denseMatrix._size
      const adt: DataType = denseMatrix._datatype || denseMatrix.getDataType()

      // sparse matrix arrays
      const bvalues: MatrixValue[] | undefined = sparseMatrix._values
      const bindex: number[] = sparseMatrix._index
      const bptr: number[] = sparseMatrix._ptr
      const bsize: number[] = sparseMatrix._size
      const bdt: DataType = sparseMatrix._datatype || sparseMatrix._data === undefined ? sparseMatrix._datatype : sparseMatrix.getDataType()

      // validate dimensions
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length)
      }

      // check rows & columns
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')')
      }

      // sparse matrix cannot be a Pattern matrix
      if (!bvalues) {
        throw new Error('Cannot perform operation on Dense Matrix and Pattern Sparse Matrix')
      }

      // rows & columns
      const rows: number = asize[0]
      const columns: number = asize[1]

      // datatype
      let dt: DataType
      // equal signature to use
      let eq: EqualScalarFunction = equalScalar
      // zero value
      let zero: any = 0
      // callback signature to use
      let cf: MatrixCallback = callback

      // process data types
      if (typeof adt === 'string' && adt === bdt && adt !== 'mixed') {
        // datatype
        dt = adt
        // find signature that matches (dt, dt)
        eq = typed.find(equalScalar, [dt, dt]) as EqualScalarFunction
        // convert 0 to the same datatype
        zero = typed.convert(0, dt)
        // callback
        cf = typed.find(callback, [dt, dt])
      }

      // result (SparseMatrix)
      const cvalues: MatrixValue[] = []
      const cindex: number[] = []
      const cptr: number[] = []

      // loop columns in b
      for (let j = 0; j < columns; j++) {
        // update cptr
        cptr[j] = cindex.length
        // values in column j
        for (let k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          // row
          const i: number = bindex[k]
          // update C(i,j)
          const cij: MatrixValue = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k])
          // check for nonzero
          if (!eq(cij, zero)) {
            // push i & v
            cindex.push(i)
            cvalues.push(cij)
          }
        }
      }
      // update cptr
      cptr[columns] = cindex.length

      // return sparse matrix
      return sparseMatrix.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: adt === denseMatrix._datatype && bdt === sparseMatrix._datatype ? dt : undefined
      })
    }
  }
)

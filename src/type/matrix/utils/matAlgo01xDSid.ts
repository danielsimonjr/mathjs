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

interface TypedFunction {
  find(fn: Function, signature: string[]): Function
  convert(value: any, datatype: string): any
}

type MatrixCallback = (a: any, b: any) => any

const name = 'matAlgo01xDSid'
const dependencies = ['typed']

<<<<<<< HEAD
export const createMatAlgo01xDSid = /* #__PURE__ */ factory(name, dependencies, ({ typed }: any) => {
=======
export const createMatAlgo01xDSid = /* #__PURE__ */ factory(name, dependencies, ({ typed }: { typed: TypedFunction }) => {
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
  /**
   * Iterates over SparseMatrix nonzero items and invokes the callback function f(Dij, Sij).
   * Callback function invoked NNZ times (number of nonzero items in SparseMatrix).
   *
   *
   *          ┌  f(Dij, Sij)  ; S(i,j) !== 0
   * C(i,j) = ┤
   *          └  Dij          ; otherwise
   *
   *
   * @param {Matrix}   denseMatrix       The DenseMatrix instance (D)
   * @param {Matrix}   sparseMatrix      The SparseMatrix instance (S)
   * @param {Function} callback          The f(Dij,Sij) operation to invoke, where Dij = DenseMatrix(i,j) and Sij = SparseMatrix(i,j)
   * @param {boolean}  inverse           A true value indicates callback should be invoked f(Sij,Dij)
   *
   * @return {Matrix}                    DenseMatrix (C)
   *
   * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97477571
   */
  return function algorithm1(
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

    // process data types
    const dt: DataType = typeof adt === 'string' && adt !== 'mixed' && adt === bdt ? adt : undefined
    // callback function
<<<<<<< HEAD
    const cf: MatrixCallback = dt ? typed.find(callback, [dt, dt]) as any as any : callback
=======
    const cf: MatrixCallback = dt ? typed.find(callback, [dt, dt]) : callback
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

    // vars
    let i: number, j: number

    // result (DenseMatrix)
    const cdata: MatrixData = []
    // initialize c
    for (i = 0; i < rows; i++) {
      cdata[i] = []
    }

    // workspace
    const x: MatrixValue[] = []
    // marks indicating we have a value in x for a given column
    const w: number[] = []

    // loop columns in b
    for (j = 0; j < columns; j++) {
      // column mark
      const mark: number = j + 1
      // values in column j
      for (let k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
        // row
        i = bindex[k]
        // update workspace
        x[i] = inverse ? cf(bvalues[k], adata[i][j]) : cf(adata[i][j], bvalues[k])
        // mark i as updated
        w[i] = mark
      }
      // loop rows
      for (i = 0; i < rows; i++) {
        // check row is in workspace
        if (w[i] === mark) {
          // c[i][j] was already calculated
          cdata[i][j] = x[i]
        } else {
          // item does not exist in S
          cdata[i][j] = adata[i][j]
        }
      }
    }

    // return dense matrix
    return denseMatrix.createDenseMatrix({
      data: cdata,
      size: [rows, columns],
      datatype: adt === denseMatrix._datatype && bdt === sparseMatrix._datatype ? dt : undefined
    })
  }
})

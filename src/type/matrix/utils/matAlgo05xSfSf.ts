import { factory } from '../../../utils/factory.js'
import { DimensionError } from '../../../error/DimensionError.js'

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
  createSparseMatrix(config: {
    values?: MatrixValue[]
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

const name = 'matAlgo05xSfSf'
const dependencies = ['typed', 'equalScalar']

export const createMatAlgo05xSfSf = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, equalScalar }: { typed: TypedFunction; equalScalar: EqualScalarFunction }) => {
    /**
     * Iterates over SparseMatrix A and SparseMatrix B nonzero items and invokes the callback function f(Aij, Bij).
     * Callback function invoked MAX(NNZA, NNZB) times
     *
     *
     *          ┌  f(Aij, Bij)  ; A(i,j) !== 0 || B(i,j) !== 0
     * C(i,j) = ┤
     *          └  0            ; otherwise
     *
     *
     * @param {Matrix}   a                 The SparseMatrix instance (A)
     * @param {Matrix}   b                 The SparseMatrix instance (B)
     * @param {Function} callback          The f(Aij,Bij) operation to invoke
     *
     * @return {Matrix}                    SparseMatrix (C)
     *
     * see https://github.com/josdejong/mathjs/pull/346#issuecomment-97620294
     */
    return function matAlgo05xSfSf(
      a: SparseMatrix,
      b: SparseMatrix,
      callback: MatrixCallback
    ): SparseMatrix {
      // sparse matrix arrays
      const avalues: MatrixValue[] | undefined = a._values
      const aindex: number[] = a._index
      const aptr: number[] = a._ptr
      const asize: number[] = a._size
      const adt: DataType = a._datatype || a._data === undefined ? a._datatype : a.getDataType()

      // sparse matrix arrays
      const bvalues: MatrixValue[] | undefined = b._values
      const bindex: number[] = b._index
      const bptr: number[] = b._ptr
      const bsize: number[] = b._size
      const bdt: DataType = b._datatype || b._data === undefined ? b._datatype : b.getDataType()

      // validate dimensions
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length)
      }

      // check rows & columns
      if (asize[0] !== bsize[0] || asize[1] !== bsize[1]) {
        throw new RangeError('Dimension mismatch. Matrix A (' + asize + ') must match Matrix B (' + bsize + ')')
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

      // result arrays
      const cvalues: MatrixValue[] | undefined = avalues && bvalues ? [] : undefined
      const cindex: number[] = []
      const cptr: number[] = []

      // workspaces
      const xa: MatrixValue[] | undefined = cvalues ? [] : undefined
      const xb: MatrixValue[] | undefined = cvalues ? [] : undefined
      // marks indicating we have a value in x for a given column
      const wa: number[] = []
      const wb: number[] = []

      // vars
      let i: number, j: number, k: number, k1: number

      // loop columns
      for (j = 0; j < columns; j++) {
        // update cptr
        cptr[j] = cindex.length
        // columns mark
        const mark: number = j + 1
        // loop values A(:,j)
        for (k = aptr[j], k1 = aptr[j + 1]; k < k1; k++) {
          // row
          i = aindex[k]
          // push index
          cindex.push(i)
          // update workspace
          wa[i] = mark
          // check we need to process values
          if (xa && avalues) {
            xa[i] = avalues[k]
          }
        }
        // loop values B(:,j)
        for (k = bptr[j], k1 = bptr[j + 1]; k < k1; k++) {
          // row
          i = bindex[k]
          // check row existed in A
          if (wa[i] !== mark) {
            // push index
            cindex.push(i)
          }
          // update workspace
          wb[i] = mark
          // check we need to process values
          if (xb && bvalues) {
            xb[i] = bvalues[k]
          }
        }
        // check we need to process values (non pattern matrix)
        if (cvalues) {
          // initialize first index in j
          k = cptr[j]
          // loop index in j
          while (k < cindex.length) {
            // row
            i = cindex[k]
            // marks
            const wai: number = wa[i]
            const wbi: number = wb[i]
            // check Aij or Bij are nonzero
            if (wai === mark || wbi === mark) {
              // matrix values @ i,j
              const va: MatrixValue = wai === mark ? xa![i] : zero
              const vb: MatrixValue = wbi === mark ? xb![i] : zero
              // Cij
              const vc: MatrixValue = cf(va, vb)
              // check for zero
              if (!eq(vc, zero)) {
                // push value
                cvalues.push(vc)
                // increment pointer
                k++
              } else {
                // remove value @ i, do not increment pointer
                cindex.splice(k, 1)
              }
            }
          }
        }
      }
      // update cptr
      cptr[columns] = cindex.length

      // return sparse matrix
      return a.createSparseMatrix({
        values: cvalues,
        index: cindex,
        ptr: cptr,
        size: [rows, columns],
        datatype: adt === a._datatype && bdt === b._datatype ? dt : undefined
      })
    }
  }
)

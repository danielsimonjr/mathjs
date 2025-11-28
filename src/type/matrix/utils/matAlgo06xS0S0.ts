import { factory } from '../../../utils/factory.js'
import { DimensionError } from '../../../error/DimensionError.js'
import { scatter } from '../../../utils/collection.js'

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

const name = 'matAlgo06xS0S0'
const dependencies = ['typed', 'equalScalar']

export const createMatAlgo06xS0S0 = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, equalScalar }: { typed: TypedFunction; equalScalar: EqualScalarFunction }) => {
    /**
     * Iterates over SparseMatrix A and SparseMatrix B nonzero items and invokes the callback function f(Aij, Bij).
     * Callback function invoked (Anz U Bnz) times, where Anz and Bnz are the nonzero elements in both matrices.
     *
     *
     *          ┌  f(Aij, Bij)  ; A(i,j) !== 0 && B(i,j) !== 0
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
    return function matAlgo06xS0S0(
      a: SparseMatrix,
      b: SparseMatrix,
      callback: MatrixCallback
    ): SparseMatrix {
      // sparse matrix arrays
      const avalues: MatrixValue[] | undefined = a._values
      const asize: number[] = a._size
      const adt: DataType = a._datatype || a._data === undefined ? a._datatype : a.getDataType()

      // sparse matrix arrays
      const bvalues: MatrixValue[] | undefined = b._values
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
      const x: MatrixValue[] | undefined = cvalues ? [] : undefined
      // marks indicating we have a value in x for a given column
      const w: number[] = []
      // marks indicating value in a given row has been updated
      const u: number[] = []

      // loop columns
      for (let j = 0; j < columns; j++) {
        // update cptr
        cptr[j] = cindex.length
        // columns mark
        const mark: number = j + 1
        // scatter the values of A(:,j) into workspace
        scatter(a, j, w, x, u, mark, cindex, cf)
        // scatter the values of B(:,j) into workspace
        scatter(b, j, w, x, u, mark, cindex, cf)
        // check we need to process values (non pattern matrix)
        if (x) {
          // initialize first index in j
          let k: number = cptr[j]
          // loop index in j
          while (k < cindex.length) {
            // row
            const i: number = cindex[k]
            // check function was invoked on current row (Aij !=0 && Bij != 0)
            if (u[i] === mark) {
              // value @ i
              const v: MatrixValue = x[i]
              // check for zero value
              if (!eq(v, zero)) {
                // push value
                cvalues!.push(v)
                // increment pointer
                k++
              } else {
                // remove value @ i, do not increment pointer
                cindex.splice(k, 1)
              }
            } else {
              // remove value @ i, do not increment pointer
              cindex.splice(k, 1)
            }
          }
        } else {
          // initialize first index in j
          let p: number = cptr[j]
          // loop index in j
          while (p < cindex.length) {
            // row
            const r: number = cindex[p]
            // check function was invoked on current row (Aij !=0 && Bij != 0)
            if (u[r] !== mark) {
              // remove value @ i, do not increment pointer
              cindex.splice(p, 1)
            } else {
              // increment pointer
              p++
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

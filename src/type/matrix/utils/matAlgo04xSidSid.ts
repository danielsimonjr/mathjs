import { factory } from '../../../utils/factory.ts'
import { DimensionError } from '../../../error/DimensionError.ts'
import type {
  DataType,
  MatrixValue,
  MatrixArray,
  MatrixCallback,
  EqualScalarFunction,
  TypedFunction,
  SparseMatrixConstructorData
} from '../types.ts'

/**
 * SparseMatrix interface for algorithm operations.
 * Note: SparseMatrix is always 2D.
 */
interface SparseMatrix {
  _values?: MatrixValue[]
  _index: number[]
  _ptr: number[]
  _size: [number, number]
  _data?: MatrixArray
  _datatype?: DataType
  getDataType(): string
  createSparseMatrix(config: SparseMatrixConstructorData): SparseMatrix
}

const name = 'matAlgo04xSidSid'
const dependencies = ['typed', 'equalScalar']

export const createMatAlgo04xSidSid = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    equalScalar
  }: {
    typed: TypedFunction
    equalScalar: EqualScalarFunction
  }) => {
    /**
     * Iterates over SparseMatrix A and SparseMatrix B nonzero items and invokes the callback function f(Aij, Bij).
     * Callback function invoked MAX(NNZA, NNZB) times
     *
     *
     *          ┌  f(Aij, Bij)  ; A(i,j) !== 0 && B(i,j) !== 0
     * C(i,j) = ┤  A(i,j)       ; A(i,j) !== 0 && B(i,j) === 0
     *          └  B(i,j)       ; A(i,j) === 0
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
    return function matAlgo04xSidSid(
      a: SparseMatrix,
      b: SparseMatrix,
      callback: MatrixCallback
    ): SparseMatrix {
      // sparse matrix arrays
      const avalues: MatrixValue[] | undefined = a._values
      const aindex: number[] = a._index
      const aptr: number[] = a._ptr
      const asize: number[] = a._size
      const adt: DataType =
        a._datatype || a._data === undefined ? a._datatype : a.getDataType()

      // sparse matrix arrays
      const bvalues: MatrixValue[] | undefined = b._values
      const bindex: number[] = b._index
      const bptr: number[] = b._ptr
      const bsize: number[] = b._size
      const bdt: DataType =
        b._datatype || b._data === undefined ? b._datatype : b.getDataType()

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
        cf = typed.find(callback, [dt, dt]) as any as any
      }

      // result arrays
      const cvalues: MatrixValue[] | undefined =
        avalues && bvalues ? [] : undefined
      const cindex: number[] = []
      const cptr: number[] = []

      // workspace
      const xa: MatrixValue[] | undefined = avalues && bvalues ? [] : undefined
      const xb: MatrixValue[] | undefined = avalues && bvalues ? [] : undefined
      // marks indicating we have a value in x for a given column
      const wa: (number | null)[] = []
      const wb: number[] = []

      // vars
      let i: number, j: number, k: number, k0: number, k1: number

      // loop columns
      for (j = 0; j < columns; j++) {
        // update cptr
        cptr[j] = cindex.length
        // columns mark
        const mark: number = j + 1
        // loop A(:,j)
        for (k0 = aptr[j], k1 = aptr[j + 1], k = k0; k < k1; k++) {
          // row
          i = aindex[k]
          // update c
          cindex.push(i)
          // update workspace
          wa[i] = mark
          // check we need to process values
          if (xa && avalues) {
            xa[i] = avalues[k]
          }
        }
        // loop B(:,j)
        for (k0 = bptr[j], k1 = bptr[j + 1], k = k0; k < k1; k++) {
          // row
          i = bindex[k]
          // check row exists in A
          if (wa[i] === mark) {
            // update record in xa @ i
            if (xa && bvalues) {
              // invoke callback
              const v: MatrixValue = cf(xa[i], bvalues[k])
              // check for zero
              if (!eq(v, zero)) {
                // update workspace
                xa[i] = v
              } else {
                // remove mark (index will be removed later)
                wa[i] = null
              }
            }
          } else {
            // update c
            cindex.push(i)
            // update workspace
            wb[i] = mark
            // check we need to process values
            if (xb && bvalues) {
              xb[i] = bvalues[k]
            }
          }
        }
        // check we need to process values (non pattern matrix)
        if (xa && xb) {
          // initialize first index in j
          k = cptr[j]
          // loop index in j
          while (k < cindex.length) {
            // row
            i = cindex[k]
            // check workspace has value @ i
            if (wa[i] === mark) {
              // push value (Aij != 0 || (Aij != 0 && Bij != 0))
              cvalues![k] = xa[i]
              // increment pointer
              k++
            } else if (wb[i] === mark) {
              // push value (bij != 0)
              cvalues![k] = xb[i]
              // increment pointer
              k++
            } else {
              // remove index @ k
              cindex.splice(k, 1)
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

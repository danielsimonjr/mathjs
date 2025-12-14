import { factory } from '../../../utils/factory.ts'
import { DimensionError } from '../../../error/DimensionError.ts'

// Type definitions
type DataType = string | undefined
type MatrixData = any

interface _TypedFunction {
  find(fn: Function, signature: string[]): Function
}

interface DenseMatrixData {
  data: MatrixData
  size: number[]
  datatype?: DataType
}

interface DenseMatrix {
  _data: MatrixData
  _size: number[]
  _datatype?: DataType
  createDenseMatrix(data: DenseMatrixData): DenseMatrix
}

type CallbackFunction = (a: any, b: any) => any

const name = 'matAlgo13xDD'
const dependencies = ['typed']

export const createMatAlgo13xDD = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: any) => {
    /**
     * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, Bij..z).
     * Callback function invoked MxN times.
     *
     * C(i,j,...z) = f(Aij..z, Bij..z)
     *
     * @param {Matrix}   a                 The DenseMatrix instance (A)
     * @param {Matrix}   b                 The DenseMatrix instance (B)
     * @param {Function} callback          The f(Aij..z,Bij..z) operation to invoke
     *
     * @return {Matrix}                    DenseMatrix (C)
     *
     * https://github.com/josdejong/mathjs/pull/346#issuecomment-97658658
     */
    return function matAlgo13xDD(
      a: DenseMatrix,
      b: DenseMatrix,
      callback: CallbackFunction
    ): DenseMatrix {
      // a arrays
      const adata = a._data
      const asize = a._size
      const adt: DataType = a._datatype
      // b arrays
      const bdata = b._data
      const bsize = b._size
      const bdt: DataType = b._datatype
      // c arrays
      const csize: number[] = []

      // validate dimensions
      if (asize.length !== bsize.length) {
        throw new DimensionError(asize.length, bsize.length)
      }

      // validate each one of the dimension sizes
      for (let s = 0; s < asize.length; s++) {
        // must match
        if (asize[s] !== bsize[s]) {
          throw new RangeError(
            'Dimension mismatch. Matrix A (' +
              asize +
              ') must match Matrix B (' +
              bsize +
              ')'
          )
        }
        // update dimension in c
        csize[s] = asize[s]
      }

      // datatype
      let dt: DataType
      // callback signature to use
      let cf: CallbackFunction = callback

      // process data types
      if (typeof adt === 'string' && adt === bdt) {
        // datatype
        dt = adt
        // callback
        cf = typed.find(callback, [dt, dt]) as any as any as CallbackFunction
      }

      // populate cdata, iterate through dimensions
      const cdata: MatrixData =
        csize.length > 0 ? _iterate(cf, 0, csize, csize[0], adata, bdata) : []

      // c matrix
      return a.createDenseMatrix({
        data: cdata,
        size: csize,
        datatype: dt
      })
    }

    // recursive function
    function _iterate(
      f: CallbackFunction,
      level: number,
      s: number[],
      n: number,
      av: any,
      bv: any
    ): any[] {
      // initialize array for this level
      const cv: any[] = []
      // check we reach the last level
      if (level === s.length - 1) {
        // loop arrays in last level
        for (let i = 0; i < n; i++) {
          // invoke callback and store value
          cv[i] = f(av[i], bv[i])
        }
      } else {
        // iterate current level
        for (let j = 0; j < n; j++) {
          // iterate next level
          cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv[j])
        }
      }
      return cv
    }
  }
)

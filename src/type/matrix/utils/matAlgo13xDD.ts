import { factory } from '../../../utils/factory.ts'
import { DimensionError } from '../../../error/DimensionError.ts'
import type {
  DataType,
  DenseMatrixData,
  MatrixCallback,
  TypedFunction,
  DenseMatrixConstructorData,
  MatrixValue
} from '../types.ts'

/**
 * Interface for DenseMatrix in algorithm context.
 * Uses types from shared types.ts.
 */
interface DenseMatrix {
  _data: DenseMatrixData
  _size: number[]
  _datatype?: DataType
  createDenseMatrix(data: DenseMatrixConstructorData): DenseMatrix
}

const name = 'matAlgo13xDD'
const dependencies = ['typed']

/**
 * Dependencies for matAlgo13xDD factory
 */
interface MatAlgo13xDDDependencies {
  typed: TypedFunction
}

export const createMatAlgo13xDD = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: MatAlgo13xDDDependencies) => {
    /**
     * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, Bij..z).
     * Callback function invoked MxN times.
     *
     * C(i,j,...z) = f(Aij..z, Bij..z)
     *
     * @param {DenseMatrix}   a                 The DenseMatrix instance (A)
     * @param {DenseMatrix}   b                 The DenseMatrix instance (B)
     * @param {MatrixCallback} callback          The f(Aij..z,Bij..z) operation to invoke
     *
     * @return {DenseMatrix}                    DenseMatrix (C)
     *
     * https://github.com/josdejong/mathjs/pull/346#issuecomment-97658658
     */
    return function matAlgo13xDD(
      a: DenseMatrix,
      b: DenseMatrix,
      callback: MatrixCallback
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
      let cf: MatrixCallback = callback

      // process data types
      if (typeof adt === 'string' && adt === bdt) {
        // datatype
        dt = adt
        // callback - typed.find returns the specialized function for the given types
        cf = (typed.find(callback, [dt, dt]) as MatrixCallback) || callback
      }

      // populate cdata, iterate through dimensions
      const cdata: DenseMatrixData =
        csize.length > 0 ? _iterate(cf, 0, csize, csize[0], adata, bdata) : []

      // c matrix
      return a.createDenseMatrix({
        data: cdata,
        size: csize,
        datatype: dt
      })
    }

    /**
     * Recursive function to iterate through matrix dimensions.
     *
     * @param f - The callback function to apply to matrix elements
     * @param level - Current recursion depth
     * @param s - Size array (dimensions)
     * @param n - Size at current level
     * @param av - Data from matrix A at current level
     * @param bv - Data from matrix B at current level
     * @returns Resulting array at this level
     */
    function _iterate(
      f: MatrixCallback,
      level: number,
      s: number[],
      n: number,
      av: DenseMatrixData,
      bv: DenseMatrixData
    ): MatrixValue[] {
      // initialize array for this level
      const cv: MatrixValue[] = []
      // check we reach the last level
      if (level === s.length - 1) {
        // loop arrays in last level
        for (let i = 0; i < n; i++) {
          // invoke callback and store value
          cv[i] = f((av as MatrixValue[])[i], (bv as MatrixValue[])[i])
        }
      } else {
        // iterate current level
        for (let j = 0; j < n; j++) {
          // iterate next level
          cv[j] = _iterate(f, level + 1, s, s[level + 1], (av as DenseMatrixData[])[j], (bv as DenseMatrixData[])[j])
        }
      }
      return cv
    }
  }
)

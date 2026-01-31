import { factory } from '../../../utils/factory.ts'
import { clone } from '../../../utils/object.ts'
import type {
  DataType,
  DenseMatrixData,
  MatrixCallback,
  TypedFunction,
  DenseMatrixConstructorData,
  MatrixValue
} from '../types.ts'

/**
 * DenseMatrix interface for algorithm operations.
 */
interface DenseMatrix {
  _data: DenseMatrixData
  _size: number[]
  _datatype?: DataType
  createDenseMatrix(data: DenseMatrixConstructorData): DenseMatrix
}

const name = 'matAlgo14xDs'
const dependencies = ['typed']

/**
 * Dependencies for matAlgo14xDs factory
 */
interface MatAlgo14xDsDependencies {
  typed: TypedFunction
}

export const createMatAlgo14xDs = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: MatAlgo14xDsDependencies) => {
    /**
     * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, b).
     * Callback function invoked MxN times.
     *
     * C(i,j,...z) = f(Aij..z, b)
     *
     * @param {DenseMatrix}   a                 The DenseMatrix instance (A)
     * @param {MatrixValue}   b                 The Scalar value
     * @param {MatrixCallback} callback          The f(Aij..z,b) operation to invoke
     * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Aij..z)
     *
     * @return {DenseMatrix}                    DenseMatrix (C)
     *
     * https://github.com/josdejong/mathjs/pull/346#issuecomment-97659042
     */
    return function matAlgo14xDs(
      a: DenseMatrix,
      b: MatrixValue,
      callback: MatrixCallback,
      inverse: boolean
    ): DenseMatrix {
      // a arrays
      const adata = a._data
      const asize = a._size
      const adt: DataType = a._datatype

      // datatype
      let dt: DataType
      // callback signature to use
      let cf: MatrixCallback = callback

      // process data types
      if (typeof adt === 'string') {
        // datatype
        dt = adt
        // convert b to the same datatype
        b = typed.convert(b, dt)
        // callback - typed.find returns specialized implementation
        cf = (typed.find(callback, [dt, dt]) as MatrixCallback) || callback
      }

      // populate cdata, iterate through dimensions
      const cdata: DenseMatrixData =
        asize.length > 0
          ? _iterate(cf, 0, asize, asize[0], adata, b, inverse)
          : []

      // c matrix
      return a.createDenseMatrix({
        data: cdata,
        size: clone(asize),
        datatype: dt
      })
    }

    /**
     * Recursive function to iterate through matrix dimensions.
     *
     * @param f - The callback function to apply
     * @param level - Current recursion depth
     * @param s - Size array (dimensions)
     * @param n - Size at current level
     * @param av - Data from matrix A at current level
     * @param bv - The scalar value
     * @param inverse - Whether to invert the callback order
     * @returns Resulting array at this level
     */
    function _iterate(
      f: MatrixCallback,
      level: number,
      s: number[],
      n: number,
      av: DenseMatrixData,
      bv: MatrixValue,
      inverse: boolean
    ): MatrixValue[] {
      // initialize array for this level
      const cv: MatrixValue[] = []
      // check we reach the last level
      if (level === s.length - 1) {
        // loop arrays in last level
        for (let i = 0; i < n; i++) {
          // invoke callback and store value
          cv[i] = inverse ? f(bv, (av as MatrixValue[])[i]) : f((av as MatrixValue[])[i], bv)
        }
      } else {
        // iterate current level
        for (let j = 0; j < n; j++) {
          // iterate next level
          cv[j] = _iterate(f, level + 1, s, s[level + 1], (av as DenseMatrixData[])[j], bv, inverse)
        }
      }
      return cv
    }
  }
)

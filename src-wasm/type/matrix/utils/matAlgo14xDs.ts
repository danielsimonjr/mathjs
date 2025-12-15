import { factory } from '../../../utils/factory.ts'
import { clone } from '../../../utils/object.ts'

// Type definitions
type DataType = string | undefined
type MatrixData = any

interface _TypedFunction {
  find(fn: Function, signature: string[]): Function
  convert(value: any, datatype: string): any
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

const name = 'matAlgo14xDs'
const dependencies = ['typed']

export const createMatAlgo14xDs = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed }: any) => {
    /**
     * Iterates over DenseMatrix items and invokes the callback function f(Aij..z, b).
     * Callback function invoked MxN times.
     *
     * C(i,j,...z) = f(Aij..z, b)
     *
     * @param {Matrix}   a                 The DenseMatrix instance (A)
     * @param {Scalar}   b                 The Scalar value
     * @param {Function} callback          The f(Aij..z,b) operation to invoke
     * @param {boolean}  inverse           A true value indicates callback should be invoked f(b,Aij..z)
     *
     * @return {Matrix}                    DenseMatrix (C)
     *
     * https://github.com/josdejong/mathjs/pull/346#issuecomment-97659042
     */
    return function matAlgo14xDs(
      a: DenseMatrix,
      b: any,
      callback: CallbackFunction,
      inverse: boolean
    ): DenseMatrix {
      // a arrays
      const adata = a._data
      const asize = a._size
      const adt: DataType = a._datatype

      // datatype
      let dt: DataType
      // callback signature to use
      let cf: CallbackFunction = callback

      // process data types
      if (typeof adt === 'string') {
        // datatype
        dt = adt
        // convert b to the same datatype
        b = typed.convert(b, dt)
        // callback
        cf = typed.find(callback, [dt, dt]) as any as any as CallbackFunction
      }

      // populate cdata, iterate through dimensions
      const cdata: MatrixData =
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

    // recursive function
    function _iterate(
      f: CallbackFunction,
      level: number,
      s: number[],
      n: number,
      av: any,
      bv: any,
      inverse: boolean
    ): any[] {
      // initialize array for this level
      const cv: any[] = []
      // check we reach the last level
      if (level === s.length - 1) {
        // loop arrays in last level
        for (let i = 0; i < n; i++) {
          // invoke callback and store value
          cv[i] = inverse ? f(bv, av[i]) : f(av[i], bv)
        }
      } else {
        // iterate current level
        for (let j = 0; j < n; j++) {
          // iterate next level
          cv[j] = _iterate(f, level + 1, s, s[level + 1], av[j], bv, inverse)
        }
      }
      return cv
    }
  }
)

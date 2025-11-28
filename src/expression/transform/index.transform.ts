import {
  isArray, isBigInt, isBigNumber, isMatrix, isNumber, isRange
} from '../../utils/is.js'
import { factory } from '../../utils/factory.js'

interface Range {
  start: number
  end: number
  step: number
}

interface BigNumber {
  toNumber(): number
}

interface Matrix {
  map(callback: (v: any) => any): Matrix
}

interface IndexClass {
  new (...args: any[]): any
  apply(instance: any, args: any[]): void
}

interface Dependencies {
  Index: IndexClass
  getMatrixDataType: (matrix: any) => string
}

const name = 'index'
const dependencies = ['Index', 'getMatrixDataType']

export const createIndexTransform = /* #__PURE__ */ factory(name, dependencies, ({ Index, getMatrixDataType }: Dependencies) => {
  /**
   * Attach a transform function to math.index
   * Adds a property transform containing the transform function.
   *
   * This transform creates a one-based index instead of a zero-based index
   */
  return function indexTransform(...args: any[]): any {
    const transformedArgs: any[] = []
    for (let i = 0, ii = args.length; i < ii; i++) {
      let arg = args[i]

      // change from one-based to zero based, convert BigNumber to number and leave Array of Booleans as is
      if (isRange(arg)) {
        arg.start--
        arg.end -= (arg.step > 0 ? 0 : 2)
      } else if (arg && arg.isSet === true) {
        arg = arg.map(function (v: any): any { return v - 1 })
      } else if (isArray(arg) || isMatrix(arg)) {
        if (getMatrixDataType(arg) !== 'boolean') {
          arg = arg.map(function (v: any): any { return v - 1 })
        }
      } else if (isNumber(arg) || isBigInt(arg)) {
        arg--
      } else if (isBigNumber(arg)) {
        arg = (arg as BigNumber).toNumber() - 1
      } else if (typeof arg === 'string') {
        // leave as is
      } else {
        throw new TypeError('Dimension must be an Array, Matrix, number, bigint, string, or Range')
      }

      transformedArgs[i] = arg
    }

    const res = new Index()
    Index.apply(res, transformedArgs)
    return res
  }
}, { isTransformFunction: true })

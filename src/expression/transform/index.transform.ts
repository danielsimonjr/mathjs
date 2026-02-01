import {
  isArray,
  isBigInt,
  isBigNumber,
  isMatrix,
  isNumber,
  isRange
} from '../../utils/is.ts'
import { factory } from '../../utils/factory.ts'
import type {
  IndexConstructor,
  IndexInstance,
  BigNumberLike,
  RangeLike,
  SetLike,
  MatrixLike
} from './types.ts'

interface IndexDependencies {
  Index: IndexConstructor
  getMatrixDataType: (matrix: unknown) => string
}

const name = 'index'
const dependencies = ['Index', 'getMatrixDataType']

export const createIndexTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ Index, getMatrixDataType }: IndexDependencies) => {
    /**
     * Attach a transform function to math.index
     * Adds a property transform containing the transform function.
     *
     * This transform creates a one-based index instead of a zero-based index
     */
    return function indexTransform(...args: unknown[]): IndexInstance {
      const transformedArgs: unknown[] = []
      for (let i = 0, ii = args.length; i < ii; i++) {
        let arg = args[i]

        // change from one-based to zero based, convert BigNumber to number and leave Array of Booleans as is
        if (isRange(arg)) {
          const range = arg as RangeLike
          range.start--
          range.end -= range.step > 0 ? 0 : 2
        } else if (arg && (arg as SetLike).isSet === true) {
          arg = (arg as SetLike).map(function (v: unknown): unknown {
            return (v as number) - 1
          })
        } else if (isArray(arg) || isMatrix(arg)) {
          if (getMatrixDataType(arg) !== 'boolean') {
            arg = (arg as MatrixLike | unknown[]).map(function (
              v: unknown
            ): unknown {
              return (v as number) - 1
            })
          }
        } else if (isNumber(arg)) {
          arg = (arg as number) - 1
        } else if (isBigInt(arg)) {
          arg = (arg as bigint) - BigInt(1)
        } else if (isBigNumber(arg)) {
          arg = (arg as BigNumberLike).toNumber() - 1
        } else if (typeof arg === 'string') {
          // leave as is
        } else {
          throw new TypeError(
            'Dimension must be an Array, Matrix, number, bigint, string, or Range'
          )
        }

        transformedArgs[i] = arg
      }

      return new Index(...transformedArgs)
    }
  },
  { isTransformFunction: true }
)

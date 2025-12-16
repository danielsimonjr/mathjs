import { factory } from '../../utils/factory.ts'
import { createRow } from '../../function/matrix/row.ts'
import { errorTransform } from './utils/errorTransform.ts'
import { isNumber } from '../../utils/is.ts'

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  Index: any
  matrix: (...args: any[]) => any
  range: (...args: any[]) => any
}

const name = 'row'
const dependencies = ['typed', 'Index', 'matrix', 'range']

/**
 * Attach a transform function to matrix.column
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `index` parameter of function column
 * from zero-based to one-based
 */
export const createRowTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, Index, matrix, range }: Dependencies) => {
    const row = createRow({ typed, Index, matrix, range })

    // @see: comment of row itself
    return typed('row', {
      '...any': function (args: any[]): any {
        // change last argument from zero-based to one-based
        const lastIndex = args.length - 1
        const last = args[lastIndex]
        if (isNumber(last)) {
          args[lastIndex] = last - 1
        }

        try {
          return row.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true }
)

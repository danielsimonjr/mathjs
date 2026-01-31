import { errorTransform } from './utils/errorTransform.ts'
import { factory } from '../../utils/factory.ts'
import { createMapSlices } from '../../function/matrix/mapSlices.ts'
import { isBigNumber, isNumber } from '../../utils/is.ts'
import type { TypedFunction, BigNumberLike, VariadicArgs } from './types.ts'

interface MapSlicesDependencies {
  typed: TypedFunction
  isInteger: (x: unknown) => boolean
}

const name = 'mapSlices'
const dependencies = ['typed', 'isInteger']

/**
 * Attach a transform function to math.mapSlices
 * Adds a property transform containing the transform function.
 *
 * This transform changed the last `dim` parameter of function mapSlices
 * from one-based to zero based
 */
export const createMapSlicesTransform = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, isInteger }: MapSlicesDependencies) => {
    const mapSlices = createMapSlices({ typed, isInteger })

    // @see: comment of concat itself
    return typed('mapSlices', {
      '...any': function (args: VariadicArgs): unknown {
        // change dim from one-based to zero-based
        const dim = args[1]

        if (isNumber(dim)) {
          args[1] = dim - 1
        } else if (isBigNumber(dim)) {
          args[1] = (dim as BigNumberLike).minus(1)
        }

        try {
          return mapSlices.apply(null, args)
        } catch (err) {
          throw errorTransform(err as Error)
        }
      }
    })
  },
  { isTransformFunction: true, ...createMapSlices.meta }
)

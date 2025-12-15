import { factory } from '../../utils/factory.ts'

// Type definitions
type NestedArray<T = any> = T | NestedArray<T>[]
type MatrixData = NestedArray<any>

interface TypedFunction<T = any> {
  (...args: any[]): T
  find(func: any, signature: string[]): TypedFunction<T>
}

interface Matrix {
  type: string
  storage(): string
  datatype(): string | undefined
  size(): number[]
  clone(): Matrix
  toArray(): MatrixData
  valueOf(): MatrixData
  _data?: MatrixData
  _size?: number[]
  _datatype?: string
}

interface MatrixConstructor {
  (data: any[] | any[][], storage?: 'dense' | 'sparse'): Matrix
}

interface FlattenFunction {
  (arr: any): any[]
}

interface SizeFunction {
  (arr: any): number[]
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  flatten: FlattenFunction
  size: SizeFunction
}

const name = 'matrixFromColumns'
const dependencies = ['typed', 'matrix', 'flatten', 'size']

export const createMatrixFromColumns = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, flatten, size }: Dependencies) => {
    /**
     * Create a dense matrix from vectors as individual columns.
     * If you pass row vectors, they will be transposed (but not conjugated!)
     *
     * Syntax:
     *
     *    math.matrixFromColumns(...arr)
     *    math.matrixFromColumns(col1, col2)
     *    math.matrixFromColumns(col1, col2, col3)
     *
     * Examples:
     *
     *    math.matrixFromColumns([1, 2, 3], [[4],[5],[6]])
     *    math.matrixFromColumns(...vectors)
     *
     * See also:
     *
     *    matrix, matrixFromRows, matrixFromFunction, zeros
     *
     * @param {... Array | Matrix} cols Multiple columns
     * @return { number[][] | Matrix } if at least one of the arguments is an array, an array will be returned
     */
    return typed(name, {
      // Single variadic handler for arrays, matrices, and mixed types
      '...': function (arr: (any[] | Matrix)[]): any[][] | Matrix {
        if (arr.length === 0) {
          throw new TypeError(
            'At least one column is needed to construct a matrix.'
          )
        }

        // Check if all arguments are Matrix (none are plain arrays)
        const allMatrix = arr.every(
          (item) => typeof (item as any).toArray === 'function'
        )
        // Check if any argument is a plain array
        const hasArray = arr.some((item) => Array.isArray(item))

        // Convert all to arrays for processing
        const arrays = arr.map((item) =>
          typeof (item as any).toArray === 'function'
            ? (item as Matrix).toArray()
            : item
        )

        const result = _createArray(arrays)

        // Return Matrix only if all inputs were Matrix, otherwise return array
        if (allMatrix && !hasArray) {
          return matrix(result)
        }
        return result
      }

      // TODO implement this properly for SparseMatrix
    })

    function _createArray(arr: any[]): any[][] {
      if (arr.length === 0)
        throw new TypeError(
          'At least one column is needed to construct a matrix.'
        )
      const N = checkVectorTypeAndReturnLength(arr[0])

      // create an array with empty rows
      const result: any[][] = []
      for (let i = 0; i < N; i++) {
        result[i] = []
      }

      // loop columns
      for (const col of arr) {
        const colLength = checkVectorTypeAndReturnLength(col)

        if (colLength !== N) {
          throw new TypeError(
            'The vectors had different length: ' +
              (N | 0) +
              ' ≠ ' +
              (colLength | 0)
          )
        }

        const f = flatten(col)

        // push a value to each row
        for (let i = 0; i < N; i++) {
          result[i].push(f[i])
        }
      }

      return result
    }

    function checkVectorTypeAndReturnLength(vec: any): number {
      const s = size(vec)

      if (s.length === 1) {
        // 1D vector
        return s[0]
      } else if (s.length === 2) {
        // 2D vector
        if (s[0] === 1) {
          // row vector
          return s[1]
        } else if (s[1] === 1) {
          // col vector
          return s[0]
        } else {
          throw new TypeError('At least one of the arguments is not a vector.')
        }
      } else {
        throw new TypeError(
          'Only one- or two-dimensional vectors are supported.'
        )
      }
    }
  }
)

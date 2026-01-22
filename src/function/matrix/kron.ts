import { arraySize as size } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Type definitions
interface Matrix {
  toArray(): any[]
}

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface MatrixConstructor {
  (data: any[]): Matrix
}

interface Dependencies {
  typed: TypedFunction
  matrix: MatrixConstructor
  multiplyScalar: TypedFunction
}

// Minimum total elements for WASM to be beneficial
const WASM_KRON_THRESHOLD = 64

/**
 * Check if a 2D array contains only plain numbers
 */
function isPlainNumber2D(arr: any[][]): boolean {
  for (let i = 0; i < arr.length; i++) {
    const row = arr[i]
    for (let j = 0; j < row.length; j++) {
      if (typeof row[j] !== 'number') {
        return false
      }
    }
  }
  return true
}

/**
 * Flatten a 2D array to Float64Array in row-major order
 */
function flatten2D(arr: number[][], rows: number, cols: number): Float64Array {
  const result = new Float64Array(rows * cols)
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i * cols + j] = arr[i][j]
    }
  }
  return result
}

/**
 * Unflatten a Float64Array to 2D array
 */
function unflatten2D(flat: Float64Array, rows: number, cols: number): number[][] {
  const result: number[][] = []
  for (let i = 0; i < rows; i++) {
    const row: number[] = []
    for (let j = 0; j < cols; j++) {
      row.push(flat[i * cols + j])
    }
    result.push(row)
  }
  return result
}

const name = 'kron'
const dependencies = ['typed', 'matrix', 'multiplyScalar']

export const createKron = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, matrix, multiplyScalar }: Dependencies) => {
    /**
     * Calculates the Kronecker product of 2 matrices or vectors.
     *
     * NOTE: If a one dimensional vector / matrix is given, it will be
     * wrapped so its two dimensions.
     * See the examples.
     *
     * Syntax:
     *
     *    math.kron(x, y)
     *
     * Examples:
     *
     *    math.kron([[1, 0], [0, 1]], [[1, 2], [3, 4]])
     *    // returns [ [ 1, 2, 0, 0 ], [ 3, 4, 0, 0 ], [ 0, 0, 1, 2 ], [ 0, 0, 3, 4 ] ]
     *
     *    math.kron([1,1], [2,3,4])
     *    // returns [2, 3, 4, 2, 3, 4]
     *
     * See also:
     *
     *    multiply, dot, cross
     *
     * @param  {Array | Matrix} x     First vector
     * @param  {Array | Matrix} y     Second vector
     * @return {Array | Matrix}       Returns the Kronecker product of `x` and `y`
     */
    return typed(name, {
      'Matrix, Matrix': function (x: Matrix, y: Matrix): Matrix {
        return matrix(_kron(x.toArray(), y.toArray()))
      },

      'Matrix, Array': function (x: Matrix, y: any[]): Matrix {
        return matrix(_kron(x.toArray(), y))
      },

      'Array, Matrix': function (x: any[], y: Matrix): Matrix {
        return matrix(_kron(x, y.toArray()))
      },

      'Array, Array': _kron
    })

    /**
     * Calculate the Kronecker product of two (1-dimensional) vectors,
     * with no dimension checking
     * @param {Array} a  First vector
     * @param {Array} b  Second vector
     * @returns {Array}  the 1-dimensional Kronecker product of a and b
     * @private
     */
    function _kron1d(a: any[], b: any[]): any[] {
      // TODO in core overhaul: would be faster to see if we can choose a
      // particular implementation of multiplyScalar at the beginning,
      // rather than re-dispatch for _every_ ordered pair of entries.
      return a.flatMap((x) => b.map((y) => multiplyScalar(x, y)))
    }

    /**
     * Calculate the Kronecker product of two possibly multidimensional arrays
     * @param {Array} a  First array
     * @param {Array} b  Second array
     * @param {number} [d]  common dimension; if missing, compute and match args
     * @returns {Array} Returns the Kronecker product of x and y
     * @private
     */
    function _kron(a: any[], b: any[], d: number = -1): any[] {
      if (d < 0) {
        let adim = size(a).length
        let bdim = size(b).length
        d = Math.max(adim, bdim)
        while (adim++ < d) a = [a]
        while (bdim++ < d) b = [b]
      }

      if (d === 1) return _kron1d(a, b)

      // Try WASM for 2D arrays with plain numbers
      if (d === 2) {
        const aSize = size(a)
        const bSize = size(b)
        const aRows = aSize[0]
        const aCols = aSize[1]
        const bRows = bSize[0]
        const bCols = bSize[1]
        const totalElements = aRows * aCols * bRows * bCols

        const wasm = wasmLoader.getModule()
        if (
          wasm &&
          totalElements >= WASM_KRON_THRESHOLD &&
          isPlainNumber2D(a as number[][]) &&
          isPlainNumber2D(b as number[][])
        ) {
          try {
            const aFlat = flatten2D(a as number[][], aRows, aCols)
            const bFlat = flatten2D(b as number[][], bRows, bCols)

            const aAlloc = wasmLoader.allocateFloat64Array(aFlat)
            const bAlloc = wasmLoader.allocateFloat64Array(bFlat)
            const resultRows = aRows * bRows
            const resultCols = aCols * bCols
            const resultAlloc = wasmLoader.allocateFloat64ArrayEmpty(resultRows * resultCols)

            try {
              wasm.laKron(aAlloc.ptr, aRows, aCols, bAlloc.ptr, bRows, bCols)
              // Read result from WASM memory
              const resultFlat = new Float64Array(resultAlloc.array)
              return unflatten2D(resultFlat, resultRows, resultCols)
            } finally {
              wasmLoader.free(aAlloc.ptr)
              wasmLoader.free(bAlloc.ptr)
              wasmLoader.free(resultAlloc.ptr)
            }
          } catch {
            // Fall back to JS implementation on WASM error
          }
        }
      }

      return a.flatMap((aSlice) =>
        b.map((bSlice) => _kron(aSlice, bSlice, d - 1))
      )
    }
  }
)

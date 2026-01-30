import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for corr
interface MatrixType {
  toArray(): unknown[]
}

// Minimum array length for WASM to be beneficial
const WASM_CORR_THRESHOLD = 200

/**
 * Check if an array contains only plain numbers
 */
function isPlainNumberArray(arr: unknown[]): arr is number[] {
  for (let i = 0; i < arr.length; i++) {
    if (typeof arr[i] !== 'number') {
      return false
    }
  }
  return true
}

const name = 'corr'
const dependencies = [
  'typed',
  'matrix',
  'mean',
  'sqrt',
  'sum',
  'add',
  'subtract',
  'multiply',
  'pow',
  'divide'
]

interface CorrDependencies {
  typed: TypedFunction
  matrix: (arr: unknown[]) => MatrixType
  sqrt: TypedFunction
  sum: TypedFunction
  add: TypedFunction
  subtract: TypedFunction
  multiply: TypedFunction
  pow: TypedFunction
  divide: TypedFunction
}

export const createCorr = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    sqrt,
    sum,
    add,
    subtract,
    multiply,
    pow,
    divide
  }: CorrDependencies) => {
    /**
     * Compute the correlation coefficient of a two list with values, For matrices, the matrix correlation coefficient is calculated.
     *
     * Syntax:
     *
     *     math.corr(A, B)
     *
     * Examples:
     *
     *     math.corr([1, 2, 3, 4, 5], [4, 5, 6, 7, 8])     // returns 1
     *     math.corr([1, 2.2, 3, 4.8, 5], [4, 5.3, 6.6, 7, 8])     //returns 0.9569941688503644
     *     math.corr([[1, 2.2, 3, 4.8, 5], [4, 5.3, 6.6, 7, 8]],[[1, 2.2, 3, 4.8, 5], [4, 5.3, 6.6, 7, 8]])   // returns [1,1]
     *
     * See also:
     *
     *     median, mean, min, max, sum, prod, std, variance
     *
     * @param {Array | Matrix} A The first array or matrix to compute correlation coefficient
     * @param {Array | Matrix} B The second array or matrix to compute correlation coefficient
     * @return {*} The correlation coefficient
     */
    return typed(name, {
      'Array, Array': function (A: unknown[], B: unknown[]): unknown {
        return _corr(A, B)
      },
      'Matrix, Matrix': function (A: MatrixType, B: MatrixType): unknown {
        const res = _corr(A.toArray(), B.toArray())
        return Array.isArray(res) ? matrix(res) : res
      }
    })
    /**
     * Calculate the correlation coefficient between two arrays or matrices.
     * @param {Array | Matrix} A
     * @param {Array | Matrix} B
     * @return {*} correlation coefficient
     * @private
     */
    function _corr(A: unknown[], B: unknown[]): unknown {
      const correlations: unknown[] = []
      if (Array.isArray(A[0]) && Array.isArray(B[0])) {
        if (A.length !== B.length) {
          throw new SyntaxError(
            'Dimension mismatch. Array A and B must have the same length.'
          )
        }
        for (let i = 0; i < A.length; i++) {
          if ((A[i] as unknown[]).length !== (B[i] as unknown[]).length) {
            throw new SyntaxError(
              'Dimension mismatch. Array A and B must have the same number of elements.'
            )
          }
          correlations.push(correlation(A[i] as unknown[], B[i] as unknown[]))
        }
        return correlations
      } else {
        if (A.length !== B.length) {
          throw new SyntaxError(
            'Dimension mismatch. Array A and B must have the same number of elements.'
          )
        }
        return correlation(A, B)
      }
    }
    function correlation(A: unknown[], B: unknown[]): unknown {
      const n = A.length

      // Try WASM for large arrays with plain numbers
      const wasm = wasmLoader.getModule()
      if (
        wasm &&
        n >= WASM_CORR_THRESHOLD &&
        isPlainNumberArray(A) &&
        isPlainNumberArray(B)
      ) {
        try {
          const aAlloc = wasmLoader.allocateFloat64Array(A)
          const bAlloc = wasmLoader.allocateFloat64Array(B)

          try {
            const result = wasm.statsCorrelation(aAlloc.ptr, bAlloc.ptr, n)
            return result
          } finally {
            wasmLoader.free(aAlloc.ptr)
            wasmLoader.free(bAlloc.ptr)
          }
        } catch {
          // Fall back to JS implementation on WASM error
        }
      }

      // JavaScript fallback
      const sumX = sum(A)
      const sumY = sum(B)
      const sumXY = A.reduce(
        (acc: unknown, x: unknown, index: number) => add(acc, multiply(x, B[index])),
        0
      )
      const sumXSquare = sum(A.map((x: unknown) => pow(x, 2)))
      const sumYSquare = sum(B.map((y: unknown) => pow(y, 2)))
      const numerator = subtract(multiply(n, sumXY), multiply(sumX, sumY))
      const denominator = sqrt(
        multiply(
          subtract(multiply(n, sumXSquare), pow(sumX, 2)),
          subtract(multiply(n, sumYSquare), pow(sumY, 2))
        )
      )
      return divide(numerator, denominator)
    }
  }
)

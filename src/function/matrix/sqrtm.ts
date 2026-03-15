import { isMatrix } from '../../utils/is.ts'
import { format } from '../../utils/string.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Type definitions
import type { BigNumber } from 'bignumber.js'
import type Complex from 'complex.js'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_SQRTM_THRESHOLD = 16 // 4x4 matrix

/** Scalar types supported by sqrtm */
type Scalar = number | BigNumber | Complex

/** Matrix data representation */
type MatrixData = Scalar | Scalar[] | Scalar[][]

/** Matrix interface */
interface Matrix {
  size(): number[]
  valueOf(): MatrixData
  _data?: MatrixData
  _size?: number[]
}

/** Typed function interface for math.js functions */
interface TypedFunction<R = Scalar | Matrix> {
  (...args: unknown[]): R
}

/** Dependencies for sqrtm factory */
interface Dependencies {
  typed: TypedFunction
  abs: TypedFunction<number | BigNumber>
  add: TypedFunction<Scalar | Matrix>
  multiply: TypedFunction<Scalar | Matrix>
  map: TypedFunction<Matrix>
  sqrt: TypedFunction<Scalar>
  subtract: TypedFunction<Scalar | Matrix>
  inv: TypedFunction<Scalar[][] | Matrix>
  size: TypedFunction<number[]>
  max: TypedFunction<number | BigNumber>
  identity: TypedFunction<Matrix>
}

const name = 'sqrtm'
const dependencies = [
  'typed',
  'abs',
  'add',
  'multiply',
  'map',
  'sqrt',
  'subtract',
  'inv',
  'size',
  'max',
  'identity'
]

export const createSqrtm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    abs,
    add,
    multiply,
    map,
    sqrt,
    subtract,
    inv,
    size,
    max,
    identity
  }: Dependencies) => {
    const _maxIterations = 1e3
    const _tolerance = 1e-6

    /**
     * Try WASM-accelerated matrix square root for plain number matrices
     */
    function _tryWasmSqrtm(
      A: Scalar[][] | Matrix,
      n: number
    ): Scalar[][] | Matrix | null {
      const wasm = wasmLoader.getModule()
      if (!wasm || n * n < WASM_SQRTM_THRESHOLD) return null

      // Extract data
      const data = isMatrix(A) ? (A as any)._data : A
      if (!data || !Array.isArray(data)) return null

      try {
        const flat = new Float64Array(n * n)
        for (let i = 0; i < n; i++) {
          const row = data[i]
          if (!Array.isArray(row)) return null
          for (let j = 0; j < n; j++) {
            if (typeof row[j] !== 'number') return null
            flat[i * n + j] = row[j]
          }
        }

        const matrixAlloc = wasmLoader.allocateFloat64Array(flat)
        const resultAlloc = wasmLoader.allocateFloat64ArrayEmpty(n * n)
        // workPtr needs 5*n*n f64 values for sqrtm
        const workAlloc = wasmLoader.allocateFloat64ArrayEmpty(5 * n * n)

        try {
          const status = wasm.sqrtm(
            matrixAlloc.ptr, n, resultAlloc.ptr,
            _tolerance, _maxIterations, workAlloc.ptr
          )

          if (status === 1) {
            const result: number[][] = []
            for (let i = 0; i < n; i++) {
              const row: number[] = []
              for (let j = 0; j < n; j++) {
                row[j] = resultAlloc.array[i * n + j]
              }
              result[i] = row
            }

            if (isMatrix(A)) {
              return (A as any).createDenseMatrix({
                data: result,
                size: [n, n],
                datatype: (A as any)._datatype
              })
            }
            return result
          }
        } finally {
          wasmLoader.free(matrixAlloc.ptr)
          wasmLoader.free(resultAlloc.ptr)
          wasmLoader.free(workAlloc.ptr)
        }
      } catch {
        // Fall through to JS
      }
      return null
    }

    /**
     * Calculate the principal square root matrix using the Denman-Beavers iterative method
     *
     * https://en.wikipedia.org/wiki/Square_root_of_a_matrix#By_Denman-Beavers_iteration
     *
     * @param A   The square matrix `A`
     * @return    The principal square root of matrix `A`
     * @private
     */
    function _denmanBeavers(A: Scalar[][] | Matrix): Scalar[][] | Matrix {
      let error: number
      let iterations = 0

      let Y: Scalar[][] | Matrix = A
      let Z: Scalar[][] | Matrix = identity(size(A))

      do {
        const Yk = Y
        Y = multiply(0.5, add(Yk, inv(Z))) as Scalar[][] | Matrix
        Z = multiply(0.5, add(Z, inv(Yk))) as Scalar[][] | Matrix

        error = max(abs(subtract(Y, Yk))) as number

        if (error > _tolerance && ++iterations > _maxIterations) {
          throw new Error(
            'computing square root of matrix: iterative method could not converge'
          )
        }
      } while (error > _tolerance)

      return Y
    }

    /**
     * Calculate the principal square root of a square matrix.
     * The principal square root matrix `X` of another matrix `A` is such that `X * X = A`.
     *
     * https://en.wikipedia.org/wiki/Square_root_of_a_matrix
     *
     * Syntax:
     *
     *     math.sqrtm(A)
     *
     * Examples:
     *
     *     math.sqrtm([[33, 24], [48, 57]]) // returns [[5, 2], [4, 7]]
     *
     * See also:
     *
     *     sqrt, pow
     *
     * @param  {Array | Matrix} A   The square matrix `A`
     * @return {Array | Matrix}     The principal square root of matrix `A`
     */
    return typed(name, {
      'Array | Matrix': function (
        A: Scalar[] | Scalar[][] | Matrix
      ): Scalar[][] | Matrix {
        const sizeArray = isMatrix(A)
          ? (A as Matrix).size()
          : arraySize(A as Scalar[] | Scalar[][])
        switch (sizeArray.length) {
          case 1:
            // Single element Array | Matrix
            if (sizeArray[0] === 1) {
              return map(A, sqrt)
            } else {
              throw new RangeError(
                'Matrix must be square ' +
                  '(size: ' +
                  format(sizeArray, {}) +
                  ')'
              )
            }

          case 2: {
            // Two-dimensional Array | Matrix
            const rows = sizeArray[0]
            const cols = sizeArray[1]
            if (rows === cols) {
              // Try WASM for plain number matrices
              const wasmResult = _tryWasmSqrtm(A as Scalar[][] | Matrix, rows)
              if (wasmResult !== null) return wasmResult
              return _denmanBeavers(A as Scalar[][] | Matrix)
            } else {
              throw new RangeError(
                'Matrix must be square ' +
                  '(size: ' +
                  format(sizeArray, {}) +
                  ')'
              )
            }
          }
          default:
            // Multi dimensional array
            throw new RangeError(
              'Matrix must be at most two dimensional ' +
                '(size: ' +
                format(sizeArray, {}) +
                ')'
            )
        }
      }
    })
  }
)

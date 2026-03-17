import { isSparseMatrix } from '../../utils/is.ts'
import { format } from '../../utils/string.ts'
import { factory } from '../../utils/factory.ts'
import { wasmLoader } from '../../wasm/WasmLoader.ts'

// Type definitions
import type { BigNumber } from 'bignumber.js'
import type Complex from 'complex.js'

// Minimum matrix size (n*n elements) for WASM to be beneficial
const WASM_EXPM_THRESHOLD = 16 // 4x4 matrix

/** Scalar types supported by expm */
type Scalar = number | BigNumber | Complex

/** Matrix interface */
interface Matrix {
  size(): number[]
  get(index: number[]): Scalar
  storage(): string
  createSparseMatrix?(data: Matrix): Matrix
}

/** Typed function interface for math.js functions */
interface TypedFunction<R = Scalar | Matrix> {
  (...args: unknown[]): R
}

/** Dependencies for expm factory */
interface Dependencies {
  typed: TypedFunction
  abs: TypedFunction<number | BigNumber>
  add: TypedFunction<Scalar | Matrix>
  identity: TypedFunction<Matrix>
  inv: TypedFunction<Matrix>
  multiply: TypedFunction<Scalar | Matrix>
}

const name = 'expm'
const dependencies = ['typed', 'abs', 'add', 'identity', 'inv', 'multiply']

export const createExpm = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({ typed, abs, add, identity, inv, multiply }: Dependencies) => {
    /**
     * Compute the matrix exponential, expm(A) = e^A. The matrix must be square.
     * Not to be confused with exp(a), which performs element-wise
     * exponentiation.
     *
     * The exponential is calculated using the Padé approximant with scaling and
     * squaring; see "Nineteen Dubious Ways to Compute the Exponential of a
     * Matrix," by Moler and Van Loan.
     *
     * Syntax:
     *
     *     math.expm(x)
     *
     * Examples:
     *
     *     const A = [[0,2],[0,0]]
     *     math.expm(A)        // returns [[1,2],[0,1]]
     *
     * See also:
     *
     *     exp
     *
     * @param {Matrix} x  A square Matrix
     * @return {Matrix}   The exponential of x
     */
    return typed(name, {
      Matrix: function (A: Matrix): Matrix {
        // Check matrix size
        const size = A.size()

        if (size.length !== 2 || size[0] !== size[1]) {
          throw new RangeError(
            'Matrix must be square ' + '(size: ' + format(size, {}) + ')'
          )
        }

        const n = size[0]

        // Try WASM for large plain number matrices
        const wasmResult = _tryWasmExpm(A, n)
        if (wasmResult !== null) {
          return wasmResult
        }

        // Desired accuracy of the approximant (The actual accuracy
        // will be affected by round-off error)
        const eps = 1e-15

        // The Padé approximant is not so accurate when the values of A
        // are "large", so scale A by powers of two. Then compute the
        // exponential, and square the result repeatedly according to
        // the identity e^A = (e^(A/m))^m

        // Compute infinity-norm of A, ||A||, to see how "big" it is
        const infNorm = infinityNorm(A)

        // Find the optimal scaling factor and number of terms in the
        // Padé approximant to reach the desired accuracy
        const params = findParams(infNorm, eps)
        const q = params.q
        const j = params.j

        // The Pade approximation to e^A is:
        // Rqq(A) = Dqq(A) ^ -1 * Nqq(A)
        // where
        // Nqq(A) = sum(i=0, q, (2q-i)!p! / [ (2q)!i!(q-i)! ] A^i
        // Dqq(A) = sum(i=0, q, (2q-i)!q! / [ (2q)!i!(q-i)! ] (-A)^i

        // Scale A by 1 / 2^j
        const Apos = multiply(A, Math.pow(2, -j))

        // The i=0 term is just the identity matrix
        let N: Matrix = identity(n)
        let D: Matrix = identity(n)

        // Initialization (i=0)
        let factor = 1

        // Initialization (i=1)
        let AposToI: Matrix = Apos as Matrix // Cloning not necessary
        let alternate = -1

        for (let i = 1; i <= q; i++) {
          if (i > 1) {
            AposToI = multiply(AposToI, Apos) as Matrix
            alternate = -alternate
          }
          factor = (factor * (q - i + 1)) / ((2 * q - i + 1) * i)

          N = add(N, multiply(factor, AposToI)) as Matrix
          D = add(D, multiply(factor * alternate, AposToI)) as Matrix
        }

        let R: Matrix = multiply(inv(D), N) as Matrix

        // Square j times
        for (let i = 0; i < j; i++) {
          R = multiply(R, R) as Matrix
        }

        return isSparseMatrix(A) ? A.createSparseMatrix!(R) : R
      }
    })

    /**
     * Try WASM-accelerated matrix exponential for plain number matrices
     */
    function _tryWasmExpm(A: Matrix, n: number): Matrix | null {
      const wasm = wasmLoader.getModule()
      if (!wasm || n * n < WASM_EXPM_THRESHOLD) return null

      // Extract data and check it's plain numbers
      const data = (A as any)._data
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
        // workPtr needs 6*n*n f64 values for expm
        const workAlloc = wasmLoader.allocateFloat64ArrayEmpty(6 * n * n)

        try {
          const status = wasm.expm(
            matrixAlloc.ptr, n, resultAlloc.ptr, workAlloc.ptr
          )

          if (status === 0) {
            // Read results back into 2D array (AS returns 0 on success)
            const result: number[][] = []
            for (let i = 0; i < n; i++) {
              const row: number[] = []
              for (let j = 0; j < n; j++) {
                row[j] = resultAlloc.array[i * n + j]
              }
              result[i] = row
            }

            // Return same Matrix type as input
            if (isSparseMatrix(A)) {
              return (A as any).createSparseMatrix({ data: result, size: [n, n] })
            }
            return (A as any).createDenseMatrix({ data: result, size: [n, n], datatype: (A as any)._datatype })
          }
        } finally {
          wasmLoader.free(matrixAlloc.ptr)
          wasmLoader.free(resultAlloc.ptr)
          wasmLoader.free(workAlloc.ptr)
        }
      } catch {
        // Fall through to JS implementation
      }
      return null
    }

    function infinityNorm(A: Matrix): number {
      const n = A.size()[0]
      let infNorm = 0
      for (let i = 0; i < n; i++) {
        let rowSum = 0
        for (let j = 0; j < n; j++) {
          rowSum += abs(A.get([i, j]))
        }
        infNorm = Math.max(rowSum, infNorm)
      }
      return infNorm
    }

    /**
     * Find the best parameters for the Pade approximant given
     * the matrix norm and desired accuracy. Returns the first acceptable
     * combination in order of increasing computational load.
     */
    function findParams(
      infNorm: number,
      eps: number
    ): { q: number; j: number } {
      const maxSearchSize = 30
      for (let k = 0; k < maxSearchSize; k++) {
        for (let q = 0; q <= k; q++) {
          const j = k - q
          if (errorEstimate(infNorm, q, j) < eps) {
            return { q, j }
          }
        }
      }
      throw new Error(
        'Could not find acceptable parameters to compute the matrix exponential (try increasing maxSearchSize in expm.js)'
      )
    }

    /**
     * Returns the estimated error of the Pade approximant for the given
     * parameters.
     */
    function errorEstimate(infNorm: number, q: number, j: number): number {
      let qfac = 1
      for (let i = 2; i <= q; i++) {
        qfac *= i
      }
      let twoqfac = qfac
      for (let i = q + 1; i <= 2 * q; i++) {
        twoqfac *= i
      }
      const twoqp1fac = twoqfac * (2 * q + 1)

      return (
        (8.0 * Math.pow(infNorm / Math.pow(2, j), 2 * q) * qfac * qfac) /
        (twoqfac * twoqp1fac)
      )
    }
  }
)

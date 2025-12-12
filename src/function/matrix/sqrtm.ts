import { isMatrix } from '../../utils/is.ts'
import { format } from '../../utils/string.ts'
import { arraySize } from '../../utils/array.ts'
import { factory } from '../../utils/factory.ts'

// Type definitions
interface Matrix {
  size(): number[]
  valueOf(): any
  _data?: any
  _size?: number[]
}

interface TypedFunction<T = any> {
  (...args: any[]): T
}

interface Dependencies {
  typed: TypedFunction
  abs: TypedFunction
  add: TypedFunction
  multiply: TypedFunction
  map: TypedFunction
  sqrt: TypedFunction
  subtract: TypedFunction
  inv: TypedFunction
  size: TypedFunction<number[]>
  max: TypedFunction
  identity: TypedFunction
}

const name = 'sqrtm'
const dependencies = ['typed', 'abs', 'add', 'multiply', 'map', 'sqrt', 'subtract', 'inv', 'size', 'max', 'identity']

export const createSqrtm = /* #__PURE__ */ factory(name, dependencies, ({ typed, abs, add, multiply, map, sqrt, subtract, inv, size, max, identity }: Dependencies) => {
  const _maxIterations = 1e3
  const _tolerance = 1e-6

  /**
   * Calculate the principal square root matrix using the Denman–Beavers iterative method
   *
   * https://en.wikipedia.org/wiki/Square_root_of_a_matrix#By_Denman–Beavers_iteration
   *
   * @param  {Array | Matrix} A   The square matrix `A`
   * @return {Array | Matrix}     The principal square root of matrix `A`
   * @private
   */
  function _denmanBeavers (A: any): any {
    let error: number
    let iterations = 0

    let Y = A
    let Z = identity(size(A))

    do {
      const Yk = Y
      Y = multiply(0.5, add(Yk, inv(Z)))
      Z = multiply(0.5, add(Z, inv(Yk)))

      error = max(abs(subtract(Y, Yk)))

      if (error > _tolerance && ++iterations > _maxIterations) {
        throw new Error('computing square root of matrix: iterative method could not converge')
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
    'Array | Matrix': function (A: any[] | Matrix): any {
      const sizeArray = isMatrix(A) ? (A as Matrix).size() : arraySize(A as any[])
      switch (sizeArray.length) {
        case 1:
          // Single element Array | Matrix
          if (sizeArray[0] === 1) {
            return map(A, sqrt)
          } else {
            throw new RangeError('Matrix must be square ' +
            '(size: ' + format(sizeArray, {}) + ')')
          }

        case 2:
        {
          // Two-dimensional Array | Matrix
          const rows = sizeArray[0]
          const cols = sizeArray[1]
          if (rows === cols) {
            return _denmanBeavers(A)
          } else {
            throw new RangeError('Matrix must be square ' +
              '(size: ' + format(sizeArray, {}) + ')')
          }
        }
        default:
          // Multi dimensional array
          throw new RangeError('Matrix must be at most two dimensional ' +
          '(size: ' + format(sizeArray, {}) + ')')
      }
    }
  })
})

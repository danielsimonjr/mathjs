import { factory } from '../../utils/factory.ts'
import type { TypedFunction } from '../../core/function/typed.ts'

// Type definitions for kldivergence
interface MatrixType {
  size(): number[]
}

interface KldivergenceDependencies {
  typed: TypedFunction
  matrix: (arr: unknown[]) => MatrixType
  divide: TypedFunction
  sum: TypedFunction
  multiply: TypedFunction
  map: TypedFunction
  dotDivide: TypedFunction
  log: TypedFunction
  isNumeric: (value: unknown) => boolean
}

const name = 'kldivergence'
const dependencies = [
  'typed',
  'matrix',
  'divide',
  'sum',
  'multiply',
  'map',
  'dotDivide',
  'log',
  'isNumeric'
]

export const createKldivergence = /* #__PURE__ */ factory(
  name,
  dependencies,
  ({
    typed,
    matrix,
    divide,
    sum,
    multiply,
    map,
    dotDivide,
    log,
    isNumeric
  }: KldivergenceDependencies) => {
    /**
     * Calculate the Kullback-Leibler (KL) divergence  between two distributions
     *
     * Syntax:
     *
     *     math.kldivergence(x, y)
     *
     * Examples:
     *
     *     math.kldivergence([0.7,0.5,0.4], [0.2,0.9,0.5])   //returns 0.24376698773121153
     *
     *
     * @param  {Array | Matrix} q    First vector
     * @param  {Array | Matrix} p    Second vector
     * @return {number}              Returns distance between q and p
     */
    return typed(name, {
      'Array, Array': function (q: unknown[], p: unknown[]): number {
        return _kldiv(matrix(q), matrix(p))
      },

      'Matrix, Array': function (q: MatrixType, p: unknown[]): number {
        return _kldiv(q, matrix(p))
      },

      'Array, Matrix': function (q: unknown[], p: MatrixType): number {
        return _kldiv(matrix(q), p)
      },

      'Matrix, Matrix': function (q: MatrixType, p: MatrixType): number {
        return _kldiv(q, p)
      }
    })

    function _kldiv(q: MatrixType, p: MatrixType): number {
      const plength = p.size().length
      const qlength = q.size().length
      if (plength > 1) {
        throw new Error('first object must be one dimensional')
      }

      if (qlength > 1) {
        throw new Error('second object must be one dimensional')
      }

      if (plength !== qlength) {
        throw new Error('Length of two vectors must be equal')
      }

      // Before calculation, apply normalization
      const sumq = sum(q)
      if (sumq === 0) {
        throw new Error('Sum of elements in first object must be non zero')
      }

      const sump = sum(p)
      if (sump === 0) {
        throw new Error('Sum of elements in second object must be non zero')
      }
      const qnorm = divide(q, sum(q))
      const pnorm = divide(p, sum(p))

      const result = sum(
        multiply(
          qnorm,
          map(dotDivide(qnorm, pnorm), (x: unknown) =>
            log(x)
          )
        )
      )
      if (isNumeric(result)) {
        return result as number
      } else {
        return Number.NaN
      }
    }
  }
)

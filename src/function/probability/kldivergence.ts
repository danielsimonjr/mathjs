import { factory } from '../../utils/factory.js'

const name = 'kldivergence'
<<<<<<< HEAD
const dependencies = ['typed', 'matrix', 'divide', 'sum', 'multiply', 'map', 'dotDivide', 'log', 'isNumeric']
=======
const dependencies = ['typed', 'matrix', 'divide', 'sum', 'multiply', 'map', 'dotDivide', 'log', 'isNumeric'] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createKldivergence = /* #__PURE__ */ factory(name, dependencies, ({ typed, matrix, divide, sum, multiply, map, dotDivide, log, isNumeric }: {
  typed: any
  matrix: any
  divide: any
  sum: any
  multiply: any
  map: any
  dotDivide: any
  log: any
  isNumeric: any
}) => {
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
    'Array, Array': function (q: any, p: any): number {
      return _kldiv(matrix(q), matrix(p))
    },

    'Matrix, Array': function (q: any, p: any): number {
      return _kldiv(q, matrix(p))
    },

    'Array, Matrix': function (q: any, p: any): number {
      return _kldiv(matrix(q), p)
    },

    'Matrix, Matrix': function (q: any, p: any): number {
      return _kldiv(q, p)
    }

  })

  function _kldiv (q: any, p: any): number {
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
    if ((sumq as any) === 0) {
      throw new Error('Sum of elements in first object must be non zero')
    }

    const sump = sum(p)
    if ((sump as any) === 0) {
      throw new Error('Sum of elements in second object must be non zero')
    }
<<<<<<< HEAD
<<<<<<< HEAD
    const qnorm = (divide as any)(q, (sum as any)(q))
    const pnorm = (divide as any)(p, (sum as any)(p))

    const result = (sum as any)((multiply as any)(qnorm, (map as any)((dotDivide as any)(qnorm, pnorm), (x: any) => (log as any)(x))))
=======
    const qnorm = divide(q, sum(q))
    const pnorm = divide(p, sum(p))

    const result = sum(multiply(qnorm, map(dotDivide(qnorm, pnorm), (x: any) => log(x))))
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
=======
    const qnorm = divide(q, sum(q))
    const pnorm = divide(p, sum(p))

    const result = sum(multiply(qnorm, map(dotDivide(qnorm, pnorm), (x: any) => log(x))))
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
    if (isNumeric(result)) {
      return result
    } else {
      return Number.NaN
    }
  }
})

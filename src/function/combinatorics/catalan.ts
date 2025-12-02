import { factory } from '../../utils/factory.js'

const name = 'catalan'
const dependencies = [
  'typed',
  'addScalar',
  'divideScalar',
  'multiplyScalar',
  'combinations',
  'isNegative',
  'isInteger'
<<<<<<< HEAD
]
=======
] as const
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu

export const createCatalan = /* #__PURE__ */ factory(name, dependencies, ({
  typed,
  addScalar,
  divideScalar,
  multiplyScalar,
  combinations,
  isNegative,
  isInteger
}: any) => {
  /**
   * The Catalan Numbers enumerate combinatorial structures of many different types.
   * catalan only takes integer arguments.
   * The following condition must be enforced: n >= 0
   *
   * Syntax:
   *
   *   math.catalan(n)
   *
   * Examples:
   *
   *    math.catalan(3) // returns 5
   *    math.catalan(8) // returns 1430
   *
   * See also:
   *
   *    bellNumbers
   *
   * @param {Number | BigNumber} n    nth Catalan number
   * @return {Number | BigNumber}     Cn(n)
   */
  return typed(name, {
    'number | BigNumber': function (n: number | any): number | any {
      if (!isInteger(n) || isNegative(n)) {
        throw new TypeError('Non-negative integer value expected in function catalan')
      }

<<<<<<< HEAD
<<<<<<< HEAD
      return divideScalar(combinations(multiplyScalar(n, 2), n), (addScalar as any)(n, 1))
=======
      return divideScalar(combinations(multiplyScalar(n, 2), n), addScalar(n, 1))
>>>>>>> claude/typescript-wasm-refactor-019dszeNRqExsgy5oKFU3mVu
=======
      return divideScalar(combinations(multiplyScalar(n, 2), n), addScalar(n, 1))
>>>>>>> claude/typecheck-and-convert-js-01YLWgcoNb8jFsVbPqer68y8
    }
  })
})

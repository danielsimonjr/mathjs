<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for sqrtm - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
// test sqrtm
import assert from 'assert'

import { approxDeepEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'

<<<<<<< HEAD
describe('sqrtm', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('sqrtm', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  const A = [
    [5, 2],
    [4, 7]
  ]
  const AA = [
    [33, 24],
    [48, 57]
  ]

  const B = [
    [1.5667, 1.7408],
    [2.6112, 4.1779]
  ]
  const BB = [
    [7, 10],
    [15, 22]
  ]

<<<<<<< HEAD
  it('should return the principal square root of a matrix', function () {
=======
  it('should return the principal square root of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(math.sqrtm(AA), A)
    approxDeepEqual(math.sqrtm(BB), B)

    approxDeepEqual(
      math.sqrtm([
        [5, -4, 1, 0, 0],
        [-4, 6, -4, 1, 0],
        [1, -4, 6, -4, 1],
        [0, 1, -4, 6, -4],
        [0, 0, 1, -4, 6]
      ]),
      [
        [
          2.001450032980806, -0.997069854672086, 0.004226841220338,
          0.004648098208404, 0.003162179891248
        ],
        [
          -0.997069854672086, 2.006191486385745, -0.990363307725271,
          0.011838782789231, 0.009369460553432
        ],
        [
          0.004226841220338, -0.990363307725271, 2.017072849046023,
          -0.974622709753106, 0.026274470491696
        ],
        [
          0.004648098208404, 0.011838782789231, -0.974622709753106,
          2.050268428894304, -0.919971837350421
        ],
        [
          0.003162179891248, 0.009369460553432, 0.026274470491696,
          -0.919971837350421, 2.269992000979243
        ]
      ]
    )
  })

<<<<<<< HEAD
  it('should return the principal square root of a matrix with just one value', function () {
=======
  it('should return the principal square root of a matrix with just one value', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.sqrtm([4]), [2])
    assert.deepStrictEqual(math.sqrtm([16]), [4])
    assert.deepStrictEqual(math.sqrtm([20.25]), [4.5])
  })

<<<<<<< HEAD
  it('should return the principal square root of a matrix of big numbers', function () {
=======
  it('should return the principal square root of a matrix of big numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.round(math.sqrtm(math.bignumber(AA)), 20),
      math.bignumber(A)
    )
  })

<<<<<<< HEAD
  it('math.pow(math.sqrtm(A), 2) should equal A', function () {
=======
  it('math.pow(math.sqrtm(A), 2) should equal A', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(math.pow(math.sqrtm(A), 2), A)
    approxDeepEqual(math.pow(math.sqrtm(B), 2), B)
    approxDeepEqual(math.pow(math.sqrtm(AA), 2), AA)
    approxDeepEqual(math.pow(math.sqrtm(BB), 2), BB)
  })

<<<<<<< HEAD
  it('should throw an error in case of non-square matrices', function () {
    assert.throws(function () {
      math.sqrtm([1, 2, 3])
    }, /Matrix must be square/)
    assert.throws(function () {
      math.sqrtm([[1, 2, 3]])
    }, /Matrix must be square/)
    assert.throws(function () {
=======
  it('should throw an error in case of non-square matrices', function (): void {
    assert.throws(function (): void {
      math.sqrtm([1, 2, 3])
    }, /Matrix must be square/)
    assert.throws(function (): void {
      math.sqrtm([[1, 2, 3]])
    }, /Matrix must be square/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sqrtm([
        [1, 2, 3],
        [4, 5, 6]
      ])
    }, /Matrix must be square/)
  })

<<<<<<< HEAD
  it('should throw an error in case of matrices with dimension greater than two', function () {
    const errorRegex = /Matrix must be at most two dimensional/
    assert.throws(function () {
      math.sqrtm(math.zeros(1, 1, 1))
    }, errorRegex)
    assert.throws(function () {
      math.sqrtm(math.zeros(2, 2, 2))
    }, errorRegex)
    assert.throws(function () {
=======
  it('should throw an error in case of matrices with dimension greater than two', function (): void {
    const errorRegex = /Matrix must be at most two dimensional/
    assert.throws(function (): void {
      math.sqrtm(math.zeros(1, 1, 1))
    }, errorRegex)
    assert.throws(function (): void {
      math.sqrtm(math.zeros(2, 2, 2))
    }, errorRegex)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.sqrtm(math.zeros(3, 3, 3, 3))
    }, errorRegex)
  })

<<<<<<< HEAD
  it('should LaTeX sqrtm', function () {
=======
  it('should LaTeX sqrtm', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('sqrtm([[33, 24], [48, 57]])')
    assert.strictEqual(
      expression.toTex(),
      '{\\begin{bmatrix}33&24\\\\48&57\\end{bmatrix}}^{\\frac{1}{2}}'
    )
  })

<<<<<<< HEAD
  it('should return the result in the same format as the input', function () {
=======
  it('should return the result in the same format as the input', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.typeOf(math.sqrtm(A)), 'Array')
    assert.strictEqual(math.typeOf(math.sqrtm(B)), 'Array')
    assert.strictEqual(math.typeOf(math.sqrtm(AA)), 'Array')
    assert.strictEqual(math.typeOf(math.sqrtm(BB)), 'Array')

    assert.strictEqual(math.typeOf(math.sqrtm(math.matrix(A))), 'DenseMatrix')
    assert.strictEqual(math.typeOf(math.sqrtm(math.matrix(B))), 'DenseMatrix')
    assert.strictEqual(math.typeOf(math.sqrtm(math.matrix(AA))), 'DenseMatrix')
    assert.strictEqual(math.typeOf(math.sqrtm(math.matrix(BB))), 'DenseMatrix')
  })
})

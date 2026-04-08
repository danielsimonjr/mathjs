// test characteristicPolynomial
import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { createCharacteristicPolynomial } from '../../../../src/function/matrix/characteristicPolynomial.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...allFactories, createCharacteristicPolynomial })
const { characteristicPolynomial } = math

const TOL = 1e-8

function approxEqual (a, b) {
  return Math.abs(a - b) < TOL
}

describe('characteristicPolynomial', function () {
  it('should compute polynomial for a 2x2 diagonal matrix [[2,0],[0,3]]', function () {
    // Eigenvalues 2,3 => (λ-2)(λ-3) = λ²-5λ+6 => coeffs [6, -5, 1]
    const A = [[2, 0], [0, 3]]
    const coeffs = characteristicPolynomial(A)
    assert.strictEqual(coeffs.length, 3)
    assert.ok(approxEqual(coeffs[0], 6), `c[0] = ${coeffs[0]}, expected 6`)
    assert.ok(approxEqual(coeffs[1], -5), `c[1] = ${coeffs[1]}, expected -5`)
    assert.ok(approxEqual(coeffs[2], 1), `c[2] = ${coeffs[2]}, expected 1`)
  })

  it('should compute polynomial for [[2,1],[0,3]]', function () {
    // Eigenvalues 2,3 => (λ-2)(λ-3) = λ²-5λ+6 => coeffs [6, -5, 1]
    const A = [[2, 1], [0, 3]]
    const coeffs = characteristicPolynomial(A)
    assert.strictEqual(coeffs.length, 3)
    assert.ok(approxEqual(coeffs[0], 6), `c[0] = ${coeffs[0]}, expected 6`)
    assert.ok(approxEqual(coeffs[1], -5), `c[1] = ${coeffs[1]}, expected -5`)
    assert.ok(approxEqual(coeffs[2], 1), `c[2] = ${coeffs[2]}, expected 1`)
  })

  it('should compute polynomial for the identity 2x2', function () {
    // Eigenvalue 1 (double) => (λ-1)² = λ²-2λ+1 => coeffs [1, -2, 1]
    const A = [[1, 0], [0, 1]]
    const coeffs = characteristicPolynomial(A)
    assert.ok(approxEqual(coeffs[0], 1), `c[0] = ${coeffs[0]}, expected 1`)
    assert.ok(approxEqual(coeffs[1], -2), `c[1] = ${coeffs[1]}, expected -2`)
    assert.ok(approxEqual(coeffs[2], 1), `c[2] = ${coeffs[2]}, expected 1`)
  })

  it('should return array of length n+1 for n x n matrix', function () {
    const A = [[1, 2, 3], [0, 4, 5], [0, 0, 6]]
    const coeffs = characteristicPolynomial(A)
    assert.strictEqual(coeffs.length, 4, `should have 4 coefficients for 3x3, got ${coeffs.length}`)
  })

  it('should have leading coefficient 1 (monic polynomial)', function () {
    const A = [[3, 1], [2, 4]]
    const coeffs = characteristicPolynomial(A)
    assert.ok(approxEqual(coeffs[coeffs.length - 1], 1), 'leading coefficient should be 1')
  })

  it('should compute correct constant term (= det A) for 2x2', function () {
    // Constant term of char poly = det(A) (up to sign (-1)^n)
    // For 2x2: (λ-λ1)(λ-λ2) = λ² - (λ1+λ2)λ + λ1*λ2, so c[0] = det(A)
    const A = [[3, 1], [2, 4]]
    const det = 3 * 4 - 1 * 2 // = 10
    const coeffs = characteristicPolynomial(A)
    assert.ok(approxEqual(coeffs[0], det), `constant term = ${coeffs[0]}, expected det = ${det}`)
  })

  it('should accept Matrix input', function () {
    const A = math.matrix([[2, 0], [0, 3]])
    const coeffs = characteristicPolynomial(A)
    assert.ok(Array.isArray(coeffs), 'result should be an array')
    assert.strictEqual(coeffs.length, 3)
    assert.ok(approxEqual(coeffs[0], 6))
  })

  it('should throw for non-square matrix', function () {
    assert.throws(function () {
      characteristicPolynomial([[1, 2, 3], [4, 5, 6]])
    }, /square/)
  })

  it('should compute polynomial for a 3x3 diagonal matrix', function () {
    // Eigenvalues 1,2,3 => (λ-1)(λ-2)(λ-3) = λ³-6λ²+11λ-6 => [−6, 11, −6, 1]
    const A = [[1, 0, 0], [0, 2, 0], [0, 0, 3]]
    const coeffs = characteristicPolynomial(A)
    assert.strictEqual(coeffs.length, 4)
    assert.ok(approxEqual(coeffs[0], -6), `c[0] = ${coeffs[0]}, expected -6`)
    assert.ok(approxEqual(coeffs[1], 11), `c[1] = ${coeffs[1]}, expected 11`)
    assert.ok(approxEqual(coeffs[2], -6), `c[2] = ${coeffs[2]}, expected -6`)
    assert.ok(approxEqual(coeffs[3], 1), `c[3] = ${coeffs[3]}, expected 1`)
  })
})

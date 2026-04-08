import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createPadeApproximant } from '../../../../src/function/numeric/padeApproximant.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createPadeApproximant })

describe('padeApproximant', function () {
  // exp(x) Taylor series: sum x^k / k!
  const expCoeffs = [1, 1, 1 / 2, 1 / 6, 1 / 24, 1 / 120, 1 / 720]

  it('should return an object with numerator, denominator, and evaluate', function () {
    const pade = math.padeApproximant(expCoeffs, 2, 2)
    assert(Array.isArray(pade.numerator), 'numerator should be an array')
    assert(Array.isArray(pade.denominator), 'denominator should be an array')
    assert.strictEqual(typeof pade.evaluate, 'function')
  })

  it('numerator should have degree m+1 coefficients', function () {
    const pade = math.padeApproximant(expCoeffs, 2, 2)
    assert.strictEqual(pade.numerator.length, 3)
  })

  it('denominator should have degree n+1 coefficients, Q(0)=1', function () {
    const pade = math.padeApproximant(expCoeffs, 2, 2)
    assert.strictEqual(pade.denominator.length, 3)
    assert(Math.abs(pade.denominator[0] - 1) < 1e-12, 'Q(0) should be 1')
  })

  it('[2/2] Pade of exp(x) should match exp(x) better than degree-4 Taylor at x=1', function () {
    const pade = math.padeApproximant(expCoeffs, 2, 2)
    const padeVal = pade.evaluate(1)
    // Taylor truncated at degree 4: 1 + 1 + 0.5 + 1/6 + 1/24 = 2.708333
    const taylorVal = 1 + 1 + 0.5 + 1 / 6 + 1 / 24
    const exact = Math.exp(1)
    assert(
      Math.abs(padeVal - exact) < Math.abs(taylorVal - exact),
      'Pade [2/2] should approximate exp(1) better than Taylor degree 4'
    )
  })

  it('[2/2] Pade of exp(x) should be accurate at x=0.5', function () {
    const pade = math.padeApproximant(expCoeffs, 2, 2)
    const v = pade.evaluate(0.5)
    assert(Math.abs(v - Math.exp(0.5)) < 1e-4, 'Pade [2/2] of exp at x=0.5 should be accurate')
  })

  it('[1/0] Pade should equal truncated Taylor (pure polynomial)', function () {
    const pade = math.padeApproximant(expCoeffs, 1, 0)
    // P(x) = 1 + x, Q(x) = 1
    assert.strictEqual(pade.denominator.length, 1)
    assert(Math.abs(pade.denominator[0] - 1) < 1e-12)
    assert(Math.abs(pade.evaluate(1) - 2) < 1e-9)
  })

  it('should work for [3/3] approximant', function () {
    const pade = math.padeApproximant(expCoeffs, 3, 3)
    const v = pade.evaluate(1)
    assert(Math.abs(v - Math.exp(1)) < 1e-4, 'Pade [3/3] of exp at x=1 should be very accurate')
  })

  it('[0/0] should return constant approximation', function () {
    const pade = math.padeApproximant([5, 1, 2], 0, 0)
    assert(Math.abs(pade.evaluate(1) - 5) < 1e-9)
  })

  it('should throw for not enough coefficients', function () {
    assert.throws(
      () => math.padeApproximant([1, 1], 2, 2),
      /at least m\+n\+1/
    )
  })

  it('should throw for negative m or n', function () {
    assert.throws(
      () => math.padeApproximant(expCoeffs, -1, 2),
      /non-negative/
    )
  })

  it('should throw for non-integer m or n', function () {
    assert.throws(
      () => math.padeApproximant(expCoeffs, 1.5, 2),
      /integers/
    )
  })
})

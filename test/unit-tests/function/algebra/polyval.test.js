import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPolyval } from '../../../../src/function/algebra/polyval.js'

const math = create({ ...all, createPolyval })

describe('polyval', function () {
  it('should evaluate a quadratic polynomial at x=2', function () {
    // p(x) = 1 + 2x + 3x^2 => p(2) = 1 + 4 + 12 = 17
    assert.strictEqual(math.polyval([1, 2, 3], 2), 17)
  })

  it('should evaluate a linear polynomial', function () {
    // p(x) = 3 + 4x => p(5) = 3 + 20 = 23
    assert.strictEqual(math.polyval([3, 4], 5), 23)
  })

  it('should evaluate a constant polynomial', function () {
    assert.strictEqual(math.polyval([5], 100), 5)
  })

  it('should return 0 for an empty coefficient array', function () {
    assert.strictEqual(math.polyval([], 10), 0)
  })

  it('should evaluate at x=0 returning the constant term', function () {
    assert.strictEqual(math.polyval([7, 8, 9], 0), 7)
  })

  it('should evaluate polynomial with negative coefficients', function () {
    // p(x) = 1 + 0*x + (-1)*x^2 => p(3) = 1 - 9 = -8
    assert.strictEqual(math.polyval([1, 0, -1], 3), -8)
  })

  it('should evaluate at x=1 returning sum of coefficients', function () {
    assert.strictEqual(math.polyval([1, 2, 3, 4], 1), 10)
  })

  it('should handle a degree-0 polynomial (single coefficient)', function () {
    assert.strictEqual(math.polyval([42], 999), 42)
  })

  it('should correctly use Horner reduction for higher degree', function () {
    // p(x) = 2 + 0*x + 0*x^2 + 1*x^3 => p(2) = 2 + 8 = 10
    assert.strictEqual(math.polyval([2, 0, 0, 1], 2), 10)
  })
})

import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLambertW } from '../../../../src/function/special/lambertW.js'

const math = create({ ...allFactories, createLambertW })

describe('lambertW', function () {
  it('should return 0 for x = 0', function () {
    assert.strictEqual(math.lambertW(0), 0)
  })

  it('should return -1 for x = -1/e (branch point)', function () {
    const result = math.lambertW(-1 / Math.E)
    assert(Math.abs(result - (-1)) < 1e-10, 'Expected -1, got ' + result)
  })

  it('should satisfy W(1) = Omega constant ~ 0.5671432904097838', function () {
    const result = math.lambertW(1)
    assert(Math.abs(result - 0.5671432904097838) < 1e-10)
  })

  it('should satisfy W(e) = 1', function () {
    const result = math.lambertW(Math.E)
    assert(Math.abs(result - 1) < 1e-10)
  })

  it('should satisfy W(x)*exp(W(x)) = x for various positive values', function () {
    const values = [0.1, 0.5, 1, 2, 5, 10, 100]
    for (const x of values) {
      const w = math.lambertW(x)
      const check = w * Math.exp(w)
      assert(
        Math.abs(check - x) < 1e-10 * Math.max(1, Math.abs(x)),
        'Failed for x=' + x + ', w=' + w + ', check=' + check
      )
    }
  })

  it('should satisfy W(x)*exp(W(x)) = x for negative values near -1/e', function () {
    const values = [-0.1, -0.2, -0.3, -0.36]
    for (const x of values) {
      const w = math.lambertW(x)
      const check = w * Math.exp(w)
      assert(Math.abs(check - x) < 1e-10, 'Failed for x=' + x)
    }
  })

  it('should handle large x', function () {
    const x = 1000
    const w = math.lambertW(x)
    const check = w * Math.exp(w)
    assert(Math.abs(check - x) < 1e-8 * x)
  })

  it('should throw RangeError for x < -1/e', function () {
    assert.throws(() => math.lambertW(-1), /RangeError/)
    assert.throws(() => math.lambertW(-0.5), /RangeError/)
  })

  it('should throw for invalid types', function () {
    assert.throws(() => math.lambertW('abc'))
    assert.throws(() => math.lambertW())
  })
})

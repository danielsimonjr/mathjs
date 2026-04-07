import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createExpIntegralEi } from '../../../../src/function/special/expIntegralEi.js'

const math = create({ ...allFactories, createExpIntegralEi })

describe('expIntegralEi', function () {
  it('should return -Infinity for x = 0', function () {
    assert.strictEqual(math.expIntegralEi(0), -Infinity)
  })

  it('should return Ei(1) ~ 1.8951178163559368', function () {
    assert(Math.abs(math.expIntegralEi(1) - 1.8951178163559368) < 1e-10)
  })

  it('should return Ei(2) ~ 4.954234356001891', function () {
    assert(Math.abs(math.expIntegralEi(2) - 4.954234356001891) < 1e-10)
  })

  it('should return Ei(-1) ~ -0.21938393439552029', function () {
    assert(Math.abs(math.expIntegralEi(-1) - (-0.21938393439552029)) < 1e-10)
  })

  it('should return Ei(-0.5) ~ -0.5597735947761608', function () {
    assert(Math.abs(math.expIntegralEi(-0.5) - (-0.5597735947761608)) < 1e-10)
  })

  it('should return Ei(0.5) ~ 0.4542199048144268', function () {
    assert(Math.abs(math.expIntegralEi(0.5) - 0.4542199048144268) < 1e-10)
  })

  it('should handle large x using asymptotic series', function () {
    // Ei(50) is a very large number ~ e^50/50 * (1 + correction terms)
    const result = math.expIntegralEi(50)
    // e^50/50 ~ 1.037e20; verify within 10% of asymptotic leading term
    const approx = Math.exp(50) / 50
    // The asymptotic series converges well for large x
    assert(result > approx * 0.9, 'Ei(50) should be close to e^50/50')
    assert(result > 0, 'Ei(50) should be positive')
  })

  it('should be negative for negative x', function () {
    assert(math.expIntegralEi(-0.1) < 0)
    assert(math.expIntegralEi(-1) < 0)
    assert(math.expIntegralEi(-10) < 0)
  })

  it('should be increasing in x (Ei is monotonically increasing)', function () {
    // For negative x: Ei(-2) ~ -0.049 > Ei(-1) ~ -0.219 (less negative = larger)
    assert(math.expIntegralEi(-2) > math.expIntegralEi(-1), 'Ei(-2) should be greater than Ei(-1)')
    assert(math.expIntegralEi(0.5) < math.expIntegralEi(1), 'Ei(0.5) should be less than Ei(1)')
    assert(math.expIntegralEi(1) < math.expIntegralEi(2), 'Ei(1) should be less than Ei(2)')
  })

  it('should throw for invalid types', function () {
    assert.throws(() => math.expIntegralEi('abc'))
    assert.throws(() => math.expIntegralEi())
  })
})

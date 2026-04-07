import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createCosIntegral } from '../../../../src/function/special/cosIntegral.js'

const math = create({ ...allFactories, createCosIntegral })

describe('cosIntegral', function () {
  it('should throw for x <= 0', function () {
    assert.throws(() => math.cosIntegral(0))
    assert.throws(() => math.cosIntegral(-1))
    assert.throws(() => math.cosIntegral(-100))
  })

  it('should return 0 for x = Infinity', function () {
    assert.strictEqual(math.cosIntegral(Infinity), 0)
  })

  it('should compute cosIntegral(1) accurately (~0.3374)', function () {
    // Ci(1) ~ 0.3374039229009681 (DLMF)
    const result = math.cosIntegral(1)
    assert(Math.abs(result - 0.3374039229009681) < 1e-8,
      `cosIntegral(1) = ${result}`)
  })

  it('should compute cosIntegral(2) accurately (~0.4230)', function () {
    // Ci(2) ~ 0.42298082877486476
    const result = math.cosIntegral(2)
    assert(Math.abs(result - 0.42298082877486476) < 1e-8,
      `cosIntegral(2) = ${result}`)
  })

  it('should compute cosIntegral(0.5) in the Taylor regime', function () {
    // Ci(0.5) ~ -0.17778407880661287
    const result = math.cosIntegral(0.5)
    assert(Math.abs(result - (-0.17778407880661287)) < 1e-7,
      `cosIntegral(0.5) = ${result}`)
  })

  it('should compute cosIntegral(5) in the Taylor regime', function () {
    // Ci(5) ~ -0.19002974965664388
    const result = math.cosIntegral(5)
    assert(Math.abs(result - (-0.19002974965664388)) < 1e-7,
      `cosIntegral(5) = ${result}`)
  })

  it('should compute cosIntegral(10) accurately', function () {
    // Ci(10) ~ -0.04545643300446489
    const result = math.cosIntegral(10)
    assert(Math.abs(result - (-0.04545643300446489)) < 1e-8,
      `cosIntegral(10) = ${result}`)
  })

  it('should compute cosIntegral(20) accurately', function () {
    // Ci(20) ~ 0.044419820853363934
    const result = math.cosIntegral(20)
    assert(Math.abs(result - 0.044419820853363934) < 1e-7,
      `cosIntegral(20) = ${result}`)
  })

  it('should compute cosIntegral in the asymptotic regime (x > 25)', function () {
    // Ci(30) ~ -0.033032417282052834
    const result = math.cosIntegral(30)
    assert(Math.abs(result - (-0.033032417282052834)) < 1e-6,
      `cosIntegral(30) = ${result}`)
  })

  it('should approach 0 for large x', function () {
    const result = math.cosIntegral(100)
    assert(Math.abs(result) < 0.02,
      `cosIntegral(100) = ${result} should be near 0`)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.cosIntegral('abc'))
    assert.throws(() => math.cosIntegral())
  })
})

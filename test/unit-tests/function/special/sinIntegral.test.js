import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSinIntegral } from '../../../../src/function/special/sinIntegral.js'

const math = create({ ...allFactories, createSinIntegral })

describe('sinIntegral', function () {
  it('should compute sinIntegral(0) = 0', function () {
    assert.strictEqual(math.sinIntegral(0), 0)
  })

  it('should compute sinIntegral(Infinity) = pi/2', function () {
    assert.strictEqual(math.sinIntegral(Infinity), Math.PI / 2)
  })

  it('should compute sinIntegral(-Infinity) = -pi/2', function () {
    assert.strictEqual(math.sinIntegral(-Infinity), -Math.PI / 2)
  })

  it('should be an odd function: sinIntegral(-x) = -sinIntegral(x)', function () {
    for (const x of [0.5, 1, 2, 5]) {
      assert(Math.abs(math.sinIntegral(-x) + math.sinIntegral(x)) < 1e-14,
        `sinIntegral(-${x}) + sinIntegral(${x}) should be 0`)
    }
  })

  it('should compute sinIntegral(1) accurately (~0.9461)', function () {
    // Si(1) ~ 0.9460830703671831
    const result = math.sinIntegral(1)
    assert(Math.abs(result - 0.9460830703671831) < 1e-8,
      `sinIntegral(1) = ${result}`)
  })

  it('should compute sinIntegral(pi) accurately (~1.8519)', function () {
    // Si(pi) ~ 1.851937051982466
    const result = math.sinIntegral(Math.PI)
    assert(Math.abs(result - 1.851937051982466) < 1e-7,
      `sinIntegral(pi) = ${result}`)
  })

  it('should compute sinIntegral(2) accurately', function () {
    // Si(2) ~ 1.6054129768921367
    const result = math.sinIntegral(2)
    assert(Math.abs(result - 1.6054129768921367) < 1e-8,
      `sinIntegral(2) = ${result}`)
  })

  it('should use Taylor approximation: sinIntegral(x) ~ x for very small x', function () {
    const x = 0.001
    assert(Math.abs(math.sinIntegral(x) - x) < 1e-10)
  })

  it('should compute sinIntegral(5) accurately', function () {
    // Si(5) ~ 1.5499312449585524
    const result = math.sinIntegral(5)
    assert(Math.abs(result - 1.5499312449585524) < 1e-7,
      `sinIntegral(5) = ${result}`)
  })

  it('should compute sinIntegral(10) accurately', function () {
    // Si(10) ~ 1.6583475942188752
    const result = math.sinIntegral(10)
    assert(Math.abs(result - 1.6583475942188752) < 1e-7,
      `sinIntegral(10) = ${result}`)
  })

  it('should compute sinIntegral in the asymptotic regime (x > 25)', function () {
    // Si(30) ~ 1.5667565400303753
    const result = math.sinIntegral(30)
    assert(Math.abs(result - 1.5667565400303753) < 1e-6,
      `sinIntegral(30) = ${result}`)
  })

  it('should approach pi/2 for large x', function () {
    const result = math.sinIntegral(100)
    assert(Math.abs(result - Math.PI / 2) < 0.02,
      `sinIntegral(100) = ${result} should be close to pi/2`)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.sinIntegral('abc'))
    assert.throws(() => math.sinIntegral())
  })
})

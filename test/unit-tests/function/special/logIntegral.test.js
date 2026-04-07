import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createLogIntegral } from '../../../../src/function/special/logIntegral.js'

const math = create({ ...allFactories, createLogIntegral })

describe('logIntegral', function () {
  it('should throw for x <= 0', function () {
    assert.throws(() => math.logIntegral(0))
    assert.throws(() => math.logIntegral(-1))
    assert.throws(() => math.logIntegral(-100))
  })

  it('should return -Infinity at x = 1', function () {
    assert.strictEqual(math.logIntegral(1), -Infinity)
  })

  it('should return Infinity for x = Infinity', function () {
    assert.strictEqual(math.logIntegral(Infinity), Infinity)
  })

  it('should compute logIntegral(2) accurately (~1.0452)', function () {
    // li(2) ~ 1.0451637801174928
    const result = math.logIntegral(2)
    assert(Math.abs(result - 1.0451637801174928) < 1e-8,
      `logIntegral(2) = ${result}`)
  })

  it('should compute logIntegral(10) accurately (~6.1656)', function () {
    // li(10) ~ 6.165599504787298
    const result = math.logIntegral(10)
    assert(Math.abs(result - 6.165599504787298) < 1e-6,
      `logIntegral(10) = ${result}`)
  })

  it('should compute logIntegral(100) accurately', function () {
    // li(100) ~ 30.1261415
    const result = math.logIntegral(100)
    assert(Math.abs(result - 30.1261415) < 1e-4,
      `logIntegral(100) = ${result}`)
  })

  it('should be positive for x > 1', function () {
    for (const x of [2, 5, 10, 100]) {
      assert(math.logIntegral(x) > 0, `logIntegral(${x}) should be positive`)
    }
  })

  it('should be negative for 0 < x < 1', function () {
    // li(x) < 0 for x in (0, 1) since ln(x) < 0 and Ei of negative
    const result = math.logIntegral(0.5)
    assert(result < 0, `logIntegral(0.5) = ${result} should be negative`)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.logIntegral('abc'))
    assert.throws(() => math.logIntegral())
  })
})

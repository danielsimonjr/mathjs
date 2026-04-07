import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createEllipticE } from '../../../../src/function/special/ellipticE.js'

const math = create({ ...allFactories, createEllipticE })

describe('ellipticE', function () {
  it('should return pi/2 for m = 0', function () {
    assert(Math.abs(math.ellipticE(0) - Math.PI / 2) < 1e-15)
  })

  it('should return 1 for m = 1', function () {
    assert.strictEqual(math.ellipticE(1), 1)
  })

  it('should return E(0.5) ~ 1.3506438810476755', function () {
    assert(Math.abs(math.ellipticE(0.5) - 1.3506438810476755) < 1e-10)
  })

  it('should return E(0.25) ~ 1.4674622093394272', function () {
    assert(Math.abs(math.ellipticE(0.25) - 1.4674622093394272) < 1e-10)
  })

  it('should return E(0.9) ~ 1.1047747327040733', function () {
    assert(Math.abs(math.ellipticE(0.9) - 1.1047747327040733) < 1e-10)
  })

  it('should be decreasing in m', function () {
    assert(math.ellipticE(0.1) > math.ellipticE(0.5))
    assert(math.ellipticE(0.5) > math.ellipticE(0.9))
  })

  it('should satisfy E(m) <= pi/2 for all m in [0,1]', function () {
    for (const m of [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
      assert(math.ellipticE(m) <= Math.PI / 2 + 1e-15)
    }
  })

  it('should satisfy E(m) >= 1 for all m in [0,1]', function () {
    for (const m of [0, 0.1, 0.3, 0.5, 0.7, 0.9, 1]) {
      assert(math.ellipticE(m) >= 1 - 1e-15)
    }
  })

  it('should throw RangeError for m < 0', function () {
    assert.throws(() => math.ellipticE(-0.1), /RangeError/)
  })

  it('should throw RangeError for m > 1', function () {
    assert.throws(() => math.ellipticE(1.1), /RangeError/)
  })

  it('should throw for invalid types', function () {
    assert.throws(() => math.ellipticE('abc'))
    assert.throws(() => math.ellipticE())
  })
})

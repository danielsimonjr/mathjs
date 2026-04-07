import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createEllipticK } from '../../../../src/function/special/ellipticK.js'

const math = create({ ...allFactories, createEllipticK })

describe('ellipticK', function () {
  it('should return pi/2 for m = 0', function () {
    assert(Math.abs(math.ellipticK(0) - Math.PI / 2) < 1e-15)
  })

  it('should return K(0.5) ~ 1.8540746773013719', function () {
    // K(m=0.5): integral with parameter m = k^2 = 0.5
    assert(Math.abs(math.ellipticK(0.5) - 1.8540746773013719) < 1e-10)
  })

  it('should return K(0.25) ~ 1.685750354812596', function () {
    assert(Math.abs(math.ellipticK(0.25) - 1.685750354812596) < 1e-10)
  })

  it('should return K(0.81) ~ 2.2805491384227703', function () {
    // K(m=0.81) corresponds to modulus k = 0.9
    assert(Math.abs(math.ellipticK(0.81) - 2.2805491384227703) < 1e-10)
  })

  it('should return K(0.75) ~ 2.1565156474996434', function () {
    assert(Math.abs(math.ellipticK(0.75) - 2.1565156474996434) < 1e-10)
  })

  it('should be increasing in m', function () {
    assert(math.ellipticK(0.1) < math.ellipticK(0.5))
    assert(math.ellipticK(0.5) < math.ellipticK(0.9))
    assert(math.ellipticK(0.9) < math.ellipticK(0.99))
  })

  it('should diverge as m approaches 1', function () {
    // K(m) -> infinity as m -> 1
    assert(math.ellipticK(0.9999) > 5)
    assert(math.ellipticK(0.999999) > 8)
  })

  it('should throw RangeError for m < 0', function () {
    assert.throws(() => math.ellipticK(-0.1), /RangeError/)
  })

  it('should throw RangeError for m >= 1', function () {
    assert.throws(() => math.ellipticK(1), /RangeError/)
    assert.throws(() => math.ellipticK(2), /RangeError/)
  })

  it('should throw for invalid types', function () {
    assert.throws(() => math.ellipticK('abc'))
    assert.throws(() => math.ellipticK())
  })
})

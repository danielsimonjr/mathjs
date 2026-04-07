import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('findRoot', function () {
  it('should find root of x^2 - 4 near x=1 using Newton', function () {
    const root = math.findRoot(function (x) { return x * x - 4 }, 1)
    assert(Math.abs(root - 2) < 1e-10)
  })

  it('should find root of cos(x) near x=1 using Newton', function () {
    const root = math.findRoot(Math.cos, 1)
    assert(Math.abs(root - Math.PI / 2) < 1e-10)
  })

  it('should find root in bracket [0, 3] for x^2 - 4 using Brent', function () {
    const root = math.findRoot(function (x) { return x * x - 4 }, 0, 3)
    assert(Math.abs(root - 2) < 1e-10)
  })

  it('should find root of sin(x) in [3, 4] using Brent', function () {
    const root = math.findRoot(Math.sin, 3, 4)
    assert(Math.abs(root - Math.PI) < 1e-10)
  })

  it('should accept tolerance option for Newton', function () {
    const root = math.findRoot(function (x) { return x * x - 2 }, 1, { tol: 1e-14 })
    assert(Math.abs(root - Math.SQRT2) < 1e-13)
  })

  it('should accept tolerance and bracket for Brent', function () {
    const root = math.findRoot(function (x) { return x * x - 2 }, 1, 2, { tol: 1e-14 })
    assert(Math.abs(root - Math.SQRT2) < 1e-13)
  })

  it('should throw when Newton does not converge', function () {
    assert.throws(function () {
      math.findRoot(function (x) { return x * x + 1 }, 0, { maxIter: 10 })
    }, /converge/)
  })

  it('should throw when bracket does not bracket a root', function () {
    assert.throws(function () {
      math.findRoot(function (x) { return x * x + 1 }, 0, 1)
    }, /opposite signs/)
  })
})

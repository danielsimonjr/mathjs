import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { createChebyshevApprox } from '../../../../src/function/numeric/chebyshevApprox.js'
import { create } from '../../../../src/core/create.js'

const math = create({ ...all, createChebyshevApprox })

describe('chebyshevApprox', function () {
  it('should return an object with coefficients and evaluate', function () {
    const approx = math.chebyshevApprox(Math.sin, 0, Math.PI, 10)
    assert(Array.isArray(approx.coefficients), 'coefficients should be an array')
    assert.strictEqual(typeof approx.evaluate, 'function')
  })

  it('should return n coefficients', function () {
    const approx = math.chebyshevApprox(Math.sin, 0, Math.PI, 10)
    assert.strictEqual(approx.coefficients.length, 10)
  })

  it('should approximate sin(x) on [0, pi] accurately', function () {
    const approx = math.chebyshevApprox(Math.sin, 0, Math.PI, 10)
    const testPoints = [0.1, 0.5, 1.0, 1.5, 2.0, 2.5, 3.0]
    for (const x of testPoints) {
      const err = Math.abs(approx.evaluate(x) - Math.sin(x))
      assert(err < 1e-6, 'error at x=' + x + ' should be < 1e-6, got ' + err)
    }
  })

  it('should approximate exp(x) on [0, 1] accurately', function () {
    const approx = math.chebyshevApprox(Math.exp, 0, 1, 12)
    const testPoints = [0.0, 0.25, 0.5, 0.75, 1.0]
    for (const x of testPoints) {
      const err = Math.abs(approx.evaluate(x) - Math.exp(x))
      assert(err < 1e-8, 'error at x=' + x + ' should be < 1e-8, got ' + err)
    }
  })

  it('should approximate cos(x) on [-pi, pi] accurately', function () {
    const approx = math.chebyshevApprox(Math.cos, -Math.PI, Math.PI, 16)
    const testPoints = [-2.5, -1.0, 0.0, 1.0, 2.5]
    for (const x of testPoints) {
      const err = Math.abs(approx.evaluate(x) - Math.cos(x))
      assert(err < 1e-7, 'error at x=' + x + ' should be < 1e-7, got ' + err)
    }
  })

  it('should approximate a polynomial exactly with enough terms', function () {
    // f(x) = x^2 on [0, 1]
    const f = (x) => x * x
    const approx = math.chebyshevApprox(f, 0, 1, 8)
    assert(Math.abs(approx.evaluate(0.0) - 0.0) < 1e-12)
    assert(Math.abs(approx.evaluate(0.5) - 0.25) < 1e-12)
    assert(Math.abs(approx.evaluate(1.0) - 1.0) < 1e-12)
  })

  it('should approximate a constant function', function () {
    const approx = math.chebyshevApprox(() => 7, 0, 1, 4)
    assert(Math.abs(approx.evaluate(0.5) - 7) < 1e-10)
  })

  it('sin(1) approximation matches reference with 10 terms', function () {
    const approx = math.chebyshevApprox(Math.sin, 0, Math.PI, 10)
    const v = approx.evaluate(1)
    assert(Math.abs(v - Math.sin(1)) < 1e-6, 'sin(1) approximation failed, got ' + v)
  })

  it('should throw for x outside the interval', function () {
    const approx = math.chebyshevApprox(Math.sin, 0, Math.PI, 10)
    assert.throws(() => approx.evaluate(-0.1), /outside the approximation interval/)
    assert.throws(() => approx.evaluate(Math.PI + 0.1), /outside the approximation interval/)
  })

  it('should throw for n < 1', function () {
    assert.throws(
      () => math.chebyshevApprox(Math.sin, 0, Math.PI, 0),
      /positive integer/
    )
  })

  it('should throw for a >= b', function () {
    assert.throws(
      () => math.chebyshevApprox(Math.sin, 2, 1, 5),
      /a must be less than b/
    )
  })
})

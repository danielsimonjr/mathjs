import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('nintegrate', function () {
  it('should integrate x^2 from 0 to 1', function () {
    const result = math.nintegrate(function (x) { return x * x }, 0, 1)
    assert(Math.abs(result - 1 / 3) < 1e-10)
  })

  it('should integrate sin(x) from 0 to pi', function () {
    const result = math.nintegrate(Math.sin, 0, Math.PI)
    assert(Math.abs(result - 2) < 1e-10)
  })

  it('should integrate exp(x) from 0 to 1', function () {
    const result = math.nintegrate(Math.exp, 0, 1)
    assert(Math.abs(result - (Math.E - 1)) < 1e-10)
  })

  it('should handle negative intervals', function () {
    const result = math.nintegrate(function (x) { return x }, -1, 1)
    assert(Math.abs(result) < 1e-10)
  })

  it('should integrate with specified tolerance', function () {
    const result = math.nintegrate(Math.sin, 0, Math.PI, { tol: 1e-14 })
    assert(Math.abs(result - 2) < 1e-12)
  })

  it('should accept maxDepth option', function () {
    const result = math.nintegrate(Math.exp, 0, 1, { tol: 1e-8, maxDepth: 20 })
    assert(Math.abs(result - (Math.E - 1)) < 1e-7)
  })

  it('should integrate a constant function', function () {
    const result = math.nintegrate(function () { return 3 }, 0, 2)
    assert(Math.abs(result - 6) < 1e-10)
  })
})

import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('trapz', function () {
  it('should integrate y = x^2 data with explicit x', function () {
    const x = [0, 1, 2, 3]
    const y = x.map(xi => xi * xi)
    // exact = 9, trapz overestimates slightly for convex functions
    const result = math.trapz(y, x)
    assert(Math.abs(result - 9.5) < 1e-10)
  })

  it('should integrate with scalar dx', function () {
    const y = [0, 1, 4, 9]
    const result = math.trapz(y, 1)
    assert(Math.abs(result - 9.5) < 1e-10)
  })

  it('should integrate constant function', function () {
    const y = [3, 3, 3, 3]
    const result = math.trapz(y, [0, 1, 2, 3])
    assert(Math.abs(result - 9) < 1e-10)
  })

  it('should integrate linear function exactly', function () {
    const x = [0, 1, 2, 3]
    const y = x.map(xi => 2 * xi + 1) // y = 2x+1
    // exact = [x^2 + x]_0^3 = 9+3 = 12
    const result = math.trapz(y, x)
    assert(Math.abs(result - 12) < 1e-10)
  })

  it('should handle two-element arrays', function () {
    const result = math.trapz([0, 2], [0, 1])
    assert(Math.abs(result - 1) < 1e-10)
  })

  it('should throw if y and x have different lengths', function () {
    assert.throws(function () { math.trapz([1, 2, 3], [0, 1]) }, /same length/)
  })

  it('should throw if arrays are too short', function () {
    assert.throws(function () { math.trapz([1], [0]) }, /at least 2/)
  })
})

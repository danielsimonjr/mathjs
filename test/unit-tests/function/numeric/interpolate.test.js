import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('interpolate', function () {
  const points = [[0, 0], [1, 1], [2, 4], [3, 9]]

  it('should do linear interpolation by default', function () {
    const result = math.interpolate(points, 0.5)
    assert(Math.abs(result - 0.5) < 1e-10)
  })

  it('should do linear interpolation at midpoint', function () {
    const result = math.interpolate(points, 1.5, 'linear')
    assert(Math.abs(result - 2.5) < 1e-10)
  })

  it('should return exact data points for linear', function () {
    assert(Math.abs(math.interpolate(points, 2, 'linear') - 4) < 1e-10)
  })

  it('should do Lagrange interpolation', function () {
    // Points are from y = x^2, Lagrange through [0,0],[1,1],[2,4],[3,9] is exact polynomial
    const result = math.interpolate(points, 1.5, 'lagrange')
    assert(Math.abs(result - 2.25) < 1e-10) // 1.5^2 = 2.25
  })

  it('should extrapolate with lagrange', function () {
    const result = math.interpolate(points, 4, 'lagrange')
    assert(Math.abs(result - 16) < 1e-10) // 4^2 = 16
  })

  it('should do cubic spline interpolation', function () {
    const result = math.interpolate(points, 1.5, 'cubic')
    // Cubic spline through x^2 data should be close to 2.25
    assert(Math.abs(result - 2.25) < 0.1)
  })

  it('should throw for x outside range with linear', function () {
    assert.throws(function () { math.interpolate(points, -1, 'linear') }, /range/)
  })

  it('should throw for x outside range with cubic', function () {
    assert.throws(function () { math.interpolate(points, 5, 'cubic') }, /range/)
  })

  it('should throw for unknown method', function () {
    assert.throws(function () { math.interpolate(points, 1, 'quadratic') }, /unknown method/)
  })
})

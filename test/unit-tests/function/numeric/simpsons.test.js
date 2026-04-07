import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('simpsons', function () {
  it("should integrate x^2 from 0 to 1 with Simpson's rule", function () {
    const result = math.simpsons(function (x) { return x * x }, 0, 1)
    assert(Math.abs(result - 1 / 3) < 1e-10)
  })

  it('should integrate sin(x) from 0 to pi', function () {
    const result = math.simpsons(Math.sin, 0, Math.PI)
    assert(Math.abs(result - 2) < 1e-7)
  })

  it('should integrate exp(x) from 0 to 1', function () {
    const result = math.simpsons(Math.exp, 0, 1)
    assert(Math.abs(result - (Math.E - 1)) < 1e-8)
  })

  it('should accept custom n', function () {
    const result = math.simpsons(Math.sin, 0, Math.PI, 200)
    assert(Math.abs(result - 2) < 1e-9)
  })

  it('should integrate a constant function', function () {
    const result = math.simpsons(function () { return 5 }, 0, 4)
    assert(Math.abs(result - 20) < 1e-10)
  })

  it('should throw for odd n', function () {
    assert.throws(function () { math.simpsons(Math.sin, 0, 1, 3) }, /even/)
  })

  it('should throw for non-positive n', function () {
    assert.throws(function () { math.simpsons(Math.sin, 0, 1, 0) }, /positive/)
  })
})

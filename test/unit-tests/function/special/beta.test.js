import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('beta', function () {
  it('should compute beta(1, 1) = 1', function () {
    assert(Math.abs(math.beta(1, 1) - 1) < 1e-14)
  })

  it('should compute beta(2, 3) = 1/12', function () {
    assert(Math.abs(math.beta(2, 3) - 1 / 12) < 1e-14)
  })

  it('should compute beta(3, 2) = 1/12 (symmetry)', function () {
    assert(Math.abs(math.beta(3, 2) - 1 / 12) < 1e-14)
  })

  it('should compute beta(0.5, 0.5) = pi', function () {
    assert(Math.abs(math.beta(0.5, 0.5) - Math.PI) < 1e-10)
  })

  it('should satisfy beta(a, b) = beta(b, a)', function () {
    const a = 2.3, b = 4.7
    assert(Math.abs(math.beta(a, b) - math.beta(b, a)) < 1e-14)
  })

  it('should satisfy beta(a, b) = gamma(a)*gamma(b)/gamma(a+b)', function () {
    const a = 3, b = 4
    const expected = math.gamma(a) * math.gamma(b) / math.gamma(a + b)
    assert(Math.abs(math.beta(a, b) - expected) < 1e-14)
  })

  it('should compute beta for fractional arguments', function () {
    // beta(1/3, 2/3) = 2*pi/sqrt(3) by reflection formula
    const result = math.beta(1 / 3, 2 / 3)
    const expected = 2 * Math.PI / Math.sqrt(3)
    assert(Math.abs(result - expected) < 1e-10)
  })

  it('should compute beta(5, 5) accurately', function () {
    // beta(5,5) = Gamma(5)*Gamma(5)/Gamma(10) = (4!)^2 / 9! = 576/362880 = 1/630
    assert(Math.abs(math.beta(5, 5) - 1 / 630) < 1e-13)
  })
})

import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const convolve = math.convolve

describe('convolve', function () {
  it('should convolve [1,2,3] with [1,1] to give [1,3,5,3]', function () {
    approxDeepEqual(convolve([1, 2, 3], [1, 1]), [1, 3, 5, 3])
  })

  it('should produce output of length len(a)+len(b)-1', function () {
    const result = convolve([1, 2, 3, 4], [1, 2, 3])
    assert.strictEqual(result.length, 6)
  })

  it('should act as identity when convolving with [1]', function () {
    approxDeepEqual(convolve([1, 2, 3], [1]), [1, 2, 3])
  })

  it('should convolve [1,0,0] with [1,2,3] to give [1,2,3,0,0]', function () {
    approxDeepEqual(convolve([1, 0, 0], [1, 2, 3]), [1, 2, 3, 0, 0])
  })

  it('should be commutative: convolve(a, b) equals convolve(b, a)', function () {
    const a = [1, 2, 3]
    const b = [4, 5]
    approxDeepEqual(convolve(a, b), convolve(b, a))
  })

  it('should convolve single-element arrays', function () {
    approxDeepEqual(convolve([3], [4]), [12])
  })

  it('should accept Matrix inputs', function () {
    const a = math.matrix([1, 2, 3])
    const b = math.matrix([1, 1])
    approxDeepEqual(convolve(a, b), [1, 3, 5, 3])
  })

  it('should accept mixed Array and Matrix inputs', function () {
    approxDeepEqual(convolve([1, 2, 3], math.matrix([1, 1])), [1, 3, 5, 3])
    approxDeepEqual(convolve(math.matrix([1, 2, 3]), [1, 1]), [1, 3, 5, 3])
  })

  it('should convolve [1,2] with [1,2] to give [1,4,4]', function () {
    approxDeepEqual(convolve([1, 2], [1, 2]), [1, 4, 4])
  })

  it('should handle larger arrays correctly', function () {
    // step response: [1,1,1] convolved with [1,1,1,1,1]
    approxDeepEqual(convolve([1, 1, 1], [1, 1, 1, 1, 1]), [1, 2, 3, 3, 3, 2, 1])
  })
})

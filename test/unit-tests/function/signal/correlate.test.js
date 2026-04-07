import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const correlate = math.correlate

describe('correlate', function () {
  it('should compute autocorrelation with a single argument', function () {
    const result = correlate([1, 2, 3])
    assert.strictEqual(result.length, 5)
  })

  it('should have autocorrelation peak at center index', function () {
    const a = [1, 2, 3]
    const result = correlate(a, a)
    const center = a.length - 1
    // center value should be sum of squares: 1+4+9 = 14
    assert.strictEqual(result.length, 2 * a.length - 1)
    approxDeepEqual(result[center], 14)
  })

  it('should compute autocorrelation sum-of-squares correctly', function () {
    // correlate([1,2,3],[1,2,3]) center = 1*1 + 2*2 + 3*3 = 14
    const result = correlate([1, 2, 3], [1, 2, 3])
    approxDeepEqual(result[2], 14)
  })

  it('should detect shift between identical signals', function () {
    // [0,0,1] correlated with [1,0,0] — peak at right edge
    const a = [0, 0, 1]
    const b = [1, 0, 0]
    const result = correlate(a, b)
    const maxIdx = result.indexOf(Math.max(...result))
    assert.strictEqual(maxIdx, result.length - 1)
  })

  it('should produce output length len(a)+len(b)-1', function () {
    const result = correlate([1, 2, 3, 4], [1, 2])
    assert.strictEqual(result.length, 5)
  })

  it('should accept Matrix inputs', function () {
    const a = math.matrix([1, 2, 3])
    const b = math.matrix([1, 2, 3])
    const result = correlate(a, b)
    assert.strictEqual(result.length, 5)
    approxDeepEqual(result[2], 14)
  })

  it('should accept single Matrix argument for autocorrelation', function () {
    const a = math.matrix([1, 2, 3])
    const result = correlate(a)
    approxDeepEqual(result[2], 14)
  })

  it('should accept mixed Array and Matrix inputs', function () {
    const result1 = correlate([1, 2, 3], math.matrix([1, 2, 3]))
    const result2 = correlate(math.matrix([1, 2, 3]), [1, 2, 3])
    approxDeepEqual(result1[2], 14)
    approxDeepEqual(result2[2], 14)
  })

  it('should give symmetric result for autocorrelation', function () {
    const a = [1, 2, 3, 4]
    const result = correlate(a, a)
    for (let i = 0; i < result.length; i++) {
      approxDeepEqual(result[i], result[result.length - 1 - i])
    }
  })
})

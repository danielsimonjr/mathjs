import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const windowFunction = math.windowFunction

describe('windowFunction', function () {
  it('should return an array of length n', function () {
    assert.strictEqual(windowFunction(10).length, 10)
    assert.strictEqual(windowFunction(10, 'hamming').length, 10)
    assert.strictEqual(windowFunction(10, 'hanning').length, 10)
    assert.strictEqual(windowFunction(10, 'blackman').length, 10)
    assert.strictEqual(windowFunction(10, 'rectangular').length, 10)
    assert.strictEqual(windowFunction(10, 'kaiser', 2.5).length, 10)
  })

  it('should default to hamming window', function () {
    approxDeepEqual(windowFunction(5), windowFunction(5, 'hamming'))
  })

  it('should return all ones for rectangular window', function () {
    const w = windowFunction(5, 'rectangular')
    for (const v of w) {
      approxDeepEqual(v, 1)
    }
  })

  it('should have hamming window symmetric', function () {
    const w = windowFunction(8, 'hamming')
    for (let i = 0; i < Math.floor(w.length / 2); i++) {
      approxDeepEqual(w[i], w[w.length - 1 - i])
    }
  })

  it('should have hanning window symmetric', function () {
    const w = windowFunction(8, 'hanning')
    for (let i = 0; i < Math.floor(w.length / 2); i++) {
      approxDeepEqual(w[i], w[w.length - 1 - i])
    }
  })

  it('should have blackman window symmetric', function () {
    const w = windowFunction(8, 'blackman')
    for (let i = 0; i < Math.floor(w.length / 2); i++) {
      approxDeepEqual(w[i], w[w.length - 1 - i])
    }
  })

  it('should have kaiser window symmetric', function () {
    const w = windowFunction(8, 'kaiser', 3)
    for (let i = 0; i < Math.floor(w.length / 2); i++) {
      approxDeepEqual(w[i], w[w.length - 1 - i])
    }
  })

  it('should compute hamming window endpoints correctly', function () {
    // w[0] = 0.54 - 0.46*cos(0) = 0.54 - 0.46 = 0.08
    const w = windowFunction(5, 'hamming')
    approxDeepEqual(w[0], 0.08)
    approxDeepEqual(w[w.length - 1], 0.08)
  })

  it('should compute hanning window endpoints correctly', function () {
    // w[0] = 0.5*(1 - cos(0)) = 0
    const w = windowFunction(5, 'hanning')
    approxDeepEqual(w[0], 0)
    approxDeepEqual(w[w.length - 1], 0)
  })

  it('should compute blackman window endpoints correctly', function () {
    // w[0] = 0.42 - 0.5*cos(0) + 0.08*cos(0) = 0.42 - 0.5 + 0.08 = 0
    const w = windowFunction(5, 'blackman')
    approxDeepEqual(w[0], 0)
    approxDeepEqual(w[w.length - 1], 0)
  })

  it('should have kaiser window equal to 1 at center', function () {
    // At center, x = 0, so sqrt(1-0) = 1, I0(alpha)/I0(alpha) = 1
    const w = windowFunction(5, 'kaiser', 2)
    const center = Math.floor(w.length / 2)
    approxDeepEqual(w[center], 1)
  })

  it('should throw on unknown window type', function () {
    assert.throws(function () { windowFunction(5, 'unknown') }, /unknown window type/)
  })

  it('should throw on non-positive n', function () {
    assert.throws(function () { windowFunction(0) }, /must be a positive integer/)
    assert.throws(function () { windowFunction(-1) }, /must be a positive integer/)
  })

  it('should compute known hamming values for n=5', function () {
    const w = windowFunction(5, 'hamming')
    // k=0: 0.54 - 0.46*cos(0) = 0.08
    // k=2: 0.54 - 0.46*cos(pi) = 0.54 + 0.46 = 1.0
    approxDeepEqual(w[0], 0.08)
    approxDeepEqual(w[2], 1.0)
  })
})

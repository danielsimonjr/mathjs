import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const fourier = math.fourier

function approxEqual (a, b, tol = 1e-6) {
  return Math.abs(a - b) < tol
}

describe('fourier', function () {
  it('should return frequencies, amplitudes, phases for a DC signal', function () {
    const signal = [1, 1, 1, 1]
    const result = fourier(signal)
    assert(Array.isArray(result.frequencies))
    assert(Array.isArray(result.amplitudes))
    assert(Array.isArray(result.phases))
    assert.strictEqual(result.frequencies.length, 4)
    assert.strictEqual(result.amplitudes.length, 4)
    assert.strictEqual(result.phases.length, 4)
  })

  it('should return amplitude 1 at DC for a unit signal', function () {
    const signal = [1, 1, 1, 1]
    const result = fourier(signal)
    // DC bin: amplitudes[0] = sum/N = 4/4 = 1
    assert(approxEqual(result.amplitudes[0], 1, 1e-5))
    // All other bins should be near zero
    for (let i = 1; i < result.amplitudes.length; i++) {
      assert(result.amplitudes[i] < 1e-5)
    }
  })

  it('should have correct frequency bins with custom sampleRate', function () {
    const signal = [1, 0, 1, 0]
    const fs = 8
    const result = fourier(signal, { sampleRate: fs })
    assert.strictEqual(result.frequencies.length, 4)
    assert(approxEqual(result.frequencies[0], 0))
    assert(approxEqual(result.frequencies[1], 2))   // 1 * 8/4
    assert(approxEqual(result.frequencies[2], 4))   // 2 * 8/4
    assert(approxEqual(result.frequencies[3], 6))   // 3 * 8/4
  })

  it('should return complex array when output option is "complex"', function () {
    const signal = [1, 0, 1, 0]
    const result = fourier(signal, { output: 'complex' })
    assert(Array.isArray(result))
    assert.strictEqual(result.length, 4)
  })

  it('should have correct amplitudes for [1,0,1,0]', function () {
    // [1,0,1,0]: DFT has DC=2, index2=2, others=0; scaled by 1/4 → [0.5, 0, 0.5, 0]
    const signal = [1, 0, 1, 0]
    const result = fourier(signal)
    assert(approxEqual(result.amplitudes[0], 0.5, 1e-5))
    assert(result.amplitudes[1] < 1e-5)
    assert(approxEqual(result.amplitudes[2], 0.5, 1e-5))
    assert(result.amplitudes[3] < 1e-5)
  })

  it('should work with default sampleRate=1', function () {
    const signal = [1, 1, 1, 1]
    const result = fourier(signal)
    assert(approxEqual(result.frequencies[0], 0))
    assert(approxEqual(result.frequencies[1], 0.25))
  })
})

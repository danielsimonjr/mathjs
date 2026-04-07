import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

const fourier = math.fourier
const invFourier = math.invFourier

function approxEqual (a, b, tol = 1e-6) {
  return Math.abs(a - b) < tol
}

describe('invFourier', function () {
  it('should reconstruct signal from complex spectrum', function () {
    const original = [1, 0, 1, 0]
    const spectrum = fourier(original, { output: 'complex' })
    const reconstructed = invFourier(spectrum)
    assert.strictEqual(reconstructed.length, 4)
    for (let i = 0; i < original.length; i++) {
      assert(approxEqual(reconstructed[i], original[i], 1e-5))
    }
  })

  it('should reconstruct a DC signal', function () {
    const original = [1, 1, 1, 1]
    const spectrum = fourier(original, { output: 'complex' })
    const reconstructed = invFourier(spectrum)
    for (let i = 0; i < original.length; i++) {
      assert(approxEqual(reconstructed[i], 1, 1e-5))
    }
  })

  it('should reconstruct signal from spectrum object', function () {
    const original = [1, 0, 1, 0]
    const spectrum = fourier(original)
    const reconstructed = invFourier(spectrum)
    assert.strictEqual(reconstructed.length, 4)
    for (let i = 0; i < original.length; i++) {
      assert(approxEqual(reconstructed[i], original[i], 1e-5))
    }
  })

  it('should reconstruct a longer signal', function () {
    const original = [3, 1, 4, 1, 5, 9, 2, 6]
    const spectrum = fourier(original, { output: 'complex' })
    const reconstructed = invFourier(spectrum)
    assert.strictEqual(reconstructed.length, 8)
    for (let i = 0; i < original.length; i++) {
      assert(approxEqual(reconstructed[i], original[i], 1e-4))
    }
  })

  it('should return an array', function () {
    const spectrum = fourier([1, 2, 3, 4], { output: 'complex' })
    const result = invFourier(spectrum)
    assert(Array.isArray(result))
  })

  it('should round-trip through fourier and invFourier', function () {
    const original = [2, -1, 3, 0, 1, -2]
    const spectrum = fourier(original, { output: 'complex' })
    const reconstructed = invFourier(spectrum)
    for (let i = 0; i < original.length; i++) {
      assert(approxEqual(reconstructed[i], original[i], 1e-4))
    }
  })
})

import assert from 'assert'
import { all } from '../../../../src/entry/allFactoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createHilbertTransform } from '../../../../src/function/signal/hilbertTransform.js'

const math = create({ ...all, createHilbertTransform })
const hilbertTransform = math.hilbertTransform

function approxArrayEqual (arr1, arr2, tol = 1e-4) {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (Math.abs(arr1[i] - arr2[i]) > tol) return false
  }
  return true
}

describe('hilbertTransform', function () {
  it('should return an empty array for empty input', function () {
    const result = hilbertTransform([])
    assert.deepStrictEqual(result, [])
  })

  it('should return [0] for a single-element input', function () {
    const result = hilbertTransform([1])
    assert.deepStrictEqual(result, [0])
  })

  it('should return an array of the same length as the input', function () {
    const signal = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = hilbertTransform(signal)
    assert.strictEqual(result.length, signal.length)
  })

  it('should give hilbert transform of cos(t) approximately equal to sin(t)', function () {
    // Sample cos(2*pi*k/N) for k=0..N-1, N=8
    const N = 8
    const cosSignal = []
    const sinSignal = []
    for (let k = 0; k < N; k++) {
      cosSignal.push(Math.cos(2 * Math.PI * k / N))
      sinSignal.push(Math.sin(2 * Math.PI * k / N))
    }

    const result = hilbertTransform(cosSignal)
    assert(Array.isArray(result))
    assert.strictEqual(result.length, N)

    // Check that hilbert transform of cos is approximately sin
    assert(approxArrayEqual(result, sinSignal, 1e-3),
      'hilbertTransform of cos should approximate sin, got: ' + JSON.stringify(result))
  })

  it('should return numeric values for all elements', function () {
    const signal = [1, 0, -1, 0, 1, 0, -1, 0]
    const result = hilbertTransform(signal)
    for (const val of result) {
      assert(typeof val === 'number', 'Expected number, got ' + typeof val)
      assert(isFinite(val), 'Expected finite value, got ' + val)
    }
  })

  it('should produce near-zero output for DC (constant) signal', function () {
    // Hilbert transform of a constant is zero (no phase shift of DC)
    const signal = [1, 1, 1, 1, 1, 1, 1, 1]
    const result = hilbertTransform(signal)
    for (const val of result) {
      assert(Math.abs(val) < 1e-8, 'Expected near-zero for DC signal, got ' + val)
    }
  })

  it('should handle negative values in the signal', function () {
    const signal = [-1, -2, -3, -4]
    const result = hilbertTransform(signal)
    assert.strictEqual(result.length, 4)
    for (const val of result) {
      assert(typeof val === 'number')
      assert(isFinite(val))
    }
  })

  it('hilbert transform should give energy comparable to the original signal', function () {
    // For a pure cosine, ||H(x)||^2 ≈ ||x||^2
    const N = 8
    const signal = []
    for (let k = 0; k < N; k++) {
      signal.push(Math.cos(2 * Math.PI * k / N))
    }
    const result = hilbertTransform(signal)

    const energyIn = signal.reduce((s, v) => s + v * v, 0)
    const energyOut = result.reduce((s, v) => s + v * v, 0)

    // Energy should be approximately equal (both = N/2 for pure tone)
    assert(Math.abs(energyIn - energyOut) / energyIn < 0.1,
      'Expected energy conservation, energyIn=' + energyIn + ', energyOut=' + energyOut)
  })
})

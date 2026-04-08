import { approxDeepEqual } from '../../../../tools/approx.js'
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDwt } from '../../../../src/function/signal/dwt.js'

const math = create({ ...all, createDwt })
const dwt = math.dwt

describe('dwt', function () {
  it('should return object with approximation and detail arrays', function () {
    const result = dwt([1, 1, 1, 1], 'haar')
    assert.ok(Array.isArray(result.approximation))
    assert.ok(Array.isArray(result.detail))
  })

  it('should return empty arrays for empty input', function () {
    const result = dwt([], 'haar')
    assert.deepStrictEqual(result.approximation, [])
    assert.deepStrictEqual(result.detail, [])
  })

  it('should compute haar DWT for constant signal [1,1,1,1]', function () {
    // approx[i] = (x[2i] + x[2i+1]) / sqrt(2)
    // [1,1,1,1]: approx = [sqrt(2), sqrt(2)], detail = [0, 0]
    const result = dwt([1, 1, 1, 1], 'haar')
    const sqrt2 = Math.sqrt(2)
    assert.strictEqual(result.approximation.length, 2)
    assert.strictEqual(result.detail.length, 2)
    approxDeepEqual(result.approximation[0], sqrt2)
    approxDeepEqual(result.approximation[1], sqrt2)
    approxDeepEqual(result.detail[0], 0)
    approxDeepEqual(result.detail[1], 0)
  })

  it('should compute haar DWT for [1, 2, 3, 4]', function () {
    // approx[0] = (1+2)/sqrt(2) = 3/sqrt(2)
    // approx[1] = (3+4)/sqrt(2) = 7/sqrt(2)
    // detail[0] = (1-2)/sqrt(2) = -1/sqrt(2)
    // detail[1] = (3-4)/sqrt(2) = -1/sqrt(2)
    const result = dwt([1, 2, 3, 4], 'haar')
    const sqrt2 = Math.sqrt(2)
    approxDeepEqual(result.approximation[0], 3 / sqrt2)
    approxDeepEqual(result.approximation[1], 7 / sqrt2)
    approxDeepEqual(result.detail[0], -1 / sqrt2)
    approxDeepEqual(result.detail[1], -1 / sqrt2)
  })

  it('should produce output of length floor(N/2) for haar', function () {
    assert.strictEqual(dwt([1, 2, 3, 4], 'haar').approximation.length, 2)
    assert.strictEqual(dwt([1, 2, 3, 4, 5, 6, 7, 8], 'haar').approximation.length, 4)
  })

  it('should compute haar DWT for alternating signal [1, -1, 1, -1]', function () {
    // approx[i] = (1 + (-1))/sqrt(2) = 0
    // detail[i] = (1 - (-1))/sqrt(2) = sqrt(2)
    const result = dwt([1, -1, 1, -1], 'haar')
    const sqrt2 = Math.sqrt(2)
    approxDeepEqual(result.approximation[0], 0)
    approxDeepEqual(result.approximation[1], 0)
    approxDeepEqual(result.detail[0], sqrt2)
    approxDeepEqual(result.detail[1], sqrt2)
  })

  it('should compute db2 DWT returning correct output length', function () {
    const result = dwt([1, 2, 3, 4], 'db2')
    assert.strictEqual(result.approximation.length, 2)
    assert.strictEqual(result.detail.length, 2)
  })

  it('should throw on unknown wavelet', function () {
    assert.throws(() => dwt([1, 2, 3, 4], 'unknown'), /unknown wavelet/)
  })

  it('should preserve energy in haar transform (Parseval)', function () {
    // Energy of input = sum of squares
    // Energy of output = sum of approx^2 + sum of detail^2
    const signal = [3, 1, 4, 1]
    const result = dwt(signal, 'haar')
    const inputEnergy = signal.reduce((s, x) => s + x * x, 0)
    const outputEnergy = result.approximation.reduce((s, x) => s + x * x, 0) +
                         result.detail.reduce((s, x) => s + x * x, 0)
    approxDeepEqual(inputEnergy, outputEnergy)
  })
})

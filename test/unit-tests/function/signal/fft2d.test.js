import assert from 'assert'
import { all } from '../../../../src/entry/allFactoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFft2d } from '../../../../src/function/signal/fft2d.js'

const math = create({ ...all, createFft2d })
const fft2d = math.fft2d

function approxEqual (a, b, tol = 1e-8) {
  return Math.abs(a - b) < tol
}

describe('fft2d', function () {
  it('should return an empty array for empty input', function () {
    assert.deepStrictEqual(fft2d([]), [])
  })

  it('should return complex numbers as output', function () {
    const matrix = [[1, 0], [0, 0]]
    const result = fft2d(matrix)
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 2)
    assert('re' in result[0][0], 'Output should have re property')
    assert('im' in result[0][0], 'Output should have im property')
  })

  it('should have DC component equal to sum of all elements for all-ones matrix', function () {
    const N = 4
    const matrix = Array.from({ length: N }, () => new Array(N).fill(1))
    const result = fft2d(matrix)

    // DC component (0,0) should equal N*N = 16
    assert(approxEqual(result[0][0].re, N * N, 1e-6),
      'DC component should equal N^2=' + (N * N) + ', got ' + result[0][0].re)
    assert(approxEqual(result[0][0].im, 0, 1e-6),
      'DC component imaginary should be 0, got ' + result[0][0].im)
  })

  it('should have all non-DC components near zero for all-ones matrix', function () {
    const N = 4
    const matrix = Array.from({ length: N }, () => new Array(N).fill(1))
    const result = fft2d(matrix)

    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (r === 0 && c === 0) continue
        assert(Math.abs(result[r][c].re) < 1e-8,
          'Non-DC real component should be ~0 at [' + r + '][' + c + '], got ' + result[r][c].re)
        assert(Math.abs(result[r][c].im) < 1e-8,
          'Non-DC imag component should be ~0 at [' + r + '][' + c + '], got ' + result[r][c].im)
      }
    }
  })

  it('should return correct result for 1x1 matrix', function () {
    const result = fft2d([[5]])
    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].length, 1)
    assert(approxEqual(result[0][0].re, 5), 'Expected re=5, got ' + result[0][0].re)
    assert(approxEqual(result[0][0].im, 0), 'Expected im=0, got ' + result[0][0].im)
  })

  it('should return correct result for 2x2 all-ones matrix', function () {
    const result = fft2d([[1, 1], [1, 1]])
    // DC should be 4
    assert(approxEqual(result[0][0].re, 4, 1e-10), 'DC should be 4')
    assert(approxEqual(result[0][0].im, 0, 1e-10), 'DC imag should be 0')
    // All others should be 0
    assert(approxEqual(result[0][1].re, 0, 1e-10), '[0][1] re should be 0')
    assert(approxEqual(result[1][0].re, 0, 1e-10), '[1][0] re should be 0')
    assert(approxEqual(result[1][1].re, 0, 1e-10), '[1][1] re should be 0')
  })

  it('should return correct size for non-square matrices', function () {
    const matrix = [[1, 2, 3], [4, 5, 6]]
    const result = fft2d(matrix)
    assert.strictEqual(result.length, 2)
    assert.strictEqual(result[0].length, 3)
  })

  it('should have DC equal to sum of all elements for arbitrary matrix', function () {
    const matrix = [[2, 0], [0, 0]]
    const result = fft2d(matrix)
    // DC should equal sum = 2
    assert(approxEqual(result[0][0].re, 2, 1e-10), 'DC should be 2, got ' + result[0][0].re)
  })

  it('should return finite values for all elements', function () {
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const result = fft2d(matrix)
    for (let r = 0; r < result.length; r++) {
      for (let c = 0; c < result[r].length; c++) {
        assert(isFinite(result[r][c].re), 're should be finite at [' + r + '][' + c + ']')
        assert(isFinite(result[r][c].im), 'im should be finite at [' + r + '][' + c + ']')
      }
    }
  })
})

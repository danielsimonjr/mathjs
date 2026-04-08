import assert from 'assert'
import { all } from '../../../../src/entry/allFactoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDst } from '../../../../src/function/signal/dst.js'

const math = create({ ...all, createDst })
const dst = math.dst

function approxEqual (a, b, tol = 1e-8) {
  return Math.abs(a - b) < tol
}

function approxArrayEqual (arr1, arr2, tol = 1e-8) {
  if (arr1.length !== arr2.length) return false
  for (let i = 0; i < arr1.length; i++) {
    if (Math.abs(arr1[i] - arr2[i]) > tol) return false
  }
  return true
}

describe('dst', function () {
  it('should return an empty array for empty input', function () {
    assert.deepStrictEqual(dst([]), [])
  })

  it('should return a single-element result for single-element input', function () {
    const result = dst([3])
    assert.strictEqual(result.length, 1)
    // DST-I of [x]: X[0] = x * sin(pi*1*1/2) = x * sin(pi/2) = x
    assert(approxEqual(result[0], 3), 'Expected 3, got ' + result[0])
  })

  it('should return correct DST-I for [1, 0, -1]', function () {
    // N=3: X[k] = sum_{n=0}^{2} x[n] * sin(pi*(n+1)*(k+1)/4)
    // X[0] = 1*sin(pi/4) + 0*sin(pi/2) + (-1)*sin(3pi/4)
    //       = sqrt(2)/2 - sqrt(2)/2 = 0
    // X[1] = 1*sin(pi/2) + 0*sin(pi) + (-1)*sin(3pi/2) = 1 + 0 + 1 = 2
    // X[2] = 1*sin(3pi/4) + 0*sin(3pi/2) + (-1)*sin(9pi/4) = sqrt(2)/2 - sqrt(2)/2 = 0
    const result = dst([1, 0, -1])
    assert(approxEqual(result[0], 0, 1e-10), 'X[0] should be 0')
    assert(approxEqual(result[1], 2, 1e-10), 'X[1] should be 2')
    assert(approxEqual(result[2], 0, 1e-10), 'X[2] should be 0')
  })

  it('should return same length as input', function () {
    const result = dst([1, 2, 3, 4])
    assert.strictEqual(result.length, 4)
  })

  it('should produce finite numeric values', function () {
    const result = dst([1, 2, 3, 4])
    for (const val of result) {
      assert(typeof val === 'number')
      assert(isFinite(val))
    }
  })

  it('should be linear: dst(a*x + b*y) = a*dst(x) + b*dst(y)', function () {
    const x = [1, 2, 3]
    const y = [4, 5, 6]
    const a = 2; const b = 3
    const lhs = dst(x.map((v, i) => a * v + b * y[i]))
    const dstX = dst(x)
    const dstY = dst(y)
    const rhs = dstX.map((v, i) => a * v + b * dstY[i])
    assert(approxArrayEqual(lhs, rhs, 1e-8), 'DST should be linear')
  })

  it('should handle signals with negative values', function () {
    const result = dst([-1, -2, -3])
    assert.strictEqual(result.length, 3)
    for (const val of result) {
      assert(isFinite(val))
    }
  })

  it('should compute all ones input without error', function () {
    const result = dst([1, 1, 1, 1])
    assert.strictEqual(result.length, 4)
    for (const val of result) {
      assert(isFinite(val))
    }
  })
})

import assert from 'assert'
import { all } from '../../../../src/entry/allFactoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createDst } from '../../../../src/function/signal/dst.js'
import { createIdst } from '../../../../src/function/signal/idst.js'

const math = create({ ...all, createDst, createIdst })
const dst = math.dst
const idst = math.idst

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

describe('idst', function () {
  it('should return an empty array for empty input', function () {
    assert.deepStrictEqual(idst([]), [])
  })

  it('should reconstruct signal: idst(dst(x)) ≈ x for [1, 2, 3, 4]', function () {
    const x = [1, 2, 3, 4]
    const result = idst(dst(x))
    assert(approxArrayEqual(result, x, 1e-6),
      'idst(dst(x)) should equal x, got: ' + JSON.stringify(result))
  })

  it('should reconstruct signal: idst(dst(x)) ≈ x for [0, 1, 0, -1]', function () {
    const x = [0, 1, 0, -1]
    const result = idst(dst(x))
    assert(approxArrayEqual(result, x, 1e-6),
      'idst(dst(x)) should equal x, got: ' + JSON.stringify(result))
  })

  it('should reconstruct signal: idst(dst(x)) ≈ x for single element', function () {
    const x = [5]
    const result = idst(dst(x))
    assert(approxEqual(result[0], x[0], 1e-10),
      'idst(dst([5])) should be [5], got: ' + result[0])
  })

  it('should reconstruct signal: idst(dst(x)) ≈ x for arbitrary signal', function () {
    const x = [3, -1, 4, 1, 5, -9, 2, 6]
    const result = idst(dst(x))
    assert(approxArrayEqual(result, x, 1e-6),
      'idst(dst(x)) should equal x for arbitrary signal')
  })

  it('should return same length as input', function () {
    const result = idst([1, 2, 3, 4])
    assert.strictEqual(result.length, 4)
  })

  it('should produce finite numeric values', function () {
    const result = idst([1, 2, 3, 4])
    for (const val of result) {
      assert(typeof val === 'number')
      assert(isFinite(val))
    }
  })

  it('idst of all zeros should return all zeros', function () {
    const result = idst([0, 0, 0, 0])
    for (const val of result) {
      assert(approxEqual(val, 0, 1e-10), 'Expected 0, got ' + val)
    }
  })

  it('should apply scaling factor 2/(N+1) relative to forward DST', function () {
    // idst(X) = (2/(N+1)) * dst(X)
    const X = [1, 2, 3]
    const N = X.length
    const scale = 2 / (N + 1)
    const dstX = dst(X)
    const expected = dstX.map(v => scale * v)
    const result = idst(X)
    assert(approxArrayEqual(result, expected, 1e-10),
      'idst(X) should equal (2/(N+1)) * dst(X)')
  })
})

import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPolymul } from '../../../../src/function/algebra/polymul.js'

const math = create({ ...all, createPolymul })

describe('polymul', function () {
  it('should compute (1+x)^2 = 1+2x+x^2', function () {
    assert.deepStrictEqual(math.polymul([1, 1], [1, 1]), [1, 2, 1])
  })

  it('should compute (1+2x)(3+4x) = 3+10x+8x^2', function () {
    assert.deepStrictEqual(math.polymul([1, 2], [3, 4]), [3, 10, 8])
  })

  it('should multiply by a constant (scalar polynomial)', function () {
    assert.deepStrictEqual(math.polymul([2], [1, 2, 3]), [2, 4, 6])
  })

  it('should return empty array when multiplying by zero polynomial', function () {
    assert.deepStrictEqual(math.polymul([], [1, 2, 3]), [])
  })

  it('should return empty array when both are empty', function () {
    assert.deepStrictEqual(math.polymul([], []), [])
  })

  it('should handle multiplication of two linear polynomials', function () {
    // (2+x)(3+x) = 6 + 5x + x^2
    assert.deepStrictEqual(math.polymul([2, 1], [3, 1]), [6, 5, 1])
  })

  it('should be commutative', function () {
    const a = [1, 2, 3]
    const b = [4, 5]
    assert.deepStrictEqual(math.polymul(a, b), math.polymul(b, a))
  })

  it('should compute correct degree: deg(a)+deg(b)', function () {
    // degree 2 * degree 3 = degree 5 => array of length 6
    const result = math.polymul([1, 0, 1], [1, 0, 0, 1])
    assert.strictEqual(result.length, 6)
  })
})

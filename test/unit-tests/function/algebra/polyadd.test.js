import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPolyadd } from '../../../../src/function/algebra/polyadd.js'

const math = create({ ...all, createPolyadd })

describe('polyadd', function () {
  it('should add two polynomials of different lengths', function () {
    assert.deepStrictEqual(math.polyadd([1, 2], [3, 4, 5]), [4, 6, 5])
  })

  it('should add two polynomials when first is longer', function () {
    assert.deepStrictEqual(math.polyadd([3, 4, 5], [1, 2]), [4, 6, 5])
  })

  it('should add two polynomials of the same length', function () {
    assert.deepStrictEqual(math.polyadd([1, 2, 3], [4, 5, 6]), [5, 7, 9])
  })

  it('should handle adding with empty polynomial', function () {
    assert.deepStrictEqual(math.polyadd([1, 2, 3], []), [1, 2, 3])
  })

  it('should handle two empty polynomials', function () {
    assert.deepStrictEqual(math.polyadd([], []), [])
  })

  it('should correctly pad shorter array with zeros', function () {
    assert.deepStrictEqual(math.polyadd([1], [0, 0, 5]), [1, 0, 5])
  })

  it('should be commutative', function () {
    const a = [1, 2, 3]
    const b = [4, 5]
    assert.deepStrictEqual(math.polyadd(a, b), math.polyadd(b, a))
  })

  it('should handle negative coefficients', function () {
    assert.deepStrictEqual(math.polyadd([1, -2, 3], [-1, 2, -3]), [0, 0, 0])
  })
})

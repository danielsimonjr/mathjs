import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPolyder } from '../../../../src/function/algebra/polyder.js'

const math = create({ ...all, createPolyder })

describe('polyder', function () {
  it('should differentiate a quadratic polynomial', function () {
    // d/dx(1 + 2x + 3x^2) = 2 + 6x => [2, 6]
    assert.deepStrictEqual(math.polyder([1, 2, 3]), [2, 6])
  })

  it('should differentiate a linear polynomial', function () {
    // d/dx(3 + 4x) = 4 => [4]
    assert.deepStrictEqual(math.polyder([3, 4]), [4])
  })

  it('should return empty array for a constant polynomial', function () {
    assert.deepStrictEqual(math.polyder([5]), [])
  })

  it('should return empty array for empty input', function () {
    assert.deepStrictEqual(math.polyder([]), [])
  })

  it('should differentiate x^2 polynomial', function () {
    // d/dx(x^2) = 2x => [0, 2]
    assert.deepStrictEqual(math.polyder([0, 0, 1]), [0, 2])
  })

  it('should handle higher-degree polynomial', function () {
    // d/dx(1 + x + x^2 + x^3 + x^4) = 1 + 2x + 3x^2 + 4x^3
    assert.deepStrictEqual(math.polyder([1, 1, 1, 1, 1]), [1, 2, 3, 4])
  })

  it('should handle polynomial with negative coefficients', function () {
    // d/dx(0 - x + x^2) = -1 + 2x
    assert.deepStrictEqual(math.polyder([0, -1, 1]), [-1, 2])
  })
})

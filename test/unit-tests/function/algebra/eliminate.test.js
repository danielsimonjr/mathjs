import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createEliminate } from '../../../../src/function/algebra/eliminate.js'
import { createResultant } from '../../../../src/function/algebra/resultant.js'
import { createCoefficientList } from '../../../../src/function/algebra/coefficientList.js'

const math = create({ ...all, createEliminate, createResultant, createCoefficientList })

describe('eliminate', function () {
  it('should eliminate x from a linear system (x+y-1, x-y)', function () {
    const result = math.eliminate(['x + y - 1', 'x - y'], ['x'])
    assert.ok(Array.isArray(result), 'should return an array')
    assert.ok(result.length > 0, 'should return at least one equation')
    // The result should be a polynomial in y only
    // x+y-1=0 and x-y=0 → x=y, 2y=1 → y=0.5
    // Verify that the returned equation vanishes at y=0.5
    const evalResult = math.evaluate(result[0], { y: 0.5 })
    assert.ok(Math.abs(evalResult) < 1e-4, `Expected result to vanish at y=0.5, got ${evalResult}`)
    // Verify the result does not contain x (only y)
    assert.ok(!result[0].includes('x'), 'result should not contain x')
  })

  it('should return an array of remaining equations', function () {
    const result = math.eliminate(['x + y - 3', 'x - y - 1'], ['x'])
    assert.ok(Array.isArray(result))
    assert.ok(result.length > 0)
  })

  it('should handle equation strings with = sign', function () {
    const result = math.eliminate(['x + y = 1', 'x - y = 0'], ['x'])
    assert.ok(Array.isArray(result))
    assert.ok(result.length > 0)
  })

  it('should throw when fewer than 2 equations provided for elimination', function () {
    assert.throws(
      () => math.eliminate(['x + y - 1'], ['x']),
      /eliminate: need at least 2 equations/
    )
  })

  it('should eliminate x from quadratic system', function () {
    // x^2 + y^2 - 1 = 0, x - y = 0 → 2y^2 - 1 = 0
    const result = math.eliminate(['x^2 + y^2 - 1', 'x - y'], ['x'])
    assert.ok(Array.isArray(result))
    assert.ok(result.length > 0)
    // Verify the result does not contain x
    assert.ok(!result[0].includes('x'), 'result should not contain x')
    // y = ±1/sqrt(2) ≈ ±0.7071: the result polynomial should vanish there
    const evalPlus = math.evaluate(result[0], { y: 1 / Math.sqrt(2) })
    assert.ok(Math.abs(evalPlus) < 1e-3, `Expected ~0, got ${evalPlus}`)
  })

  it('should throw for invalid equation with multiple = signs', function () {
    assert.throws(
      () => math.eliminate(['x = y = z', 'x + y - 1'], ['x']),
      /eliminate: invalid equation/
    )
  })
})

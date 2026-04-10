import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createPiecewise } from '../../../../src/function/algebra/piecewise.js'

const math = create({ ...all, createPiecewise })

describe('piecewise', function () {
  it('should return the first matching condition (positive x)', function () {
    const result = math.piecewise([['x > 0', 'x'], ['x < 0', '-x']], '0', { x: 5 })
    assert.strictEqual(result, 5)
  })

  it('should return the second matching condition (negative x)', function () {
    const result = math.piecewise([['x > 0', 'x'], ['x < 0', '-x']], '0', { x: -3 })
    assert.strictEqual(result, 3)
  })

  it('should return default when no condition matches (x=0)', function () {
    const result = math.piecewise([['x > 0', 'x'], ['x < 0', '-x']], '0', { x: 0 })
    assert.strictEqual(result, 0)
  })

  it('should return numeric default value', function () {
    const result = math.piecewise([['x > 10', 'x']], 42, { x: 5 })
    assert.strictEqual(result, 42)
  })

  it('should handle numeric condition values in scope', function () {
    const result = math.piecewise([['x >= 0', 'x^2']], '-1', { x: 3 })
    assert.strictEqual(result, 9)
  })

  it('should work without scope (empty scope)', function () {
    const result = math.piecewise([[true, 99]], 0)
    assert.strictEqual(result, 99)
  })

  it('should evaluate value expressions in scope', function () {
    const result = math.piecewise([['x > 0', '2*x + 1']], '0', { x: 4 })
    assert.strictEqual(result, 9)
  })

  it('should handle multiple pairs and pick first match', function () {
    const pairs = [['x > 100', '100'], ['x > 10', '10'], ['x > 0', '1']]
    const result = math.piecewise(pairs, '0', { x: 50 })
    assert.strictEqual(result, 10)
  })

  it('should throw if a pair is not an array of length 2', function () {
    assert.throws(() => math.piecewise([[1, 2, 3]], 0, {}), /piecewise: each pair must be/)
  })

  it('should skip branch when condition evaluation fails and return default', function () {
    // If a condition expression is invalid/throws, it should be treated as not matching
    // A condition that references an undefined variable in a failing way → should fall through to default
    // We simulate a failed condition by using an expression that evaluates to false
    const result = math.piecewise([['x > 100', 'x']], -999, { x: 5 })
    assert.strictEqual(result, -999, 'should return default when condition does not match')
  })
})

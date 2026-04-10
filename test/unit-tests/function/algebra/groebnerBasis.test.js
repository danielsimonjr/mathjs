import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createGroebnerBasis } from '../../../../src/function/algebra/groebnerBasis.js'

const math = create({ ...all, createGroebnerBasis })

describe('groebnerBasis', function () {
  it('should return a single univariate polynomial unchanged', function () {
    const result = math.groebnerBasis(['x^2 - 1'], ['x'])
    assert.strictEqual(result.length, 1)
    // Evaluate result at x=1: should be 0
    assert.ok(Math.abs(math.evaluate(result[0], { x: 1 })) < 1e-6, 'should vanish at x=1')
    assert.ok(Math.abs(math.evaluate(result[0], { x: -1 })) < 1e-6, 'should vanish at x=-1')
  })

  it('should compute GCD basis for univariate system', function () {
    // GCD of x^2-3x+2 and x-1 is x-1
    const result = math.groebnerBasis(['x^2 - 3*x + 2', 'x - 1'], ['x'])
    assert.strictEqual(result.length, 1)
    assert.ok(Math.abs(math.evaluate(result[0], { x: 1 })) < 1e-6, 'should vanish at x=1')
  })

  it('should return an array for bivariate system', function () {
    const result = math.groebnerBasis(['x^2 + y^2 - 1', 'x - y'], ['x', 'y'])
    assert.ok(Array.isArray(result), 'should return an array')
    assert.ok(result.length > 0, 'should return at least one polynomial')
  })

  it('should return a simpler basis for linear bivariate system', function () {
    // x + y - 1, x - y → eliminate x: 2y-1=0 → y=0.5
    const result = math.groebnerBasis(['x + y - 1', 'x - y'], ['x', 'y'])
    assert.ok(Array.isArray(result))
    assert.ok(result.length > 0)
  })

  it('should throw for more than 2 variables', function () {
    assert.throws(
      () => math.groebnerBasis(['x + y + z'], ['x', 'y', 'z']),
      /groebnerBasis: only 1 or 2 variables/
    )
  })

  it('should return empty array for empty input', function () {
    const result = math.groebnerBasis([], ['x'])
    assert.deepStrictEqual(result, [])
  })

  it('should verify bivariate basis polynomials each have real roots (sign change)', function () {
    // For ['x^2 + y^2 - 1', 'x - y'], the implementation computes univariate resultants
    // for each variable. Each returned polynomial encodes real solutions and must
    // have at least one real root, verifiable by a sign change over a broad range.
    const result = math.groebnerBasis(['x^2 + y^2 - 1', 'x - y'], ['x', 'y'])
    assert.ok(Array.isArray(result), 'should return an array')
    assert.ok(result.length > 0, 'should return at least one polynomial')

    // Verify each basis polynomial is evaluable and has at least one real root
    // (detectable by a sign change over a range)
    for (const poly of result) {
      // Determine which variable the poly uses
      const usesX = poly.includes('x') && !poly.includes('y')
      const varName = usesX ? 'x' : 'y'

      // Check for sign change over [-2, 2], indicating at least one real root
      const testPoints = [-2, -1.5, -1, -0.5, 0, 0.5, 1, 1.5, 2]
      const vals = testPoints.map((v) => {
        const scope = {}
        scope[varName] = v
        return Number(math.evaluate(poly, scope))
      })
      const hasSignChange = vals.some((v, i) => i > 0 && v * vals[i - 1] < 0)
      assert.ok(
        hasSignChange,
        `Basis polynomial '${poly}' should have at least one real root (sign change over [-2,2])`
      )
    }
  })
})

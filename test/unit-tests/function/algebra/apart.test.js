import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createApart } from '../../../../src/function/algebra/apart.js'

const math = create({ ...all, createApart })

/**
 * Evaluate a partial fraction result string numerically at x=value
 * @param {string} expr
 * @param {number} xVal
 * @return {number}
 */
function evalExpr (expr, xVal) {
  return math.evaluate(expr, { x: xVal })
}

describe('apart', function () {
  it('should decompose 1/(x^2-1)', function () {
    const result = math.apart('1 / (x^2 - 1)', 'x')
    assert.strictEqual(typeof result, 'string')
    // Verify numerically: result and original should agree at x=2
    const original = 1 / (4 - 1) // 1/3
    const decomposed = evalExpr(result, 2)
    assert(Math.abs(original - decomposed) < 1e-8,
      `Numerical mismatch: original=1/3, decomposed=${decomposed}, expr="${result}"`)
  })

  it('should simplify (x+1)/(x^2-1) to 1/(x-1)', function () {
    const result = math.apart('(x + 1) / (x^2 - 1)', 'x')
    assert.strictEqual(typeof result, 'string')
    // 1/(x-1) at x=3 is 0.5
    const original = (3 + 1) / (9 - 1) // 4/8 = 0.5
    const decomposed = evalExpr(result, 3)
    assert(Math.abs(original - decomposed) < 1e-8,
      `Numerical mismatch: original=0.5, decomposed=${decomposed}, expr="${result}"`)
  })

  it('should accept a Node input', function () {
    const node = math.parse('1 / (x^2 - 1)')
    const result = math.apart(node, 'x')
    assert.strictEqual(typeof result, 'string')
  })

  it('should return a result consistent with the original function numerically', function () {
    const testCases = [
      { expr: '1 / (x^2 - 4)', xVals: [3, 5, 10] },
      { expr: '2 / (x^2 - 1)', xVals: [2, 3, 5] }
    ]

    for (const tc of testCases) {
      const result = math.apart(tc.expr, 'x')
      for (const xVal of tc.xVals) {
        const original = evalExpr(tc.expr, xVal)
        const decomposed = evalExpr(result, xVal)
        assert(Math.abs(original - decomposed) < 1e-6,
          `Mismatch for "${tc.expr}" at x=${xVal}: original=${original}, decomposed=${decomposed}, result="${result}"`)
      }
    }
  })

  it('should handle a simple fraction with single linear denominator', function () {
    // 1/(x-2) — already in partial fraction form, should simplify/return it
    const result = math.apart('1 / (x - 2)', 'x')
    assert.strictEqual(typeof result, 'string')
    const original = 1 / (3 - 2) // 1
    const decomposed = evalExpr(result, 3)
    assert(Math.abs(original - decomposed) < 1e-6,
      `Mismatch: original=${original}, decomposed=${decomposed}`)
  })

  it('residues should sum correctly for 1/(x^2-1)', function () {
    // 1/(x^2-1) = 1/2 * 1/(x-1) - 1/2 * 1/(x+1)
    // At x=2: 1/(4-1) = 1/3
    // 1/2 * 1/(2-1) - 1/2 * 1/(2+1) = 1/2 - 1/6 = 1/3 ✓
    const result = math.apart('1 / (x^2 - 1)', 'x')
    const xVals = [2, 3, 5, 10]
    for (const xVal of xVals) {
      const original = 1 / (xVal * xVal - 1)
      const decomposed = evalExpr(result, xVal)
      assert(Math.abs(original - decomposed) < 1e-8,
        `Mismatch at x=${xVal}: original=${original}, decomposed=${decomposed}`)
    }
  })
})

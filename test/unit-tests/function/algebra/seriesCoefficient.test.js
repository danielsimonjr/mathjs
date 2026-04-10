import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSeriesCoefficient } from '../../../../src/function/algebra/seriesCoefficient.js'
import { approxEqual } from '../../../../tools/approx.js'

const math = create({ ...all, createSeriesCoefficient })

describe('seriesCoefficient', function () {
  it('should compute the 0th coefficient of exp(x) at 0 (= 1)', function () {
    const c = math.seriesCoefficient('exp(x)', 'x', 0, 0)
    approxEqual(c, 1, 1e-10)
  })

  it('should compute the 1st coefficient of exp(x) at 0 (= 1)', function () {
    const c = math.seriesCoefficient('exp(x)', 'x', 0, 1)
    approxEqual(c, 1, 1e-10)
  })

  it('should compute the 3rd coefficient of exp(x) at 0 (= 1/6)', function () {
    const c = math.seriesCoefficient('exp(x)', 'x', 0, 3)
    approxEqual(c, 1 / 6, 1e-10)
  })

  it('should compute the 1st coefficient of sin(x) at 0 (= 1)', function () {
    const c = math.seriesCoefficient('sin(x)', 'x', 0, 1)
    approxEqual(c, 1, 1e-10)
  })

  it('should compute the 2nd coefficient of cos(x) at 0 (= -1/2)', function () {
    const c = math.seriesCoefficient('cos(x)', 'x', 0, 2)
    approxEqual(c, -0.5, 1e-10)
  })

  it('should compute the 2nd coefficient of x^2 + x at 0 (= 1)', function () {
    const c = math.seriesCoefficient('x^2 + x', 'x', 0, 2)
    approxEqual(c, 1, 1e-10)
  })

  it('should compute the 4th coefficient of sin(x) at 0 (= 0)', function () {
    const c = math.seriesCoefficient('sin(x)', 'x', 0, 4)
    approxEqual(c, 0, 1e-10)
  })

  it('should throw for negative n', function () {
    assert.throws(function () {
      math.seriesCoefficient('exp(x)', 'x', 0, -1)
    }, /non-negative integer/)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('exp(x)')
    const c = math.seriesCoefficient(node, 'x', 0, 2)
    approxEqual(c, 0.5, 1e-10)
  })
})

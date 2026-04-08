// test solve
import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createSolve } from '../../../../src/function/algebra/solve.js'

const math = create({ ...all, createSolve })

describe('solve', function () {
  function approxEqual (a, b, tol) {
    return Math.abs(a - b) < (tol || 1e-6)
  }

  it('should solve a linear equation', function () {
    const result = math.solve('2*x + 6', 'x')
    assert.strictEqual(result.length, 1)
    assert.ok(approxEqual(result[0], -3), 'expected -3, got: ' + result[0])
  })

  it('should solve x^2 - 4 = 0', function () {
    const result = math.solve('x^2 - 4', 'x')
    assert.strictEqual(result.length, 2)
    const sorted = result.slice().sort(function (a, b) { return a - b })
    assert.ok(approxEqual(sorted[0], -2), 'expected -2, got: ' + sorted[0])
    assert.ok(approxEqual(sorted[1], 2), 'expected 2, got: ' + sorted[1])
  })

  it('should solve a quadratic with repeated root', function () {
    const result = math.solve('x^2 - 2*x + 1', 'x')
    assert.ok(result.length >= 1)
    assert.ok(approxEqual(result[0], 1), 'expected 1, got: ' + result[0])
  })

  it('should solve x^2 - 5*x + 6 = 0', function () {
    const result = math.solve('x^2 - 5*x + 6', 'x')
    assert.strictEqual(result.length, 2)
    const sorted = result.slice().sort(function (a, b) { return a - b })
    assert.ok(approxEqual(sorted[0], 2), 'expected 2, got: ' + sorted[0])
    assert.ok(approxEqual(sorted[1], 3), 'expected 3, got: ' + sorted[1])
  })

  it('should return empty array for quadratic with no real roots', function () {
    const result = math.solve('x^2 + 1', 'x')
    assert.strictEqual(result.length, 0)
  })

  it('should solve a cubic with rational roots', function () {
    const result = math.solve('x^3 - 6*x^2 + 11*x - 6', 'x')
    assert.ok(result.length >= 2, 'expected at least 2 roots, got: ' + result.length)
  })

  it('should handle equation with = sign', function () {
    const result = math.solve('x^2 = 4', 'x')
    assert.ok(result.length >= 1)
    const hasTwo = result.some(function (r) { return approxEqual(r, 2) })
    const hasNegTwo = result.some(function (r) { return approxEqual(r, -2) })
    assert.ok(hasTwo || hasNegTwo, 'expected 2 or -2 in result: ' + result)
  })

  it('should accept a Node as input', function () {
    const node = math.parse('x - 5')
    const result = math.solve(node, 'x')
    assert.strictEqual(result.length, 1)
    assert.ok(approxEqual(result[0], 5), 'expected 5, got: ' + result[0])
  })

  it('should solve x^3 - x = 0 (roots 0, -1, 1)', function () {
    const result = math.solve('x^3 - x', 'x')
    assert.ok(result.length >= 2)
    const hasZero = result.some(function (r) { return approxEqual(r, 0) })
    assert.ok(hasZero, 'expected 0 in roots: ' + result)
  })
})

import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createAssume } from '../../../../src/function/algebra/assume.js'
import { createElement } from '../../../../src/function/algebra/element.js'
import { getAssumption, clearAssumptions } from '../../../../src/function/algebra/assume.js'

const math = create({ ...all, createAssume, createElement })

describe('element', function () {
  beforeEach(function () {
    clearAssumptions()
  })

  it('should record Integer domain', function () {
    math.element('n', 'Integer')
    assert.strictEqual(getAssumption('n'), 'integer')
  })

  it('should record Real domain', function () {
    math.element('x', 'Real')
    assert.strictEqual(getAssumption('x'), 'real')
  })

  it('should record Rational domain (maps to real)', function () {
    math.element('q', 'Rational')
    assert.strictEqual(getAssumption('q'), 'real')
  })

  it('should record Complex domain', function () {
    math.element('z', 'Complex')
    assert.strictEqual(getAssumption('z'), 'complex')
  })

  it('should record Positive domain', function () {
    math.element('r', 'Positive')
    assert.strictEqual(getAssumption('r'), 'positive')
  })

  it('should record Negative domain', function () {
    math.element('s', 'Negative')
    assert.strictEqual(getAssumption('s'), 'negative')
  })

  it('should return true when domain is recorded', function () {
    const result = math.element('x', 'Integer')
    assert.strictEqual(result, true)
  })

  it('should be case-insensitive for domain', function () {
    math.element('x', 'integer')
    assert.strictEqual(getAssumption('x'), 'integer')
  })

  it('should throw for unknown domain', function () {
    assert.throws(() => math.element('x', 'Quaternion'), /element: unknown domain/)
  })

  it('should store assumptions for multiple variables', function () {
    math.element('x', 'Positive')
    math.element('y', 'Integer')
    assert.strictEqual(getAssumption('x'), 'positive')
    assert.strictEqual(getAssumption('y'), 'integer')
  })
})

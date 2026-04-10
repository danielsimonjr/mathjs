import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createAssume } from '../../../../src/function/algebra/assume.js'
import { getAssumption, clearAssumptions, assumptionRegistry } from '../../../../src/function/algebra/assume.js'

const math = create({ ...all, createAssume })

describe('assume', function () {
  beforeEach(function () {
    clearAssumptions()
  })

  it('should store a positive assumption', function () {
    math.assume('x', 'positive')
    assert.strictEqual(getAssumption('x'), 'positive')
  })

  it('should store a negative assumption', function () {
    math.assume('y', 'negative')
    assert.strictEqual(getAssumption('y'), 'negative')
  })

  it('should store an integer assumption', function () {
    math.assume('n', 'integer')
    assert.strictEqual(getAssumption('n'), 'integer')
  })

  it('should store a real assumption', function () {
    math.assume('z', 'real')
    assert.strictEqual(getAssumption('z'), 'real')
  })

  it('should store a complex assumption', function () {
    math.assume('w', 'complex')
    assert.strictEqual(getAssumption('w'), 'complex')
  })

  it('should store a nonnegative assumption', function () {
    math.assume('r', 'nonnegative')
    assert.strictEqual(getAssumption('r'), 'nonnegative')
  })

  it('should store a nonzero assumption', function () {
    math.assume('k', 'nonzero')
    assert.strictEqual(getAssumption('k'), 'nonzero')
  })

  it('should return true when assumption is stored', function () {
    const result = math.assume('x', 'positive')
    assert.strictEqual(result, true)
  })

  it('should be case-insensitive for property', function () {
    math.assume('x', 'Positive')
    assert.strictEqual(getAssumption('x'), 'positive')
  })

  it('should overwrite previous assumption', function () {
    math.assume('x', 'real')
    math.assume('x', 'positive')
    assert.strictEqual(getAssumption('x'), 'positive')
  })

  it('should throw for unknown property', function () {
    assert.throws(() => math.assume('x', 'nonexistent'), /assume: unknown property/)
  })

  it('should clear assumptions', function () {
    math.assume('x', 'positive')
    clearAssumptions()
    assert.strictEqual(getAssumption('x'), undefined)
  })

  it('should store assumptions for multiple variables independently', function () {
    math.assume('x', 'positive')
    math.assume('y', 'negative')
    assert.strictEqual(getAssumption('x'), 'positive')
    assert.strictEqual(getAssumption('y'), 'negative')
  })

  it('should return undefined for variables with no assumption', function () {
    assert.strictEqual(getAssumption('unknownVar'), undefined)
  })

  it('should share assumptions across math instances (known limitation)', function () {
    // The assumption registry is module-level, so all math instances share it.
    // This is a documented limitation: assumptions are global, not per-instance.
    const math2 = create({ ...all, createAssume })

    // Set assumption via math (original instance)
    math.assume('sharedVar', 'positive')
    // Read it back via math2 (different instance)
    assert.strictEqual(
      getAssumption('sharedVar'),
      'positive',
      'assumptions stored via one instance are visible globally'
    )

    // Set via math2, read via original registry
    math2.assume('sharedVar2', 'integer')
    assert.strictEqual(
      getAssumption('sharedVar2'),
      'integer',
      'assumptions stored via second instance are visible globally'
    )
  })
})

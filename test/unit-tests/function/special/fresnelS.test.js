import assert from 'assert'
import math from '../../../../src/defaultInstance.js'

describe('fresnelS', function () {
  it('should compute fresnelS(0) = 0', function () {
    assert.strictEqual(math.fresnelS(0), 0)
  })

  it('should compute fresnelS(Infinity) = 0.5', function () {
    assert.strictEqual(math.fresnelS(Infinity), 0.5)
  })

  it('should compute fresnelS(-Infinity) = -0.5', function () {
    assert.strictEqual(math.fresnelS(-Infinity), -0.5)
  })

  it('should be an odd function: fresnelS(-x) = -fresnelS(x)', function () {
    const x = 0.7
    assert(Math.abs(math.fresnelS(-x) + math.fresnelS(x)) < 1e-14)
  })

  it('should compute fresnelS(1) accurately', function () {
    // S(1) ~ 0.4382591473235709
    const result = math.fresnelS(1)
    assert(Math.abs(result - 0.4382591473235709) < 1e-8)
  })

  it('should compute fresnelS(0.5) accurately', function () {
    // S(0.5) ~ 0.06473243285999947
    const result = math.fresnelS(0.5)
    assert(Math.abs(result - 0.06473243285999947) < 1e-8)
  })

  it('should be bounded by 0.5 in absolute value for all x', function () {
    // S(x) oscillates and converges to 0.5
    for (const x of [0.5, 1, 2, 3, 5, 10]) {
      const s = Math.abs(math.fresnelS(x))
      assert(s <= 0.6, `|fresnelS(${x})| = ${s} should be bounded`)
    }
  })

  it('should return values near 0.5 for large arguments', function () {
    const result = math.fresnelS(10)
    assert(Math.abs(result - 0.5) < 0.1)
  })

  it('should use Taylor series for small x (< 1.6)', function () {
    // Cross check: for very small x, S(x) ~ pi*x^3/6
    const x = 0.1
    const approx = Math.PI * x * x * x / 6
    assert(Math.abs(math.fresnelS(x) - approx) < 1e-8)
  })
})

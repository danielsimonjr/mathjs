import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createFresnelC } from '../../../../src/function/special/fresnelC.js'

const math = create({ ...allFactories, createFresnelC })

describe('fresnelC', function () {
  it('should compute fresnelC(0) = 0', function () {
    assert.strictEqual(math.fresnelC(0), 0)
  })

  it('should compute fresnelC(Infinity) = 0.5', function () {
    assert.strictEqual(math.fresnelC(Infinity), 0.5)
  })

  it('should compute fresnelC(-Infinity) = -0.5', function () {
    assert.strictEqual(math.fresnelC(-Infinity), -0.5)
  })

  it('should be an odd function: fresnelC(-x) = -fresnelC(x)', function () {
    for (const x of [0.5, 1, 2, 3]) {
      assert(Math.abs(math.fresnelC(-x) + math.fresnelC(x)) < 1e-14,
        `fresnelC(-${x}) + fresnelC(${x}) should be 0`)
    }
  })

  it('should compute fresnelC(1) accurately (~0.7799)', function () {
    // C(1) ~ 0.7798934003768229
    const result = math.fresnelC(1)
    assert(Math.abs(result - 0.7798934003768229) < 1e-8,
      `fresnelC(1) = ${result}, expected ~0.7799`)
  })

  it('should compute fresnelC(2) accurately (~0.4883)', function () {
    // C(2) ~ 0.4882534060753382
    const result = math.fresnelC(2)
    assert(Math.abs(result - 0.4882534060753382) < 1e-8,
      `fresnelC(2) = ${result}, expected ~0.4883`)
  })

  it('should compute fresnelC(0.5) in the Taylor regime', function () {
    // C(0.5) ~ 0.4923442258714464
    const result = math.fresnelC(0.5)
    assert(Math.abs(result - 0.4923442258714464) < 1e-8)
  })

  it('should compute fresnelC(5) at the Taylor/asymptotic boundary', function () {
    // C(5) ~ 0.4048685353316916
    const result = math.fresnelC(5)
    assert(Math.abs(result - 0.4048685353316916) < 1e-7,
      `fresnelC(5) = ${result}`)
  })

  it('should compute fresnelC in the asymptotic regime (x > 5)', function () {
    // C(6) ~ 0.4995309754388873
    const result = math.fresnelC(6)
    assert(Math.abs(result - 0.4995309754388873) < 1e-6,
      `fresnelC(6) = ${result}`)
  })

  it('should return values near 0.5 for large arguments', function () {
    const result = math.fresnelC(10)
    assert(Math.abs(result - 0.5) < 0.1,
      `fresnelC(10) = ${result} should be near 0.5`)
  })

  it('should use Taylor series: fresnelC(x) ~ x for very small x', function () {
    const x = 0.01
    // C(x) ~ x for very small x (leading term x / 1)
    assert(Math.abs(math.fresnelC(x) - x) < 1e-8)
  })

  it('should be bounded in absolute value', function () {
    for (const x of [0.5, 1, 2, 3, 5, 10]) {
      const c = Math.abs(math.fresnelC(x))
      assert(c <= 0.9, `|fresnelC(${x})| = ${c} should be bounded`)
    }
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.fresnelC('abc'))
    assert.throws(() => math.fresnelC())
  })
})

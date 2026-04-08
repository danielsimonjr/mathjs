import assert from 'assert'
import { all } from '../../../../src/entry/allFactoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createInverseLaplaceTransform } from '../../../../src/function/algebra/inverseLaplaceTransform.js'

const math = create({ ...all, createInverseLaplaceTransform })
const inverseLaplaceTransform = math.inverseLaplaceTransform

describe('inverseLaplaceTransform', function () {
  it('should compute inverse Laplace of 1/s → 1', function () {
    const result = inverseLaplaceTransform('1/s', 's', 't')
    assert.strictEqual(result, '1', 'Expected "1", got "' + result + '"')
  })

  it('should compute inverse Laplace of 1/s^2 → t', function () {
    const result = inverseLaplaceTransform('1/s^2', 's', 't')
    assert.strictEqual(result, 't', 'Expected "t", got "' + result + '"')
  })

  it('should compute inverse Laplace of 1/(s - 2) → e^(2*t)', function () {
    const result = inverseLaplaceTransform('1/(s - 2)', 's', 't')
    assert(result.includes('e^') && result.includes('2'), 'Expected e^(2*t), got "' + result + '"')
  })

  it('should compute inverse Laplace of 1/(s + 3) → e^(-3*t)', function () {
    const result = inverseLaplaceTransform('1/(s + 3)', 's', 't')
    assert(result.includes('e^') && result.includes('3'), 'Expected e^(-3*t), got "' + result + '"')
  })

  it('should compute inverse Laplace of s/(s^2 + 4) → cos(2*t)', function () {
    const result = inverseLaplaceTransform('s/(s^2 + 4)', 's', 't')
    assert(result.includes('cos') && result.includes('2'), 'Expected cos(2*t), got "' + result + '"')
  })

  it('should compute inverse Laplace of 2/(s^2 + 4) → sin(2*t)', function () {
    // 2/(s^2+4) = 2/(s^2+2^2), and 2/(s^2+b^2) = (2/b)*sin(bt) = sin(2t)
    const result = inverseLaplaceTransform('2/(s^2 + 4)', 's', 't')
    assert(result.includes('sin') && result.includes('2'), 'Expected sin(2*t), got "' + result + '"')
  })

  it('should work with Node input', function () {
    const node = math.parse('1/s')
    const result = inverseLaplaceTransform(node, 's', 't')
    assert.strictEqual(result, '1')
  })

  it('should compute inverse Laplace of 6/s^4 → t^3', function () {
    // 6/s^4 = 3!/s^(3+1) → t^3
    const result = inverseLaplaceTransform('6/s^4', 's', 't')
    assert(result.includes('t') && result.includes('3'), 'Expected t^3, got "' + result + '"')
  })

  it('should compute inverse Laplace of 3/s → 3 (constant multiple)', function () {
    const result = inverseLaplaceTransform('3/s', 's', 't')
    assert.strictEqual(result, '3', 'Expected "3", got "' + result + '"')
  })

  it('should throw for unrecognized pattern', function () {
    assert.throws(() => {
      inverseLaplaceTransform('1/(s^3 + s^2 + s + 1)', 's', 't')
    }, /inverseLaplaceTransform/)
  })

  it('should use provided variable names', function () {
    const result = inverseLaplaceTransform('1/p', 'p', 'x')
    assert.strictEqual(result, '1', 'Should work with variable names p and x')
  })
})

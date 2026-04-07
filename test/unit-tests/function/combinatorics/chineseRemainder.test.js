import assert from 'assert'
import { create } from '../../../../src/core/create.js'
import * as all from '../../../../src/factoriesAny.js'
import { createChineseRemainder } from '../../../../src/function/combinatorics/chineseRemainder.js'

const math = create({ ...all, createChineseRemainder })

describe('chineseRemainder', function () {
  it('should solve x≡2 (mod 3), x≡3 (mod 5), x≡2 (mod 7) => 23', function () {
    assert.strictEqual(math.chineseRemainder([2, 3, 2], [3, 5, 7]), 23)
  })

  it('should solve x≡1 (mod 3), x≡2 (mod 5) => 7', function () {
    assert.strictEqual(math.chineseRemainder([1, 2], [3, 5]), 7)
  })

  it('should solve single congruence x≡0 (mod 7) => 0', function () {
    assert.strictEqual(math.chineseRemainder([0], [7]), 0)
  })

  it('should solve single congruence x≡3 (mod 7) => 3', function () {
    assert.strictEqual(math.chineseRemainder([3], [7]), 3)
  })

  it('should return result in [0, M)', function () {
    const result = math.chineseRemainder([2, 3, 2], [3, 5, 7])
    assert.ok(result >= 0)
    assert.ok(result < 3 * 5 * 7)
  })

  it('should verify solution satisfies all congruences', function () {
    const remainders = [2, 3, 2]
    const moduli = [3, 5, 7]
    const x = math.chineseRemainder(remainders, moduli)
    for (let i = 0; i < moduli.length; i++) {
      assert.strictEqual(x % moduli[i], remainders[i])
    }
  })

  it('should solve two-modulus system x≡0 (mod 2), x≡0 (mod 3) => 0', function () {
    assert.strictEqual(math.chineseRemainder([0, 0], [2, 3]), 0)
  })

  it('should throw when arrays have different lengths', function () {
    assert.throws(function () { math.chineseRemainder([1, 2], [3]) }, /same length/)
  })

  it('should throw when given empty arrays', function () {
    assert.throws(function () { math.chineseRemainder([], []) }, /At least one/)
  })

  it('should throw when moduli are not coprime', function () {
    assert.throws(function () { math.chineseRemainder([1, 1], [4, 6]) }, /coprime/)
  })
})

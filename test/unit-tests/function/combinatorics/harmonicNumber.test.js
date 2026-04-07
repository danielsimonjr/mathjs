import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createHarmonicNumber } from '../../../../src/function/combinatorics/harmonicNumber.js'

const math = create({ ...allFactories, createHarmonicNumber })

describe('harmonicNumber', function () {
  it('should compute harmonicNumber(1) = 1', function () {
    assert.strictEqual(math.harmonicNumber(1), 1)
  })

  it('should compute harmonicNumber(2) = 1.5', function () {
    assert.strictEqual(math.harmonicNumber(2), 1.5)
  })

  it('should compute harmonicNumber(3) = 11/6', function () {
    assert(Math.abs(math.harmonicNumber(3) - 11 / 6) < 1e-14)
  })

  it('should compute harmonicNumber(4) = 25/12', function () {
    assert(Math.abs(math.harmonicNumber(4) - 25 / 12) < 1e-14)
  })

  it('should compute harmonicNumber(5) = 137/60 ~ 2.2833', function () {
    const expected = 137 / 60
    assert(Math.abs(math.harmonicNumber(5) - expected) < 1e-14,
      `harmonicNumber(5) = ${math.harmonicNumber(5)}`)
  })

  it('should compute harmonicNumber(10) ~ 2.9290', function () {
    // H_10 = 7381/2520
    const result = math.harmonicNumber(10)
    assert(Math.abs(result - 2.9289682539682538) < 1e-12,
      `harmonicNumber(10) = ${result}`)
  })

  it('should use asymptotic expansion for large n (n > 50)', function () {
    // H_100 ~ 5.187377517639621
    const result = math.harmonicNumber(100)
    assert(Math.abs(result - 5.187377517639621) < 1e-6,
      `harmonicNumber(100) = ${result}`)
  })

  it('should be monotonically increasing', function () {
    let prev = math.harmonicNumber(1)
    for (let n = 2; n <= 10; n++) {
      const curr = math.harmonicNumber(n)
      assert(curr > prev, `harmonicNumber(${n}) should be > harmonicNumber(${n - 1})`)
      prev = curr
    }
  })

  it('should throw for non-positive integers', function () {
    assert.throws(() => math.harmonicNumber(0), /TypeError/)
    assert.throws(() => math.harmonicNumber(-1), /TypeError/)
  })

  it('should throw for non-integer n', function () {
    assert.throws(() => math.harmonicNumber(1.5), /TypeError/)
    assert.throws(() => math.harmonicNumber(2.7), /TypeError/)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.harmonicNumber('abc'))
    assert.throws(() => math.harmonicNumber())
  })
})

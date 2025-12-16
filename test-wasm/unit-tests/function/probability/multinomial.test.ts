<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for multinomial - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const multinomial = math.multinomial

<<<<<<< HEAD
describe('multinomial', function () {
  it('should calculate the multinomial of an array of numbers', function () {
=======
describe('multinomial', function (): void {
  it('should calculate the multinomial of an array of numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(multinomial([1, 2, 1]), 12)
    assert.strictEqual(multinomial([4, 2, 1]), 105)
    assert.strictEqual(multinomial([4, 4]), 70)
  })

<<<<<<< HEAD
  it('should calculate the multinomial of n items taken k at a time with BigNumbers', function () {
=======
  it('should calculate the multinomial of n items taken k at a time with BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      multinomial([math.bignumber(3), math.bignumber(4), math.bignumber(5)]),
      math.bignumber(27720)
    )
    assert.deepStrictEqual(
      multinomial([math.bignumber(10), math.bignumber(1), math.bignumber(2)]),
      math.bignumber(858)
    )
  })

<<<<<<< HEAD
  it('should not work with non-integer and negative input', function () {
    assert.throws(function () {
      multinomial([0.5, 3])
    }, TypeError)
    assert.throws(function () {
      multinomial([math.bignumber(3), math.bignumber(0.5)])
    }, TypeError)
    assert.throws(function () {
      multinomial([math.bignumber(3.5), math.bignumber(-3)])
    }, TypeError)
    assert.throws(function () {
=======
  it('should not work with non-integer and negative input', function (): void {
    assert.throws(function (): void {
      multinomial([0.5, 3])
    }, TypeError)
    assert.throws(function (): void {
      multinomial([math.bignumber(3), math.bignumber(0.5)])
    }, TypeError)
    assert.throws(function (): void {
      multinomial([math.bignumber(3.5), math.bignumber(-3)])
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multinomial([math.bignumber(3.5), 1 / 3])
    }, TypeError)
  })

<<<<<<< HEAD
  it('should not work with the wrong number or type of arguments', function () {
    assert.throws(function () {
      multinomial(5, 3, 2)
    })
    assert.throws(function () {
=======
  it('should not work with the wrong number or type of arguments', function (): void {
    assert.throws(function (): void {
      multinomial(5, 3, 2)
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      multinomial(true, 'hello world')
    })
  })
})

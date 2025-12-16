<<<<<<< HEAD
// @ts-nocheck
// test not
=======
/**
 * Test for not - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const complex = math.complex
const matrix = math.matrix
const unit = math.unit
const not = math.not
const FunctionNode = math.FunctionNode
const ConstantNode = math.ConstantNode
const SymbolNode = math.SymbolNode

<<<<<<< HEAD
describe('not', function () {
  it('should not numbers correctly', function () {
=======
describe('not', function (): void {
  it('should not numbers correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(1), false)
    assert.strictEqual(not(-1), false)
    assert.strictEqual(not(1.23e100), false)
    assert.strictEqual(not(-1.0e-100), false)
    assert.strictEqual(not(1.0e-100), false)
    assert.strictEqual(not(Infinity), false)
    assert.strictEqual(not(-Infinity), false)
    assert.strictEqual(not(0), true)
    assert.strictEqual(not(NaN), true)
  })

<<<<<<< HEAD
  it('should not a bigint', function () {
=======
  it('should not a bigint', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(1n), false)
    assert.strictEqual(not(-1n), false)
    assert.strictEqual(not(0n), true)
  })

<<<<<<< HEAD
  it('should not complex numbers', function () {
=======
  it('should not complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(complex(1, 1)), false)
    assert.strictEqual(not(complex(0, 1)), false)
    assert.strictEqual(not(complex(1, 0)), false)
    assert.strictEqual(not(complex(0, 0)), true)
    assert.strictEqual(not(complex()), true)
    assert.strictEqual(not(complex(0)), true)
    assert.strictEqual(not(complex(1)), false)
  })

<<<<<<< HEAD
  it('should not booleans', function () {
=======
  it('should not booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(true), false)
    assert.strictEqual(not(false), true)
  })

<<<<<<< HEAD
  it('should not bignumbers', function () {
=======
  it('should not bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(bignumber(1)), false)
    assert.strictEqual(not(bignumber(-1)), false)
    assert.strictEqual(not(bignumber(0)), true)
    assert.strictEqual(not(bignumber(NaN)), true)
    assert.strictEqual(not(bignumber('1e+10')), false)
    assert.strictEqual(not(bignumber('-1.0e-100')), false)
    assert.strictEqual(not(bignumber('1.0e-100')), false)
    assert.strictEqual(not(bignumber(Infinity)), false)
    assert.strictEqual(not(bignumber(-Infinity)), false)
  })

<<<<<<< HEAD
  it('should not units', function () {
=======
  it('should not units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(not(unit('100cm')), false)
    assert.strictEqual(not(unit('0 inch')), true)
    assert.strictEqual(not(unit('1m')), false)
    assert.strictEqual(not(unit('m')), true)
    assert.strictEqual(not(unit('-10inch')), false)

    assert.strictEqual(not(unit(bignumber(1), 'm')), false)
    assert.strictEqual(not(unit(bignumber(0), 'm')), true)
  })

<<<<<<< HEAD
  it('should not arrays', function () {
=======
  it('should not arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(not([0, 10]), [true, false])
    assert.deepStrictEqual(not([]), [])
  })

<<<<<<< HEAD
  it('should not matrices', function () {
=======
  it('should not matrices', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(not(matrix([0, 10])), matrix([true, false]))
    assert.deepStrictEqual(not(matrix([])), matrix([]))
  })

<<<<<<< HEAD
  it('should not null', function () {
    assert.strictEqual(not(null), true)
  })

  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      not()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should not null', function (): void {
    assert.strictEqual(not(null), true)
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      not()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      not(1, 2)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type if arguments', function () {
    assert.throws(function () {
      not(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type if arguments', function (): void {
    assert.throws(function (): void {
      not(new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      not({})
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX not', function () {
=======
  it('should LaTeX not', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const c = new ConstantNode(1)
    const node = new FunctionNode(new SymbolNode('not'), [c])
    assert.strictEqual(node.toTex(), '\\neg\\left(1\\right)')
  })
})

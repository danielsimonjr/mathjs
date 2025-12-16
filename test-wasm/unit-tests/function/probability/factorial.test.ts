<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for factorial - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import { approxEqual } from '../../../../tools/approx.js'
import math from '../../../../src/defaultInstance.ts'
const factorial = math.factorial

<<<<<<< HEAD
describe('factorial', function () {
  it('should calculate the factorial of a number', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('factorial', function (): void {
  it('should calculate the factorial of a number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(factorial(0), 1)
    assert.strictEqual(factorial(1), 1)
    assert.strictEqual(factorial(2), 2)
    assert.strictEqual(factorial(3), 6)
    assert.strictEqual(factorial(4), 24)
    assert.strictEqual(factorial(5), 120)
    assert.ok(!Number.isFinite(factorial(Number.MAX_VALUE))) // shouldn't stall
    assert.ok(!Number.isFinite(factorial(Infinity)))
  })

<<<<<<< HEAD
  it('should calculate the factorial of a bignumber', function () {
=======
  it('should calculate the factorial of a bignumber', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ number: 'BigNumber', precision: 5 })
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(0)),
      bigmath.bignumber(1)
    )
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(Infinity)).toString(),
      'Infinity'
    )
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(11)),
      bigmath.bignumber(39917000)
    )
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(22)),
      bigmath.bignumber(1.124e21)
    )
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(24)),
      bigmath.bignumber(6.2045e23)
    )
    assert.deepStrictEqual(
      bigmath.factorial(bigmath.bignumber(26)),
      bigmath.bignumber(4.0329e26)
    )

    const bigmath20 = bigmath.create({ precision: 20 })
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(5)),
      bigmath20.bignumber(120)
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(19)),
      bigmath20.bignumber(121645100408832000)
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(20)),
      bigmath20.bignumber(2432902008176640000)
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(21)),
      bigmath20.bignumber('51090942171709440000')
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(25)),
      bigmath20.bignumber('1.5511210043330985984e+25')
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(24)),
      bigmath20.bignumber('6.2044840173323943936e+23')
    )
    assert.deepStrictEqual(
      bigmath20.factorial(bigmath20.bignumber(22)),
      bigmath20.bignumber('1124000727777607680000')
    )
  })

<<<<<<< HEAD
  it('should calculate the factorial of a boolean', function () {
=======
  it('should calculate the factorial of a boolean', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(factorial(true), 1)
    assert.strictEqual(factorial(false), 1)
  })

<<<<<<< HEAD
  it('should calculate the factorial of each element in a matrix', function () {
=======
  it('should calculate the factorial of each element in a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      factorial(math.matrix([0, 1, 2, 3, 4, 5])),
      math.matrix([1, 1, 2, 6, 24, 120])
    )
  })

<<<<<<< HEAD
  it('should calculate the factorial of each element in an array', function () {
    assert.deepStrictEqual(factorial([0, 1, 2, 3, 4, 5]), [1, 1, 2, 6, 24, 120])
  })

  it('should calculate the factorial of a non-integer', function () {
=======
  it('should calculate the factorial of each element in an array', function (): void {
    assert.deepStrictEqual(factorial([0, 1, 2, 3, 4, 5]), [1, 1, 2, 6, 24, 120])
  })

  it('should calculate the factorial of a non-integer', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxEqual(factorial(1.5), 1.32934038817914)
    approxEqual(factorial(7.5), 14034.40729348)
  })

<<<<<<< HEAD
  it('should throw error if called with negative number', function () {
    assert.throws(function () {
      factorial(-1)
    }, /Value must be non-negative/)
    assert.throws(function () {
      factorial(-1.5)
    }, /Value must be non-negative/)

    assert.throws(function () {
      factorial(math.bignumber(-1))
    }, /Value must be non-negative/)
    assert.throws(function () {
      factorial(math.bignumber(-1.5))
    }, /Value must be non-negative/)
    assert.throws(function () {
=======
  it('should throw error if called with negative number', function (): void {
    assert.throws(function (): void {
      factorial(-1)
    }, /Value must be non-negative/)
    assert.throws(function (): void {
      factorial(-1.5)
    }, /Value must be non-negative/)

    assert.throws(function (): void {
      factorial(math.bignumber(-1))
    }, /Value must be non-negative/)
    assert.throws(function (): void {
      factorial(math.bignumber(-1.5))
    }, /Value must be non-negative/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      factorial(math.bignumber(-Infinity))
    }, /Value must be non-negative/)
  })

<<<<<<< HEAD
  it('should throw an error if called with non-integer bignumber', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with non-integer bignumber', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      factorial(math.bignumber(1.5))
    })
  })

<<<<<<< HEAD
  it('should throw en error if called with invalid number of arguments', function () {
    assert.throws(function () {
      factorial()
    })
    assert.throws(function () {
=======
  it('should throw en error if called with invalid number of arguments', function (): void {
    assert.throws(function (): void {
      factorial()
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      factorial(1, 3)
    })
  })

<<<<<<< HEAD
  it('should throw en error if called with invalid type of argument', function () {
    assert.throws(function () {
      factorial(new Date())
    })
    assert.throws(function () {
=======
  it('should throw en error if called with invalid type of argument', function (): void {
    assert.throws(function (): void {
      factorial(new Date())
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      factorial('a string')
    })
  })

<<<<<<< HEAD
  it('should LaTeX factorial', function () {
    const expression = math.parse('factorial(6)')
=======
  it('should LaTeX factorial', function (): void {
    const expression = math.parse('factorial(6)') as MathNode
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(expression.toTex(), '\\left(6\\right)!')
  })
})

<<<<<<< HEAD
// @ts-nocheck
// test bitOr
=======
/**
 * Test for bitOr - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber
const bitOr = math.bitOr

<<<<<<< HEAD
describe('bitOr', function () {
  it('should bitwise or two numbers', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('bitOr', function (): void {
  it('should bitwise or two numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitOr(53, 131), 183)
    assert.strictEqual(bitOr(2, 3), 3)
    assert.strictEqual(bitOr(-2, 3), -1)
    assert.strictEqual(bitOr(2, -3), -1)
    assert.strictEqual(bitOr(-5, -3), -1)
  })

<<<<<<< HEAD
  it('should bitwise or two bigints', function () {
=======
  it('should bitwise or two bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitOr(53n, 131n), 183n)
    assert.strictEqual(bitOr(2n, 3n), 3n)
    assert.strictEqual(bitOr(-2n, 3n), -1n)
    assert.strictEqual(bitOr(2n, -3n), -1n)
    assert.strictEqual(bitOr(-5n, -3n), -1n)
  })

<<<<<<< HEAD
  it('should bitwise or booleans', function () {
=======
  it('should bitwise or booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitOr(true, true), 1)
    assert.strictEqual(bitOr(true, false), 1)
    assert.strictEqual(bitOr(false, true), 1)
    assert.strictEqual(bitOr(false, false), 0)
  })

<<<<<<< HEAD
  it('should bitwise or mixed numbers and booleans', function () {
=======
  it('should bitwise or mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitOr(0, true), 1)
    assert.strictEqual(bitOr(0, false), 0)
    assert.strictEqual(bitOr(true, 0), 1)
    assert.strictEqual(bitOr(false, 0), 0)
  })

<<<<<<< HEAD
  it('should bitwise or bignumbers', function () {
=======
  it('should bitwise or bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitOr(bignumber(1), bignumber(2)), bignumber(3))
    assert.deepStrictEqual(
      bitOr(bignumber('-1.0e+31'), bignumber('-1.0e+32')),
      bignumber('-8726602014714682917963150917632')
    )
    assert.deepStrictEqual(
      bitOr(bignumber('1.0e+31'), bignumber('1.0e+32')),
      bignumber('101273397985285317082038996566016')
    )
    assert.deepStrictEqual(
      bitOr(bignumber('-1.0e+31'), bignumber('1.0e+32')),
      bignumber('-1273397985285317082038996566016')
    )
    assert.deepStrictEqual(
      bitOr(bignumber('1.0e+31'), bignumber('-1.0e+32')),
      bignumber('-91273397985285317082036849082368')
    )
  })

<<<<<<< HEAD
  it('should bitwise or mixed numbers and bignumbers', function () {
=======
  it('should bitwise or mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitOr(bignumber(1), 2), bignumber(3))
    assert.deepStrictEqual(bitOr(1, bignumber(2)), bignumber(3))
    assert.deepStrictEqual(bitOr(bignumber(7), 9), bignumber(15))
    assert.deepStrictEqual(bitOr(7, bignumber(9)), bignumber(15))
  })

<<<<<<< HEAD
  it('should bitwise or mixed numbers and bigints', function () {
=======
  it('should bitwise or mixed numbers and bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(bitOr(53, 131n), 183)
    assert.strictEqual(bitOr(53n, 131), 183)
  })

<<<<<<< HEAD
  it('should bitwise or mixed booleans and bignumbers', function () {
=======
  it('should bitwise or mixed booleans and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitOr(bignumber(1), false), bignumber(1))
    assert.deepStrictEqual(bitOr(bignumber(2), true), bignumber(3))
    assert.deepStrictEqual(bitOr(false, bignumber(1)), bignumber(1))
    assert.deepStrictEqual(bitOr(true, bignumber(2)), bignumber(3))
  })

<<<<<<< HEAD
  it('should throw an error if used with a unit', function () {
    assert.throws(function () {
      bitOr(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      bitOr(2, math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
      bitOr(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitOr(2, math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitOr(math.unit('2cm'), math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error if the parameters are not integers', function () {
    assert.throws(function () {
      bitOr(1.1, 1)
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
      bitOr(1, 1.1)
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
      bitOr(1.1, 1.1)
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
      bitOr(bignumber(1.1), 1)
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
      bitOr(1, bignumber(1.1))
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
      bitOr(bignumber(1.1), bignumber(1))
    }, /Integers expected in function bitOr/)
    assert.throws(function () {
=======
  it('should throw an error if the parameters are not integers', function (): void {
    assert.throws(function (): void {
      bitOr(1.1, 1)
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
      bitOr(1, 1.1)
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
      bitOr(1.1, 1.1)
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
      bitOr(bignumber(1.1), 1)
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
      bitOr(1, bignumber(1.1))
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
      bitOr(bignumber(1.1), bignumber(1))
    }, /Integers expected in function bitOr/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitOr(bignumber(1), bignumber(1.1))
    }, /Integers expected in function bitOr/)
  })

<<<<<<< HEAD
  it('should bitwise or arrays correctly', function () {
=======
  it('should bitwise or arrays correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = [
      [1, 4],
      [3, 2]
    ]

    // array - array
    let b = [
      [5, 8],
      [7, 6]
    ]
    let c = bitOr(a, b)
    assert.deepStrictEqual(c, [
      [5, 12],
      [7, 6]
    ])

    // array - dense
    b = math.matrix([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )

    // array - sparse
    b = math.sparse([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )
  })

<<<<<<< HEAD
  it('should bitwise or dense matrix correctly', function () {
=======
  it('should bitwise or dense matrix correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = math.matrix([
      [1, 4],
      [3, 2]
    ])

    // dense - array
    let b = [
      [5, 8],
      [7, 6]
    ]
    let c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )

    // dense - dense
    b = math.matrix([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )

    // dense - sparse
    b = math.sparse([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )
  })

<<<<<<< HEAD
  it('should bitwise or sparse matrix correctly', function () {
=======
  it('should bitwise or sparse matrix correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    let a = math.sparse([
      [1, 4],
      [3, 2]
    ])

    // sparse - array
    let b = [
      [5, 8],
      [7, 6]
    ]
    let c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )

    // sparse - dense
    b = math.matrix([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.matrix([
        [5, 12],
        [7, 6]
      ])
    )

    // sparse - sparse
    b = math.sparse([
      [5, 8],
      [7, 6]
    ])
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      math.sparse([
        [5, 12],
        [7, 6]
      ])
    )

    // sparse - sparse pattern
    a = math.sparse([
      [1, 1],
      [0, 0]
    ])
    b = new math.SparseMatrix({
      index: [0, 1],
      ptr: [0, 1, 2],
      size: [2, 2]
    })
    c = bitOr(a, b)
    assert.deepStrictEqual(
      c,
      new math.SparseMatrix({
        index: [0, 0, 1],
        ptr: [0, 1, 3],
        size: [2, 2]
      })
    )

    // sparse pattern - sparse
    c = bitOr(b, a)
    assert.deepStrictEqual(
      c,
      new math.SparseMatrix({
        index: [0, 1, 0], // row index not in order, not a problem!
        ptr: [0, 1, 3],
        size: [2, 2]
      })
    )
  })

<<<<<<< HEAD
  it('should bitwise or matrices correctly', function () {
=======
  it('should bitwise or matrices correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a2 = math.matrix([
      [1, 2],
      [3, 4]
    ])
    const a3 = math.matrix([
      [5, 6],
      [7, 8]
    ])
    const a4 = bitOr(a2, a3)
    assert.ok(a4 instanceof math.Matrix)
    assert.deepStrictEqual(a4.size(), [2, 2])
    assert.deepStrictEqual(a4.valueOf(), [
      [5, 6],
      [7, 12]
    ])
    const a5 = math.pow(a2, 2)
    assert.ok(a5 instanceof math.Matrix)
    assert.deepStrictEqual(a5.size(), [2, 2])
    assert.deepStrictEqual(a5.valueOf(), [
      [7, 10],
      [15, 22]
    ])
  })

<<<<<<< HEAD
  it('should bitwise or a scalar and a matrix correctly', function () {
=======
  it('should bitwise or a scalar and a matrix correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      bitOr(12, math.matrix([3, 9])),
      math.matrix([15, 13])
    )
    assert.deepStrictEqual(
      bitOr(math.matrix([3, 9]), 12),
      math.matrix([15, 13])
    )
  })

<<<<<<< HEAD
  it('should bitwise or a scalar and an array correctly', function () {
=======
  it('should bitwise or a scalar and an array correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(bitOr(12, [3, 9]), [15, 13])
    assert.deepStrictEqual(bitOr([3, 9], 12), [15, 13])
  })

<<<<<<< HEAD
  it('should bitwise or broadcastable arrays correctly', function () {
=======
  it('should bitwise or broadcastable arrays correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = [6, 4, 28]
    const b = [[13], [92], [101]]

    assert.deepStrictEqual(bitOr(a, b), [
      [15, 13, 29],
      [94, 92, 92],
      [103, 101, 125]
    ])
    assert.deepStrictEqual(bitOr(b, a), [
      [15, 13, 29],
      [94, 92, 92],
      [103, 101, 125]
    ])
  })

<<<<<<< HEAD
  it('should bitwise or a matrix and an array correctly', function () {
=======
  it('should bitwise or a matrix and an array correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const a = [6, 4, 28]
    const b = math.matrix([13, 92, 101])
    const c = bitOr(a, b)

    assert.ok(c instanceof math.Matrix)
    assert.deepStrictEqual(c, math.matrix([15, 92, 125]))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid number of arguments', function () {
    assert.throws(function () {
      bitOr(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      bitOr(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitOr(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      bitOr(null, 1)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      bitOr(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      bitOr(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      bitOr(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      bitOr(null, 1)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitOr(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitOr(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitOr(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bitOr(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX bitOr', function () {
    const expression = math.parse('bitOr(2,3)')
=======
  it('should LaTeX bitOr', function (): void {
    const expression = math.parse('bitOr(2,3)') as MathNode
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(expression.toTex(), '\\left(2|3\\right)')
  })
})

<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for intersect - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'

const fraction = math.fraction

<<<<<<< HEAD
describe('intersect', function () {
  it('should calculate the intersection point of two 2D lines', function () {
=======
describe('intersect', function (): void {
  it('should calculate the intersection point of two 2D lines', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect([0, 0], [10, 10], [10, 0], [0, 10]),
      [5, 5]
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 0]),
        [10, 10],
        math.matrix([10, 0]),
        math.matrix([0, 10])
      ),
      math.matrix([5, 5])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 0]),
        math.matrix([10, 10]),
        math.matrix([10, 0]),
        math.matrix([0, 10])
      ),
      math.matrix([5, 5])
    )
    assert.deepStrictEqual(
      math.intersect([300, 90], [400, 97], [300, 130], [400, 125]),
      [633.3333333333334, 113.33333333333334]
    )
  })

<<<<<<< HEAD
  it('should calculate the intersection point of two 3D lines', function () {
=======
  it('should calculate the intersection point of two 3D lines', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect([0, 0, 0], [10, 10, 0], [10, 0, 0], [0, 10, 0]),
      [5, 5, 0]
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 0, 0]),
        [10, 10, 0],
        [10, 0, 0],
        math.matrix([0, 10, 0])
      ),
      math.matrix([5, 5, 0])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 0, 0]),
        math.matrix([10, 10, 0]),
        math.matrix([10, 0, 0]),
        math.matrix([0, 10, 0])
      ),
      math.matrix([5, 5, 0])
    )
  })

<<<<<<< HEAD
  it('should calculate the intersection point of a line and a plane', function () {
=======
  it('should calculate the intersection point of a line and a plane', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect([1, 0, 1], [4, -2, 2], [1, 1, 1, 6]),
      [7, -4, 3]
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([1, 0, 1]),
        [4, -2, 2],
        math.matrix([1, 1, 1, 6])
      ),
      math.matrix([7, -4, 3])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([1, 0, 1]),
        math.matrix([4, -2, 2]),
        math.matrix([1, 1, 1, 6])
      ),
      math.matrix([7, -4, 3])
    )
  })

<<<<<<< HEAD
  it('should calculate the intersection point of a line and a plane with plane coefficients other than (1, 1, 1)', function () {
=======
  it('should calculate the intersection point of a line and a plane with plane coefficients other than (1, 1, 1)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect([0, 30, 0], [0, 21, 0], [0, 9, 0, 0]),
      [0, 0, 0]
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 30, 0]),
        [0, 21, 0],
        math.matrix([0, 9, 0, 0])
      ),
      math.matrix([0, 0, 0])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 30, 0]),
        math.matrix([0, 21, 0]),
        math.matrix([0, 9, 0, 0])
      ),
      math.matrix([0, 0, 0])
    )
  })

<<<<<<< HEAD
  it('should return null if the points do not intersect', function () {
=======
  it('should return null if the points do not intersect', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect([0, 1, 0], [0, 0, 0], [1, 1, 0], [1, 0, 0]),
      null
    )
    assert.deepStrictEqual(math.intersect([0, 1], [0, 0], [1, 1], [1, 0]), null)
    // assert.deepStrictEqual(math.intersect([0, 30, 0], [0, 21, 0], [0, 0, 9, 0]), null) // TODO

    assert.deepStrictEqual(
      math.intersect(
        math.matrix([1, 0, 0]),
        math.matrix([1, 1, 1]),
        math.matrix([0, 1, 0]),
        math.matrix([1, 1, 0])
      ),
      null
    )
    // assert.deepStrictEqual(math.intersect(math.matrix([0, 30, 0]), math.matrix([0, 21, 0]), math.matrix([0, 0, 9, 0])), null) // TODO
  })

<<<<<<< HEAD
  it('should throw an error when number of arguments are other than 3 or 4', function () {
    assert.throws(function () {
      math.intersect([2, 0, 1], [1, 1, 1, 6])
    }, /TypeError: Too few arguments in function intersect/)
    assert.throws(function () {
=======
  it('should throw an error when number of arguments are other than 3 or 4', function (): void {
    assert.throws(function (): void {
      math.intersect([2, 0, 1], [1, 1, 1, 6])
    }, /TypeError: Too few arguments in function intersect/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.intersect([2, 0, 1], [1, 1, 6], [2, 0, 1], [1, 1, 6], [0, 8, 1])
    }, /TypeError: Too many arguments in function intersect/)
  })

<<<<<<< HEAD
  it('should throw an error for incompatible parameter types', function () {
    assert.throws(function () {
      math.intersect(2, 3, 6)
    }, /TypeError: Unexpected type of argument in function intersect/)
    assert.throws(function () {
      math.intersect([2, 0, 1], [1, 1, 1], [5, 1, 10])
    }, /TypeError: Array with 4 numbers expected as third argument/)
    assert.throws(function () {
      math.intersect([], [], [], [])
    }, /TypeError: Arrays with two or thee dimensional points expected/)
    assert.throws(function () {
      math.intersect([2, 8, 9], 3, 6)
    }, /TypeError: Unexpected type of argument in function intersect/)
    assert.throws(function () {
=======
  it('should throw an error for incompatible parameter types', function (): void {
    assert.throws(function (): void {
      math.intersect(2, 3, 6)
    }, /TypeError: Unexpected type of argument in function intersect/)
    assert.throws(function (): void {
      math.intersect([2, 0, 1], [1, 1, 1], [5, 1, 10])
    }, /TypeError: Array with 4 numbers expected as third argument/)
    assert.throws(function (): void {
      math.intersect([], [], [], [])
    }, /TypeError: Arrays with two or thee dimensional points expected/)
    assert.throws(function (): void {
      math.intersect([2, 8, 9], 3, 6)
    }, /TypeError: Unexpected type of argument in function intersect/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.intersect('a', 'b', 'c', 'd')
    }, /TypeError: Unexpected type of argument in function intersect/)
  })

<<<<<<< HEAD
  it('should calculate the intersection point if coordinates are bignumbers', function () {
=======
  it('should calculate the intersection point if coordinates are bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ number: 'BigNumber', precision: 32 })
    const bigintersect = bigmath.intersect
    const bignumber = bigmath.bignumber

    assert.deepStrictEqual(
      bigmath.evaluate('intersect([0, 0], [10, 10], [10, 0], [0, 10])'),
      bigmath.matrix([bignumber(5), bignumber(5)])
    )
    assert.deepStrictEqual(
      bigintersect(
        [bignumber(0), bignumber(0)],
        [bignumber(10), bignumber(10)],
        [bignumber(10), bignumber(0)],
        [bignumber(0), bignumber(10)]
      ),
      [bignumber(5), bignumber(5)]
    )
    assert.deepStrictEqual(
      bigintersect(
        [bignumber(0), 0],
        [10, bignumber(10)],
        [10, bignumber(0)],
        [0, bignumber(10)]
      ),
      [bignumber(5), bignumber(5)]
    )
    assert.deepStrictEqual(
      bigintersect(
        [bignumber(0), bignumber(0), bignumber(0)],
        [bignumber(10), bignumber(10), bignumber(0)],
        [bignumber(10), bignumber(0), bignumber(0)],
        [bignumber(0), bignumber(10), bignumber(0)]
      ),
      [bignumber(5), bignumber(5), bignumber(0)]
    )
    assert.deepStrictEqual(
      bigintersect(
        [bignumber(1), bignumber(0), bignumber(1)],
        [bignumber(4), bignumber(-2), bignumber(2)],
        [bignumber(1), bignumber(1), bignumber(1), bignumber(6)]
      ),
      [bignumber(7), bignumber(-4), bignumber(3)]
    )
  })

<<<<<<< HEAD
  it('should accept column and row vectors', function () {
=======
  it('should accept column and row vectors', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([[0], [0]]),
        [[10, 10]],
        math.matrix([[10, 0]]),
        math.matrix([[0], [10]])
      ),
      math.matrix([5, 5])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([0, 0]),
        math.matrix([[10, 10]]),
        math.matrix([[10], [0]]),
        math.matrix([0, 10])
      ),
      math.matrix([5, 5])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([[0], [0], [0]]),
        [[10, 10, 0]],
        [10, 0, 0],
        math.matrix([0, 10, 0])
      ),
      math.matrix([5, 5, 0])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([[1, 0, 1]]),
        [4, -2, 2],
        math.matrix([[1], [1], [1], [6]])
      ),
      math.matrix([7, -4, 3])
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([[1], [0], [1]]),
        math.matrix([4, -2, 2]),
        math.matrix([[1, 1, 1, 6]])
      ),
      math.matrix([7, -4, 3])
    )
  })

<<<<<<< HEAD
  it('should calculate the intersection point if coordinates are fractions', function () {
=======
  it('should calculate the intersection point if coordinates are fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect(
        [fraction(1, 1), fraction(0, 1), fraction(1, 1)],
        [fraction(4, 1), fraction(-2, 1), fraction(2, 1)],
        [fraction(1, 1), fraction(1, 1), fraction(1, 1), fraction(6, 1)]
      ),
      [fraction(7, 1), fraction(-4, 1), fraction(3, 1)]
    )
    assert.deepStrictEqual(
      math.intersect(
        math.matrix([fraction(1, 1), fraction(0, 1), fraction(1, 1)]),
        [fraction(4, 1), fraction(-2, 1), fraction(2, 1)],
        math.matrix([
          fraction(1, 1),
          fraction(1, 1),
          fraction(1, 1),
          fraction(6, 1)
        ])
      ),
      math.matrix([fraction(7, 1), fraction(-4, 1), fraction(3, 1)])
    )
    // assert.deepStrictEqual(math.intersect(math.matrix([1, 0, 1]), math.matrix([4, -2, 2]), math.matrix([1, 1, 1, 6])), math.matrix([7, -4, 3]))
  })

<<<<<<< HEAD
  it('should return null if the points do not intersect and the coordinates are fractions', function () {
=======
  it('should return null if the points do not intersect and the coordinates are fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      math.intersect(
        [fraction(0, 1), fraction(1, 1), fraction(0, 1)],
        [fraction(0, 1), fraction(0, 1), fraction(0, 1)],
        [fraction(1, 1), fraction(1, 1), fraction(0, 1)],
        [fraction(1, 1), fraction(0, 1), fraction(0, 1)]
      ),
      null
    )
    assert.deepStrictEqual(
      math.intersect(
        [fraction(0, 1), fraction(1, 1)],
        [fraction(0, 1), fraction(0, 1)],
        [fraction(1, 1), fraction(1, 1)],
        [fraction(1, 1), fraction(0, 1)]
      ),
      null
    )
    // assert.deepStrictEqual(math.intersect([0, 30, 0], [0, 21, 0], [0, 0, 9, 0]), null) // TODO

    assert.deepStrictEqual(
      math.intersect(
        math.matrix([fraction(1, 1), fraction(0, 1), fraction(0, 1)]),
        math.matrix([fraction(1, 1), fraction(1, 1), fraction(1, 1)]),
        math.matrix([fraction(0, 1), fraction(1, 1), fraction(0, 1)]),
        math.matrix([fraction(1, 1), fraction(1, 1), fraction(0, 1)])
      ),
      null
    )
    // assert.deepStrictEqual(math.intersect(math.matrix([0, 30, 0]), math.matrix([0, 21, 0]), math.matrix([0, 0, 9, 0])), null) // TODO
  })
})

<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for partitionSelect - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const matrix = math.matrix
const partitionSelect = math.partitionSelect

<<<<<<< HEAD
describe('partitionSelect', function () {
  it('should sort an array with numbers', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('partitionSelect', function (): void {
  it('should sort an array with numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(partitionSelect([5, 10, 1], 0), 1)
    assert.strictEqual(partitionSelect([5, 10, 1], 1), 5)
    assert.strictEqual(partitionSelect([5, 10, 1], 2), 10)
  })

<<<<<<< HEAD
  it('should sort a Matrix', function () {
=======
  it('should sort a Matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(partitionSelect(matrix([5, 10, 1]), 0), 1)
    assert.strictEqual(partitionSelect(matrix([5, 10, 1]), 1), 5)
    assert.strictEqual(partitionSelect(matrix([5, 10, 1]), 2), 10)
  })

<<<<<<< HEAD
  it('should sort an array in ascending order', function () {
=======
  it('should sort an array in ascending order', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(partitionSelect([5, 10, 1], 0, 'asc'), 1)
    assert.strictEqual(partitionSelect([5, 10, 1], 1, 'asc'), 5)
    assert.strictEqual(partitionSelect([5, 10, 1], 2, 'asc'), 10)
  })

<<<<<<< HEAD
  it('should sort an array in descending order', function () {
=======
  it('should sort an array in descending order', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(partitionSelect([5, 10, 1], 0, 'desc'), 10)
    assert.strictEqual(partitionSelect([5, 10, 1], 1, 'desc'), 5)
    assert.strictEqual(partitionSelect([5, 10, 1], 2, 'desc'), 1)
  })

<<<<<<< HEAD
  it('should sort an array with a custom compare function', function () {
=======
  it('should sort an array with a custom compare function', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    function sortByLength(a, b) {
      return a.length - b.length
    }
    assert.strictEqual(
      partitionSelect(['Langdon', 'Tom', 'Sara'], 0, sortByLength),
      'Tom'
    )
    assert.strictEqual(
      partitionSelect(['Langdon', 'Tom', 'Sara'], 1, sortByLength),
      'Sara'
    )
    assert.strictEqual(
      partitionSelect(['Langdon', 'Tom', 'Sara'], 2, sortByLength),
      'Langdon'
    )
  })

<<<<<<< HEAD
  it('should mutate the input array, leaving it partitioned at k', function () {
=======
  it('should mutate the input array, leaving it partitioned at k', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const arr = [3, 2, 4, 6, -2, 5]
    partitionSelect(arr, 3)

    for (let i = 0; i < 3; ++i) {
      assert.ok(arr[i] <= arr[3])
    }
    assert.ok(arr[3] === 4)
    for (let i = 4; i < arr.length; ++i) {
      assert.ok(arr[3] <= arr[i])
    }
  })

<<<<<<< HEAD
  it('should mutate the input matrix, leaving it partitioned at k', function () {
=======
  it('should mutate the input matrix, leaving it partitioned at k', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const m = matrix([3, 2, 4, 6, -2, 5])
    partitionSelect(m, 3)

    m.forEach(function (value, index, _matrix) {
      if (index[0] < 3) {
        assert.ok(value <= 4)
      } else if (index[0] === 3) {
        assert.ok(value === 4)
      } else {
        assert.ok(value >= 4)
      }
    })
  })

<<<<<<< HEAD
  it('should return NaN if any of the inputs contains NaN', function () {
=======
  it('should return NaN if any of the inputs contains NaN', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(isNaN(partitionSelect([NaN], 0)))
    assert(isNaN(partitionSelect([1, NaN], 0)))
    assert(isNaN(partitionSelect([NaN, 1], 0)))
    assert(isNaN(partitionSelect([1, 3, NaN], 1)))
    assert(isNaN(partitionSelect([NaN, NaN, NaN], 1)))
  })

<<<<<<< HEAD
  it('should throw an error if called with a multi dimensional matrix', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a multi dimensional matrix', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      partitionSelect(
        matrix([
          [1, 2],
          [3, 4]
        ]),
        2
      )
    }, /Only one dimensional matrices supported/)
  })

<<<<<<< HEAD
  it('should throw an error if called with a non-negative k, within the bounds of the array', function () {
    assert.throws(function () {
      partitionSelect([1], -2)
    }, /k must be a non-negative integer/)
    assert.throws(function () {
      partitionSelect([3, 2, 1], 1.2)
    }, /k must be a non-negative integer/)
    assert.throws(function () {
      partitionSelect([3, 2, 1], 3)
    }, /k out of bounds/)
    assert.throws(function () {
=======
  it('should throw an error if called with a non-negative k, within the bounds of the array', function (): void {
    assert.throws(function (): void {
      partitionSelect([1], -2)
    }, /k must be a non-negative integer/)
    assert.throws(function (): void {
      partitionSelect([3, 2, 1], 1.2)
    }, /k must be a non-negative integer/)
    assert.throws(function (): void {
      partitionSelect([3, 2, 1], 3)
    }, /k out of bounds/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      partitionSelect([], 0)
    }, /k out of bounds/)
  })

<<<<<<< HEAD
  it('should throw an error if called with unsupported type', function () {
    assert.throws(function () {
      partitionSelect(2, 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      partitionSelect('string', 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      partitionSelect([1], new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      partitionSelect([1], 1, 'function')
    }, /Error: Compare string must be "asc" or "desc"/)
    assert.throws(function () {
=======
  it('should throw an error if called with unsupported type', function (): void {
    assert.throws(function (): void {
      partitionSelect(2, 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      partitionSelect('string', 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      partitionSelect([1], new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      partitionSelect([1], 1, 'function')
    }, /Error: Compare string must be "asc" or "desc"/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      partitionSelect([1], 1, {})
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error if called with invalid number of arguments', function () {
    assert.throws(function () {
      partitionSelect()
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
      partitionSelect([])
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if called with invalid number of arguments', function (): void {
    assert.throws(function (): void {
      partitionSelect()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      partitionSelect([])
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      partitionSelect([], 2, 'foo', 3)
    }, /TypeError: Too many arguments/)
  })

  /*
<<<<<<< HEAD
  it('should LaTeX sort', function () {
=======
  it('should LaTeX sort', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('sort([3,2,1])')
    assert.strictEqual(expression.toTex(), '\\mathrm{sort}\\left(\\begin{bmatrix}3\\\\2\\\\1\\\\\\end{bmatrix}\\right)')
  })
  */
})

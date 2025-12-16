<<<<<<< HEAD
// @ts-nocheck
// test rightLogShift
=======
/**
 * Test for rightLogShift - AssemblyScript-friendly TypeScript
 */

>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
const matrix = math.matrix
const sparse = math.sparse
const rightLogShift = math.rightLogShift

<<<<<<< HEAD
describe('rightLogShift', function () {
  it('should right logically shift a number by a given amount', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('rightLogShift', function (): void {
  it('should right logically shift a number by a given amount', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(rightLogShift(0, 1000), 0)
    assert.strictEqual(rightLogShift(2, 0), 2)
    assert.strictEqual(rightLogShift(12, 3), 1)
    assert.strictEqual(rightLogShift(32, 4), 2)
    assert.strictEqual(rightLogShift(-1, 1000), 16777215)
    assert.strictEqual(rightLogShift(-12, 2), 1073741821)
    assert.strictEqual(rightLogShift(122, 3), 15)
    assert.strictEqual(rightLogShift(-13, 2), 1073741820)
    assert.strictEqual(rightLogShift(-13, 3), 536870910)
  })

<<<<<<< HEAD
  it('should right logically shift booleans by a boolean amount', function () {
=======
  it('should right logically shift booleans by a boolean amount', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(rightLogShift(true, true), 0)
    assert.strictEqual(rightLogShift(true, false), 1)
    assert.strictEqual(rightLogShift(false, true), 0)
    assert.strictEqual(rightLogShift(false, false), 0)
  })

<<<<<<< HEAD
  it('should right logically shift with a mix of numbers and booleans', function () {
=======
  it('should right logically shift with a mix of numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(rightLogShift(2, true), 1)
    assert.strictEqual(rightLogShift(2, false), 2)
    assert.strictEqual(rightLogShift(true, 0), 1)
    assert.strictEqual(rightLogShift(true, 1), 0)
    assert.strictEqual(rightLogShift(false, 2), 0)
  })

<<<<<<< HEAD
  it('should throw an error if the parameters are not integers', function () {
    assert.throws(function () {
      rightLogShift(1.1, 1)
    }, /Integers expected in function rightLogShift/)
    assert.throws(function () {
      rightLogShift(1, 1.1)
    }, /Integers expected in function rightLogShift/)
    assert.throws(function () {
=======
  it('should throw an error if the parameters are not integers', function (): void {
    assert.throws(function (): void {
      rightLogShift(1.1, 1)
    }, /Integers expected in function rightLogShift/)
    assert.throws(function (): void {
      rightLogShift(1, 1.1)
    }, /Integers expected in function rightLogShift/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      rightLogShift(1.1, 1.1)
    }, /Integers expected in function rightLogShift/)
  })

<<<<<<< HEAD
  it('should throw an error if used with a unit', function () {
    assert.throws(function () {
      rightLogShift(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      rightLogShift(2, math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
      rightLogShift(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      rightLogShift(2, math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      rightLogShift(math.unit('2cm'), math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  describe('Array', function () {
    it('should right arithmetically shift array - scalar', function () {
=======
  describe('Array', function (): void {
    it('should right arithmetically shift array - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          [
            [4, 8],
            [8, 0]
          ],
          2
        ),
        [
          [1, 2],
          [2, 0]
        ]
      )
      assert.deepStrictEqual(
        rightLogShift(
          [
            [4, 8],
            [12, 16]
          ],
          2
        ),
        [
          [1, 2],
          [3, 4]
        ]
      )
      assert.deepStrictEqual(
        rightLogShift(2, [
          [1, 2],
          [8, 0]
        ]),
        [
          [1, 0],
          [0, 2]
        ]
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift array - array', function () {
=======
    it('should right arithmetically shift array - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          [
            [1, 2],
            [8, 0]
          ],
          [
            [4, 8],
            [32, 0]
          ]
        ),
        [
          [0, 0],
          [8, 0]
        ]
      )
      assert.deepStrictEqual(
        rightLogShift(
          [
            [4, 8],
            [32, 0]
          ],
          [
            [1, 2],
            [8, 0]
          ]
        ),
        [
          [2, 2],
          [0, 0]
        ]
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift between broadcastable arrays', function () {
=======
    it('should right arithmetically shift between broadcastable arrays', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(rightLogShift([[1, 2]], [[4], [32]]), [
        [0, 0],
        [1, 2]
      ])
      assert.deepStrictEqual(rightLogShift([[4], [32]], [1, 2]), [
        [2, 1],
        [16, 8]
      ])
    })

<<<<<<< HEAD
    it('should right arithmetically shift array - dense matrix', function () {
=======
    it('should right arithmetically shift array - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          [
            [1, 2],
            [8, 0]
          ],
          matrix([
            [4, 8],
            [32, 0]
          ])
        ),
        matrix([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          [
            [4, 8],
            [32, 0]
          ],
          matrix([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [2, 2],
          [0, 0]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift array - sparse matrix', function () {
=======
    it('should right arithmetically shift array - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          [
            [1, 2],
            [8, 0]
          ],
          sparse([
            [4, 8],
            [32, 0]
          ])
        ),
        matrix([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          [
            [4, 8],
            [32, 0]
          ],
          sparse([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [2, 2],
          [0, 0]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should right arithmetically shift dense matrix - scalar', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should right arithmetically shift dense matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [4, 8],
            [8, 0]
          ]),
          2
        ),
        matrix([
          [1, 2],
          [2, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [4, 8],
            [12, 16]
          ]),
          2
        ),
        matrix([
          [1, 2],
          [3, 4]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          2,
          matrix([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [1, 0],
          [0, 2]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift dense matrix - array', function () {
=======
    it('should right arithmetically shift dense matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [1, 2],
            [8, 0]
          ]),
          [
            [4, 8],
            [32, 0]
          ]
        ),
        matrix([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [4, 8],
            [32, 0]
          ]),
          [
            [1, 2],
            [8, 0]
          ]
        ),
        matrix([
          [2, 2],
          [0, 0]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift dense matrix - dense matrix', function () {
=======
    it('should right arithmetically shift dense matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [1, 2],
            [8, 0]
          ]),
          matrix([
            [4, 8],
            [32, 0]
          ])
        ),
        matrix([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [4, 8],
            [32, 0]
          ]),
          matrix([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [2, 2],
          [0, 0]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift dense matrix - sparse matrix', function () {
=======
    it('should right arithmetically shift dense matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [1, 2],
            [8, 0]
          ]),
          sparse([
            [4, 8],
            [32, 0]
          ])
        ),
        matrix([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          matrix([
            [4, 8],
            [32, 0]
          ]),
          sparse([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [2, 2],
          [0, 0]
        ])
      )
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should right arithmetically shift sparse matrix - scalar', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should right arithmetically shift sparse matrix - scalar', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [4, 8],
            [8, 0]
          ]),
          2
        ),
        sparse([
          [1, 2],
          [2, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [4, 8],
            [12, 16]
          ]),
          2
        ),
        sparse([
          [1, 2],
          [3, 4]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          2,
          sparse([
            [1, 2],
            [8, 0]
          ])
        ),
        matrix([
          [1, 0],
          [0, 2]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift sparse matrix - array', function () {
=======
    it('should right arithmetically shift sparse matrix - array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [1, 2],
            [8, 0]
          ]),
          [
            [4, 8],
            [32, 0]
          ]
        ),
        sparse([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [4, 8],
            [32, 0]
          ]),
          [
            [1, 2],
            [8, 0]
          ]
        ),
        sparse([
          [2, 2],
          [0, 0]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift sparse matrix - dense matrix', function () {
=======
    it('should right arithmetically shift sparse matrix - dense matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [1, 2],
            [8, 0]
          ]),
          matrix([
            [4, 8],
            [32, 0]
          ])
        ),
        sparse([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [4, 8],
            [32, 0]
          ]),
          matrix([
            [1, 2],
            [8, 0]
          ])
        ),
        sparse([
          [2, 2],
          [0, 0]
        ])
      )
    })

<<<<<<< HEAD
    it('should right arithmetically shift sparse matrix - sparse matrix', function () {
=======
    it('should right arithmetically shift sparse matrix - sparse matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [1, 2],
            [8, 0]
          ]),
          sparse([
            [4, 8],
            [32, 0]
          ])
        ),
        sparse([
          [0, 0],
          [8, 0]
        ])
      )
      assert.deepStrictEqual(
        rightLogShift(
          sparse([
            [4, 8],
            [32, 0]
          ]),
          sparse([
            [1, 2],
            [8, 0]
          ])
        ),
        sparse([
          [2, 2],
          [0, 0]
        ])
      )
    })
  })

<<<<<<< HEAD
  it('should throw an error if used with wrong number of arguments', function () {
    assert.throws(function () {
      rightLogShift(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should throw an error if used with wrong number of arguments', function (): void {
    assert.throws(function (): void {
      rightLogShift(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      rightLogShift(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of arguments', function () {
    assert.throws(function () {
      rightLogShift(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      rightLogShift(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      rightLogShift(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
      rightLogShift(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      rightLogShift(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      rightLogShift(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      rightLogShift(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      rightLogShift(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      rightLogShift(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX rightLogShift', function () {
    const expression = math.parse('rightLogShift(1,2)')
=======
  it('should LaTeX rightLogShift', function (): void {
    const expression = math.parse('rightLogShift(1,2)') as MathNode
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(expression.toTex(), '\\left(1>>>2\\right)')
  })
})

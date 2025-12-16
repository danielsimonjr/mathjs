<<<<<<< HEAD
// @ts-nocheck
// test dotDivide (element-wise divide)
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'
=======
/**
 * Test for dotDivide - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import { approxEqual, approxDeepEqual } from '../../../../tools/approx.js'
const dotDivide = math.dotDivide
const complex = math.complex

<<<<<<< HEAD
describe('dotDivide', function () {
  it('should divide two numbers', function () {
=======
describe('dotDivide', function (): void {
  it('should divide two numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(dotDivide(4, 2), 2)
    assert.strictEqual(dotDivide(-4, 2), -2)
    assert.strictEqual(dotDivide(4, -2), -2)
    assert.strictEqual(dotDivide(-4, -2), 2)
    assert.strictEqual(dotDivide(4, 0), Infinity)
    assert.strictEqual(dotDivide(0, -5), -0)
    assert.ok(isNaN(dotDivide(0, 0)))
  })

<<<<<<< HEAD
  it('should divide booleans', function () {
=======
  it('should divide booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(dotDivide(true, true), 1)
    assert.strictEqual(dotDivide(true, false), Infinity)
    assert.strictEqual(dotDivide(false, true), 0)
    assert.ok(isNaN(dotDivide(false, false)))
  })

<<<<<<< HEAD
  it('should add mixed numbers and booleans', function () {
=======
  it('should add mixed numbers and booleans', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(dotDivide(2, true), 2)
    assert.strictEqual(dotDivide(2, false), Infinity)
    approxEqual(dotDivide(true, 2), 0.5)
    assert.strictEqual(dotDivide(false, 2), 0)
  })

<<<<<<< HEAD
  it("should throw an error if there's wrong number of arguments", function () {
    assert.throws(function () {
      dotDivide(2, 3, 4)
    })
    assert.throws(function () {
=======
  it("should throw an error if there's wrong number of arguments", function (): void {
    assert.throws(function (): void {
      dotDivide(2, 3, 4)
    })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      dotDivide(2)
    })
  })

<<<<<<< HEAD
  it('should throw an in case of wrong type of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      dotDivide(null, 1)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should divide two complex numbers', function () {
=======
  it('should divide two complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    approxDeepEqual(dotDivide(complex('2+3i'), 2), complex('1+1.5i'))
    approxDeepEqual(
      dotDivide(complex('2+3i'), complex('4i')),
      complex('0.75 - 0.5i')
    )
    approxDeepEqual(dotDivide(complex('2i'), complex('4i')), 0.5)
    approxDeepEqual(dotDivide(4, complex('1+2i')), complex('0.8 - 1.6i'))
  })

<<<<<<< HEAD
  it('should divide a unit by a number', function () {
    assert.strictEqual(dotDivide(math.unit('5 m'), 10).toString(), '0.5 m')
  })

  it('should divide a number by a unit', function () {
=======
  it('should divide a unit by a number', function (): void {
    assert.strictEqual(dotDivide(math.unit('5 m'), 10).toString(), '0.5 m')
  })

  it('should divide a number by a unit', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(dotDivide(10, math.unit('5 m')).toString(), '2 m^-1')
  })

  /*
  // This is supported not --ericman314
  it('should throw an error if dividing a number by a unit', function() {
<<<<<<< HEAD
    assert.throws(function () {dotDivide(10, math.unit('5 m')).toString()})
  });
  */

  describe('Array', function () {
    it('should divide all the elements of a array by one number', function () {
=======
    assert.throws(function (): void {dotDivide(10, math.unit('5 m')).toString()})
  });
  */

  describe('Array', function (): void {
    it('should divide all the elements of a array by one number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(dotDivide([2, 4, 6], 2), [1, 2, 3])
      const a = [
        [1, 2],
        [3, 4]
      ]
      assert.deepStrictEqual(dotDivide(a, 2), [
        [0.5, 1],
        [1.5, 2]
      ])
      assert.deepStrictEqual(dotDivide([], 2), [])
    })

<<<<<<< HEAD
    it('should divide 1 over a array element-wise', function () {
=======
    it('should divide 1 over a array element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        dotDivide(1, [
          [1, 4, 7],
          [3, 0, 5],
          [-1, 9, 11]
        ]),
        [
          [1, 0.25, 1 / 7],
          [1 / 3, Infinity, 0.2],
          [-1, 1 / 9, 1 / 11]
        ]
      )
    })

<<<<<<< HEAD
    it('should divide broadcastable arrays element-wise', function () {
=======
    it('should divide broadcastable arrays element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a2 = [1, 2]
      const a3 = [[3], [4]]
      const a4 = dotDivide(a2, a3)
      const a5 = dotDivide(a3, a2)
      assert.deepStrictEqual(a4, [
        [0.3333333333333333, 0.6666666666666666],
        [0.25, 0.5]
      ])
      assert.deepStrictEqual(a5, [
        [3, 1.5],
        [4, 2]
      ])
    })

<<<<<<< HEAD
    it('should perform (array ./ array) element-wise matrix division', function () {
=======
    it('should perform (array ./ array) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [
        [1, 2],
        [3, 4]
      ]
      const b = [
        [5, 6],
        [7, 8]
      ]
      assert.deepStrictEqual(dotDivide(a, b), [
        [1 / 5, 2 / 6],
        [3 / 7, 4 / 8]
      ])
    })

<<<<<<< HEAD
    it('should perform (array ./ dense matrix) element-wise matrix division', function () {
=======
    it('should perform (array ./ dense matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [
        [1, 2],
        [3, 4]
      ]
      const b = math.matrix([
        [5, 6],
        [7, 8]
      ])
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.matrix([
          [1 / 5, 2 / 6],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (array ./ sparse matrix) element-wise matrix division', function () {
=======
    it('should perform (array ./ sparse matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = [
        [1, 2],
        [3, 4]
      ]
      const b = math.sparse([
        [5, 0],
        [7, 8]
      ])
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.matrix([
          [1 / 5, Infinity],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should throw an error when dividing element-wise with not broadcastable sizes', function () {
      assert.throws(function () {
=======
    it('should throw an error when dividing element-wise with not broadcastable sizes', function (): void {
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        dotDivide(
          [
            [1, 2],
            [3, 4]
          ],
          [[1, 2, 3]]
        )
      })
    })
  })

<<<<<<< HEAD
  describe('DenseMatrix', function () {
    it('should divide all the elements of a dense matrix by one number', function () {
=======
  describe('DenseMatrix', function (): void {
    it('should divide all the elements of a dense matrix by one number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        dotDivide(math.matrix([2, 4, 6]), 2),
        math.matrix([1, 2, 3])
      )
      const a = math.matrix([
        [1, 2],
        [3, 4]
      ])
      assert.deepStrictEqual(
        dotDivide(a, 2),
        math.matrix([
          [0.5, 1],
          [1.5, 2]
        ])
      )
      assert.deepStrictEqual(dotDivide(math.matrix([]), 2), math.matrix([]))
    })

<<<<<<< HEAD
    it('should divide 1 over a dense matrix element-wise', function () {
=======
    it('should divide 1 over a dense matrix element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        dotDivide(
          1,
          math.matrix([
            [1, 4, 7],
            [3, 0, 5],
            [-1, 9, 11]
          ])
        ),
        math.matrix([
          [1, 0.25, 1 / 7],
          [1 / 3, Infinity, 0.2],
          [-1, 1 / 9, 1 / 11]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (dense matrix ./ array) element-wise matrix division', function () {
=======
    it('should perform (dense matrix ./ array) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([
        [1, 2],
        [3, 4]
      ])
      const b = [
        [5, 6],
        [7, 8]
      ]
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.matrix([
          [1 / 5, 2 / 6],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (dense matrix ./ dense matrix) element-wise matrix division', function () {
=======
    it('should perform (dense matrix ./ dense matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([
        [1, 2],
        [3, 4]
      ])
      const b = math.matrix([
        [5, 6],
        [7, 8]
      ])
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.matrix([
          [1 / 5, 2 / 6],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (dense matrix ./ sparse matrix) element-wise matrix division', function () {
=======
    it('should perform (dense matrix ./ sparse matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.matrix([
        [1, 2],
        [3, 4]
      ])
      const b = math.sparse([
        [5, 0],
        [7, 8]
      ])
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.matrix([
          [1 / 5, Infinity],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should throw an error when dividing element-wise with not broadcastable sizes', function () {
      assert.throws(function () {
=======
    it('should throw an error when dividing element-wise with not broadcastable sizes', function (): void {
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        dotDivide(
          math.matrix([
            [1, 2],
            [3, 4]
          ]),
          math.matrix([[1, 2, 3]])
        )
      })
    })
  })

<<<<<<< HEAD
  describe('SparseMatrix', function () {
    it('should divide all the elements of a sparse matrix by one number', function () {
=======
  describe('SparseMatrix', function (): void {
    it('should divide all the elements of a sparse matrix by one number', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        dotDivide(
          math.sparse([
            [2, 0, 6],
            [8, 10, 12]
          ]),
          2
        ),
        math.sparse([
          [1, 0, 3],
          [4, 5, 6]
        ])
      )
      const a = math.sparse([
        [1, 2],
        [3, 4]
      ])
      assert.deepStrictEqual(
        dotDivide(a, 2),
        math.sparse([
          [0.5, 1],
          [1.5, 2]
        ])
      )
      assert.deepStrictEqual(dotDivide(math.sparse(), 2), math.sparse())
    })

<<<<<<< HEAD
    it('should divide 1 over a sparse matrix element-wise', function () {
=======
    it('should divide 1 over a sparse matrix element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      approxDeepEqual(
        dotDivide(
          1,
          math.sparse([
            [1, 4, 7],
            [3, 0, 5],
            [-1, 9, 11]
          ])
        ),
        math.matrix([
          [1, 0.25, 1 / 7],
          [1 / 3, Infinity, 0.2],
          [-1, 1 / 9, 1 / 11]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (sparse matrix ./ array) element-wise matrix division', function () {
=======
    it('should perform (sparse matrix ./ array) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.sparse([
        [1, 2],
        [3, 4]
      ])
      const b = [
        [5, 6],
        [7, 8]
      ]
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.sparse([
          [1 / 5, 2 / 6],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (sparse matrix ./ dense matrix) element-wise matrix division', function () {
=======
    it('should perform (sparse matrix ./ dense matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.sparse([
        [1, 2],
        [3, 4]
      ])
      const b = math.matrix([
        [5, 6],
        [7, 8]
      ])
      assert.deepStrictEqual(
        dotDivide(a, b),
        math.sparse([
          [1 / 5, 2 / 6],
          [3 / 7, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should perform (sparse matrix ./ sparse matrix) element-wise matrix division', function () {
=======
    it('should perform (sparse matrix ./ sparse matrix) element-wise matrix division', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const a = math.sparse([
        [1, 2],
        [0, 4]
      ])
      const b = math.sparse([
        [5, 0],
        [7, 8]
      ])
      const result = dotDivide(a, b)
      const isSparseMatrix = !!(result._values && result._index && result._ptr)
      assert.strictEqual(isSparseMatrix, true)
      approxDeepEqual(
        result,
        math.sparse([
          [1 / 5, Infinity],
          [0, 4 / 8]
        ])
      )
    })

<<<<<<< HEAD
    it('should throw an error when dividing element-wise with differing size is not broadcastable', function () {
      assert.throws(function () {
=======
    it('should throw an error when dividing element-wise with differing size is not broadcastable', function (): void {
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        dotDivide(
          math.sparse([
            [1, 2],
            [3, 4]
          ]),
          math.sparse([1, 2, 3])
        )
      })
    })
  })

<<<<<<< HEAD
  it('should LaTeX dotDivide', function () {
=======
  it('should LaTeX dotDivide', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('dotDivide([1,2],[3,4])')
    assert.strictEqual(
      expression.toTex(),
      '\\left(\\begin{bmatrix}1\\\\2\\end{bmatrix}.:\\begin{bmatrix}3\\\\4\\end{bmatrix}\\right)'
    )
  })
})

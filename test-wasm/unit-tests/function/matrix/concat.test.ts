<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for concat - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const bignumber = math.bignumber

<<<<<<< HEAD
describe('concat', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('concat', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
  const a = [
    [1, 2],
    [3, 4]
  ]
  const b = [
    [5, 6],
    [7, 8]
  ]
  const c = [
    [9, 10],
    [11, 12]
  ]
  const d = [
    [
      [1, 2],
      [3, 4]
    ],
    [
      [5, 6],
      [7, 8]
    ]
  ]
  const e = [
    [
      [9, 10],
      [11, 12]
    ],
    [
      [13, 14],
      [15, 16]
    ]
  ]

<<<<<<< HEAD
  it('should concatenate compatible matrices on the last dimension by default', function () {
=======
  it('should concatenate compatible matrices on the last dimension by default', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.concat([1, 2, 3], [4, 5]), [1, 2, 3, 4, 5])
    assert.deepStrictEqual(
      math.concat([bignumber(1), bignumber(2), bignumber(3)], [bignumber(4)]),
      [bignumber(1), bignumber(2), bignumber(3), bignumber(4)]
    )
    assert.deepStrictEqual(math.concat([[1], [2], [3]], [[4]], 0), [
      [1],
      [2],
      [3],
      [4]
    ])
    assert.deepStrictEqual(
      math.concat(
        [[], []],
        [
          [1, 2],
          [3, 4]
        ]
      ),
      [
        [1, 2],
        [3, 4]
      ]
    )

    assert.deepStrictEqual(
      math.concat(math.matrix(a), math.matrix(b)),
      math.matrix([
        [1, 2, 5, 6],
        [3, 4, 7, 8]
      ])
    )

    assert.deepStrictEqual(math.concat(a, b, c), [
      [1, 2, 5, 6, 9, 10],
      [3, 4, 7, 8, 11, 12]
    ])

    assert.deepStrictEqual(math.concat(d, e), [
      [
        [1, 2, 9, 10],
        [3, 4, 11, 12]
      ],
      [
        [5, 6, 13, 14],
        [7, 8, 15, 16]
      ]
    ])
  })

<<<<<<< HEAD
  it('should concatenate compatible matrices on the given dimension', function () {
=======
  it('should concatenate compatible matrices on the given dimension', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(math.concat([[1]], [[2]], 1), [[1, 2]])
    assert.deepStrictEqual(math.concat([[1]], [[2]], 0), [[1], [2]])
    assert.deepStrictEqual(math.concat([[1]], [[2]], 0), [[1], [2]])

    assert.deepStrictEqual(math.concat(a, b, 0), [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8]
    ])

    assert.deepStrictEqual(math.concat(a, b, c, 0), [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
      [11, 12]
    ])

    assert.deepStrictEqual(math.concat(d, e, 0), [
      [
        [1, 2],
        [3, 4]
      ],
      [
        [5, 6],
        [7, 8]
      ],
      [
        [9, 10],
        [11, 12]
      ],
      [
        [13, 14],
        [15, 16]
      ]
    ])

    assert.deepStrictEqual(math.concat(d, e, 1), [
      [
        [1, 2],
        [3, 4],
        [9, 10],
        [11, 12]
      ],
      [
        [5, 6],
        [7, 8],
        [13, 14],
        [15, 16]
      ]
    ])

    assert.deepStrictEqual(math.concat(d, e, bignumber(1)), [
      [
        [1, 2],
        [3, 4],
        [9, 10],
        [11, 12]
      ],
      [
        [5, 6],
        [7, 8],
        [13, 14],
        [15, 16]
      ]
    ])
  })

<<<<<<< HEAD
  it('should concatenate strings', function () {
=======
  it('should concatenate strings', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(math.concat('a', 'b'), 'ab')
    assert.strictEqual(math.concat('a', 'b', 'c'), 'abc')
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid requested dimension number', function () {
    assert.throws(function () {
      math.concat([1, 2], [3, 4], 2.3)
    }, /Integer number expected for dimension/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid requested dimension number', function (): void {
    assert.throws(function (): void {
      math.concat([1, 2], [3, 4], 2.3)
    }, /Integer number expected for dimension/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat([1, 2], [3, 4], 1)
    }, /Index out of range \(1 > 0\)/)
  })

<<<<<<< HEAD
  it('should throw an error in case dimension mismatch', function () {
    assert.throws(function () {
=======
  it('should throw an error in case dimension mismatch', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat(
        [1, 2],
        [
          [1, 2],
          [3, 4]
        ]
      )
    }, RangeError)
<<<<<<< HEAD
    assert.throws(function () {
=======
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat(
        [[1, 2]],
        [
          [1, 2],
          [3, 4]
        ]
      )
    }, /Dimension mismatch/)
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid type of argument', function () {
    assert.throws(function () {
=======
  it('should throw an error in case of invalid type of argument', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat(math.complex(2, 3))
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should throw an error when called without matrices as argument', function () {
    assert.throws(function () {
=======
  it('should throw an error when called without matrices as argument', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      math.concat(2)
    }, /At least one matrix expected/)
  })

<<<<<<< HEAD
  it('should LaTeX concat', function () {
=======
  it('should LaTeX concat', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('concat([1],[2])')
    assert.strictEqual(
      expression.toTex(),
      '\\mathrm{concat}\\left(\\begin{bmatrix}1\\end{bmatrix},\\begin{bmatrix}2\\end{bmatrix}\\right)'
    )
  })
})

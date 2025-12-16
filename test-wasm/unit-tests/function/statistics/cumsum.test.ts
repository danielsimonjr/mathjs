<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for cumsum - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const BigNumber = math.BigNumber
const Complex = math.Complex
const DenseMatrix = math.DenseMatrix
const Unit = math.Unit
const cumsum = math.cumsum

<<<<<<< HEAD
describe('cumsum', function () {
  it('should return the cumsum of numbers', function () {
=======
describe('cumsum', function (): void {
  it('should return the cumsum of numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cumsum(5), [5])
    assert.deepStrictEqual(cumsum(3, 1), [3, 4])
    assert.deepStrictEqual(cumsum(1, 3), [1, 4])
    assert.deepStrictEqual(cumsum(1, 3, 5, 2), [1, 4, 9, 11])
    assert.deepStrictEqual(cumsum(0, 0, 0, 0), [0, 0, 0, 0])
  })

<<<<<<< HEAD
  it('should return the cumulative sum of big numbers', function () {
=======
  it('should return the cumulative sum of big numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum(
        new BigNumber(1),
        new BigNumber(3),
        new BigNumber(5),
        new BigNumber(2)
      ),
      [new BigNumber(1), new BigNumber(4), new BigNumber(9), new BigNumber(11)]
    )
  })

<<<<<<< HEAD
  it('should return the cumulative sum of strings (convert them to numbers)', function () {
=======
  it('should return the cumulative sum of strings (convert them to numbers)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cumsum('2', '3', '4', '5'), [2, 5, 9, 14])
    assert.deepStrictEqual(
      cumsum([
        ['2', '3'],
        ['4', '5']
      ]),
      [
        [2, 3],
        [6, 8]
      ]
    )
    assert.deepStrictEqual(
      cumsum(
        [
          ['2', '3'],
          ['4', '5']
        ],
        1
      ),
      [
        [2, 5],
        [4, 9]
      ]
    )
  })

<<<<<<< HEAD
  it('should return the cumulative sum of complex numbers', function () {
=======
  it('should return the cumulative sum of complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cumsum(new Complex(2, 3), new Complex(-1, 2)), [
      new Complex(2, 3),
      new Complex(1, 5)
    ])
  })

<<<<<<< HEAD
  it('should return the cumulative sum of mixed numbers and complex numbers', function () {
=======
  it('should return the cumulative sum of mixed numbers and complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(cumsum(2, new Complex(-1, 3)), [
      2,
      new Complex(1, 3)
    ])
  })

<<<<<<< HEAD
  it('should return the cumulative sum from an array', function () {
    assert.deepStrictEqual(cumsum([1, 3, 5, 2, -5]), [1, 4, 9, 11, 6])
  })

  it('should return the cumulative sum of units', function () {
=======
  it('should return the cumulative sum from an array', function (): void {
    assert.deepStrictEqual(cumsum([1, 3, 5, 2, -5]), [1, 4, 9, 11, 6])
  })

  it('should return the cumulative sum of units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum([new Unit(5, 'm'), new Unit(10, 'm'), new Unit(15, 'm')]),
      [new Unit(5, 'm'), new Unit(15, 'm'), new Unit(30, 'm')]
    )
  })

<<<<<<< HEAD
  it('should return the cumulative sum from a 1d matrix', function () {
=======
  it('should return the cumulative sum from a 1d matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum(new DenseMatrix([1, 3, 5, 2, -5])),
      new DenseMatrix([1, 4, 9, 11, 6])
    )
    assert.deepStrictEqual(
      cumsum(math.matrix([1, 3, 5, 2, -5])),
      math.matrix([1, 4, 9, 11, 6])
    )
  })

<<<<<<< HEAD
  it('should return the cumulative sum element from a 2d array', function () {
=======
  it('should return the cumulative sum element from a 2d array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum([
        [1, 4, 7],
        [3, 0, 5],
        [-1, 11, 9]
      ]),
      [
        [1, 4, 7],
        [4, 4, 12],
        [3, 15, 21]
      ]
    )
  })

<<<<<<< HEAD
  it('should return the cumulative sum element from a 2d matrix', function () {
=======
  it('should return the cumulative sum element from a 2d matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum(
        new DenseMatrix([
          [1, 4, 7],
          [3, 0, 5],
          [-1, 11, 9]
        ])
      ),
      new DenseMatrix([
        [1, 4, 7],
        [4, 4, 12],
        [3, 15, 21]
      ])
    )
  })

<<<<<<< HEAD
  it('should return NaN for all values after a NaN', function () {
=======
  it('should return NaN for all values after a NaN', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert(isNaN(cumsum([NaN])[0]))
    assert(!isNaN(cumsum([1, NaN])[0]))
    assert(isNaN(cumsum([1, NaN])[1]))
  })

<<<<<<< HEAD
  it('should throw an error if called with invalid number of arguments', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with invalid number of arguments', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cumsum()
    })
  })

  const inputMatrix = [
    // this is a 4x3x2 matrix, full test coverage
    [
      [10, 20],
      [30, 40],
      [50, 60]
    ],
    [
      [70, 80],
      [90, 100],
      [110, 120]
    ],
    [
      [130, 140],
      [150, 160],
      [170, 180]
    ],
    [
      [190, 200],
      [210, 220],
      [230, 240]
    ]
  ]

<<<<<<< HEAD
  it('should return the sum value along a dimension of a matrix', function () {
=======
  it('should return the sum value along a dimension of a matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      cumsum(
        [
          [2, 6],
          [4, 10]
        ],
        1
      ),
      [
        [2, 8],
        [4, 14]
      ]
    )
    assert.deepStrictEqual(
      cumsum(
        [
          [2, 6],
          [4, 10]
        ],
        0
      ),
      [
        [2, 6],
        [6, 16]
      ]
    )
    assert.deepStrictEqual(cumsum(inputMatrix, 0), [
      [
        [10, 20],
        [80, 100],
        [210, 240],
        [400, 440]
      ],
      [
        [30, 40],
        [120, 140],
        [270, 300],
        [480, 520]
      ],
      [
        [50, 60],
        [160, 180],
        [330, 360],
        [560, 600]
      ]
    ])
    assert.deepStrictEqual(cumsum(inputMatrix, 1), [
      [
        [10, 20],
        [40, 60],
        [90, 120]
      ],
      [
        [70, 80],
        [160, 180],
        [270, 300]
      ],
      [
        [130, 140],
        [280, 300],
        [450, 480]
      ],
      [
        [190, 200],
        [400, 420],
        [630, 660]
      ]
    ])
    assert.deepStrictEqual(cumsum(inputMatrix, 2), [
      [
        [10, 30],
        [30, 70],
        [50, 110]
      ],
      [
        [70, 150],
        [90, 190],
        [110, 230]
      ],
      [
        [130, 270],
        [150, 310],
        [170, 350]
      ],
      [
        [190, 390],
        [210, 430],
        [230, 470]
      ]
    ])
  })

<<<<<<< HEAD
  it('should return zero if called with an empty array', function () {
    assert.deepStrictEqual(cumsum([]), [])
  })

  it('should throw an error if called with invalid dimension', function () {
    assert.throws(function () {
      cumsum([1, 2, 3], 1)
    }, /IndexError: Index out of range \(1 > 0\)/)
    assert.throws(function () {
=======
  it('should return zero if called with an empty array', function (): void {
    assert.deepStrictEqual(cumsum([]), [])
  })

  it('should throw an error if called with invalid dimension', function (): void {
    assert.throws(function (): void {
      cumsum([1, 2, 3], 1)
    }, /IndexError: Index out of range \(1 > 0\)/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cumsum([1, 2, 3], -1)
    }, /IndexError: Index out of range \(-1 < 0\)/)
  })

<<<<<<< HEAD
  it('should throw an error if called with invalid type of arguments', function () {
    assert.throws(function () {
      cumsum(new Date(), 2)
    }, /Cannot calculate cumsum, unexpected type of argument/)
    assert.throws(function () {
      cumsum(2, 3, null)
    }, /Cannot calculate cumsum, unexpected type of argument/)
    assert.throws(function () {
=======
  it('should throw an error if called with invalid type of arguments', function (): void {
    assert.throws(function (): void {
      cumsum(new Date(), 2)
    }, /Cannot calculate cumsum, unexpected type of argument/)
    assert.throws(function (): void {
      cumsum(2, 3, null)
    }, /Cannot calculate cumsum, unexpected type of argument/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      cumsum([2, 3, null])
    }, /Cannot calculate cumsum, unexpected type of argument/)
  })
})

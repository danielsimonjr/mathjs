/**
 * Test for dotMultiply - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
import { approxEqual, approxDeepEqual } from '../../../../../tools/approx.js'
const dotMultiply = math.dotMultiply
const divide = math.divide
const matrix = math.matrix
const sparse = math.sparse
const complex = math.complex
const unit = math.unit

describe('dotMultiply', function (): void {
  it('should multiply 2 numbers', function (): void {
    // number
    approxEqual(dotMultiply(2, 3), 6)
    approxEqual(dotMultiply(-2, 3), -6)
    approxEqual(dotMultiply(-2, -3), 6)
    approxEqual(dotMultiply(5, 0), 0)
    approxEqual(dotMultiply(0, 5), 0)
  })

  it('should multiply booleans', function (): void {
    assert.strictEqual(dotMultiply(true, true), 1)
    assert.strictEqual(dotMultiply(true, false), 0)
    assert.strictEqual(dotMultiply(false, true), 0)
    assert.strictEqual(dotMultiply(false, false), 0)
  })

  it('should multiply mixed numbers and booleans', function (): void {
    assert.strictEqual(dotMultiply(2, true), 2)
    assert.strictEqual(dotMultiply(2, false), 0)
    assert.strictEqual(dotMultiply(true, 2), 2)
    assert.strictEqual(dotMultiply(false, 2), 0)
  })

  it('should multiply 2 complex numbers', function (): void {
    // complex
    approxDeepEqual(dotMultiply(complex(2, 3), 2), complex(4, 6))
    approxDeepEqual(dotMultiply(complex(2, -3), 2), complex(4, -6))
    approxDeepEqual(dotMultiply(complex(0, 1), complex(2, 3)), complex(-3, 2))
    approxDeepEqual(dotMultiply(complex(2, 3), complex(2, 3)), complex(-5, 12))
    approxDeepEqual(dotMultiply(2, complex(2, 3)), complex(4, 6))
    approxDeepEqual(divide(complex(-5, 12), complex(2, 3)), complex(2, 3))
  })

  it('should multiply a unit by a number', function (): void {
    // unit
    assert.strictEqual(dotMultiply(2, unit('5 mm')).toString(), '10 mm')
    assert.strictEqual(dotMultiply(2, unit('5 mm')).toString(), '10 mm')
    assert.strictEqual(dotMultiply(unit('5 mm'), 2).toString(), '10 mm')
    assert.strictEqual(dotMultiply(unit('5 mm'), 0).toString(), '0 mm')
  })

  it('should throw an error with strings', function (): void {
    // string
    assert.throws(function (): void {
      dotMultiply('hello', 'world')
    })
    assert.throws(function (): void {
      dotMultiply('hello', 2)
    })
  })

  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
      dotMultiply(null, 1)
    }, /TypeError: Unexpected type of argument/)
  })

  describe('Array', function (): void {
    const a = [
      [1, 0],
      [3, 4]
    ]
    const b = [
      [5, 6],
      [0, 8]
    ]
    const c = [[5], [6]]
    const d = [[5, 6]]
    const e = [[1, 2, 3]]
    const f = [[1], [2], [3]]

    it('should multiply a all elements in a array by a number', function (): void {
      // matrix, array, range
      approxDeepEqual(dotMultiply(a, 3), [
        [3, 0],
        [9, 12]
      ])
      approxDeepEqual(dotMultiply(3, a), [
        [3, 0],
        [9, 12]
      ])
      approxDeepEqual(dotMultiply([1, 2, 3, 4], 2), [2, 4, 6, 8])
      approxDeepEqual(dotMultiply(2, [1, 2, 3, 4]), [2, 4, 6, 8])
    })

    it('should multiply broadcastable arrays element-wise', function (): void {
      const a2 = [1, 2]
      const a3 = [[3], [4]]
      const a4 = dotMultiply(a2, a3)
      const a5 = dotMultiply(a3, a2)
      assert.deepStrictEqual(a4, [
        [3, 6],
        [4, 8]
      ])
      assert.deepStrictEqual(a5, [
        [3, 6],
        [4, 8]
      ])
    })

    it('should perform element-wise (array .* array) multiplication', function (): void {
      approxDeepEqual(dotMultiply(a, b), [
        [5, 0],
        [0, 32]
      ])
      approxDeepEqual(
        dotMultiply(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [5, 6],
            [7, 8]
          ]
        ),
        [
          [5, 12],
          [21, 32]
        ]
      )
    })

    it('should perform element-wise (array .* dense matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          [
            [1, 2],
            [3, 4]
          ],
          matrix([
            [5, 6],
            [7, 8]
          ])
        ),
        matrix([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should perform element-wise (array .* sparse matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          [
            [1, 2],
            [3, 4]
          ],
          sparse([
            [5, 6],
            [7, 8]
          ])
        ),
        sparse([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should throw an error if arrays are of different not broadcastable sizes', function (): void {
      assert.throws(function (): void {
        dotMultiply(a, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, a)
      })
      assert.throws(function (): void {
        dotMultiply(b, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, b)
      })
      assert.throws(function (): void {
        dotMultiply(d, e)
      })
      assert.throws(function (): void {
        dotMultiply(c, f)
      })
    })
  })

  describe('DenseMatrix', function (): void {
    const a = matrix([
      [1, 0],
      [3, 4]
    ])
    const b = matrix([
      [5, 6],
      [0, 8]
    ])
    const c = matrix([[5], [6]])
    const d = matrix([[5, 6]])
    const e = matrix([[1, 2, 3]])
    const f = matrix([[1], [2], [3]])

    it('should multiply a all elements in a dense matrix by a number', function (): void {
      // matrix, array, range
      approxDeepEqual(
        dotMultiply(a, 3),
        matrix([
          [3, 0],
          [9, 12]
        ])
      )
      approxDeepEqual(
        dotMultiply(3, a),
        matrix([
          [3, 0],
          [9, 12]
        ])
      )
      approxDeepEqual(
        dotMultiply(matrix([1, 2, 3, 4]), 2),
        matrix([2, 4, 6, 8])
      )
      approxDeepEqual(
        dotMultiply(2, matrix([1, 2, 3, 4])),
        matrix([2, 4, 6, 8])
      )
    })

    it('should perform element-wise (dense matrix .* array) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(a, [
          [5, 6],
          [0, 8]
        ]),
        matrix([
          [5, 0],
          [0, 32]
        ])
      )
      approxDeepEqual(
        dotMultiply(
          matrix([
            [1, 2],
            [3, 4]
          ]),
          [
            [5, 6],
            [7, 8]
          ]
        ),
        matrix([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should perform element-wise (dense matrix .* dense matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          matrix([
            [1, 2],
            [3, 4]
          ]),
          matrix([
            [5, 6],
            [7, 8]
          ])
        ),
        matrix([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should perform element-wise (dense matrix .* sparse matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          matrix([
            [1, 2],
            [3, 4]
          ]),
          sparse([
            [5, 6],
            [7, 8]
          ])
        ),
        sparse([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should throw an error if arrays are of different sizes', function (): void {
      assert.throws(function (): void {
        dotMultiply(a, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, a)
      })
      assert.throws(function (): void {
        dotMultiply(b, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, a)
      })
      assert.throws(function (): void {
        dotMultiply(d, e)
      })
      assert.throws(function (): void {
        dotMultiply(c, f)
      })
    })
  })

  describe('SparseMatrix', function (): void {
    const a = sparse([
      [1, 0],
      [3, 4]
    ])
    const b = sparse([
      [5, 6],
      [0, 8]
    ])
    const c = sparse([[5], [6]])
    const d = sparse([[5, 6]])
    const e = sparse([[1, 2, 3]])
    const f = sparse([[5], [6], [7]])

    it('should multiply a all elements in a sparse matrix by a number', function (): void {
      // matrix, array, range
      approxDeepEqual(
        dotMultiply(a, 3),
        sparse([
          [3, 0],
          [9, 12]
        ])
      )
      approxDeepEqual(
        dotMultiply(3, a),
        sparse([
          [3, 0],
          [9, 12]
        ])
      )
      approxDeepEqual(
        dotMultiply(sparse([1, 2, 3, 4]), 2),
        sparse([2, 4, 6, 8])
      )
      approxDeepEqual(
        dotMultiply(2, sparse([1, 2, 3, 4])),
        sparse([2, 4, 6, 8])
      )
    })

    it('should perform element-wise (sparse matrix .* array) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(a, [
          [5, 6],
          [0, 8]
        ]),
        sparse([
          [5, 0],
          [0, 32]
        ])
      )
      approxDeepEqual(
        dotMultiply(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          [
            [5, 6],
            [7, 8]
          ]
        ),
        sparse([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should perform element-wise (sparse matrix .* dense matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          matrix([
            [5, 6],
            [7, 8]
          ])
        ),
        sparse([
          [5, 12],
          [21, 32]
        ])
      )
    })

    it('should perform element-wise (sparse matrix .* sparse matrix) multiplication', function (): void {
      approxDeepEqual(
        dotMultiply(
          sparse([
            [0, 2],
            [3, 4]
          ]),
          sparse([
            [5, 6],
            [0, 8]
          ])
        ),
        sparse([
          [0, 12],
          [0, 32]
        ])
      )
    })

    it('should throw an error if arrays are of different sizes', function (): void {
      assert.throws(function (): void {
        dotMultiply(a, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, a)
      })
      assert.throws(function (): void {
        dotMultiply(b, e)
      })
      assert.throws(function (): void {
        dotMultiply(e, b)
      })
      assert.throws(function (): void {
        dotMultiply(d, e)
      })
      assert.throws(function (): void {
        dotMultiply(c, f)
      })
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      dotMultiply(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      dotMultiply(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should LaTeX dotMultiply', function (): void {
    const expression = math.parse('dotMultiply([1,2],[3,4])')
    assert.strictEqual(
      expression.toTex(),
      '\\left(\\begin{bmatrix}1\\\\2\\end{bmatrix}.\\cdot\\begin{bmatrix}3\\\\4\\end{bmatrix}\\right)'
    )
  })
})

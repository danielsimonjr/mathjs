/**
 * Test for bitXor - AssemblyScript-friendly TypeScript
 */

import assert from 'assert'

import math from '../../../../../src/defaultInstance.ts'
const matrix = math.matrix
const sparse = math.sparse
const bignumber = math.bignumber
const bitXor = math.bitXor

interface MathNode {
  type: string
  toTex(): string
}

describe('bitXor', function (): void {
  it('should xor two numbers', function (): void {
    assert.strictEqual(bitXor(53, 131), 182)
    assert.strictEqual(bitXor(2, 3), 1)
    assert.strictEqual(bitXor(-2, 3), -3)
    assert.strictEqual(bitXor(2, -3), -1)
    assert.strictEqual(bitXor(-5, -3), 6)
  })

  it('should xor two bigints', function (): void {
    assert.strictEqual(bitXor(53n, 131n), 182n)
    assert.strictEqual(bitXor(2n, 3n), 1n)
    assert.strictEqual(bitXor(-2n, 3n), -3n)
    assert.strictEqual(bitXor(2n, -3n), -1n)
    assert.strictEqual(bitXor(-5n, -3n), 6n)
  })

  it('should xor booleans', function (): void {
    assert.strictEqual(bitXor(true, true), 0)
    assert.strictEqual(bitXor(true, false), 1)
    assert.strictEqual(bitXor(false, true), 1)
    assert.strictEqual(bitXor(false, false), 0)
  })

  it('should xor mixed numbers and booleans', function (): void {
    assert.strictEqual(bitXor(0, true), 1)
    assert.strictEqual(bitXor(0, false), 0)
    assert.strictEqual(bitXor(true, 0), 1)
    assert.strictEqual(bitXor(false, 0), 0)
    assert.strictEqual(bitXor(true, 1), 0)
    assert.strictEqual(bitXor(false, 1), 1)
  })

  it('should bitwise xor bignumbers', function (): void {
    assert.deepStrictEqual(bitXor(bignumber(1), bignumber(2)), bignumber(3))
    assert.deepStrictEqual(
      bitXor(bignumber('-1.0e+31'), bignumber('-1.0e+32')),
      bignumber('92546795970570634164073698164736')
    )
    assert.deepStrictEqual(
      bitXor(bignumber('1.0e+31'), bignumber('1.0e+32')),
      bignumber('92546795970570634164077993132032')
    )
    assert.deepStrictEqual(
      bitXor(bignumber('-1.0e+31'), bignumber('1.0e+32')),
      bignumber('-92546795970570634164077993132032')
    )
    assert.deepStrictEqual(
      bitXor(bignumber('1.0e+31'), bignumber('-1.0e+32')),
      bignumber('-92546795970570634164073698164736')
    )
  })

  it('should bitwise xor mixed numbers and bignumbers', function (): void {
    assert.deepStrictEqual(bitXor(bignumber(1), 2), bignumber(3))
    assert.deepStrictEqual(bitXor(1, bignumber(2)), bignumber(3))
    assert.deepStrictEqual(bitXor(bignumber(7), 9), bignumber(14))
    assert.deepStrictEqual(bitXor(7, bignumber(9)), bignumber(14))
  })

  it('should bitwise xor mixed numbers and bigints', function (): void {
    assert.strictEqual(bitXor(53n, 131), 182)
    assert.strictEqual(bitXor(53, 131n), 182)
  })

  it('should bitwise xor mixed booleans and bignumbers', function (): void {
    assert.deepStrictEqual(bitXor(bignumber(1), true), bignumber(0))
    assert.deepStrictEqual(bitXor(bignumber(1), false), bignumber(1))
    assert.deepStrictEqual(bitXor(true, bignumber(3)), bignumber(2))
    assert.deepStrictEqual(bitXor(false, bignumber(3)), bignumber(3))
  })

  it('should throw an error if used with a unit', function (): void {
    assert.throws(function (): void {
      bitXor(math.unit('5cm'), 2)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(2, math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(math.unit('2cm'), math.unit('5cm'))
    }, /TypeError: Unexpected type of argument/)
  })

  it('should throw an error if the parameters are not integers', function (): void {
    assert.throws(function (): void {
      bitXor(1.1, 1)
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(1, 1.1)
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(1.1, 1.1)
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(bignumber(1.1), 1)
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(1, bignumber(1.1))
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(bignumber(1.1), bignumber(1))
    }, /Integers expected in function bitXor/)
    assert.throws(function (): void {
      bitXor(bignumber(1), bignumber(1.1))
    }, /Integers expected in function bitXor/)
  })

  describe('Array', function (): void {
    it('should bitwise xor array - scalar', function (): void {
      assert.deepStrictEqual(bitXor(12, [3, 9]), [15, 5])
      assert.deepStrictEqual(bitXor([3, 9], 12), [15, 5])
    })

    it('should bitwise xor array - array', function (): void {
      assert.deepStrictEqual(
        bitXor(
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
          [4, 4],
          [4, 12]
        ]
      )
    })

    it('should bitwise xor broadcastable arrays', function (): void {
      assert.deepStrictEqual(bitXor([[3, 4]], [[5], [6]]), [
        [6, 1],
        [5, 2]
      ])
      assert.deepStrictEqual(bitXor([[5], [6]], [[2, 3]]), [
        [7, 6],
        [4, 5]
      ])
    })

    it('should bitwise xor array - dense matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
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
          [4, 4],
          [4, 12]
        ])
      )
    })

    it('should bitwise xor array - sparse matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
          [
            [1, 2],
            [3, 4]
          ],
          sparse([
            [5, 6],
            [7, 8]
          ])
        ),
        matrix([
          [4, 4],
          [4, 12]
        ])
      )
    })
  })

  describe('DenseMatrix', function (): void {
    it('should bitwise xor dense matrix - scalar', function (): void {
      assert.deepStrictEqual(bitXor(12, matrix([3, 9])), matrix([15, 5]))
      assert.deepStrictEqual(bitXor(matrix([3, 9]), 12), matrix([15, 5]))
    })

    it('should bitwise xor dense matrix - array', function (): void {
      assert.deepStrictEqual(
        bitXor(
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
          [4, 4],
          [4, 12]
        ])
      )
    })

    it('should bitwise xor dense matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
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
          [4, 4],
          [4, 12]
        ])
      )
    })

    it('should bitwise xor dense matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
          matrix([
            [1, 2],
            [3, 4]
          ]),
          sparse([
            [5, 6],
            [7, 8]
          ])
        ),
        matrix([
          [4, 4],
          [4, 12]
        ])
      )
    })
  })

  describe('SparseMatrix', function (): void {
    it('should bitwise xor sparse matrix - scalar', function (): void {
      assert.deepStrictEqual(
        bitXor(
          12,
          sparse([
            [3, 9],
            [9, 3]
          ])
        ),
        matrix([
          [15, 5],
          [5, 15]
        ])
      )
      assert.deepStrictEqual(
        bitXor(
          sparse([
            [3, 9],
            [9, 3]
          ]),
          12
        ),
        matrix([
          [15, 5],
          [5, 15]
        ])
      )
    })

    it('should bitwise xor sparse matrix - array', function (): void {
      assert.deepStrictEqual(
        bitXor(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          [
            [5, 6],
            [7, 8]
          ]
        ),
        matrix([
          [4, 4],
          [4, 12]
        ])
      )
    })

    it('should bitwise xor sparse matrix - dense matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          matrix([
            [5, 6],
            [7, 8]
          ])
        ),
        matrix([
          [4, 4],
          [4, 12]
        ])
      )
    })

    it('should bitwise xor sparse matrix - sparse matrix', function (): void {
      assert.deepStrictEqual(
        bitXor(
          sparse([
            [1, 2],
            [3, 4]
          ]),
          sparse([
            [5, 6],
            [7, 8]
          ])
        ),
        sparse([
          [4, 4],
          [4, 12]
        ])
      )
    })
  })

  it('should throw an error in case of invalid number of arguments', function (): void {
    assert.throws(function (): void {
      bitXor(1)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      bitXor(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an error in case of invalid type of arguments', function (): void {
    assert.throws(function (): void {
      bitXor(2, null)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(new Date(), true)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(true, new Date())
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(true, undefined)
    }, /TypeError: Unexpected type of argument/)
    assert.throws(function (): void {
      bitXor(undefined, true)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should LaTeX bitXor', function (): void {
    const expression = math.parse('bitXor(2,3)') as MathNode
    assert.strictEqual(expression.toTex(), '\\left(2\\underline{|}3\\right)')
  })
})

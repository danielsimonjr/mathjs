/**
 * Test for nthRoot - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'

import { approxEqual, approxDeepEqual } from '../../../../../tools/approx.js'
import math from '../../../../../src/defaultInstance.ts'

interface MathNode {
  type: string
  toTex(): string
}
const matrix = math.matrix
const sparse = math.sparse
const unit = math.unit
const nthRoot = math.nthRoot
const big = math.bignumber
const complex = math.complex

describe('nthRoot', function (): void {
  it('should return the nthRoot of a boolean value', function (): void {
    assert.strictEqual(nthRoot(true), 1)
    assert.strictEqual(nthRoot(false), 0)
    assert.strictEqual(nthRoot(1, true), 1)
  })

  it('should return the nthRoot for numbers', function (): void {
    approxEqual(nthRoot(4), 2)
    approxEqual(nthRoot(9), 3)
    approxEqual(nthRoot(8, 3), 2)
    approxEqual(nthRoot(64, 3), 4)
    approxEqual(nthRoot(2, 2.5), 1.31950791077289)
    approxEqual(nthRoot(2.5, 2), 1.58113883008419)
    approxEqual(nthRoot(0.1 + 0.2), 0.5477225575051662) // a value containing a round-off error
    approxEqual(nthRoot(0, 3), 0)
    approxEqual(nthRoot(0, 2), 0)
    approxEqual(nthRoot(0.0001, 3), 0.0464158883361278)
  })

  it('should return the nthRoot for very large numbers', function (): void {
    approxEqual(nthRoot(2e150 * 2e150), 2e150)
    approxEqual(nthRoot(Math.pow(2, 1000)), 3.273390607896142e150)
  })

  it('should return the nthRoot for small large numbers', function (): void {
    approxEqual(nthRoot(4e-300), 2e-150)
  })

  it('should return the nthRoot for negative numbers', function (): void {
    approxEqual(nthRoot(-64, 3), -4)
    approxEqual(nthRoot(-8, 3), -2)
    // Newton's method fails in this particular case: --ericman314
    approxEqual(nthRoot(-2, 3), -1.2599210498949)
  })

  it('should return the nthRoot for negative roots', function (): void {
    approxEqual(nthRoot(64, -3), 0.25)
    approxEqual(nthRoot(-64, -3), -0.25)
  })

  it('should return the nthRoot for zero', function (): void {
    assert.strictEqual(nthRoot(0, 2), 0)
    assert.strictEqual(nthRoot(0, -2), Infinity)
  })

  it('should return the nthRoot for infinity', function (): void {
    approxEqual(nthRoot(Infinity, 2), Infinity)
    approxEqual(nthRoot(-Infinity, 3), -Infinity)
    approxEqual(nthRoot(Infinity, -3), 0)
  })

  it('should throw an error when n is zero', function (): void {
    assert.throws(function (): void {
      nthRoot(4, 0)
    }, /Root must be non-zero/)
  })

  it('should throw an error when value is negative and root is even', function (): void {
    assert.throws(function (): void {
      nthRoot(-27, 2)
    }, /Root must be odd when a is negative/)
    assert.throws(function (): void {
      nthRoot(-27, 2.5)
    }, /Root must be odd when a is negative/)
  })

  it('should throw an error if invalid number of arguments', function (): void {
    assert.throws(function (): void {
      nthRoot()
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
      nthRoot(1, 2, 3)
    }, /TypeError: Too many arguments/)
  })

  it('should throw an in case of wrong type of arguments', function (): void {
    assert.throws(function (): void {
      nthRoot(null)
    }, /TypeError: Unexpected type of argument/)
  })

  it('should return the nthRoot of bignumbers', function (): void {
    assert.deepStrictEqual(nthRoot(big(4)), big(2))
    assert.deepStrictEqual(nthRoot(big(9)), big(3))
    assert.deepStrictEqual(nthRoot(big(8), big(3)), big(2))
    assert.deepStrictEqual(nthRoot(big(64), big(3)), big(4))
  })

  it('should return the nthRoot of negative bignumber values', function (): void {
    assert.deepStrictEqual(
      nthRoot(big(-2), big(3)),
      big('-1.259921049894873164767210607278228350570251464701507980081975112')
    )
    assert.deepStrictEqual(nthRoot(big(-64), big(3)), big(-4))
  })

  it('should return the nthRoot of negative bignumber roots', function (): void {
    assert.deepStrictEqual(nthRoot(big(64), big(-3)), big(0.25))
    assert.deepStrictEqual(nthRoot(big(-64), big(3)), big(-4))
    assert.deepStrictEqual(nthRoot(big(-64), big(-3)), big(-0.25))
  })

  it('should return the nthRoot for bignumber zero', function (): void {
    assert.deepStrictEqual(nthRoot(big(0), big(2)).toString(), '0')
    assert.deepStrictEqual(nthRoot(big(0), big(-2)).toString(), 'Infinity')
  })

  it('should return the nthRoot for bignumber infinity', function (): void {
    assert.deepStrictEqual(
      nthRoot(big(Infinity), big(2)).toString(),
      'Infinity'
    )
    assert.deepStrictEqual(
      nthRoot(big(-Infinity), big(3)).toString(),
      '-Infinity'
    )
    assert.deepStrictEqual(nthRoot(big(Infinity), big(-3)), big(0))
  })

  it('should throw an error when used with a complex number', function (): void {
    assert.throws(function (): void {
      nthRoot(complex('-8'), 3)
    })
  })

  it('should throw an error when used with a complex number and root is less than 0', function (): void {
    assert.throws(function (): void {
      nthRoot(complex('-1'), -1)
    })
  })

  it('should throw an error when used with a complex number and root is not an integer', function (): void {
    assert.throws(function (): void {
      nthRoot(complex('-1 + 2i'), 0.5)
    })
  })

  it('should throw an error when used on a unit', function (): void {
    assert.throws(function (): void {
      nthRoot(unit('5cm'))
    })
  })

  it('should throw an error when used on a string', function (): void {
    assert.throws(function (): void {
      nthRoot('text')
    })
  })

  describe('Array', function (): void {
    it('should return the nthRoot for array - scalar', function (): void {
      approxDeepEqual(nthRoot([8, 27, 64], 3), [2, 3, 4])
      approxDeepEqual(nthRoot(64, [2, 3, 8]), [8, 4, 1.68179283050743])
    })

    it('should return the nthRoot for array - array', function (): void {
      approxDeepEqual(
        nthRoot(
          [
            [64, 3125],
            [0, -1]
          ],
          [
            [3, 5],
            [1, 3]
          ]
        ),
        [
          [4, 5],
          [0, -1]
        ]
      )
    })

    it('should return the nthRoot for broadcastable arrays', function (): void {
      approxDeepEqual(nthRoot([64, 3125], [[3], [1]]), [
        [3.9999999999999996, 14.620088691064328],
        [64, 3125]
      ])
      approxDeepEqual(nthRoot([[64], [0]], [3, 5]), [
        [3.9999999999999996, 2.29739670999407],
        [0, 0]
      ])
    })

    it('should return the nthRoot for array - dense matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          [
            [64, 3125],
            [0, -1]
          ],
          matrix([
            [3, 5],
            [1, 3]
          ])
        ),
        matrix([
          [4, 5],
          [0, -1]
        ])
      )
    })

    it('should return the nthRoot for array - sparse matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          [
            [64, 3125],
            [0, -1]
          ],
          sparse([
            [3, 5],
            [1, 3]
          ])
        ),
        matrix([
          [4, 5],
          [0, -1]
        ])
      )
    })
  })

  describe('DenseMatrix', function (): void {
    it('should return the nthRoot for dense matrix - scalar', function (): void {
      approxDeepEqual(nthRoot(matrix([8, 27, 64]), 3), matrix([2, 3, 4]))
      approxDeepEqual(
        nthRoot(64, matrix([2, 3, 8])),
        matrix([8, 4, 1.68179283050743])
      )
    })

    it('should return the nthRoot for dense matrix - array', function (): void {
      approxDeepEqual(
        nthRoot(
          matrix([
            [64, 3125],
            [0, -1]
          ]),
          [
            [3, 5],
            [1, 3]
          ]
        ),
        matrix([
          [4, 5],
          [0, -1]
        ])
      )
    })

    it('should return the nthRoot for dense matrix - dense matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          matrix([
            [64, 3125],
            [0, -1]
          ]),
          matrix([
            [3, 5],
            [1, 3]
          ])
        ),
        matrix([
          [4, 5],
          [0, -1]
        ])
      )
    })

    it('should return the nthRoot for dense matrix - sparse matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          matrix([
            [64, 3125],
            [0, -1]
          ]),
          sparse([
            [3, 5],
            [1, 3]
          ])
        ),
        matrix([
          [4, 5],
          [0, -1]
        ])
      )
    })
  })

  describe('SparseMatrix', function (): void {
    it('should return the nthRoot for sparse matrix - scalar', function (): void {
      approxDeepEqual(
        nthRoot(
          sparse([
            [8, 27],
            [0, 64]
          ]),
          3
        ),
        sparse([
          [2, 3],
          [0, 4]
        ])
      )
      approxDeepEqual(
        nthRoot(
          64,
          sparse([
            [2, 3],
            [1, 8]
          ])
        ),
        sparse([
          [8, 4],
          [64, 1.68179283050743]
        ])
      )
    })

    it('should return the nthRoot for sparse matrix - array', function (): void {
      approxDeepEqual(
        nthRoot(
          sparse([
            [64, 3125],
            [0, -1]
          ]),
          [
            [3, 5],
            [1, 3]
          ]
        ),
        sparse([
          [4, 5],
          [0, -1]
        ])
      )
    })

    it('should return the nthRoot for sparse matrix - dense matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          sparse([
            [64, 3125],
            [0, -1]
          ]),
          matrix([
            [3, 5],
            [1, 3]
          ])
        ),
        sparse([
          [4, 5],
          [0, -1]
        ])
      )
    })

    it('should return the nthRoot for sparse matrix - sparse matrix', function (): void {
      approxDeepEqual(
        nthRoot(
          sparse([
            [64, 3125],
            [0, -1]
          ]),
          sparse([
            [3, 5],
            [1, 3]
          ])
        ),
        sparse([
          [4, 5],
          [0, -1]
        ])
      )
    })
  })

  it('should LaTeX nthRoot', function (): void {
    const expression = math.parse('nthRoot(8,3)')
    assert.strictEqual(expression.toTex(), '\\sqrt[3]{8}')
  })
})

<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for range - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const range = math.range
const matrix = math.matrix
const bignumber = math.bignumber
const unit = math.unit
const evaluate = math.evaluate

<<<<<<< HEAD
describe('range', function () {
  it('should parse a valid string correctly', function () {
=======
interface MathNode {
  type: string
  toTex(): string
}

describe('range', function (): void {
  it('should parse a valid string correctly', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range('1:6'), matrix([1, 2, 3, 4, 5]))
    assert.deepStrictEqual(range('0:2:10'), matrix([0, 2, 4, 6, 8]))
    assert.deepStrictEqual(range('5:-1:0'), matrix([5, 4, 3, 2, 1]))
    assert.deepStrictEqual(range('2:-2:-3'), matrix([2, 0, -2]))
  })

<<<<<<< HEAD
  it('should throw an error in case of invalid string', function () {
    assert.throws(function () {
      range('1:2:6:4')
    }, /is no valid range/)
    assert.throws(function () {
      range('1')
    }, /is no valid range/)
    assert.throws(function () {
      range('1,3:4')
    }, /is no valid range/)
    assert.throws(function () {
      range('1:2,4')
    }, /is no valid range/)
    assert.throws(function () {
=======
  it('should throw an error in case of invalid string', function (): void {
    assert.throws(function (): void {
      range('1:2:6:4')
    }, /is no valid range/)
    assert.throws(function (): void {
      range('1')
    }, /is no valid range/)
    assert.throws(function (): void {
      range('1,3:4')
    }, /is no valid range/)
    assert.throws(function (): void {
      range('1:2,4')
    }, /is no valid range/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range('1:a')
    }, /is no valid range/)
  })

<<<<<<< HEAD
  it('should create a range start:1:end if called with 2 numbers', function () {
=======
  it('should create a range start:1:end if called with 2 numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(3, 6), matrix([3, 4, 5]))
    assert.deepStrictEqual(range(1, 6), matrix([1, 2, 3, 4, 5]))
    assert.deepStrictEqual(range(1, 6.1), matrix([1, 2, 3, 4, 5, 6]))
    assert.deepStrictEqual(range(1, 5.9), matrix([1, 2, 3, 4, 5]))
    assert.deepStrictEqual(range(6, 1), matrix([]))
  })

<<<<<<< HEAD
  it('should create a range start:step:end if called with 3 numbers', function () {
=======
  it('should create a range start:step:end if called with 3 numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(0, 10, 2), matrix([0, 2, 4, 6, 8]))
    assert.deepStrictEqual(range(5, 0, -1), matrix([5, 4, 3, 2, 1]))
    assert.deepStrictEqual(range(2, -4, -2), matrix([2, 0, -2]))
  })

<<<<<<< HEAD
  it('should throw an error when step==0', function () {
    assert.throws(function () {
      range(0, 0, 0)
    }, /Step must be non-zero/)
    assert.throws(function () {
      range(0, 10, 0)
    }, /Step must be non-zero/)
    assert.throws(function () {
=======
  it('should throw an error when step==0', function (): void {
    assert.throws(function (): void {
      range(0, 0, 0)
    }, /Step must be non-zero/)
    assert.throws(function (): void {
      range(0, 10, 0)
    }, /Step must be non-zero/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(0, 10, 0, true)
    }, /Step must be non-zero/)
  })

<<<<<<< HEAD
  it('should create an empty range when start and stop are equal', function () {
=======
  it('should create an empty range when start and stop are equal', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(0, 0), matrix([]))
    assert.deepStrictEqual(range(1, 1, 2), matrix([]))
    assert.deepStrictEqual(range('0:0'), matrix([]))
    assert.deepStrictEqual(range('0:1:0'), matrix([]))
    assert.deepStrictEqual(range('1:2:1'), matrix([]))
    assert.deepStrictEqual(range('1:1:1'), matrix([]))
  })

<<<<<<< HEAD
  it('should create an array with the end value when start and stop are equal and includeEnd=true', function () {
=======
  it('should create an array with the end value when start and stop are equal and includeEnd=true', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(0, 0, true), matrix([0]))
    assert.deepStrictEqual(range(1, 1, 2, true), matrix([1]))
    assert.deepStrictEqual(range('0:0', true), matrix([0]))
    assert.deepStrictEqual(range('1:1:1', true), matrix([1]))
  })

<<<<<<< HEAD
  it('should output an array when setting matrix==="array"', function () {
=======
  it('should output an array when setting matrix==="array"', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const math2 = math.create({
      matrix: 'Array'
    })

    assert.deepStrictEqual(math2.range(0, 10, 2), [0, 2, 4, 6, 8])
    assert.deepStrictEqual(math2.range(5, 0, -1), [5, 4, 3, 2, 1])
  })

<<<<<<< HEAD
  it('should create a range with bigints', function () {
=======
  it('should create a range with bigints', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(1n, 3n), matrix([1n, 2n]))
    assert.deepStrictEqual(range(3n, 1n, -1n), matrix([3n, 2n]))
    assert.deepStrictEqual(range(1n, 3n, true), matrix([1n, 2n, 3n]))
    assert.deepStrictEqual(range(3n, 1n, -1n, true), matrix([3n, 2n, 1n]))
  })

<<<<<<< HEAD
  it('should handle mixed numbers and bigints appropriately', function () {
=======
  it('should handle mixed numbers and bigints appropriately', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(1n, 3), matrix([1n, 2n]))
    assert.deepStrictEqual(range(3, 1n, -1n), matrix([3n, 2n]))
    assert.deepStrictEqual(range(3n, 1, -1), matrix([3n, 2n]))
    assert.deepStrictEqual(range(1, 3n, true), matrix([1n, 2n, 3n]))
    assert.deepStrictEqual(range(3n, 1, -1n, true), matrix([3n, 2n, 1n]))
    assert.deepStrictEqual(range(3, 1n, -1, true), matrix([3n, 2n, 1n]))
    assert.deepStrictEqual(range(1, 5, 2n), matrix([1, 3]))
    assert.deepStrictEqual(range(5, 1, -2n, true), matrix([5, 3, 1]))
  })

<<<<<<< HEAD
  it('should create a range with bignumbers', function () {
=======
  it('should create a range with bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      range(bignumber(1), bignumber(3)),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(bignumber(3), bignumber(1), bignumber(-1)),
      matrix([bignumber(3), bignumber(2)])
    )
  })

<<<<<<< HEAD
  it('should throw an error from bignumbers when step==0', function () {
    assert.throws(function () {
      range(bignumber(0), bignumber(10), bignumber(0))
    }, /Step must be non-zero/)
    assert.throws(function () {
=======
  it('should throw an error from bignumbers when step==0', function (): void {
    assert.throws(function (): void {
      range(bignumber(0), bignumber(10), bignumber(0))
    }, /Step must be non-zero/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(bignumber(0), bignumber(10), bignumber(0), true)
    }, /Step must be non-zero/)
  })

<<<<<<< HEAD
  it('should create a range with mixed numbers and bignumbers', function () {
=======
  it('should create a range with mixed numbers and bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      range(bignumber(1), 3),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(1, bignumber(3)),
      matrix([bignumber(1), bignumber(2)])
    )

    assert.deepStrictEqual(
      range(1, bignumber(3), bignumber(1)),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(bignumber(1), 3, bignumber(1)),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(bignumber(1), bignumber(3), 1),
      matrix([bignumber(1), bignumber(2)])
    )

    assert.deepStrictEqual(
      range(bignumber(1), 3, 1),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(1, bignumber(3), 1),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      range(1, 3, bignumber(1)),
      matrix([bignumber(1), bignumber(2)])
    )
  })

<<<<<<< HEAD
  it('should parse a range with bignumbers', function () {
=======
  it('should parse a range with bignumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const bigmath = math.create({ number: 'BigNumber' })
    const bignumber = bigmath.bignumber
    const matrix = bigmath.matrix
    assert.deepStrictEqual(
      bigmath.range('1:3'),
      matrix([bignumber(1), bignumber(2)])
    )
    assert.deepStrictEqual(
      bigmath.range('3:-1:0'),
      matrix([bignumber(3), bignumber(2), bignumber(1)])
    )
  })

<<<<<<< HEAD
  it('should throw an error when parsing a an invalid string to a bignumber range', function () {
    const bigmath = math.create({ number: 'BigNumber' })
    assert.throws(function () {
=======
  it('should throw an error when parsing a an invalid string to a bignumber range', function (): void {
    const bigmath = math.create({ number: 'BigNumber' })
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      bigmath.range('1:a')
    }, /is no valid range/)
  })

<<<<<<< HEAD
  it('should create a range with units', function () {
=======
  it('should create a range with units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      range(unit(1, 'm'), unit(3, 'm'), unit(1, 'm')),
      matrix([unit(1, 'm'), unit(2, 'm')])
    )
    assert.deepStrictEqual(
      range(unit(3, 'm'), unit(1, 'm'), unit(-1, 'm')),
      matrix([unit(3, 'm'), unit(2, 'm')])
    )
  })

<<<<<<< HEAD
  it('should parse a range with units', function () {
=======
  it('should parse a range with units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(
      evaluate('1m:1m:3m'),
      matrix([unit(1, 'm'), unit(2, 'm'), unit(3, 'm')])
    )
    assert.deepStrictEqual(
      evaluate('3m:-1m:0m'),
      matrix([unit(3, 'm'), unit(2, 'm'), unit(1, 'm'), unit(0, 'm')])
    )
    assert.deepStrictEqual(
      evaluate('range(1m,3m,1m)'),
      matrix([unit(1, 'm'), unit(2, 'm'), unit(3, 'm')])
    )
    assert.deepStrictEqual(
      evaluate('range(3m,0m,-1m)'),
      matrix([unit(3, 'm'), unit(2, 'm'), unit(1, 'm'), unit(0, 'm')])
    )
  })

<<<<<<< HEAD
  it('should gracefully handle round-off errors', function () {
=======
  it('should gracefully handle round-off errors', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.deepStrictEqual(range(1, 2, 0.1, true)._size, [11])
    assert.deepStrictEqual(range(0.1, 0.2, 0.01, true)._size, [11])
    assert.deepStrictEqual(range(1, 5, 0.1)._size, [40])
    assert.deepStrictEqual(range(2, 1, -0.1, true)._size, [11])
    assert.deepStrictEqual(range(5, 1, -0.1)._size, [40])
    assert.deepStrictEqual(
      range(
        -3.2909135802469143,
        3.2909135802469143,
        (3.2909135802469143 + 3.2909135802469143) / 10,
        true
      )._size,
      [11]
    )
    assert.deepStrictEqual(
      range(
        -3.2909135802469143,
        3.2909135802469143,
        (3.2909135802469143 + 3.2909135802469143) / 9,
        true
      )._size,
      [10]
    )
    assert.deepStrictEqual(
      range(
        -3.2909135802469143,
        3.2909135802469143,
        (3.2909135802469143 + 3.2909135802469143) / 10
      )._size,
      [10]
    )
    assert.deepStrictEqual(
      range(
        -3.2909135802469143,
        3.2909135802469143,
        (3.2909135802469143 + 3.2909135802469143) / 9
      )._size,
      [9]
    )
  })

<<<<<<< HEAD
  describe('option includeEnd', function () {
    it('should parse a string and include end', function () {
=======
  describe('option includeEnd', function (): void {
    it('should parse a string and include end', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(range('1:6', false), matrix([1, 2, 3, 4, 5]))
      assert.deepStrictEqual(range('1:2:6', false), matrix([1, 3, 5]))
      assert.deepStrictEqual(range('1:6', true), matrix([1, 2, 3, 4, 5, 6]))
    })

<<<<<<< HEAD
    it('should create a range start:1:end and include end', function () {
=======
    it('should create a range start:1:end and include end', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(range(3, 6, false), matrix([3, 4, 5]))
      assert.deepStrictEqual(range(3, 6, true), matrix([3, 4, 5, 6]))
    })

<<<<<<< HEAD
    it('should create a range start:step:end and include end', function () {
=======
    it('should create a range start:step:end and include end', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(range(0, 10, 2, false), matrix([0, 2, 4, 6, 8]))
      assert.deepStrictEqual(range(0, 10, 2, true), matrix([0, 2, 4, 6, 8, 10]))
    })

<<<<<<< HEAD
    it('should create a range with bignumbers and include end', function () {
=======
    it('should create a range with bignumbers and include end', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      assert.deepStrictEqual(
        range(bignumber(1), bignumber(3), true),
        matrix([bignumber(1), bignumber(2), bignumber(3)])
      )
      assert.deepStrictEqual(
        range(bignumber(3), bignumber(1), bignumber(-1), true),
        matrix([bignumber(3), bignumber(2), bignumber(1)])
      )
    })

<<<<<<< HEAD
    it('should handle Fractions', function () {
=======
    it('should handle Fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const frac = math.fraction
      assert.deepStrictEqual(
        range(frac(1, 3), frac(10, 3)),
        matrix([frac(1, 3), frac(4, 3), frac(7, 3)])
      )
      assert.deepStrictEqual(
        range(frac(1, 3), frac(7, 3), true),
        matrix([frac(1, 3), frac(4, 3), frac(7, 3)])
      )
      assert.deepStrictEqual(
        range(frac(1, 3), frac(4, 3), frac(1, 3)),
        matrix([frac(1, 3), frac(2, 3), frac(1)])
      )
      assert.deepStrictEqual(
        range(frac(1, 3), frac(4, 3), frac(1, 3), true),
        matrix([frac(1, 3), frac(2, 3), frac(1), frac(4, 3)])
      )
    })

<<<<<<< HEAD
    it('should allow mixed number and Fraction', function () {
=======
    it('should allow mixed number and Fraction', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const frac = math.fraction
      assert.deepStrictEqual(
        range(1, frac(10, 3)),
        matrix([frac(1), frac(2), frac(3)])
      )
      assert.deepStrictEqual(
        range(frac(1, 3), 3, true),
        matrix([frac(1, 3), frac(4, 3), frac(7, 3)])
      )
      assert.deepStrictEqual(
        range(frac(1, 3), 2, frac(1, 3)),
        matrix([frac(1, 3), frac(2, 3), frac(1), frac(4, 3), frac(5, 3)])
      )
      assert.deepStrictEqual(
        range(0, frac(4, 3), frac(1, 3), true),
        matrix([frac(0), frac(1, 3), frac(2, 3), frac(1), frac(4, 3)])
      )
    })

<<<<<<< HEAD
    it('should throw an error in case of invalid type of include end', function () {
      assert.throws(function () {
        range(0, 10, 2, 0)
      }, /TypeError: Unexpected type of argument/)
      assert.throws(function () {
        range(0, 10, 2, 1)
      }, /TypeError: Unexpected type of argument/)
      assert.throws(function () {
=======
    it('should throw an error in case of invalid type of include end', function (): void {
      assert.throws(function (): void {
        range(0, 10, 2, 0)
      }, /TypeError: Unexpected type of argument/)
      assert.throws(function (): void {
        range(0, 10, 2, 1)
      }, /TypeError: Unexpected type of argument/)
      assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        range(0, 10, 2, 'str')
      }, /TypeError: Unexpected type of argument/)
    })
  })

<<<<<<< HEAD
  it('should throw an error if called with an invalid string', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with an invalid string', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range('invalid range')
    }, SyntaxError)
  })

<<<<<<< HEAD
  it('should throw an error if called with a single unit value', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a single unit value', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(math.unit('5cm'))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error if called with only two units value', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with only two units value', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(math.unit('0cm'), math.unit('5cm'))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error when called with mismatching units', function () {
=======
  it('should throw an error when called with mismatching units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.throws(
      function () {
        range(math.unit('0cm'), math.unit('2kg'), math.unit('1cm'))
      },
      Error,
      'Cannot compare units with different base'
    )
  })

<<<<<<< HEAD
  it('should throw an error if called with a complex number', function () {
    assert.throws(function () {
=======
  it('should throw an error if called with a complex number', function (): void {
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(math.complex(2, 3))
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error if called with one invalid argument', function () {
    assert.throws(function () {
      range(math.unit('5cm'), 2)
    }, TypeError)
    assert.throws(function () {
      range(2, math.complex(2, 3))
    }, TypeError)
    assert.throws(function () {
      range(2, new Date(), 3)
    }, TypeError)
    assert.throws(function () {
      range(2, 1, math.unit('5cm'))
    }, TypeError)
    assert.throws(function () {
=======
  it('should throw an error if called with one invalid argument', function (): void {
    assert.throws(function (): void {
      range(math.unit('5cm'), 2)
    }, TypeError)
    assert.throws(function (): void {
      range(2, math.complex(2, 3))
    }, TypeError)
    assert.throws(function (): void {
      range(2, new Date(), 3)
    }, TypeError)
    assert.throws(function (): void {
      range(2, 1, math.unit('5cm'))
    }, TypeError)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(math.complex(2, 3), 1, 3)
    }, TypeError)
  })

<<<<<<< HEAD
  it('should throw an error if called with an invalid number of arguments', function () {
    assert.throws(function () {
      range()
    }, /TypeError: Too few arguments/)

    assert.throws(function () {
=======
  it('should throw an error if called with an invalid number of arguments', function (): void {
    assert.throws(function (): void {
      range()
    }, /TypeError: Too few arguments/)

    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(1, 2, 3, true, 5)
    }, /TypeError: Too many arguments/)
  })

<<<<<<< HEAD
  it('should not cast a single number or boolean to string', function () {
    assert.throws(function () {
      range(2)
    }, /TypeError: Too few arguments/)
    assert.throws(function () {
=======
  it('should not cast a single number or boolean to string', function (): void {
    assert.throws(function (): void {
      range(2)
    }, /TypeError: Too few arguments/)
    assert.throws(function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      range(true)
    }, /TypeError: Unexpected type of argument/)
  })

<<<<<<< HEAD
  it('should LaTeX range', function () {
=======
  it('should LaTeX range', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const expression = math.parse('range(1,10)')
    assert.strictEqual(expression.toTex(), '\\mathrm{range}\\left(1,10\\right)')
  })
})

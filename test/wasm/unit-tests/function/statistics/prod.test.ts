/**
 * Test for prod - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const BigNumber = math.BigNumber
const Complex = math.Complex
const DenseMatrix = math.DenseMatrix
const prod = math.prod

interface MathNode {
  type: string
  toTex(): string
}

describe('prod', function (): void {
  it('should return the product of numbers', function (): void {
    assert.strictEqual(prod(5), 5)
    assert.strictEqual(prod(3, 2), 6)
    assert.strictEqual(prod(1, 3, 5, 2), 30)
    assert.strictEqual(prod(1, 3, 0, 2), 0)
    assert.strictEqual(prod(0, 0, 0, 0), 0)
  })

  it('should return the product of big numbers', function (): void {
    assert.deepStrictEqual(
      prod(
        new BigNumber(1),
        new BigNumber(3),
        new BigNumber(5),
        new BigNumber(2)
      ),
      new BigNumber(30)
    )
  })

  it('should return the product of strings (convert them to numbers)', function (): void {
    assert.strictEqual(prod('2', '3'), 6)
    assert.strictEqual(prod('2'), 2)
    assert.strictEqual(
      prod([
        ['1', '3'],
        ['5', '2']
      ]),
      30
    )
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('should return the product of strings (with BigNumber config)', function (): void {
    // TODO: requires math.add to recon with config.number when parsing strings
    const bigmath = math.create({ number: 'BigNumber' })
    assert.deepStrictEqual(
      bigmath.prod('10', '3', '4', '2'),
      bigmath.bignumber('240')
    )
    assert.deepStrictEqual(bigmath.prod('10'), bigmath.bignumber(10))
  })

  // eslint-disable-next-line mocha/no-skipped-tests
  it.skip('should return the product of strings (with bigint config)', function (): void {
    // TODO: requires math.add to recon with config.number when parsing strings
    const bigmath = math.create({ number: 'bigint' })
    assert.strictEqual(bigmath.prod('10', '3', '4', '2'), 240n)
    assert.strictEqual(bigmath.prod('10'), 10n)
    assert.strictEqual(bigmath.prod('2.5'), 2.5) // fallback to number
    assert.strictEqual(bigmath.prod('2.5', '4'), 10) // fallback to number
  })

  it('should return the product of complex numbers', function (): void {
    assert.deepStrictEqual(
      prod(new Complex(2, 3), new Complex(-1, 2)),
      new Complex(-8, 1)
    )
  })

  it('should return the product of mixed numbers and complex numbers', function (): void {
    assert.deepStrictEqual(prod(2, new Complex(2, 3)), new Complex(4, 6))
  })

  it('should return the prod from an array', function (): void {
    assert.strictEqual(prod([1, 3, 5, 2]), 30)
  })

  it('should return the prod from an 1d matrix', function (): void {
    assert.strictEqual(prod(new DenseMatrix([1, 3, 5, 2])), 30)
  })

  it('should return the prod element from a 2d array', function (): void {
    assert.deepStrictEqual(
      prod([
        [1, 7, 2],
        [3, 5, 4]
      ]),
      840
    )
  })

  it('should return the prod element from a 2d matrix', function (): void {
    assert.deepStrictEqual(
      prod(
        new DenseMatrix([
          [1, 7, 2],
          [3, 5, 4]
        ])
      ),
      840
    )
  })

  it('should return NaN if any of the inputs contains NaN', function (): void {
    assert(isNaN(prod([NaN])))
    assert(isNaN(prod([1, NaN])))
    assert(isNaN(prod([NaN, 1])))
    assert(isNaN(prod([1, 3, NaN])))
    assert(isNaN(prod([NaN, NaN, NaN])))
    assert(isNaN(prod(NaN, NaN, NaN)))
  })

  it('should throw an error if called with invalid number of arguments', function (): void {
    assert.throws(function (): void {
      prod()
    })
  })

  it('should throw an error if called with not yet supported argument dim', function (): void {
    assert.throws(function (): void {
      prod([], 2)
    }, /not yet supported/)
  })

  it('should throw an error if called with an empty array', function (): void {
    assert.throws(function (): void {
      prod([])
    })
  })

  it('should throw an error if called with invalid type of arguments', function (): void {
    assert.throws(function (): void {
      prod([[2, undefined, 4]])
    }, /TypeError: Cannot calculate prod, unexpected type of argument/)
    assert.throws(function (): void {
      prod([[2, new Date(), 4]])
    }, /TypeError: Cannot calculate prod, unexpected type of argument/)
    assert.throws(function (): void {
      prod([2, null, 4])
    }, /TypeError: Cannot calculate prod, unexpected type of argument/)
    assert.throws(function (): void {
      prod('a', 'b')
    }, /Error: Cannot convert "a" to a number/)
    assert.throws(function (): void {
      prod('a')
    }, /SyntaxError: String "a" is not a valid number/)
  })

  it('should LaTeX prod', function (): void {
    const expression = math.parse('prod(1,2,3)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{prod}\\left(1,2,3\\right)')
  })
})

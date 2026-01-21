/**
 * Test for nullish - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'
const { sparse, matrix, nullish } = math

describe('nullish', function (): void {
  it('should return right if left nullish', function (): void {
    assert.strictEqual(nullish(null, 42), 42)
    assert.strictEqual(nullish(undefined, 'foo'), 'foo')
    assert.strictEqual(nullish(0, 42), 0)
  })

  it('should short-circuit scalar ?? sparse', function (): void {
    const s = sparse([[1, 0]])
    assert.strictEqual(nullish(5, s), 5)
    assert.strictEqual(nullish(undefined, s), s)
  })

  it('should short-circuit scalar ?? dense', function (): void {
    const d = matrix([
      [1, null],
      [undefined, 4]
    ])
    assert.strictEqual(nullish(5, d), 5)
    assert.strictEqual(nullish(undefined, d), d)
  })

  it('should handle sparse ?? dense efficiently', function (): void {
    const s = sparse([[1, 0]])
    const d = matrix([[10, 20]])
    const res = nullish(s, d)
    assert(res.isSparseMatrix) // but since 0 not nullish, res should have 1 and 0 (but sparse might skip 0)
    assert.deepStrictEqual(res.toArray(), [[1, 0]])
  })

  it('should handle dense ?? scalar element-wise', function (): void {
    const d = matrix([
      [null, 0],
      [undefined, 1]
    ])
    const res = nullish(d, 42)
    assert.deepStrictEqual(res.toArray(), [
      [42, 0],
      [42, 1]
    ])
  })

  it('should allow scalar broadcasting', function (): void {
    assert.strictEqual(nullish(5, [7, 8]), 5)
    assert.deepStrictEqual(nullish(null, [7, 8]), [7, 8])
    assert.deepStrictEqual(nullish([null, undefined], 42), [42, 42])
  })

  describe('nullish with advanced types', function (): void {
    it('should handle Complex numbers', function (): void {
      const zeroComplex = math.complex(0, 0)
      const nonZeroComplex = math.complex(1, 1)
      assert.strictEqual(nullish(null, nonZeroComplex), nonZeroComplex)
      assert.strictEqual(nullish(zeroComplex, nonZeroComplex), zeroComplex) // zero complex is not nullish
      assert.strictEqual(nullish(nonZeroComplex, zeroComplex), nonZeroComplex)
    })

    it('should handle BigNumbers', function (): void {
      const zeroBig = math.bignumber(0)
      const nonZeroBig = math.bignumber(42)
      assert.strictEqual(nullish(null, nonZeroBig), nonZeroBig)
      assert.strictEqual(nullish(zeroBig, nonZeroBig), zeroBig) // zero BigNumber is not nullish
      assert.strictEqual(nullish(nonZeroBig, zeroBig), nonZeroBig)
    })

    it('should handle Fractions', function (): void {
      const zeroFrac = math.fraction(0)
      const nonZeroFrac = math.fraction(3, 4)
      assert.strictEqual(nullish(null, nonZeroFrac), nonZeroFrac)
      assert.strictEqual(nullish(zeroFrac, nonZeroFrac), zeroFrac) // zero Fraction is not nullish
      assert.strictEqual(nullish(nonZeroFrac, zeroFrac), nonZeroFrac)
    })

    it('should handle Units', function (): void {
      const zeroUnit = math.unit(0, 'cm')
      const nonZeroUnit = math.unit(5, 'cm')
      assert.strictEqual(nullish(null, nonZeroUnit), nonZeroUnit)
      assert.strictEqual(nullish(zeroUnit, nonZeroUnit), zeroUnit) // zero Unit is not nullish
      assert.strictEqual(nullish(nonZeroUnit, zeroUnit), nonZeroUnit)
    })
  })

  describe('nullish with n-dimensional matrices', function (): void {
    it('should handle 3D matrices element-wise', function (): void {
      const left = math.matrix([
        [
          [null, 1],
          [undefined, 2]
        ],
        [
          [3, null],
          [4, 5]
        ]
      ])
      const right = math.matrix([
        [
          [10, 20],
          [30, 40]
        ],
        [
          [50, 60],
          [70, 80]
        ]
      ])
      const res = nullish(left, right)
      assert.deepStrictEqual(res.toArray(), [
        [
          [10, 1],
          [30, 2]
        ],
        [
          [3, 60],
          [4, 5]
        ]
      ])
    })
  })

  describe('shape handling and sparse matrices', function (): void {
    it('should throw on mismatched shapes', function (): void {
      assert.throws(function (): void { nullish([1], [7, 8]) }, /Dimension mismatch/)
      assert.throws(function (): void { nullish(matrix([1]), matrix([7, 8])) }, /RangeError/)
      assert.throws(
        function (): void { nullish(sparse([[1]]), matrix([7, 8])) },
        /DimensionError/
      )
    })

    it('should throw on mismatched shapes for sparse ?? dense', function (): void {
      const left = sparse([[1, 0]])
      const right = matrix([7, 8])
      assert.throws(function (): void { nullish(left, right) }, /Dimension mismatch/)
    })

    it('should throw on mismatched shapes for sparse ?? dense with zeros', function (): void {
      const left = sparse([[0, 1]])
      const right = matrix([7, 8])
      assert.throws(function (): void { nullish(left, right) }, /Dimension mismatch/)
    })

    it('should handle sparse with explicit null', function (): void {
      const d = math.matrix([[null, 1]])
      const s = math.sparse([[10, 20]])
      const res = nullish(d, s)
      assert.deepStrictEqual(res.toArray(), [[10, 1]])
    })

    it('should handle explicit null in dense ?? sparse', function (): void {
      const d = math.matrix([[null, 1]])
      const s = math.sparse([[10, 20]])
      const res = nullish(d, s)
      assert.deepStrictEqual(res.toArray(), [[10, 1]])
    })

    it('should throw on broadcastable but mismatched sizes', function (): void {
      assert.throws(function (): void { nullish([1], [7, 8]) }, /Dimension mismatch/)
      assert.throws(
        function (): void { nullish(math.matrix([1]), math.matrix([7, 8])) },
        /Dimension mismatch/
      )
    })

    it('should throw on mismatched shapes for sparse ?? array (no temp conversion)', function (): void {
      const left = sparse([[1, 0]])
      const right = [7, 8, 9]
      assert.throws(function (): void { nullish(left, right) }, /Dimension mismatch/)
    })

    it('should throw on mismatched shapes for sparse ?? sparse', function (): void {
      const left = sparse([[1, 0]]) // 1x2
      const right = sparse([[7], [8]]) // 2x1
      assert.throws(function (): void { nullish(left, right) }, /Dimension mismatch/)
    })

    it('should return left on matching shapes for sparse ?? sparse', function (): void {
      const left = sparse([[1, 0]]) // 1x2
      const right = sparse([[7, 8]]) // 1x2
      const res = nullish(left, right)
      assert(res && res.isSparseMatrix)
      assert.deepStrictEqual(res.toArray(), [[1, 0]])
    })
  })

  describe('result type conventions (function form)', function (): void {
    it('Array, Array -> Array', function (): void {
      const r = nullish([null, 2], [7, 8])
      assert(Array.isArray(r))
      assert.deepStrictEqual(r, [7, 2])
    })

    it('Array, DenseMatrix -> Matrix', function (): void {
      const r = nullish([null, 2], math.matrix([7, 8]))
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [7, 2])
    })

    it('DenseMatrix, Array -> Matrix', function (): void {
      const r = nullish(math.matrix([null, 2]), [7, 8])
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [7, 2])
    })

    it('SparseMatrix, Array -> Matrix (left returned on match)', function (): void {
      const r = nullish(math.sparse([[1, 0]]), [[7, 8]])
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [[1, 0]])
    })

    it('Array, any (scalar) -> Array', function (): void {
      const r = nullish([null, 5], 42)
      assert(Array.isArray(r))
      assert.deepStrictEqual(r, [42, 5])
    })
  })
})

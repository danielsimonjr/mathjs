<<<<<<< HEAD
// @ts-nocheck
=======
/**
 * Test for nullish - AssemblyScript-friendly TypeScript
 */
>>>>>>> claude/review-sprints-quality-checks-Rlfec
import assert from 'assert'
import math from '../../../../src/defaultInstance.ts'
const { sparse, matrix, nullish } = math

<<<<<<< HEAD
describe('nullish', function () {
  it('should return right if left nullish', function () {
=======
describe('nullish', function (): void {
  it('should return right if left nullish', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(nullish(null, 42), 42)
    assert.strictEqual(nullish(undefined, 'foo'), 'foo')
    assert.strictEqual(nullish(0, 42), 0)
  })

<<<<<<< HEAD
  it('should short-circuit scalar ?? sparse', function () {
=======
  it('should short-circuit scalar ?? sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const s = sparse([[1, 0]])
    assert.strictEqual(nullish(5, s), 5)
    assert.strictEqual(nullish(undefined, s), s)
  })

<<<<<<< HEAD
  it('should short-circuit scalar ?? dense', function () {
=======
  it('should short-circuit scalar ?? dense', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const d = matrix([
      [1, null],
      [undefined, 4]
    ])
    assert.strictEqual(nullish(5, d), 5)
    assert.strictEqual(nullish(undefined, d), d)
  })

<<<<<<< HEAD
  it('should handle sparse ?? dense efficiently', function () {
=======
  it('should handle sparse ?? dense efficiently', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    const s = sparse([[1, 0]])
    const d = matrix([[10, 20]])
    const res = nullish(s, d)
    assert(res.isSparseMatrix) // but since 0 not nullish, res should have 1 and 0 (but sparse might skip 0)
    assert.deepStrictEqual(res.toArray(), [[1, 0]])
  })

<<<<<<< HEAD
  it('should handle dense ?? scalar element-wise', function () {
=======
  it('should handle dense ?? scalar element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
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

<<<<<<< HEAD
  it('should allow scalar broadcasting', function () {
=======
  it('should allow scalar broadcasting', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
    assert.strictEqual(nullish(5, [7, 8]), 5)
    assert.deepStrictEqual(nullish(null, [7, 8]), [7, 8])
    assert.deepStrictEqual(nullish([null, undefined], 42), [42, 42])
  })

<<<<<<< HEAD
  describe('nullish with advanced types', function () {
    it('should handle Complex numbers', function () {
=======
  describe('nullish with advanced types', function (): void {
    it('should handle Complex numbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const zeroComplex = math.complex(0, 0)
      const nonZeroComplex = math.complex(1, 1)
      assert.strictEqual(nullish(null, nonZeroComplex), nonZeroComplex)
      assert.strictEqual(nullish(zeroComplex, nonZeroComplex), zeroComplex) // zero complex is not nullish
      assert.strictEqual(nullish(nonZeroComplex, zeroComplex), nonZeroComplex)
    })

<<<<<<< HEAD
    it('should handle BigNumbers', function () {
=======
    it('should handle BigNumbers', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const zeroBig = math.bignumber(0)
      const nonZeroBig = math.bignumber(42)
      assert.strictEqual(nullish(null, nonZeroBig), nonZeroBig)
      assert.strictEqual(nullish(zeroBig, nonZeroBig), zeroBig) // zero BigNumber is not nullish
      assert.strictEqual(nullish(nonZeroBig, zeroBig), nonZeroBig)
    })

<<<<<<< HEAD
    it('should handle Fractions', function () {
=======
    it('should handle Fractions', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const zeroFrac = math.fraction(0)
      const nonZeroFrac = math.fraction(3, 4)
      assert.strictEqual(nullish(null, nonZeroFrac), nonZeroFrac)
      assert.strictEqual(nullish(zeroFrac, nonZeroFrac), zeroFrac) // zero Fraction is not nullish
      assert.strictEqual(nullish(nonZeroFrac, zeroFrac), nonZeroFrac)
    })

<<<<<<< HEAD
    it('should handle Units', function () {
=======
    it('should handle Units', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const zeroUnit = math.unit(0, 'cm')
      const nonZeroUnit = math.unit(5, 'cm')
      assert.strictEqual(nullish(null, nonZeroUnit), nonZeroUnit)
      assert.strictEqual(nullish(zeroUnit, nonZeroUnit), zeroUnit) // zero Unit is not nullish
      assert.strictEqual(nullish(nonZeroUnit, zeroUnit), nonZeroUnit)
    })
  })

<<<<<<< HEAD
  describe('nullish with n-dimensional matrices', function () {
    it('should handle 3D matrices element-wise', function () {
=======
  describe('nullish with n-dimensional matrices', function (): void {
    it('should handle 3D matrices element-wise', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
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

<<<<<<< HEAD
  describe('shape handling and sparse matrices', function () {
    it('should throw on mismatched shapes', function () {
      assert.throws(() => nullish([1], [7, 8]), /Dimension mismatch/)
      assert.throws(() => nullish(matrix([1]), matrix([7, 8])), /RangeError/)
      assert.throws(
        () => nullish(sparse([[1]]), matrix([7, 8])),
=======
  describe('shape handling and sparse matrices', function (): void {
    it('should throw on mismatched shapes', function (): void {
      assert.throws(function (): void { nullish([1], [7, 8]) }, /Dimension mismatch/)
      assert.throws(function (): void { nullish(matrix([1]), matrix([7, 8])) }, /RangeError/)
      assert.throws(
        function (): void { nullish(sparse([[1]]), matrix([7, 8])) },
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        /DimensionError/
      )
    })

<<<<<<< HEAD
    it('should throw on mismatched shapes for sparse ?? dense', function () {
      const left = sparse([[1, 0]])
      const right = matrix([7, 8])
      assert.throws(() => nullish(left, right), /Dimension mismatch/)
    })

    it('should throw on mismatched shapes for sparse ?? dense with zeros', function () {
      const left = sparse([[0, 1]])
      const right = matrix([7, 8])
      assert.throws(() => nullish(left, right), /Dimension mismatch/)
    })

    it('should handle sparse with explicit null', function () {
=======
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
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const d = math.matrix([[null, 1]])
      const s = math.sparse([[10, 20]])
      const res = nullish(d, s)
      assert.deepStrictEqual(res.toArray(), [[10, 1]])
    })

<<<<<<< HEAD
    it('should handle explicit null in dense ?? sparse', function () {
=======
    it('should handle explicit null in dense ?? sparse', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const d = math.matrix([[null, 1]])
      const s = math.sparse([[10, 20]])
      const res = nullish(d, s)
      assert.deepStrictEqual(res.toArray(), [[10, 1]])
    })

<<<<<<< HEAD
    it('should throw on broadcastable but mismatched sizes', function () {
      assert.throws(() => nullish([1], [7, 8]), /Dimension mismatch/)
      assert.throws(
        () => nullish(math.matrix([1]), math.matrix([7, 8])),
=======
    it('should throw on broadcastable but mismatched sizes', function (): void {
      assert.throws(function (): void { nullish([1], [7, 8]) }, /Dimension mismatch/)
      assert.throws(
        function (): void { nullish(math.matrix([1]), math.matrix([7, 8])) },
>>>>>>> claude/review-sprints-quality-checks-Rlfec
        /Dimension mismatch/
      )
    })

<<<<<<< HEAD
    it('should throw on mismatched shapes for sparse ?? array (no temp conversion)', function () {
      const left = sparse([[1, 0]])
      const right = [7, 8, 9]
      assert.throws(() => nullish(left, right), /Dimension mismatch/)
    })

    it('should throw on mismatched shapes for sparse ?? sparse', function () {
      const left = sparse([[1, 0]]) // 1x2
      const right = sparse([[7], [8]]) // 2x1
      assert.throws(() => nullish(left, right), /Dimension mismatch/)
    })

    it('should return left on matching shapes for sparse ?? sparse', function () {
=======
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
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const left = sparse([[1, 0]]) // 1x2
      const right = sparse([[7, 8]]) // 1x2
      const res = nullish(left, right)
      assert(res && res.isSparseMatrix)
      assert.deepStrictEqual(res.toArray(), [[1, 0]])
    })
  })

<<<<<<< HEAD
  describe('result type conventions (function form)', function () {
    it('Array, Array -> Array', function () {
=======
  describe('result type conventions (function form)', function (): void {
    it('Array, Array -> Array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = nullish([null, 2], [7, 8])
      assert(Array.isArray(r))
      assert.deepStrictEqual(r, [7, 2])
    })

<<<<<<< HEAD
    it('Array, DenseMatrix -> Matrix', function () {
=======
    it('Array, DenseMatrix -> Matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = nullish([null, 2], math.matrix([7, 8]))
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [7, 2])
    })

<<<<<<< HEAD
    it('DenseMatrix, Array -> Matrix', function () {
=======
    it('DenseMatrix, Array -> Matrix', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = nullish(math.matrix([null, 2]), [7, 8])
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [7, 2])
    })

<<<<<<< HEAD
    it('SparseMatrix, Array -> Matrix (left returned on match)', function () {
=======
    it('SparseMatrix, Array -> Matrix (left returned on match)', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = nullish(math.sparse([[1, 0]]), [[7, 8]])
      assert.strictEqual(
        !!(r && (r.isMatrix || r.isDenseMatrix || r.isSparseMatrix)),
        true
      )
      assert.deepStrictEqual(r.toArray(), [[1, 0]])
    })

<<<<<<< HEAD
    it('Array, any (scalar) -> Array', function () {
=======
    it('Array, any (scalar) -> Array', function (): void {
>>>>>>> claude/review-sprints-quality-checks-Rlfec
      const r = nullish([null, 5], 42)
      assert(Array.isArray(r))
      assert.deepStrictEqual(r, [42, 5])
    })
  })
})

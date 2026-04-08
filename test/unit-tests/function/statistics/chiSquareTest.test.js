import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createChiSquareTest } from '../../../../src/function/statistics/chiSquareTest.js'

const math = create({ ...all, createChiSquareTest })

describe('chiSquareTest', function () {
  describe('1D goodness-of-fit', function () {
    it('should return chiSquared, pValue, and df', function () {
      const result = math.chiSquareTest([10, 20, 30], [20, 20, 20])
      assert.strictEqual(typeof result.chiSquared, 'number')
      assert.strictEqual(typeof result.pValue, 'number')
      assert.strictEqual(typeof result.df, 'number')
    })

    it('should return chiSquared=0 and pValue=1 when observed equals expected', function () {
      const result = math.chiSquareTest([10, 20, 30], [10, 20, 30])
      assert(Math.abs(result.chiSquared) < 1e-10, `expected chiSquared=0, got ${result.chiSquared}`)
      assert(Math.abs(result.pValue - 1) < 1e-6, `expected pValue=1, got ${result.pValue}`)
    })

    it('should return small pValue for very different distributions', function () {
      const result = math.chiSquareTest([100, 0, 0], [33, 33, 34])
      assert(result.pValue < 0.001, `expected small p-value, got ${result.pValue}`)
    })

    it('should have df = length - 1', function () {
      const result = math.chiSquareTest([10, 20, 30], [20, 20, 20])
      assert.strictEqual(result.df, 2)
    })

    it('should have pValue in [0, 1]', function () {
      const result = math.chiSquareTest([10, 20, 30], [20, 20, 20])
      assert(result.pValue >= 0 && result.pValue <= 1)
    })

    it('should throw for mismatched lengths', function () {
      assert.throws(() => math.chiSquareTest([1, 2], [1, 2, 3]), /same length/)
    })

    it('should throw for non-positive expected values', function () {
      assert.throws(() => math.chiSquareTest([1, 2], [0, 2]), /positive/)
    })

    it('should compute chi-squared correctly', function () {
      // chi2 = (10-20)^2/20 + (20-20)^2/20 + (30-20)^2/20 = 5 + 0 + 5 = 10
      const result = math.chiSquareTest([10, 20, 30], [20, 20, 20])
      assert(Math.abs(result.chiSquared - 10) < 1e-10, `expected chiSquared=10, got ${result.chiSquared}`)
    })
  })

  describe('2D independence test', function () {
    it('should return chiSquared, pValue, and df for 2D input', function () {
      const result = math.chiSquareTest([[10, 20], [30, 40]])
      assert.strictEqual(typeof result.chiSquared, 'number')
      assert.strictEqual(typeof result.pValue, 'number')
      assert.strictEqual(typeof result.df, 'number')
    })

    it('should have df = (rows-1)*(cols-1)', function () {
      const result = math.chiSquareTest([[10, 20], [30, 40]])
      assert.strictEqual(result.df, 1) // (2-1)*(2-1) = 1
    })

    it('should return large pValue for perfectly proportional table', function () {
      // Each row has same proportion: [1,1] each — fully independent
      const result = math.chiSquareTest([[10, 10], [10, 10]])
      assert(result.chiSquared < 1e-10, `expected chiSquared=0, got ${result.chiSquared}`)
      assert(result.pValue > 0.9, `expected large pValue, got ${result.pValue}`)
    })

    it('should return small pValue for highly dependent table', function () {
      const result = math.chiSquareTest([[100, 1], [1, 100]])
      assert(result.pValue < 0.001, `expected small p-value, got ${result.pValue}`)
    })

    it('should have pValue in [0, 1]', function () {
      const result = math.chiSquareTest([[10, 20, 30], [30, 20, 10]])
      assert(result.pValue >= 0 && result.pValue <= 1)
    })

    it('should throw for fewer than 2 rows', function () {
      assert.throws(() => math.chiSquareTest([[1, 2, 3]]), /at least 2 rows/)
    })

    it('should throw for inconsistent row lengths', function () {
      assert.throws(() => math.chiSquareTest([[1, 2], [3, 4, 5]]), /same length/)
    })
  })
})

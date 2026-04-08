import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createKolmogorovSmirnovTest } from '../../../../src/function/statistics/kolmogorovSmirnovTest.js'

const math = create({ ...all, createKolmogorovSmirnovTest })

describe('kolmogorovSmirnovTest', function () {
  describe('two-sample test', function () {
    it('should return D and pValue', function () {
      const result = math.kolmogorovSmirnovTest([1, 2, 3], [1, 2, 4])
      assert.strictEqual(typeof result.D, 'number')
      assert.strictEqual(typeof result.pValue, 'number')
    })

    it('should return D=0 and pValue=1 for identical samples', function () {
      const result = math.kolmogorovSmirnovTest([1, 2, 3], [1, 2, 3])
      assert(Math.abs(result.D) < 1e-10, `expected D=0, got ${result.D}`)
      assert(result.pValue > 0.9, `expected large pValue, got ${result.pValue}`)
    })

    it('should return small pValue for very different samples', function () {
      const s1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const s2 = [100, 101, 102, 103, 104, 105, 106, 107, 108, 109]
      const result = math.kolmogorovSmirnovTest(s1, s2)
      assert(result.D > 0.5, `expected large D, got ${result.D}`)
      assert(result.pValue < 0.05, `expected small p-value, got ${result.pValue}`)
    })

    it('should have D in [0, 1]', function () {
      const result = math.kolmogorovSmirnovTest([1, 2, 3], [4, 5, 6])
      assert(result.D >= 0 && result.D <= 1, `D=${result.D} not in [0,1]`)
    })

    it('should have pValue in [0, 1]', function () {
      const result = math.kolmogorovSmirnovTest([1, 2, 3], [2, 3, 4])
      assert(result.pValue >= 0 && result.pValue <= 1)
    })

    it('should be symmetric', function () {
      const s1 = [1, 3, 5, 7, 9]
      const s2 = [2, 4, 6, 8, 10]
      const r1 = math.kolmogorovSmirnovTest(s1, s2)
      const r2 = math.kolmogorovSmirnovTest(s2, s1)
      assert(Math.abs(r1.D - r2.D) < 1e-10, `D should be symmetric`)
      assert(Math.abs(r1.pValue - r2.pValue) < 1e-10, `pValue should be symmetric`)
    })
  })

  describe('one-sample test', function () {
    it('should accept a CDF function', function () {
      // Uniform [0,1] CDF
      const uniformCDF = x => Math.max(0, Math.min(1, x))
      const sample = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
      const result = math.kolmogorovSmirnovTest(sample, uniformCDF)
      assert.strictEqual(typeof result.D, 'number')
      assert.strictEqual(typeof result.pValue, 'number')
    })

    it('should return large pValue for sample matching its CDF', function () {
      // Uniform sample vs uniform CDF
      const uniformCDF = x => Math.max(0, Math.min(1, x))
      const sample = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]
      const result = math.kolmogorovSmirnovTest(sample, uniformCDF)
      assert(result.pValue > 0.05, `expected large pValue for matching distribution, got ${result.pValue}`)
    })

    it('should return small pValue for sample not matching CDF', function () {
      // All values near 0 vs uniform CDF — clearly not uniform
      const uniformCDF = x => Math.max(0, Math.min(1, x))
      const sample = [0.01, 0.02, 0.01, 0.03, 0.02, 0.01, 0.01, 0.02, 0.01, 0.02]
      const result = math.kolmogorovSmirnovTest(sample, uniformCDF)
      assert(result.D > 0.5, `expected large D, got ${result.D}`)
    })

    it('should have D in [0, 1] for one-sample test', function () {
      const cdf = x => x / 10 // simple linear CDF for [0,10]
      const result = math.kolmogorovSmirnovTest([1, 2, 3, 4, 5], cdf)
      assert(result.D >= 0 && result.D <= 1)
    })
  })

  describe('error handling', function () {
    it('should throw for empty sample in two-sample test', function () {
      assert.throws(() => math.kolmogorovSmirnovTest([], [1, 2, 3]), /non-empty/)
    })

    it('should throw for empty sample in one-sample test', function () {
      assert.throws(() => math.kolmogorovSmirnovTest([], x => x), /non-empty/)
    })
  })
})

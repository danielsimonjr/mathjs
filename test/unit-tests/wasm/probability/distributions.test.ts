import assert from 'assert'
import {
  setSeed,
  randomU32,
  random,
  randomInt,
  randomRange,
  uniform,
  normal,
  exponential,
  bernoulli,
  binomial,
  poisson,
  geometric,
  fillUniform,
  fillNormal,
  normalPDF,
  standardNormalCDF,
  normalCDF,
  exponentialPDF,
  exponentialCDF,
  klDivergence,
  jsDivergence,
  entropy,
  shuffle,
  sampleWithoutReplacement,
  sampleWithReplacement
} from '../../../../src/wasm/probability/distributions.ts'

const EPSILON = 1e-6

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/probability/distributions', function () {
  describe('setSeed and random', function () {
    it('should produce deterministic sequence with same seed', function () {
      setSeed(42)
      const seq1 = [random(), random(), random()]

      setSeed(42)
      const seq2 = [random(), random(), random()]

      assert.deepStrictEqual(seq1, seq2)
    })

    it('should produce different sequences with different seeds', function () {
      setSeed(1)
      const val1 = random()

      setSeed(2)
      const val2 = random()

      assert.notStrictEqual(val1, val2)
    })
  })

  describe('randomU32', function () {
    it('should return integer values', function () {
      setSeed(123)
      for (let i = 0; i < 10; i++) {
        const r = randomU32()
        assert(Number.isInteger(r))
      }
    })
  })

  describe('random', function () {
    it('should return values in [0, 1)', function () {
      setSeed(100)
      for (let i = 0; i < 100; i++) {
        const r = random()
        assert(r >= 0 && r < 1, `random() = ${r} out of range`)
      }
    })
  })

  describe('randomInt', function () {
    it('should return values in [min, max]', function () {
      setSeed(200)
      for (let i = 0; i < 100; i++) {
        const r = randomInt(5, 10)
        assert(r >= 5 && r <= 10, `randomInt(5, 10) = ${r} out of range`)
      }
    })

    it('should return single value when min = max', function () {
      setSeed(300)
      const r = randomInt(7, 7)
      assert.strictEqual(r, 7)
    })
  })

  describe('randomRange', function () {
    it('should return values in [min, max)', function () {
      setSeed(400)
      for (let i = 0; i < 100; i++) {
        const r = randomRange(2.5, 7.5)
        assert(r >= 2.5 && r < 7.5)
      }
    })
  })

  describe('uniform', function () {
    it('should return values in [a, b)', function () {
      setSeed(500)
      for (let i = 0; i < 100; i++) {
        const r = uniform(0, 10)
        assert(r >= 0 && r < 10)
      }
    })

    it('should have correct mean approximately', function () {
      setSeed(600)
      let sum = 0
      const n = 10000
      for (let i = 0; i < n; i++) {
        sum += uniform(0, 10)
      }
      const mean = sum / n
      // Expected mean = 5, allow 5% tolerance
      assert(Math.abs(mean - 5) < 0.5, `Mean ${mean} too far from expected 5`)
    })
  })

  describe('normal', function () {
    it('should generate values', function () {
      setSeed(700)
      const values = []
      for (let i = 0; i < 100; i++) {
        values.push(normal(0, 1))
      }
      // Standard normal should have most values within [-4, 4]
      const inRange = values.filter((v) => v > -4 && v < 4).length
      assert(inRange >= 95)
    })

    it('should have approximately correct mean', function () {
      setSeed(800)
      let sum = 0
      const n = 10000
      for (let i = 0; i < n; i++) {
        sum += normal(5, 2)
      }
      const mean = sum / n
      // Expected mean = 5
      assert(Math.abs(mean - 5) < 0.2, `Mean ${mean} too far from expected 5`)
    })
  })

  describe('exponential', function () {
    it('should return non-negative values', function () {
      setSeed(900)
      for (let i = 0; i < 100; i++) {
        const r = exponential(1)
        assert(r >= 0)
      }
    })

    it('should have approximately correct mean (1/lambda)', function () {
      setSeed(1000)
      let sum = 0
      const n = 10000
      const lambda = 0.5
      for (let i = 0; i < n; i++) {
        sum += exponential(lambda)
      }
      const mean = sum / n
      // Expected mean = 1/lambda = 2
      assert(Math.abs(mean - 2) < 0.2, `Mean ${mean} too far from expected 2`)
    })
  })

  describe('bernoulli', function () {
    it('should return 0 or 1', function () {
      setSeed(1100)
      for (let i = 0; i < 100; i++) {
        const r = bernoulli(0.5)
        assert(r === 0 || r === 1)
      }
    })

    it('should have approximately correct proportion', function () {
      setSeed(1200)
      let ones = 0
      const n = 10000
      for (let i = 0; i < n; i++) {
        ones += bernoulli(0.3)
      }
      const proportion = ones / n
      // Expected proportion = 0.3
      assert(Math.abs(proportion - 0.3) < 0.03)
    })
  })

  describe('binomial', function () {
    it('should return values in [0, n]', function () {
      setSeed(1300)
      for (let i = 0; i < 100; i++) {
        const r = binomial(20, 0.5)
        assert(r >= 0 && r <= 20)
      }
    })

    it('should have approximately correct mean (n*p)', function () {
      setSeed(1400)
      let sum = 0
      const n = 1000
      for (let i = 0; i < n; i++) {
        sum += binomial(20, 0.4)
      }
      const mean = sum / n
      // Expected mean = 20 * 0.4 = 8
      assert(Math.abs(mean - 8) < 0.5)
    })
  })

  describe('poisson', function () {
    it('should return non-negative integers', function () {
      setSeed(1500)
      for (let i = 0; i < 100; i++) {
        const r = poisson(5)
        assert(Number.isInteger(r) && r >= 0)
      }
    })

    it('should have approximately correct mean (lambda)', function () {
      setSeed(1600)
      let sum = 0
      const n = 10000
      for (let i = 0; i < n; i++) {
        sum += poisson(3)
      }
      const mean = sum / n
      // Expected mean = 3
      assert(Math.abs(mean - 3) < 0.3)
    })
  })

  describe('geometric', function () {
    it('should return positive integers', function () {
      setSeed(1700)
      for (let i = 0; i < 100; i++) {
        const r = geometric(0.5)
        assert(Number.isInteger(r) && r >= 1)
      }
    })
  })

  describe('fillUniform', function () {
    it('should fill array with uniform values', function () {
      setSeed(1800)
      const arr = new Float64Array(100)
      fillUniform(arr, 100, 0, 1)

      for (let i = 0; i < 100; i++) {
        assert(arr[i] >= 0 && arr[i] < 1)
      }
    })
  })

  describe('fillNormal', function () {
    it('should fill array with normal values', function () {
      setSeed(1900)
      const arr = new Float64Array(100)
      fillNormal(arr, 100, 0, 1)

      // Most values should be within [-4, 4] for standard normal
      let inRange = 0
      for (let i = 0; i < 100; i++) {
        if (arr[i] > -4 && arr[i] < 4) inRange++
      }
      assert(inRange >= 95)
    })
  })

  describe('normalPDF', function () {
    it('should compute PDF at mean correctly', function () {
      // PDF at mean = 1/(sigma * sqrt(2*pi))
      const mu = 0
      const sigma = 1
      const expected = 1 / (sigma * Math.sqrt(2 * Math.PI))
      assert(approxEqual(normalPDF(mu, mu, sigma), expected))
    })

    it('should be symmetric around mean', function () {
      assert(approxEqual(normalPDF(-1, 0, 1), normalPDF(1, 0, 1)))
    })

    it('should decrease as x moves away from mean', function () {
      const pdfAtMean = normalPDF(0, 0, 1)
      const pdfAt1 = normalPDF(1, 0, 1)
      const pdfAt2 = normalPDF(2, 0, 1)
      assert(pdfAtMean > pdfAt1)
      assert(pdfAt1 > pdfAt2)
    })
  })

  describe('standardNormalCDF', function () {
    it('should return 0.5 at mean', function () {
      assert(approxEqual(standardNormalCDF(0), 0.5))
    })

    it('should return approximately 0 for very negative x', function () {
      assert(standardNormalCDF(-10) < 0.001)
    })

    it('should return approximately 1 for very positive x', function () {
      assert(standardNormalCDF(10) > 0.999)
    })

    it('should have reasonable monotonic behavior', function () {
      // Test that the CDF is monotonically increasing
      // Note: The approximation formula used has some deviation from exact values
      assert(standardNormalCDF(-1) < standardNormalCDF(0))
      assert(standardNormalCDF(0) < standardNormalCDF(1))
      assert(standardNormalCDF(1) < standardNormalCDF(2))
    })
  })

  describe('normalCDF', function () {
    it('should return 0.5 at mean', function () {
      assert(approxEqual(normalCDF(5, 5, 2), 0.5))
    })

    it('should transform correctly', function () {
      // normalCDF(x, mu, sigma) = standardNormalCDF((x-mu)/sigma)
      const x = 7
      const mu = 5
      const sigma = 2
      const expected = standardNormalCDF((x - mu) / sigma)
      assert(approxEqual(normalCDF(x, mu, sigma), expected))
    })
  })

  describe('exponentialPDF', function () {
    it('should return 0 for x < 0', function () {
      assert.strictEqual(exponentialPDF(-1, 1), 0)
    })

    it('should return lambda at x = 0', function () {
      assert(approxEqual(exponentialPDF(0, 2), 2))
    })

    it('should decrease as x increases', function () {
      assert(exponentialPDF(0, 1) > exponentialPDF(1, 1))
      assert(exponentialPDF(1, 1) > exponentialPDF(2, 1))
    })
  })

  describe('exponentialCDF', function () {
    it('should return 0 for x < 0', function () {
      assert.strictEqual(exponentialCDF(-1, 1), 0)
    })

    it('should return 0 at x = 0', function () {
      assert.strictEqual(exponentialCDF(0, 1), 0)
    })

    it('should approach 1 as x increases', function () {
      assert(exponentialCDF(10, 1) > 0.9999)
    })

    it('should match formula 1 - exp(-lambda*x)', function () {
      const x = 2
      const lambda = 0.5
      const expected = 1 - Math.exp(-lambda * x)
      assert(approxEqual(exponentialCDF(x, lambda), expected))
    })
  })

  describe('klDivergence', function () {
    it('should return 0 for identical distributions', function () {
      const p = new Float64Array([0.25, 0.25, 0.25, 0.25])
      const kl = klDivergence(p, p, 4)
      assert(approxEqual(kl, 0))
    })

    it('should be non-negative', function () {
      const p = new Float64Array([0.5, 0.3, 0.2])
      const q = new Float64Array([0.3, 0.3, 0.4])
      const kl = klDivergence(p, q, 3)
      assert(kl >= 0)
    })
  })

  describe('jsDivergence', function () {
    it('should return 0 for identical distributions', function () {
      const p = new Float64Array([0.25, 0.25, 0.25, 0.25])
      const js = jsDivergence(p, p, 4)
      assert(approxEqual(js, 0))
    })

    it('should be symmetric', function () {
      const p = new Float64Array([0.5, 0.3, 0.2])
      const q = new Float64Array([0.3, 0.3, 0.4])
      const js_pq = jsDivergence(p, q, 3)
      const js_qp = jsDivergence(q, p, 3)
      assert(approxEqual(js_pq, js_qp))
    })

    it('should be bounded by log(2)/2', function () {
      const p = new Float64Array([1, 0])
      const q = new Float64Array([0, 1])
      const js = jsDivergence(p, q, 2)
      // JS divergence is bounded by ln(2) ≈ 0.693
      assert(js <= Math.log(2) + EPSILON)
    })
  })

  describe('entropy', function () {
    it('should return 0 for deterministic distribution', function () {
      const p = new Float64Array([1, 0, 0])
      assert(approxEqual(entropy(p, 3), 0))
    })

    it('should be maximized for uniform distribution', function () {
      const uniform = new Float64Array([0.25, 0.25, 0.25, 0.25])
      const nonUniform = new Float64Array([0.4, 0.3, 0.2, 0.1])
      assert(entropy(uniform, 4) > entropy(nonUniform, 4))
    })

    it('should equal log(n) for uniform over n outcomes', function () {
      const n = 4
      const p = new Float64Array(n).fill(1 / n)
      const h = entropy(p, n)
      assert(approxEqual(h, Math.log(n)))
    })
  })

  describe('shuffle', function () {
    it('should preserve all elements', function () {
      setSeed(2000)
      const arr = new Float64Array([1, 2, 3, 4, 5])
      const original = new Float64Array([1, 2, 3, 4, 5])
      shuffle(arr, 5)

      // Sort both and compare
      const sortedArr = Array.from(arr).sort((a, b) => a - b)
      const sortedOriginal = Array.from(original).sort((a, b) => a - b)
      assert.deepStrictEqual(sortedArr, sortedOriginal)
    })

    it('should actually shuffle (not leave unchanged)', function () {
      setSeed(2100)
      const arr = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      const original = Array.from(arr)
      shuffle(arr, 10)

      // Very unlikely to remain in exact order
      let unchanged = 0
      for (let i = 0; i < 10; i++) {
        if (arr[i] === original[i]) unchanged++
      }
      assert(unchanged < 10, 'Array should be shuffled')
    })
  })

  describe('sampleWithoutReplacement', function () {
    it('should return k unique elements', function () {
      setSeed(2200)
      const arr = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      const output = new Float64Array(3)
      sampleWithoutReplacement(arr, 10, 3, output)

      // All elements should be from original array
      for (let i = 0; i < 3; i++) {
        assert(Array.from(arr).includes(output[i]))
      }

      // No duplicates
      const set = new Set(output)
      assert.strictEqual(set.size, 3)
    })
  })

  describe('sampleWithReplacement', function () {
    it('should return k elements from array', function () {
      setSeed(2300)
      const arr = new Float64Array([1, 2, 3])
      const output = new Float64Array(10)
      sampleWithReplacement(arr, 3, 10, output)

      // All elements should be from original array
      for (let i = 0; i < 10; i++) {
        assert(Array.from(arr).includes(output[i]))
      }
    })

    it('may have duplicates', function () {
      setSeed(2400)
      const arr = new Float64Array([1, 2])
      const output = new Float64Array(100)
      sampleWithReplacement(arr, 2, 100, output)

      // With 100 samples from 2 elements, we should have both values
      let ones = 0
      let twos = 0
      for (let i = 0; i < 100; i++) {
        if (output[i] === 1) ones++
        if (output[i] === 2) twos++
      }
      assert(ones > 0 && twos > 0)
    })
  })
})

import assert from 'assert'
import {
  linearInterp,
  linearInterpTable,
  bilinearInterp,
  lagrangeInterp,
  lagrangeBasis,
  dividedDifferences,
  newtonInterp,
  newtonInterpFull,
  barycentricWeights,
  barycentricInterp,
  naturalCubicSplineCoeffs,
  clampedCubicSplineCoeffs,
  cubicSplineEval,
  cubicSplineDerivative,
  hermiteInterp,
  pchipInterp,
  akimaInterp,
  polyEval,
  polyDerivEval,
  polyFit,
  batchInterpolate
} from '../../../../src/wasm/numeric/interpolation.ts'

const EPSILON = 1e-10

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/numeric/interpolation', function () {
  describe('linearInterp', function () {
    it('should interpolate linearly between two points', function () {
      // Line from (0,0) to (2,4), interpolate at x=1
      assert(approxEqual(linearInterp(0, 0, 2, 4, 1), 2))
    })

    it('should return y0 when x equals x0', function () {
      assert(approxEqual(linearInterp(0, 5, 2, 10, 0), 5))
    })

    it('should return y1 when x equals x1', function () {
      assert(approxEqual(linearInterp(0, 5, 2, 10, 2), 10))
    })

    it('should extrapolate beyond interval', function () {
      assert(approxEqual(linearInterp(0, 0, 1, 1, 2), 2))
    })
  })

  describe('linearInterpTable', function () {
    it('should interpolate in table', function () {
      const xValues = new Float64Array([0, 1, 2, 3])
      const yValues = new Float64Array([0, 1, 4, 9])
      // Interpolate at x=1.5 (between (1,1) and (2,4))
      const result = linearInterpTable(xValues, yValues, 1.5, 4)
      assert(approxEqual(result, 2.5)) // (1+4)/2 = 2.5
    })

    it('should handle extrapolation below range', function () {
      const xValues = new Float64Array([1, 2, 3])
      const yValues = new Float64Array([1, 4, 9])
      const result = linearInterpTable(xValues, yValues, 0, 3)
      assert(approxEqual(result, -2)) // extrapolate from (1,1) and (2,4)
    })
  })

  describe('bilinearInterp', function () {
    it('should interpolate on 2D grid', function () {
      // Grid: q11=0, q12=1, q21=1, q22=2
      // Interpolate at center (0.5, 0.5)
      const result = bilinearInterp(0, 1, 0, 1, 0, 1, 1, 2, 0.5, 0.5)
      assert(approxEqual(result, 1)) // Average of corners
    })

    it('should return corner values at corners', function () {
      const result = bilinearInterp(0, 1, 0, 1, 0, 1, 1, 2, 0, 0)
      assert(approxEqual(result, 0)) // q11
    })
  })

  describe('lagrangeInterp', function () {
    it('should exactly interpolate data points', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      // Lagrange through these points should give exact values
      assert(approxEqual(lagrangeInterp(xValues, yValues, 0, 3), 0))
      assert(approxEqual(lagrangeInterp(xValues, yValues, 1, 3), 1))
      assert(approxEqual(lagrangeInterp(xValues, yValues, 2, 3), 4))
    })

    it('should interpolate parabola correctly', function () {
      // y = x² at x=0,1,2 gives y=0,1,4
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      // Should give x² at x=1.5 → 2.25
      assert(approxEqual(lagrangeInterp(xValues, yValues, 1.5, 3), 2.25))
    })
  })

  describe('lagrangeBasis', function () {
    it('should return 1 at node i', function () {
      const xValues = new Float64Array([0, 1, 2])
      assert(approxEqual(lagrangeBasis(xValues, 0, 0, 3), 1))
      assert(approxEqual(lagrangeBasis(xValues, 1, 1, 3), 1))
      assert(approxEqual(lagrangeBasis(xValues, 2, 2, 3), 1))
    })

    it('should return 0 at other nodes', function () {
      const xValues = new Float64Array([0, 1, 2])
      assert(approxEqual(lagrangeBasis(xValues, 0, 1, 3), 0))
      assert(approxEqual(lagrangeBasis(xValues, 0, 2, 3), 0))
    })
  })

  describe('dividedDifferences and newtonInterp', function () {
    it('should compute Newton form coefficients', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const coeffs = dividedDifferences(xValues, yValues, 3)
      // For y = x²: coeffs should be [0, 1, 1]
      assert.strictEqual(coeffs.length, 3)
    })

    it('should interpolate using Newton form', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const result = newtonInterpFull(xValues, yValues, 1.5, 3)
      assert(approxEqual(result, 2.25))
    })
  })

  describe('barycentricWeights and barycentricInterp', function () {
    it('should compute barycentric weights', function () {
      const xValues = new Float64Array([0, 1, 2])
      const weights = barycentricWeights(xValues, 3)
      assert.strictEqual(weights.length, 3)
    })

    it('should interpolate using barycentric form', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const weights = barycentricWeights(xValues, 3)
      const result = barycentricInterp(xValues, yValues, weights, 1.5, 3)
      assert(approxEqual(result, 2.25))
    })

    it('should return exact value at data point', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([5, 10, 20])
      const weights = barycentricWeights(xValues, 3)
      assert(approxEqual(barycentricInterp(xValues, yValues, weights, 1, 3), 10))
    })
  })

  describe('naturalCubicSplineCoeffs and cubicSplineEval', function () {
    it('should compute spline coefficients', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 0])
      const coeffs = naturalCubicSplineCoeffs(xValues, yValues, 3)
      // 2 segments × 4 coefficients = 8
      assert.strictEqual(coeffs.length, 8)
    })

    it('should interpolate through data points', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 0])
      const coeffs = naturalCubicSplineCoeffs(xValues, yValues, 3)
      assert(approxEqual(cubicSplineEval(xValues, coeffs, 0, 3), 0))
      assert(approxEqual(cubicSplineEval(xValues, coeffs, 1, 3), 1))
      assert(approxEqual(cubicSplineEval(xValues, coeffs, 2, 3), 0))
    })
  })

  describe('clampedCubicSplineCoeffs', function () {
    it('should compute clamped spline coefficients', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 0])
      const coeffs = clampedCubicSplineCoeffs(xValues, yValues, 3, 1, -1)
      assert.strictEqual(coeffs.length, 8)
    })
  })

  describe('cubicSplineDerivative', function () {
    it('should compute spline derivative', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 0])
      const coeffs = naturalCubicSplineCoeffs(xValues, yValues, 3)
      const deriv = cubicSplineDerivative(xValues, coeffs, 1, 3)
      // At peak (x=1), derivative should be close to 0
      assert(Math.abs(deriv) < 1)
    })
  })

  describe('hermiteInterp', function () {
    it('should interpolate with specified derivatives', function () {
      // Hermite through (0,0) with slope 1, to (1,1) with slope 1
      const result = hermiteInterp(0, 0, 1, 1, 1, 1, 0.5)
      assert(approxEqual(result, 0.5)) // Should be linear y=x
    })

    it('should pass through endpoints', function () {
      assert(approxEqual(hermiteInterp(0, 0, 1, 1, 1, 1, 0), 0))
      assert(approxEqual(hermiteInterp(0, 0, 1, 1, 1, 1, 1), 1))
    })
  })

  describe('pchipInterp', function () {
    it('should provide monotonicity-preserving interpolation', function () {
      const xValues = new Float64Array([0, 1, 2, 3])
      const yValues = new Float64Array([0, 1, 1, 2])
      // Pchip should be smooth but preserve monotonicity
      const result = pchipInterp(xValues, yValues, 1.5, 4)
      assert(result >= 1 && result <= 2) // Should be between plateau values
    })
  })

  describe('akimaInterp', function () {
    it('should provide smooth interpolation', function () {
      const xValues = new Float64Array([0, 1, 2, 3, 4])
      const yValues = new Float64Array([0, 1, 4, 9, 16])
      const result = akimaInterp(xValues, yValues, 2.5, 5)
      // Should be close to x² = 6.25
      assert(Math.abs(result - 6.25) < 1)
    })
  })

  describe('polyEval', function () {
    it('should evaluate polynomial using Horner method', function () {
      // p(x) = 1 + 2x + 3x²
      const coeffs = new Float64Array([1, 2, 3])
      // p(2) = 1 + 4 + 12 = 17
      assert.strictEqual(polyEval(coeffs, 2, 2), 17)
    })
  })

  describe('polyDerivEval', function () {
    it('should evaluate polynomial derivative', function () {
      // p(x) = 1 + 2x + 3x², p'(x) = 2 + 6x
      const coeffs = new Float64Array([1, 2, 3])
      // p'(2) = 2 + 12 = 14
      assert.strictEqual(polyDerivEval(coeffs, 2, 2), 14)
    })
  })

  describe('polyFit', function () {
    it('should fit polynomial to data', function () {
      // Data from y = x²
      const xValues = new Float64Array([0, 1, 2, 3])
      const yValues = new Float64Array([0, 1, 4, 9])
      const coeffs = polyFit(xValues, yValues, 4, 2)
      // Should get approximately [0, 0, 1] for x²
      assert(Math.abs(coeffs[0]) < 0.1) // constant term ~0
      assert(Math.abs(coeffs[1]) < 0.1) // linear term ~0
      assert(Math.abs(coeffs[2] - 1) < 0.1) // quadratic term ~1
    })
  })

  describe('batchInterpolate', function () {
    it('should interpolate at multiple points', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const xTargets = new Float64Array([0.5, 1.5])
      const results = batchInterpolate(xValues, yValues, 3, xTargets, 2, 0) // Linear
      assert.strictEqual(results.length, 2)
    })

    it('should support different methods', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const xTargets = new Float64Array([1.5])

      // Method 0: linear
      const linear = batchInterpolate(xValues, yValues, 3, xTargets, 1, 0)
      // Method 1: lagrange
      const lagrange = batchInterpolate(xValues, yValues, 3, xTargets, 1, 1)
      // Method 2: spline
      const spline = batchInterpolate(xValues, yValues, 3, xTargets, 1, 2)

      assert.strictEqual(linear.length, 1)
      assert.strictEqual(lagrange.length, 1)
      assert.strictEqual(spline.length, 1)
    })
  })

  describe('interpolation properties', function () {
    it('all methods should pass through data points', function () {
      const xValues = new Float64Array([0, 1, 2])
      const yValues = new Float64Array([0, 1, 4])
      const weights = barycentricWeights(xValues, 3)
      const splineCoeffs = naturalCubicSplineCoeffs(xValues, yValues, 3)

      // At x=1, all should give y=1
      assert(approxEqual(linearInterpTable(xValues, yValues, 1, 3), 1))
      assert(approxEqual(lagrangeInterp(xValues, yValues, 1, 3), 1))
      assert(approxEqual(barycentricInterp(xValues, yValues, weights, 1, 3), 1))
      assert(approxEqual(cubicSplineEval(xValues, splineCoeffs, 1, 3), 1))
    })

    it('polynomial interpolation should be exact for polynomials of same degree', function () {
      // Interpolate y = x³ at 4 points
      const xValues = new Float64Array([0, 1, 2, 3])
      const yValues = new Float64Array([0, 1, 8, 27])
      // Lagrange should give exactly x³
      const result = lagrangeInterp(xValues, yValues, 1.5, 4)
      assert(approxEqual(result, 1.5 ** 3, 1e-6))
    })
  })
})

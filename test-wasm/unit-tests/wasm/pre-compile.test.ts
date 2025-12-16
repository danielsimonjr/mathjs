/**
 * Pre-compilation tests - run AssemblyScript logic WITHOUT WASM compilation
 *
 * This imports AssemblyScript source files directly and executes them
 * as TypeScript, allowing testing before the full WASM build.
 */
import assert from 'assert'
import '../../../test-wasm/assemblyscript-stubs'

// Tolerance for floating point comparisons
const EPSILON = 1e-10

function approxEqual(actual: number, expected: number, tolerance = EPSILON): void {
  const diff = Math.abs(actual - expected)
  assert.ok(
    diff <= tolerance,
    `Expected ${actual} to be approximately equal to ${expected} (diff: ${diff})`
  )
}

describe('Pre-Compilation Tests (Direct AS Import)', function () {
  // ============================================
  // ARITHMETIC OPERATIONS
  // ============================================
  describe('Arithmetic Basic (direct import)', function () {
    it('should import and run basic arithmetic', async function () {
      const arith = await import('../../../src-wasm/arithmetic/basic')

      approxEqual(arith.square(5), 25)
      approxEqual(arith.cube(3), 27)
      approxEqual(arith.cbrt(27), 3)
      approxEqual(arith.unaryMinus(5), -5)
      approxEqual(arith.ceil(4.2), 5)
      approxEqual(arith.floor(4.8), 4)
      approxEqual(arith.round(4.5), 5)

      console.log('  ✓ arithmetic/basic')
    })
  })

  describe('Arithmetic Advanced (direct import)', function () {
    it('should import and run advanced arithmetic', async function () {
      const arith = await import('../../../src-wasm/arithmetic/advanced')

      // Test f64 functions (bigint gcd/lcm have runtime issues)
      approxEqual(arith.mod(10, 3), 1)
      approxEqual(arith.hypot2(3, 4), 5)
      approxEqual(arith.hypot3(1, 2, 2), 3)

      console.log('  ✓ arithmetic/advanced')
    })
  })

  describe('Arithmetic Logarithmic (direct import)', function () {
    it('should import and run logarithmic functions', async function () {
      const arith = await import('../../../src-wasm/arithmetic/logarithmic')

      approxEqual(arith.exp(0), 1)
      approxEqual(arith.exp(1), Math.E, 1e-10)
      approxEqual(arith.log(Math.E), 1, 1e-10)
      approxEqual(arith.log10(100), 2, 1e-10)
      approxEqual(arith.log2(8), 3, 1e-10)

      console.log('  ✓ arithmetic/logarithmic')
    })
  })

  // ============================================
  // BITWISE OPERATIONS
  // ============================================
  describe('Bitwise Operations (direct import)', function () {
    it('should import and run bitwise operations', async function () {
      const bitwise = await import('../../../src-wasm/bitwise/operations')

      assert.strictEqual(bitwise.bitAnd(5, 3), 1) // 101 & 011 = 001
      assert.strictEqual(bitwise.bitOr(5, 3), 7) // 101 | 011 = 111
      assert.strictEqual(bitwise.bitXor(5, 3), 6) // 101 ^ 011 = 110
      assert.strictEqual(bitwise.bitNot(0), -1)
      assert.strictEqual(bitwise.leftShift(1, 4), 16)
      assert.strictEqual(bitwise.rightArithShift(16, 2), 4)
      assert.strictEqual(bitwise.popcount(7), 3) // 111 has 3 bits set

      console.log('  ✓ bitwise/operations')
    })
  })

  // ============================================
  // COMBINATORICS
  // ============================================
  describe('Combinatorics (direct import)', function () {
    it('should import and run combinatorics functions', async function () {
      const comb = await import('../../../src-wasm/combinatorics/basic')

      approxEqual(comb.factorial(5), 120)
      approxEqual(comb.factorial(0), 1)
      approxEqual(comb.permutations(5, 3), 60) // 5!/(5-3)! = 60
      approxEqual(comb.combinations(5, 3), 10) // 5!/(3!*2!) = 10
      approxEqual(comb.stirlingS2(4, 2), 7) // Stirling numbers of second kind
      approxEqual(comb.catalan(5), 42) // Catalan numbers

      console.log('  ✓ combinatorics/basic')
    })
  })

  // ============================================
  // COMPLEX OPERATIONS
  // ============================================
  describe('Complex Operations (direct import)', function () {
    it('should import and run complex operations', async function () {
      const complex = await import('../../../src-wasm/complex/operations')

      approxEqual(complex.arg(1, 0), 0)
      approxEqual(complex.arg(0, 1), Math.PI / 2)
      approxEqual(complex.abs(3, 4), 5)
      assert.strictEqual(complex.re(3, 4), 3)
      assert.strictEqual(complex.im(3, 4), 4)

      console.log('  ✓ complex/operations')
    })
  })

  // ============================================
  // GEOMETRY OPERATIONS
  // ============================================
  describe('Geometry Operations (direct import)', function () {
    it('should import and run geometry operations', async function () {
      const geometry = await import('../../../src-wasm/geometry/operations')

      approxEqual(geometry.distance2D(0, 0, 3, 4), 5)
      approxEqual(geometry.distance3D(0, 0, 0, 1, 2, 2), 3)
      approxEqual(geometry.manhattanDistance2D(0, 0, 3, 4), 7)

      console.log('  ✓ geometry/operations')
    })
  })

  // ============================================
  // LOGICAL OPERATIONS
  // ============================================
  describe('Logical Operations (direct import)', function () {
    it('should import and run logical operations', async function () {
      const logical = await import('../../../src-wasm/logical/operations')

      assert.strictEqual(logical.and(1, 1), 1)
      assert.strictEqual(logical.and(1, 0), 0)
      assert.strictEqual(logical.or(0, 1), 1)
      assert.strictEqual(logical.not(0), 1)
      assert.strictEqual(logical.xor(1, 0), 1)
      assert.strictEqual(logical.nand(1, 1), 0)
      assert.strictEqual(logical.nor(0, 0), 1)

      console.log('  ✓ logical/operations')
    })
  })

  // ============================================
  // MATRIX OPERATIONS
  // ============================================
  describe('Matrix Operations (direct import)', function () {
    it('should import and run matrix multiply', async function () {
      const matrix = await import('../../../src-wasm/matrix/multiply')

      // Test dot product: [1,2,3] · [4,5,6] = 4 + 10 + 18 = 32
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([4, 5, 6])
      approxEqual(matrix.dotProduct(a, b, 3), 32)

      // Test scalar multiply
      const arr = new Float64Array([1, 2, 3])
      const scaled = matrix.scalarMultiply(arr, 2, 3)
      approxEqual(scaled[0], 2)
      approxEqual(scaled[1], 4)
      approxEqual(scaled[2], 6)

      console.log('  ✓ matrix/multiply')
    })
  })

  // ============================================
  // NUMERIC (ODE) OPERATIONS
  // ============================================
  describe('Numeric ODE Operations (direct import)', function () {
    it('should import and run ODE utilities', async function () {
      const ode = await import('../../../src-wasm/numeric/ode')

      // Test vector operations
      const v1 = new Float64Array([1, 2, 3])
      const v2 = new Float64Array([4, 5, 6])

      const sum = ode.vectorAdd(v1, v2, 3)
      approxEqual(sum[0], 5)
      approxEqual(sum[1], 7)
      approxEqual(sum[2], 9)

      const scaled = ode.vectorScale(v1, 2, 3)
      approxEqual(scaled[0], 2)
      approxEqual(scaled[1], 4)
      approxEqual(scaled[2], 6)

      console.log('  ✓ numeric/ode')
    })
  })

  // ============================================
  // RELATIONAL OPERATIONS
  // ============================================
  describe('Relational Operations (direct import)', function () {
    it('should import and run relational operations', async function () {
      const relational = await import('../../../src-wasm/relational/operations')

      assert.strictEqual(relational.compare(5, 3), 1)
      assert.strictEqual(relational.compare(3, 5), -1)
      assert.strictEqual(relational.compare(4, 4), 0)
      assert.strictEqual(relational.equal(5, 5), 1)
      assert.strictEqual(relational.larger(5, 3), 1)
      assert.strictEqual(relational.smaller(3, 5), 1)
      approxEqual(relational.clamp(15, 0, 10), 10)
      approxEqual(relational.clamp(-5, 0, 10), 0)

      console.log('  ✓ relational/operations')
    })
  })

  // ============================================
  // SET OPERATIONS
  // ============================================
  describe('Set Operations (direct import)', function () {
    it('should import and run set operations', async function () {
      const set = await import('../../../src-wasm/set/operations')

      // Test createSet (sorts and removes duplicates)
      const arr = new Float64Array([3, 1, 2, 1, 3])
      const uniqueSet = set.createSet(arr)
      assert.strictEqual(uniqueSet.length, 3)
      assert.strictEqual(uniqueSet[0], 1)
      assert.strictEqual(uniqueSet[1], 2)
      assert.strictEqual(uniqueSet[2], 3)

      // Test union
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([2, 3, 4])
      const union = set.setUnion(a, b)
      assert.strictEqual(union.length, 4)

      // Test intersection
      const intersect = set.setIntersect(a, b)
      assert.strictEqual(intersect.length, 2)

      console.log('  ✓ set/operations')
    })
  })

  // ============================================
  // SIGNAL PROCESSING (FFT)
  // ============================================
  describe('Signal Processing FFT (direct import)', function () {
    it('should import and run signal processing functions', async function () {
      const signal = await import('../../../src-wasm/signal/fft')

      // Test isPowerOf2
      assert.strictEqual(signal.isPowerOf2(8), 1)
      assert.strictEqual(signal.isPowerOf2(16), 1)
      assert.strictEqual(signal.isPowerOf2(7), 0)

      // Test FFT on simple signal (size must be power of 2)
      // Input: [1, 0, 0, 0, 0, 0, 0, 0] (interleaved real, imag)
      const data = new Float64Array([1, 0, 0, 0, 0, 0, 0, 0])
      const result = signal.fft(data, 4, 0)

      // DC component should be 1+0i
      approxEqual(result[0], 1, 1e-10)
      approxEqual(result[1], 0, 1e-10)

      console.log('  ✓ signal/fft')
    })
  })

  // ============================================
  // SPECIAL FUNCTIONS
  // ============================================
  describe('Special Functions (direct import)', function () {
    it('should import and run special functions', async function () {
      const special = await import('../../../src-wasm/special/functions')

      approxEqual(special.erf(0), 0, 1e-7)
      approxEqual(special.gamma(1), 1)
      approxEqual(special.gamma(5), 24, 1e-8)
      approxEqual(special.lgamma(1), 0, 1e-10)

      console.log('  ✓ special/functions')
    })
  })

  // ============================================
  // STATISTICS
  // ============================================
  describe('Statistics (direct import)', function () {
    it('should import and run statistics functions', async function () {
      const stats = await import('../../../src-wasm/statistics/basic')

      const data = new Float64Array([1, 2, 3, 4, 5])

      approxEqual(stats.mean(data, 5), 3)
      approxEqual(stats.sum(data, 5), 15)
      approxEqual(stats.min(data, 5), 1)
      approxEqual(stats.max(data, 5), 5)
      approxEqual(stats.prod(data, 5), 120)

      // Median of [1,2,3,4,5] = 3
      approxEqual(stats.median(data, 5), 3)

      console.log('  ✓ statistics/basic')
    })
  })

  // ============================================
  // STRING OPERATIONS
  // ============================================
  describe('String Operations (direct import)', function () {
    it('should import and run string operations', async function () {
      const str = await import('../../../src-wasm/string/operations')

      assert.strictEqual(str.isDigit(48), 1) // '0'
      assert.strictEqual(str.isDigit(57), 1) // '9'
      assert.strictEqual(str.isDigit(65), 0) // 'A'
      assert.strictEqual(str.isLetter(65), 1) // 'A'
      assert.strictEqual(str.isLetter(97), 1) // 'a'
      assert.strictEqual(str.toLowerCode(65), 97) // 'A' -> 'a'
      assert.strictEqual(str.toUpperCode(97), 65) // 'a' -> 'A'

      console.log('  ✓ string/operations')
    })
  })

  // ============================================
  // TRIGONOMETRY
  // ============================================
  describe('Trigonometry (direct import)', function () {
    it('should import and run trigonometry functions', async function () {
      const trig = await import('../../../src-wasm/trigonometry/basic')

      approxEqual(trig.sin(0), 0)
      approxEqual(trig.sin(Math.PI / 2), 1)
      approxEqual(trig.cos(0), 1)
      approxEqual(trig.cos(Math.PI), -1)
      approxEqual(trig.tan(0), 0)
      approxEqual(trig.atan2(1, 1), Math.PI / 4)
      approxEqual(trig.sinh(0), 0)
      approxEqual(trig.cosh(0), 1)

      console.log('  ✓ trigonometry/basic')
    })
  })

  // ============================================
  // ALGEBRA DECOMPOSITION
  // ============================================
  describe('Algebra Decomposition (direct import)', function () {
    it('should import and run LU decomposition', async function () {
      const decomp = await import('../../../src-wasm/algebra/decomposition')

      // Test LU decomposition on 2x2 matrix
      // A = [4, 3; 6, 3] -> LU decomposition
      const A = new Float64Array([4, 3, 6, 3])
      const result = decomp.luDecomposition(A, 2)
      const lu = decomp.getLUMatrix(result)

      assert.ok(lu.length === 4)
      assert.strictEqual(decomp.isLUSingular(result), false)

      console.log('  ✓ algebra/decomposition')
    })
  })

  // ============================================
  // ALGEBRA SPARSE UTILITIES
  // ============================================
  describe('Algebra Sparse Utilities (direct import)', function () {
    it('should import and run sparse matrix utilities', async function () {
      const sparse = await import('../../../src-wasm/algebra/sparse/utilities')

      // Test csFlip and csUnflip
      assert.strictEqual(sparse.csFlip(0), -2)
      assert.strictEqual(sparse.csFlip(1), -3)
      // Note: csUnflip(-2) returns -0, which equals 0 numerically
      assert.ok(sparse.csUnflip(-2) === 0 || Object.is(sparse.csUnflip(-2), -0))
      assert.strictEqual(sparse.csUnflip(-3), 1)
      assert.strictEqual(sparse.csUnflip(5), 5) // Positive unchanged

      // Test csCumsum
      const p = new Int32Array(4)
      const c = new Int32Array([1, 2, 3])
      const sum = sparse.csCumsum(p, c, 3)
      assert.strictEqual(sum, 6) // 1 + 2 + 3 = 6
      assert.strictEqual(p[0], 0)
      assert.strictEqual(p[1], 1)
      assert.strictEqual(p[2], 3)
      assert.strictEqual(p[3], 6)

      // Test csMarked and csMark
      const w = new Int32Array([1, 2, 3])
      assert.strictEqual(sparse.csMarked(w, 0), false)
      sparse.csMark(w, 0)
      assert.strictEqual(sparse.csMarked(w, 0), true)

      console.log('  ✓ algebra/sparse/utilities')
    })
  })

  // ============================================
  // MATRIX ALGORITHMS
  // ============================================
  describe('Matrix Algorithms (direct import)', function () {
    it('should import and run matrix algorithms', async function () {
      const algo = await import('../../../src-wasm/matrix/algorithms')

      // Test algo01 - Dense-Sparse operation
      const dense = new Float64Array([1, 2, 3, 4])
      const sparseValues = new Float64Array([10])
      const sparseIndex = new Int32Array([0])
      const sparsePtr = new Int32Array([0, 1, 1])
      const result = new Float64Array(4)

      algo.algo01DenseSparseDensity(
        dense, 2, 2,
        sparseValues, sparseIndex, sparsePtr,
        result, 0 // operation: add
      )

      approxEqual(result[0], 11) // 1 + 10
      approxEqual(result[1], 2)  // unchanged
      approxEqual(result[2], 3)  // unchanged
      approxEqual(result[3], 4)  // unchanged

      console.log('  ✓ matrix/algorithms')
    })
  })

  // ============================================
  // PLAIN OPERATIONS
  // ============================================
  describe('Plain Operations (direct import)', function () {
    it('should import and run plain number operations', async function () {
      const plain = await import('../../../src-wasm/plain/operations')

      // Basic arithmetic
      approxEqual(plain.add(2, 3), 5)
      approxEqual(plain.subtract(5, 3), 2)
      approxEqual(plain.multiply(4, 3), 12)
      approxEqual(plain.divide(10, 2), 5)
      approxEqual(plain.abs(-5), 5)
      approxEqual(plain.unaryMinus(5), -5)

      // Powers and roots
      approxEqual(plain.square(4), 16)
      approxEqual(plain.cube(3), 27)
      approxEqual(plain.sqrt(16), 4)
      approxEqual(plain.cbrt(27), 3, 1e-8)
      approxEqual(plain.pow(2, 10), 1024)
      approxEqual(plain.nthRoot(8, 3), 2, 1e-8)

      // Exponential and logarithmic
      approxEqual(plain.exp(0), 1)
      approxEqual(plain.log(Math.E), 1, 1e-10)
      approxEqual(plain.log2(8), 3, 1e-10)
      approxEqual(plain.log10(100), 2, 1e-10)

      // GCD and LCM
      approxEqual(plain.gcd(12, 8), 4)
      approxEqual(plain.lcm(4, 6), 12)

      // Sign and comparisons
      approxEqual(plain.sign(5), 1)
      approxEqual(plain.sign(-5), -1)
      approxEqual(plain.sign(0), 0)

      // Logical
      assert.strictEqual(plain.and(1, 1), true)
      assert.strictEqual(plain.or(0, 1), true)
      assert.strictEqual(plain.not(0), true)

      // Relational
      assert.strictEqual(plain.equal(5, 5), true)
      assert.strictEqual(plain.smaller(3, 5), true)
      assert.strictEqual(plain.larger(5, 3), true)
      assert.strictEqual(plain.compare(5, 3), 1)

      // Bitwise
      assert.strictEqual(plain.bitAnd(5, 3), 1)
      assert.strictEqual(plain.bitOr(5, 3), 7)
      assert.strictEqual(plain.bitXor(5, 3), 6)

      // Trigonometry
      approxEqual(plain.sin(0), 0)
      approxEqual(plain.cos(0), 1)
      approxEqual(plain.tan(0), 0)

      // Gamma function
      approxEqual(plain.gamma(5), 24, 1e-8)
      approxEqual(plain.lgamma(1), 0, 1e-8)

      // Constants
      approxEqual(plain.PI, Math.PI)
      approxEqual(plain.E, Math.E)

      // Utility checks
      assert.strictEqual(plain.isIntegerValue(5), true)
      assert.strictEqual(plain.isIntegerValue(5.5), false)
      assert.strictEqual(plain.isPositive(5), true)
      assert.strictEqual(plain.isNegative(-5), true)
      assert.strictEqual(plain.isZero(0), true)

      console.log('  ✓ plain/operations')
    })
  })

  // ============================================
  // PROBABILITY DISTRIBUTIONS
  // ============================================
  describe('Probability Distributions (direct import)', function () {
    it('should import and run probability distribution functions', async function () {
      const prob = await import('../../../src-wasm/probability/distributions')

      // Test seed setting (deterministic)
      prob.setSeed(12345)

      // Test random number generation exists
      const r1 = prob.random()
      assert.ok(r1 >= 0 && r1 < 1)

      // Test randomInt
      const ri = prob.randomInt(1, 10)
      assert.ok(ri >= 1 && ri <= 10)

      // Test randomRange
      const rr = prob.randomRange(5.0, 10.0)
      assert.ok(rr >= 5.0 && rr < 10.0)

      // Test bernoulli
      prob.setSeed(99999)
      const bern = prob.bernoulli(0.5)
      assert.ok(bern === 0 || bern === 1)

      // Test binomial
      prob.setSeed(12345)
      const bin = prob.binomial(10, 0.5)
      assert.ok(bin >= 0 && bin <= 10)

      // Test normal PDF
      approxEqual(prob.normalPDF(0, 0, 1), 1 / Math.sqrt(2 * Math.PI), 1e-10)

      // Test standard normal CDF
      approxEqual(prob.standardNormalCDF(0), 0.5, 1e-6)

      // Test normal CDF
      approxEqual(prob.normalCDF(0, 0, 1), 0.5, 1e-6)

      // Test exponential PDF
      approxEqual(prob.exponentialPDF(0, 1), 1, 1e-10)
      approxEqual(prob.exponentialPDF(1, 1), Math.exp(-1), 1e-10)

      // Test exponential CDF
      approxEqual(prob.exponentialCDF(0, 1), 0, 1e-10)
      approxEqual(prob.exponentialCDF(1, 1), 1 - Math.exp(-1), 1e-10)

      // Test KL divergence
      const p = new Float64Array([0.5, 0.5])
      const q = new Float64Array([0.25, 0.75])
      const kl = prob.klDivergence(p, q, 2)
      assert.ok(kl > 0) // KL divergence is always non-negative

      // Test entropy
      const uniform = new Float64Array([0.25, 0.25, 0.25, 0.25])
      const ent = prob.entropy(uniform, 4)
      approxEqual(ent, Math.log(4), 1e-10) // Uniform has max entropy

      console.log('  ✓ probability/distributions')
    })
  })

  // ============================================
  // UTILS/CHECKS
  // ============================================
  describe('Utils Checks (direct import)', function () {
    it('should import and run utility check functions', async function () {
      const checks = await import('../../../src-wasm/utils/checks')

      // Test isNaN
      assert.strictEqual(checks.isNaN(NaN), 1)
      assert.strictEqual(checks.isNaN(5), 0)

      // Test isFinite
      assert.strictEqual(checks.isFinite(5), 1)
      assert.strictEqual(checks.isFinite(Infinity), 0)
      assert.strictEqual(checks.isFinite(NaN), 0)

      // Test isInteger
      assert.strictEqual(checks.isInteger(5), 1)
      assert.strictEqual(checks.isInteger(5.5), 0)

      // Test isPositive/isNegative/isZero
      assert.strictEqual(checks.isPositive(5), 1)
      assert.strictEqual(checks.isPositive(-5), 0)
      assert.strictEqual(checks.isNegative(-5), 1)
      assert.strictEqual(checks.isNegative(5), 0)
      assert.strictEqual(checks.isZero(0), 1)
      assert.strictEqual(checks.isZero(5), 0)

      // Test isPrimeF64 (using f64 version which works in JS)
      assert.strictEqual(checks.isPrimeF64(2), 1)
      assert.strictEqual(checks.isPrimeF64(3), 1)
      assert.strictEqual(checks.isPrimeF64(4), 0)
      assert.strictEqual(checks.isPrimeF64(17), 1)
      assert.strictEqual(checks.isPrimeF64(1), 0)

      // Test isPrimeF64
      assert.strictEqual(checks.isPrimeF64(7), 1)
      assert.strictEqual(checks.isPrimeF64(8), 0)
      assert.strictEqual(checks.isPrimeF64(7.5), 0) // Non-integer

      // Test isEven/isOdd
      assert.strictEqual(checks.isEven(4), 1)
      assert.strictEqual(checks.isEven(5), 0)
      assert.strictEqual(checks.isOdd(5), 1)
      assert.strictEqual(checks.isOdd(4), 0)

      // Test isBounded
      assert.strictEqual(checks.isBounded(5, 0, 10), 1)
      assert.strictEqual(checks.isBounded(15, 0, 10), 0)

      // Test isPerfectSquare (requires i64 in AS, skip in JS pre-compile)
      // These functions use i64 which needs BigInt in JavaScript
      // Skip these tests in pre-compile mode

      // Test gcd and lcm (requires i64 in AS, skip in JS pre-compile)
      // Using regular numbers won't work due to type constraints

      // Test sign
      approxEqual(checks.sign(5), 1)
      approxEqual(checks.sign(-5), -1)
      approxEqual(checks.sign(0), 0)

      // Test array checks
      const data = new Float64Array([1, 2, 3, 4, 5])
      assert.strictEqual(checks.allFinite(data, 5), 1)
      assert.strictEqual(checks.anyNaN(data, 5), 0)
      assert.strictEqual(checks.allPositive(data, 5), 1)
      assert.strictEqual(checks.allIntegers(data, 5), 1)

      console.log('  ✓ utils/checks')
    })
  })

  // ============================================
  // ALGEBRA SOLVER (Triangular Systems)
  // ============================================
  describe('Algebra Solver (direct import)', function () {
    it('should import and run triangular solver functions', async function () {
      const solver = await import('../../../src-wasm/algebra/solver')

      // Test lsolve: L * x = b where L is lower triangular
      // L = [2, 0; 3, 4], b = [4, 11]
      // x = [2, 1.25] because 2*2 = 4, 3*2 + 4*1.25 = 6 + 5 = 11
      const L = new Float64Array([2, 0, 3, 4])
      const b = new Float64Array([4, 11])
      const x = solver.lsolve(L, b, 2)
      approxEqual(x[0], 2)
      approxEqual(x[1], 1.25)

      // Test usolve: U * x = b where U is upper triangular
      // U = [2, 3; 0, 4], b = [11, 4]
      // x = [4, 1] because 2*4 + 3*1 = 11, 4*1 = 4
      const U = new Float64Array([2, 3, 0, 4])
      const b2 = new Float64Array([11, 4])
      const x2 = solver.usolve(U, b2, 2)
      approxEqual(x2[0], 4)
      approxEqual(x2[1], 1)

      // Test lsolveHasSolution
      assert.strictEqual(solver.lsolveHasSolution(L, 2), 1)
      const singularL = new Float64Array([0, 0, 3, 4])
      assert.strictEqual(solver.lsolveHasSolution(singularL, 2), 0)

      // Test usolveHasSolution
      assert.strictEqual(solver.usolveHasSolution(U, 2), 1)

      // Test triangularDeterminant
      approxEqual(solver.triangularDeterminant(L, 2), 8) // 2 * 4 = 8

      // Test solveTridiagonal
      // Tridiagonal system: -x[i-1] + 2*x[i] - x[i+1] = RHS
      const a = new Float64Array([0, -1, -1]) // sub-diagonal
      const diag = new Float64Array([2, 2, 2]) // main diagonal
      const c = new Float64Array([-1, -1, 0]) // super-diagonal
      const d = new Float64Array([1, 0, 1]) // RHS
      const tri = solver.solveTridiagonal(a, diag, c, d, 3)
      // Verify Ax = d
      const Ax0 = 2 * tri[0] - tri[1]
      const Ax1 = -tri[0] + 2 * tri[1] - tri[2]
      const Ax2 = -tri[1] + 2 * tri[2]
      approxEqual(Ax0, 1, 1e-8)
      approxEqual(Ax1, 0, 1e-8)
      approxEqual(Ax2, 1, 1e-8)

      console.log('  ✓ algebra/solver')
    })
  })

  // ============================================
  // SIGNAL PROCESSING (freqz, zpk2tf)
  // ============================================
  describe('Signal Processing Functions (direct import)', function () {
    it('should import and run signal processing functions', async function () {
      const signal = await import('../../../src-wasm/signal/processing')

      // Test freqzUniform - frequency response of simple filter
      // Simple moving average filter: b = [0.5, 0.5], a = [1]
      const b = new Float64Array([0.5, 0.5])
      const a = new Float64Array([1])
      const freqResult = signal.freqzUniform(b, 2, a, 1, 5)

      const hReal = signal.getFreqzReal(freqResult)
      const hImag = signal.getFreqzImag(freqResult)

      // At DC (w=0), H = 1 (sum of b coefficients / sum of a)
      approxEqual(hReal[0], 1.0, 1e-8)
      approxEqual(hImag[0], 0.0, 1e-8)

      // Test magnitude computation
      const mag = signal.magnitude(hReal, hImag, 5)
      approxEqual(mag[0], 1.0, 1e-8)

      // Test phase computation
      const ph = signal.phase(hReal, hImag, 5)
      approxEqual(ph[0], 0.0, 1e-8) // Phase at DC is 0

      // Test polynomial multiply
      // (1 + x) * (1 - x) = 1 - x^2
      const p1Real = new Float64Array([1, 1])
      const p1Imag = new Float64Array([0, 0])
      const p2Real = new Float64Array([1, -1])
      const p2Imag = new Float64Array([0, 0])

      const polyResult = signal.polyMultiply(p1Real, p1Imag, 2, p2Real, p2Imag, 2)
      const resultReal = signal.getPolyReal(polyResult)
      const resultImag = signal.getPolyImag(polyResult)

      approxEqual(resultReal[0], 1.0, 1e-10)  // constant term
      approxEqual(resultReal[1], 0.0, 1e-10)  // x term (cancels)
      approxEqual(resultReal[2], -1.0, 1e-10) // x^2 term

      console.log('  ✓ signal/processing')
    })
  })

  // ============================================
  // MATRIX BASIC OPERATIONS
  // ============================================
  describe('Matrix Basic Operations (direct import)', function () {
    it('should import and run matrix creation functions', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      // Test zeros
      const z = matrix.zeros(2, 3)
      assert.strictEqual(z.length, 6)
      assert.strictEqual(z[0], 0)
      assert.strictEqual(z[5], 0)

      // Test ones
      const o = matrix.ones(2, 3)
      assert.strictEqual(o.length, 6)
      assert.strictEqual(o[0], 1)
      assert.strictEqual(o[5], 1)

      // Test identity
      const id = matrix.identity(3)
      assert.strictEqual(id.length, 9)
      approxEqual(id[0], 1) // (0,0)
      approxEqual(id[4], 1) // (1,1)
      approxEqual(id[8], 1) // (2,2)
      approxEqual(id[1], 0) // (0,1)
      approxEqual(id[3], 0) // (1,0)

      // Test fill
      const f = matrix.fill(2, 2, 5.0)
      assert.strictEqual(f.length, 4)
      approxEqual(f[0], 5)
      approxEqual(f[3], 5)

      // Test diagFromVector
      const dv = new Float64Array([1, 2, 3])
      const dm = matrix.diagFromVector(dv, 3)
      approxEqual(dm[0], 1) // (0,0)
      approxEqual(dm[4], 2) // (1,1)
      approxEqual(dm[8], 3) // (2,2)
      approxEqual(dm[1], 0) // off-diagonal

      console.log('  ✓ matrix/basic (creation)')
    })

    it('should import and run diagonal operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      // Test matrix: [[1,2,3],[4,5,6],[7,8,9]]
      const a = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9])

      // Test diag (extract main diagonal)
      const d = matrix.diag(a, 3, 3)
      assert.strictEqual(d.length, 3)
      approxEqual(d[0], 1)
      approxEqual(d[1], 5)
      approxEqual(d[2], 9)

      // Test trace
      approxEqual(matrix.trace(a, 3), 15) // 1 + 5 + 9

      // Test traceRect on non-square
      const rect = new Float64Array([1, 2, 3, 4, 5, 6]) // 2x3
      approxEqual(matrix.traceRect(rect, 2, 3), 6) // 1 + 5

      // Test diagK (upper diagonal k=1)
      const d1 = matrix.diagK(a, 3, 3, 1)
      assert.strictEqual(d1.length, 2)
      approxEqual(d1[0], 2) // (0,1)
      approxEqual(d1[1], 6) // (1,2)

      // Test diagK (lower diagonal k=-1)
      const dm1 = matrix.diagK(a, 3, 3, -1)
      assert.strictEqual(dm1.length, 2)
      approxEqual(dm1[0], 4) // (1,0)
      approxEqual(dm1[1], 8) // (2,1)

      console.log('  ✓ matrix/basic (diagonal)')
    })

    it('should import and run reshape operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      const a = new Float64Array([1, 2, 3, 4, 5, 6])

      // Test flatten (copy)
      const flat = matrix.flatten(a, 6)
      assert.strictEqual(flat.length, 6)
      approxEqual(flat[0], 1)
      approxEqual(flat[5], 6)

      // Test reshape 2x3 -> 3x2
      const reshaped = matrix.reshape(a, 2, 3, 3, 2)
      assert.strictEqual(reshaped.length, 6)
      approxEqual(reshaped[0], 1)
      approxEqual(reshaped[5], 6)

      // Test reshape with invalid size (should return empty)
      const invalid = matrix.reshape(a, 2, 3, 2, 2)
      assert.strictEqual(invalid.length, 0)

      // Test clone
      const c = matrix.clone(a, 6)
      assert.strictEqual(c.length, 6)
      approxEqual(c[0], 1)

      console.log('  ✓ matrix/basic (reshape)')
    })

    it('should import and run row/column operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      // 2x3 matrix: [[1,2,3],[4,5,6]]
      const a = new Float64Array([1, 2, 3, 4, 5, 6])

      // Test getRow
      const row0 = matrix.getRow(a, 3, 0)
      assert.strictEqual(row0.length, 3)
      approxEqual(row0[0], 1)
      approxEqual(row0[1], 2)
      approxEqual(row0[2], 3)

      const row1 = matrix.getRow(a, 3, 1)
      approxEqual(row1[0], 4)

      // Test getColumn
      const col1 = matrix.getColumn(a, 2, 3, 1)
      assert.strictEqual(col1.length, 2)
      approxEqual(col1[0], 2)
      approxEqual(col1[1], 5)

      // Test swapRows
      const b = new Float64Array([1, 2, 3, 4, 5, 6])
      matrix.swapRows(b, 3, 0, 1)
      approxEqual(b[0], 4) // Row 1 is now first
      approxEqual(b[3], 1) // Row 0 is now second

      console.log('  ✓ matrix/basic (row/column)')
    })

    it('should import and run element-wise operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([2, 2, 2, 2])

      // Test dotMultiply
      const dm = matrix.dotMultiply(a, b, 4)
      approxEqual(dm[0], 2)
      approxEqual(dm[1], 4)
      approxEqual(dm[2], 6)
      approxEqual(dm[3], 8)

      // Test dotDivide
      const dd = matrix.dotDivide(a, b, 4)
      approxEqual(dd[0], 0.5)
      approxEqual(dd[1], 1)
      approxEqual(dd[2], 1.5)
      approxEqual(dd[3], 2)

      // Test dotPow
      const dp = matrix.dotPow(a, b, 4)
      approxEqual(dp[0], 1)  // 1^2
      approxEqual(dp[1], 4)  // 2^2
      approxEqual(dp[2], 9)  // 3^2
      approxEqual(dp[3], 16) // 4^2

      // Test abs
      const neg = new Float64Array([-1, 2, -3, 4])
      const absVal = matrix.abs(neg, 4)
      approxEqual(absVal[0], 1)
      approxEqual(absVal[2], 3)

      // Test sqrt
      const sqrtVal = matrix.sqrt(dp, 4)
      approxEqual(sqrtVal[0], 1)
      approxEqual(sqrtVal[1], 2)
      approxEqual(sqrtVal[2], 3)
      approxEqual(sqrtVal[3], 4)

      // Test square
      const sq = matrix.square(a, 4)
      approxEqual(sq[0], 1)
      approxEqual(sq[1], 4)
      approxEqual(sq[2], 9)
      approxEqual(sq[3], 16)

      console.log('  ✓ matrix/basic (element-wise)')
    })

    it('should import and run reduction operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      const a = new Float64Array([1, 2, 3, 4, 5, 6])

      // Test sum
      approxEqual(matrix.sum(a, 6), 21)

      // Test prod
      approxEqual(matrix.prod(a, 6), 720)

      // Test min/max
      approxEqual(matrix.min(a, 6), 1)
      approxEqual(matrix.max(a, 6), 6)

      // Test argmin/argmax
      assert.strictEqual(matrix.argmin(a, 6), 0)
      assert.strictEqual(matrix.argmax(a, 6), 5)

      // Test countNonZero
      const withZeros = new Float64Array([0, 1, 0, 2, 3, 0])
      assert.strictEqual(matrix.countNonZero(withZeros, 6), 3)

      // Test sumRows on 2x3 matrix
      const sumR = matrix.sumRows(a, 2, 3)
      approxEqual(sumR[0], 6)  // 1+2+3
      approxEqual(sumR[1], 15) // 4+5+6

      // Test sumCols on 2x3 matrix
      const sumC = matrix.sumCols(a, 2, 3)
      approxEqual(sumC[0], 5)  // 1+4
      approxEqual(sumC[1], 7)  // 2+5
      approxEqual(sumC[2], 9)  // 3+6

      console.log('  ✓ matrix/basic (reduction)')
    })

    it('should import and run concatenation operations', async function () {
      const matrix = await import('../../../src-wasm/matrix/basic')

      // A = [[1,2],[3,4]], B = [[5,6],[7,8]]
      const a = new Float64Array([1, 2, 3, 4])
      const b = new Float64Array([5, 6, 7, 8])

      // Test horizontal concat: [[1,2,5,6],[3,4,7,8]]
      const h = matrix.concatHorizontal(a, 2, 2, b, 2)
      assert.strictEqual(h.length, 8)
      approxEqual(h[0], 1)
      approxEqual(h[1], 2)
      approxEqual(h[2], 5)
      approxEqual(h[3], 6)
      approxEqual(h[4], 3)
      approxEqual(h[5], 4)
      approxEqual(h[6], 7)
      approxEqual(h[7], 8)

      // Test vertical concat: [[1,2],[3,4],[5,6],[7,8]]
      const v = matrix.concatVertical(a, 2, 2, b, 2)
      assert.strictEqual(v.length, 8)
      approxEqual(v[0], 1)
      approxEqual(v[1], 2)
      approxEqual(v[2], 3)
      approxEqual(v[3], 4)
      approxEqual(v[4], 5)
      approxEqual(v[5], 6)
      approxEqual(v[6], 7)
      approxEqual(v[7], 8)

      console.log('  ✓ matrix/basic (concatenation)')
    })
  })
})

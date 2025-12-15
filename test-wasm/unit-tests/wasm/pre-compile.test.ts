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
  // NOTE: Skipped - matrix/multiply.ts uses @inline decorator which esbuild can't handle
  describe.skip('Matrix Operations (direct import)', function () {
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
  // NOTE: Skipped - signal/fft.ts uses @inline decorator which esbuild can't handle
  describe.skip('Signal Processing (direct import)', function () {
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
})

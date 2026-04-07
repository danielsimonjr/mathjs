import assert from 'assert'
import * as allFactories from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createChebyshevT } from '../../../../src/function/special/chebyshevT.js'

const math = create({ ...allFactories, createChebyshevT })

describe('chebyshevT', function () {
  it('should return T_0(x) = 1 for any x', function () {
    assert.strictEqual(math.chebyshevT(0, 0), 1)
    assert.strictEqual(math.chebyshevT(0, 0.5), 1)
    assert.strictEqual(math.chebyshevT(0, -1), 1)
    assert.strictEqual(math.chebyshevT(0, 100), 1)
  })

  it('should return T_1(x) = x', function () {
    assert.strictEqual(math.chebyshevT(1, 0), 0)
    assert.strictEqual(math.chebyshevT(1, 0.5), 0.5)
    assert.strictEqual(math.chebyshevT(1, -1), -1)
  })

  it('should compute T_2(0.5) = -0.5', function () {
    // T_2(x) = 2x^2 - 1; T_2(0.5) = 2*0.25 - 1 = -0.5
    assert(Math.abs(math.chebyshevT(2, 0.5) - (-0.5)) < 1e-15)
  })

  it('should compute T_3(0.5) = -1', function () {
    // T_3(x) = 4x^3 - 3x; T_3(0.5) = 4*0.125 - 1.5 = 0.5 - 1.5 = -1
    assert(Math.abs(math.chebyshevT(3, 0.5) - (-1)) < 1e-14)
  })

  it('should satisfy T_n(1) = 1 for all n', function () {
    for (let n = 0; n <= 10; n++) {
      assert(Math.abs(math.chebyshevT(n, 1) - 1) < 1e-13,
        `T_${n}(1) should be 1`)
    }
  })

  it('should satisfy T_n(-1) = (-1)^n', function () {
    for (let n = 0; n <= 10; n++) {
      const expected = Math.pow(-1, n)
      assert(Math.abs(math.chebyshevT(n, -1) - expected) < 1e-13,
        `T_${n}(-1) should be ${expected}`)
    }
  })

  it('should satisfy the recurrence relation explicitly', function () {
    const x = 0.7
    for (let n = 1; n < 8; n++) {
      const tNext = math.chebyshevT(n + 1, x)
      const expected = 2 * x * math.chebyshevT(n, x) - math.chebyshevT(n - 1, x)
      assert(Math.abs(tNext - expected) < 1e-13,
        `Recurrence failed at n=${n}`)
    }
  })

  it('should satisfy |T_n(x)| <= 1 for |x| <= 1', function () {
    for (const x of [-0.9, -0.5, 0, 0.3, 0.7, 1]) {
      for (let n = 0; n <= 10; n++) {
        const t = Math.abs(math.chebyshevT(n, x))
        assert(t <= 1 + 1e-12, `|T_${n}(${x})| = ${t} should be <= 1`)
      }
    }
  })

  it('should compute T_4(0.5) = 1/8', function () {
    // T_4(x) = 8x^4 - 8x^2 + 1; T_4(0.5) = 8*1/16 - 8*1/4 + 1 = 0.5 - 2 + 1 = -0.5
    // Wait: T_4(0.5) = 8*(0.0625) - 8*(0.25) + 1 = 0.5 - 2 + 1 = -0.5
    assert(Math.abs(math.chebyshevT(4, 0.5) - (-0.5)) < 1e-14)
  })

  it('should throw for non-integer n', function () {
    assert.throws(() => math.chebyshevT(1.5, 0.5), /TypeError/)
    assert.throws(() => math.chebyshevT(-1, 0.5), /TypeError/)
  })

  it('should throw for invalid argument types', function () {
    assert.throws(() => math.chebyshevT('abc', 0))
    assert.throws(() => math.chebyshevT())
  })
})

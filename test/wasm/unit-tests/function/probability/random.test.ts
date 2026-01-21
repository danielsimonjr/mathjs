/**
 * Test for random - AssemblyScript-friendly TypeScript
 */
import assert from 'assert'
import math from '../../../../../src/defaultInstance.ts'

const math2 = math.create({ randomSeed: 'test' })
const random = math2.random
const Matrix = math2.Matrix

interface MathNode {
  type: string
  toTex(): string
}

describe('random', function (): void {
  it('should have a function random', function (): void {
    assert.strictEqual(typeof math.random, 'function')
  })

  it('should pick uniformly distributed numbers in [0, 1]', function (): void {
    const picked: number[] = []

    times(1000, function (): void {
      picked.push(random())
    })
    assertUniformDistribution(picked, 0, 1)
  })

  it('should pick uniformly distributed numbers in [min, max]', function (): void {
    const picked: number[] = []

    times(1000, function (): void {
      picked.push(random(-10, 10))
    })
    assertUniformDistribution(picked, -10, 10)
  })

  it('should pick uniformly distributed random array, with elements in [0, 1]', function (): void {
    const picked: number[] = []
    const matrices: any[] = []
    const size = [2, 3, 4]

    times(100, function (): void {
      matrices.push(random(size))
    })

    // Collect all values in one array
    matrices.forEach(function (matrix) {
      assert(Array.isArray(matrix))
      assert.deepStrictEqual(math.size(matrix), size)
      math.forEach(matrix, function (val) {
        picked.push(val)
      })
    })
    assert.strictEqual(picked.length, 2 * 3 * 4 * 100)

    assertUniformDistribution(picked, 0, 1)
  })

  it('should pick uniformly distributed random array, with elements in [0, max]', function (): void {
    const picked: number[] = []
    const matrices: any[] = []
    const size = [2, 3, 4]

    times(100, function (): void {
      matrices.push(random(size, 8))
    })

    // Collect all values in one array
    matrices.forEach(function (matrix) {
      assert(Array.isArray(matrix))
      assert.deepStrictEqual(math.size(matrix), size)
      math.forEach(matrix, function (val) {
        picked.push(val)
      })
    })
    assert.strictEqual(picked.length, 2 * 3 * 4 * 100)

    assertUniformDistribution(picked, 0, 8)
  })

  it('should pick uniformly distributed random matrix, with elements in [0, 1]', function (): void {
    const picked: number[] = []
    const matrices: any[] = []
    const size = math2.matrix([2, 3, 4])

    times(100, function (): void {
      matrices.push(random(size))
    })

    // Collect all values in one array
    matrices.forEach(function (matrix) {
      assert(matrix instanceof Matrix)
      assert.deepStrictEqual(matrix.size(), size.valueOf())
      matrix.forEach(function (val: number) {
        picked.push(val)
      })
    })
    assert.strictEqual(picked.length, 2 * 3 * 4 * 100)

    assertUniformDistribution(picked, 0, 1)
  })

  it('should pick uniformly distributed random array, with elements in [min, max]', function (): void {
    const picked: number[] = []
    const matrices: any[] = []
    const size = [2, 3, 4]

    times(100, function (): void {
      matrices.push(random(size, -103, 8))
    })

    // Collect all values in one array
    matrices.forEach(function (matrix) {
      assert.deepStrictEqual(math.size(matrix), size)
      math.forEach(matrix, function (val) {
        picked.push(val)
      })
    })
    assert.strictEqual(picked.length, 2 * 3 * 4 * 100)
    assertUniformDistribution(picked, -103, 8)
  })

  it('should throw an error if called with invalid arguments', function (): void {
    assert.throws(function (): void {
      random(1, 2, [4, 8])
    })
    assert.throws(function (): void {
      random(1, 2, 3, 6)
    })

    assert.throws(function (): void {
      random('str', 10)
    })
    assert.throws(function (): void {
      random(math2.bignumber(-10), 10)
    })
  })

  it('should throw an error in case of wrong number of arguments', function (): void {
    assert.throws(function (): void {
      random([2, 3], 10, 100, 12)
    }, /Too many arguments/)
  })

  it('should LaTeX random', function (): void {
    const expression = math.parse('random(0,1)') as MathNode
    assert.strictEqual(expression.toTex(), '\\mathrm{random}\\left(0,1\\right)')
  })
})

function assertUniformDistribution(values: number[], min: number, max: number): void {
  const interval = (max - min) / 10
  let count
  let i
  count = values.filter(function (val) {
    return val < min
  }).length
  assert.strictEqual(count, 0)
  count = values.filter(function (val) {
    return val > max
  }).length
  assert.strictEqual(count, 0)

  for (i = 0; i < 10; i++) {
    count = values.filter(function (val) {
      return val >= min + i * interval && val < min + (i + 1) * interval
    }).length
    assertApproxEqual(count / values.length, 0.1, 0.02)
  }
}

const assertApproxEqual = function (testVal: number, val: number, tolerance: number): void {
  const diff = Math.abs(val - testVal)
  if (diff > tolerance) assert.strictEqual(testVal, val)
  else assert.ok(diff <= tolerance)
}

function times(n: number, callback: () => void): void {
  for (let i = 0; i < n; i++) {
    callback()
  }
}

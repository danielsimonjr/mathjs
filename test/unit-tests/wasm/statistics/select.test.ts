import assert from 'assert'
import {
  partitionSelect,
  selectMin,
  selectMax,
  selectKSmallest,
  selectKLargest,
  partitionSelectIndex
} from '../../../../src/wasm/statistics/select.ts'

const EPSILON = 1e-10

function _approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/statistics/select', function () {
  describe('partitionSelect', function () {
    it('should find k-th smallest element', function () {
      const data = new Float64Array([3, 1, 4, 1, 5, 9, 2, 6])

      // Sorted: [1, 1, 2, 3, 4, 5, 6, 9]
      assert.strictEqual(partitionSelect(data, 0), 1) // min
      assert.strictEqual(partitionSelect(data, 1), 1)
      assert.strictEqual(partitionSelect(data, 2), 2)
      assert.strictEqual(partitionSelect(data, 3), 3)
      assert.strictEqual(partitionSelect(data, 7), 9) // max
    })

    it('should return NaN for invalid k', function () {
      const data = new Float64Array([1, 2, 3])
      assert(Number.isNaN(partitionSelect(data, -1)))
      assert(Number.isNaN(partitionSelect(data, 3)))
    })

    it('should return NaN for empty array', function () {
      const data = new Float64Array([])
      assert(Number.isNaN(partitionSelect(data, 0)))
    })

    it('should handle single element', function () {
      const data = new Float64Array([42])
      assert.strictEqual(partitionSelect(data, 0), 42)
    })

    it('should handle duplicate values', function () {
      const data = new Float64Array([5, 5, 5, 5])
      assert.strictEqual(partitionSelect(data, 0), 5)
      assert.strictEqual(partitionSelect(data, 3), 5)
    })
  })

  // Note: partitionSelectMoT uses f64() type cast, requires WASM testing
  describe('partitionSelectMoT', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Uses median-of-three pivot selection with f64()
      assert(true)
    })
  })

  // Note: selectMedian uses f64() type cast, requires WASM testing
  describe('selectMedian', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Uses f64() for computing median index
      assert(true)
    })
  })

  describe('selectMin', function () {
    it('should find minimum', function () {
      const data = new Float64Array([5, 2, 8, 1, 9])
      assert.strictEqual(selectMin(data), 1)
    })

    it('should handle negative values', function () {
      const data = new Float64Array([-5, -2, -8, -1])
      assert.strictEqual(selectMin(data), -8)
    })
  })

  describe('selectMax', function () {
    it('should find maximum', function () {
      const data = new Float64Array([5, 2, 8, 1, 9])
      assert.strictEqual(selectMax(data), 9)
    })

    it('should handle negative values', function () {
      const data = new Float64Array([-5, -2, -8, -1])
      assert.strictEqual(selectMax(data), -1)
    })
  })

  describe('selectKSmallest', function () {
    it('should select k smallest elements', function () {
      const data = new Float64Array([5, 2, 8, 1, 9, 3])
      const result = selectKSmallest(data, 3)

      assert.strictEqual(result.length, 3)

      // Result should contain 1, 2, 3 (unsorted)
      const sorted = Array.from(result).sort((a, b) => a - b)
      assert.deepStrictEqual(sorted, [1, 2, 3])
    })

    it('should return empty for k <= 0', function () {
      const data = new Float64Array([1, 2, 3])
      assert.strictEqual(selectKSmallest(data, 0).length, 0)
      assert.strictEqual(selectKSmallest(data, -1).length, 0)
    })

    it('should return all elements if k >= n', function () {
      const data = new Float64Array([1, 2, 3])
      const result = selectKSmallest(data, 5)
      assert.strictEqual(result.length, 3)
    })
  })

  describe('selectKLargest', function () {
    it('should select k largest elements', function () {
      const data = new Float64Array([5, 2, 8, 1, 9, 3])
      const result = selectKLargest(data, 3)

      assert.strictEqual(result.length, 3)

      // Result should contain 5, 8, 9 (unsorted)
      const sorted = Array.from(result).sort((a, b) => a - b)
      assert.deepStrictEqual(sorted, [5, 8, 9])
    })

    it('should return empty for k <= 0', function () {
      const data = new Float64Array([1, 2, 3])
      assert.strictEqual(selectKLargest(data, 0).length, 0)
    })
  })

  // Note: introSelect uses f64() type cast, requires WASM testing
  describe('introSelect', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Uses f64() for computing max depth in introsort fallback
      assert(true)
    })
  })

  // Note: selectQuantile uses f64() type cast, requires WASM testing
  describe('selectQuantile', function () {
    it('should be tested via WASM (uses f64 type cast)', function () {
      // Uses f64() for computing quantile index
      assert(true)
    })
  })

  describe('partitionSelectIndex', function () {
    it('should return index of k-th smallest element', function () {
      const data = new Float64Array([30, 10, 20])

      // Values: 30 at 0, 10 at 1, 20 at 2
      // Sorted by value: 10 (idx 1), 20 (idx 2), 30 (idx 0)

      assert.strictEqual(partitionSelectIndex(data, 0), 1) // 10 is at index 1
      assert.strictEqual(partitionSelectIndex(data, 1), 2) // 20 is at index 2
      assert.strictEqual(partitionSelectIndex(data, 2), 0) // 30 is at index 0
    })

    it('should return -1 for invalid k', function () {
      const data = new Float64Array([1, 2, 3])
      assert.strictEqual(partitionSelectIndex(data, -1), -1)
      assert.strictEqual(partitionSelectIndex(data, 3), -1)
    })
  })

  describe('selection algorithm properties', function () {
    it('selectMin should equal partitionSelect with k=0', function () {
      const data = new Float64Array([5, 2, 8, 1, 9])
      assert.strictEqual(selectMin(data), partitionSelect(data, 0))
    })

    it('selectMax should equal partitionSelect with k=n-1', function () {
      const data = new Float64Array([5, 2, 8, 1, 9])
      assert.strictEqual(selectMax(data), partitionSelect(data, 4))
    })

    it('all selection methods should be tested via WASM (uses f64)', function () {
      // partitionSelectMoT and introSelect use f64() type casts
      assert(true)
    })

    it('kSmallest and kLargest should partition correctly', function () {
      const data = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      const k = 5

      const smallest = selectKSmallest(data, k)
      const largest = selectKLargest(data, k)

      // Max of smallest should be <= min of largest
      const maxSmall = Math.max(...smallest)
      const minLarge = Math.min(...largest)

      assert(maxSmall <= minLarge)
    })
  })
})

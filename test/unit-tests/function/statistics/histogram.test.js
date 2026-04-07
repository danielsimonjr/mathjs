import assert from 'assert'
import * as all from '../../../../src/factoriesAny.js'
import { create } from '../../../../src/core/create.js'
import { createHistogram } from '../../../../src/function/statistics/histogram.js'

const math = create({ ...all, createHistogram })

describe('histogram', function () {
  it('should return counts, binEdges, and binCenters', function () {
    const result = math.histogram([1, 2, 2, 3, 3, 3], 3)
    assert(Array.isArray(result.counts))
    assert(Array.isArray(result.binEdges))
    assert(Array.isArray(result.binCenters))
  })

  it('should produce correct counts for [1,2,2,3,3,3] with 3 bins', function () {
    const result = math.histogram([1, 2, 2, 3, 3, 3], 3)
    assert.strictEqual(result.counts.length, 3)
    // Total count should equal data length
    const total = result.counts.reduce((a, b) => a + b, 0)
    assert.strictEqual(total, 6)
    // The three 3s should all be in the last bin
    assert.strictEqual(result.counts[2], 3)
  })

  it('should produce correct bin count with numeric bins', function () {
    const result = math.histogram([1, 2, 3, 4, 5], 5)
    assert.strictEqual(result.counts.length, 5)
    assert.strictEqual(result.binEdges.length, 6)
    assert.strictEqual(result.binCenters.length, 5)
  })

  it('should work with explicit bin edges', function () {
    const result = math.histogram([1, 2, 2, 3, 3, 3], [1, 2, 3, 4])
    assert.strictEqual(result.counts.length, 3)
    // [1,2): one 1
    assert.strictEqual(result.counts[0], 1)
    // [2,3): two 2s
    assert.strictEqual(result.counts[1], 2)
    // [3,4]: three 3s
    assert.strictEqual(result.counts[2], 3)
  })

  it('should count all values', function () {
    const data = [1, 1, 2, 3, 4, 5, 5]
    const result = math.histogram(data, 5)
    const total = result.counts.reduce((a, b) => a + b, 0)
    assert.strictEqual(total, data.length)
  })

  it('should handle all identical values', function () {
    const result = math.histogram([3, 3, 3], 2)
    assert(result.counts.length >= 1)
    const total = result.counts.reduce((a, b) => a + b, 0)
    assert.strictEqual(total, 3)
  })

  it('should throw for empty data', function () {
    assert.throws(() => math.histogram([], 3), /must not be empty/)
  })

  it('should throw for non-integer bins', function () {
    assert.throws(() => math.histogram([1, 2, 3], 2.5), /must be a positive integer/)
    assert.throws(() => math.histogram([1, 2, 3], 0), /must be a positive integer/)
  })

  it('should throw for non-monotonic bin edges', function () {
    assert.throws(() => math.histogram([1, 2, 3], [1, 3, 2]), /strictly increasing/)
    assert.throws(() => math.histogram([1, 2, 3], [1, 1, 3]), /strictly increasing/)
  })

  it('should throw for bin edges array with fewer than 2 elements', function () {
    assert.throws(() => math.histogram([1, 2, 3], [1]), /at least 2 elements/)
  })

  it('bin centers should be midpoints of bin edges', function () {
    const result = math.histogram([1, 2, 3], [0, 2, 4])
    assert(Math.abs(result.binCenters[0] - 1) < 1e-12)
    assert(Math.abs(result.binCenters[1] - 3) < 1e-12)
  })
})

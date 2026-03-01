import { describe, it, expect } from 'vitest'
import '../../assemblyscript-stubs'
import { mean, variance, std } from '../../../../src/wasm/statistics/basic'

/**
 * Tests for SIMD statistics dispatch in statistics/basic.ts.
 *
 * Note: SIMD intrinsics (f64x2, v128) are not available in vitest's
 * JS stub environment. These tests verify the scalar path and the
 * dispatch threshold logic. Full SIMD correctness is tested in
 * test/wasm/unit-tests/wasm/simd-operations.test.ts via compiled WASM.
 */

// Memory helpers using the AS stub memory map
let _memOffset = 0
function resetMem(): void {
  _memOffset = 256
  const memMap = (globalThis as any).__stubMemMap as Map<number, number>
  if (memMap) memMap.clear()
}

function allocF64(values: number[]): number {
  const ptr = _memOffset
  const memMap = (globalThis as any).__stubMemMap as Map<number, number>
  for (let i = 0; i < values.length; i++) {
    memMap.set(ptr + i * 8, values[i])
  }
  _memOffset += values.length * 8
  _memOffset = (_memOffset + 15) & ~15
  return ptr
}

describe('statistics with SIMD dispatch', () => {
  beforeEach(() => resetMem())

  describe('mean (scalar path, n < 128)', () => {
    it('returns correct mean for simple array', () => {
      const ptr = allocF64([1, 2, 3, 4, 5, 6])
      expect(mean(ptr, 6)).toBeCloseTo(3.5, 10)
    })

    it('returns 0 for empty array', () => {
      expect(mean(0, 0)).toBe(0)
    })

    it('returns the value for single element', () => {
      const ptr = allocF64([42])
      expect(mean(ptr, 1)).toBeCloseTo(42, 10)
    })
  })

  describe('variance (scalar path, n < 128)', () => {
    it('returns correct population variance (ddof=0)', () => {
      const ptr = allocF64([2, 4, 4, 4, 5, 5, 7, 9])
      expect(variance(ptr, 8, 0)).toBeCloseTo(4.0, 10)
    })

    it('returns correct sample variance (ddof=1)', () => {
      const ptr = allocF64([2, 4, 4, 4, 5, 5, 7, 9])
      expect(variance(ptr, 8, 1)).toBeCloseTo(4.571428571428571, 10)
    })

    it('returns NaN when length <= ddof', () => {
      const ptr = allocF64([1])
      expect(variance(ptr, 1, 1)).toBeNaN()
    })
  })

  describe('std (scalar path, n < 128)', () => {
    it('returns correct standard deviation', () => {
      const ptr = allocF64([2, 4, 4, 4, 5, 5, 7, 9])
      expect(std(ptr, 8, 0)).toBeCloseTo(2.0, 10)
    })
  })
})

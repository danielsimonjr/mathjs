import { describe, it, expect } from 'vitest'
import '../../assemblyscript-stubs'
import { distanceND, dotND } from '../../../../src/wasm/geometry/operations'

/**
 * Tests for SIMD geometry dispatch in geometry/operations.ts.
 *
 * SIMD intrinsics are not available in vitest stubs, so these tests
 * verify the scalar path (n < 32). Full SIMD correctness is tested
 * via compiled WASM.
 */

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

describe('geometry with SIMD dispatch', () => {
  beforeEach(() => resetMem())

  describe('distanceND (scalar path, n < 32)', () => {
    it('returns 0 for identical points', () => {
      const p1 = allocF64([1, 2, 3])
      const p2 = allocF64([1, 2, 3])
      expect(distanceND(p1, p2, 3)).toBeCloseTo(0, 10)
    })

    it('returns correct distance in 2D', () => {
      const p1 = allocF64([0, 0])
      const p2 = allocF64([3, 4])
      expect(distanceND(p1, p2, 2)).toBeCloseTo(5, 10)
    })

    it('returns correct distance in 3D', () => {
      const p1 = allocF64([1, 2, 3])
      const p2 = allocF64([4, 6, 3])
      // sqrt(9 + 16 + 0) = 5
      expect(distanceND(p1, p2, 3)).toBeCloseTo(5, 10)
    })

    it('returns correct distance in 10D', () => {
      const p1 = allocF64([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
      const p2 = allocF64([1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
      // sqrt(10)
      expect(distanceND(p1, p2, 10)).toBeCloseTo(Math.sqrt(10), 10)
    })
  })

  describe('dotND (scalar path)', () => {
    it('returns correct dot product', () => {
      const a = allocF64([1, 2, 3])
      const b = allocF64([4, 5, 6])
      // 1*4 + 2*5 + 3*6 = 32
      expect(dotND(a, b, 3)).toBeCloseTo(32, 10)
    })
  })
})

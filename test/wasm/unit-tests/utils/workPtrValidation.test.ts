import { describe, it, expect } from 'vitest'
import {
  eigsSymmetricWorkSize,
  detWorkSize,
  madWorkSize,
  stirlingS2WorkSize,
  bellNumbersWorkSize,
  rombergWorkSize,
  selectWorkSize,
  invmodWorkSize,
  countPrimesWorkSize,
  condWorkSize,
  validateWorkPtrSize,
  getWorkPtrRequirement
} from '../../../../src/wasm/utils/workPtrValidation'

describe('workPtrValidation', () => {
  describe('size calculation functions', () => {
    it('eigsSymmetricWorkSize returns 2*n*8 bytes', () => {
      expect(eigsSymmetricWorkSize(10)).toBe(160) // 2*10*8
    })

    it('detWorkSize returns n*n*8 bytes', () => {
      expect(detWorkSize(4)).toBe(128) // 4*4*8
    })

    it('madWorkSize returns length*8 bytes', () => {
      expect(madWorkSize(100)).toBe(800)
    })

    it('stirlingS2WorkSize returns (n+1)*(k+1)*8 bytes', () => {
      expect(stirlingS2WorkSize(5, 3)).toBe(192) // 6*4*8
    })

    it('bellNumbersWorkSize returns (n+1)^2 * 8 bytes', () => {
      expect(bellNumbersWorkSize(4)).toBe(200) // 5*5*8
    })

    it('rombergWorkSize returns maxIter^2 * 8 bytes', () => {
      expect(rombergWorkSize(10)).toBe(800) // 10*10*8
    })

    it('selectWorkSize returns length*8 bytes', () => {
      expect(selectWorkSize(50)).toBe(400)
    })

    it('invmodWorkSize returns 24 bytes (3 i64)', () => {
      expect(invmodWorkSize()).toBe(24)
    })

    it('countPrimesWorkSize returns n+1 bytes', () => {
      expect(countPrimesWorkSize(100)).toBe(101)
    })

    it('condWorkSize returns 2*n*n*8 bytes', () => {
      expect(condWorkSize(3)).toBe(144) // 2*9*8
    })
  })

  describe('validateWorkPtrSize', () => {
    it('returns 1 when provided size is sufficient', () => {
      expect(validateWorkPtrSize(100, 200)).toBe(1)
      expect(validateWorkPtrSize(100, 100)).toBe(1)
    })

    it('returns 0 when provided size is insufficient', () => {
      expect(validateWorkPtrSize(100, 50)).toBe(0)
    })
  })

  describe('getWorkPtrRequirement', () => {
    it('returns correct size for det (operation 14)', () => {
      expect(getWorkPtrRequirement(14, 4)).toBe(128)
    })

    it('returns correct size for mad (operation 15)', () => {
      expect(getWorkPtrRequirement(15, 100)).toBe(800)
    })

    it('returns correct size for stirlingS2 (operation 16)', () => {
      expect(getWorkPtrRequirement(16, 5, 3)).toBe(192)
    })

    it('returns correct size for invmod (operation 20)', () => {
      expect(getWorkPtrRequirement(20, 0)).toBe(24)
    })

    it('returns 0 for unknown operation', () => {
      expect(getWorkPtrRequirement(99, 10)).toBe(0)
    })
  })
})

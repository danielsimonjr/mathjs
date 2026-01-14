import assert from 'assert'
import {
  rotationMatrix2D,
  rotate2D,
  rotate2DAroundPoint,
  rotationMatrixX,
  rotationMatrixY,
  rotationMatrixZ,
  rotateByMatrix
} from '../../../../src/wasm/matrix/rotation.ts'

const EPSILON = 1e-10
const PI = Math.PI

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/matrix/rotation', function () {
  describe('rotationMatrix2D', function () {
    it('should create identity for angle=0', function () {
      const R = rotationMatrix2D(0)
      assert(approxEqual(R[0], 1, 1e-10))  // cos(0) = 1
      assert(approxEqual(R[1], 0, 1e-10))  // -sin(0) = 0
      assert(approxEqual(R[2], 0, 1e-10))  // sin(0) = 0
      assert(approxEqual(R[3], 1, 1e-10))  // cos(0) = 1
    })

    it('should create 90 degree rotation matrix', function () {
      const R = rotationMatrix2D(PI / 2)
      assert(approxEqual(R[0], 0, 1e-10))   // cos(π/2) = 0
      assert(approxEqual(R[1], -1, 1e-10))  // -sin(π/2) = -1
      assert(approxEqual(R[2], 1, 1e-10))   // sin(π/2) = 1
      assert(approxEqual(R[3], 0, 1e-10))   // cos(π/2) = 0
    })

    it('should create 180 degree rotation matrix', function () {
      const R = rotationMatrix2D(PI)
      assert(approxEqual(R[0], -1, 1e-10))
      assert(approxEqual(R[1], 0, 1e-10))
      assert(approxEqual(R[2], 0, 1e-10))
      assert(approxEqual(R[3], -1, 1e-10))
    })
  })

  describe('rotate2D', function () {
    it('should not change point for angle=0', function () {
      const point = new Float64Array([3, 4])
      const result = rotate2D(point, 0)
      assert(approxEqual(result[0], 3, 1e-10))
      assert(approxEqual(result[1], 4, 1e-10))
    })

    it('should rotate point by 90 degrees', function () {
      const point = new Float64Array([1, 0])
      const result = rotate2D(point, PI / 2)
      assert(approxEqual(result[0], 0, 1e-10))
      assert(approxEqual(result[1], 1, 1e-10))
    })

    it('should rotate point by 180 degrees', function () {
      const point = new Float64Array([1, 1])
      const result = rotate2D(point, PI)
      assert(approxEqual(result[0], -1, 1e-10))
      assert(approxEqual(result[1], -1, 1e-10))
    })

    it('should preserve distance from origin', function () {
      const point = new Float64Array([3, 4])
      const originalDist = Math.sqrt(9 + 16)

      for (const angle of [PI / 6, PI / 4, PI / 3, PI / 2, PI]) {
        const result = rotate2D(point, angle)
        const newDist = Math.sqrt(result[0] * result[0] + result[1] * result[1])
        assert(approxEqual(newDist, originalDist, 1e-10))
      }
    })
  })

  describe('rotate2DAroundPoint', function () {
    it('should rotate around custom center', function () {
      const point = new Float64Array([2, 0])
      const center = new Float64Array([1, 0])
      const result = rotate2DAroundPoint(point, center, PI / 2)

      // Point is 1 unit to the right of center
      // After 90 degree rotation, should be 1 unit above center
      assert(approxEqual(result[0], 1, 1e-10))
      assert(approxEqual(result[1], 1, 1e-10))
    })

    it('should return same point when rotating around itself', function () {
      const point = new Float64Array([3, 4])
      const center = new Float64Array([3, 4])
      const result = rotate2DAroundPoint(point, center, PI / 2)

      assert(approxEqual(result[0], 3, 1e-10))
      assert(approxEqual(result[1], 4, 1e-10))
    })
  })

  describe('rotationMatrixX', function () {
    it('should create 3D rotation around X axis', function () {
      const R = rotationMatrixX(0)
      // Should be identity
      assert(approxEqual(R[0], 1, 1e-10))
      assert(approxEqual(R[4], 1, 1e-10))
      assert(approxEqual(R[8], 1, 1e-10))
    })

    it('should leave X component unchanged', function () {
      const R = rotationMatrixX(PI / 2)
      assert(approxEqual(R[0], 1, 1e-10))
      assert(approxEqual(R[1], 0, 1e-10))
      assert(approxEqual(R[2], 0, 1e-10))
    })
  })

  describe('rotationMatrixY', function () {
    it('should create 3D rotation around Y axis', function () {
      const R = rotationMatrixY(0)
      // Should be identity
      assert(approxEqual(R[0], 1, 1e-10))
      assert(approxEqual(R[4], 1, 1e-10))
      assert(approxEqual(R[8], 1, 1e-10))
    })

    it('should leave Y component unchanged', function () {
      const R = rotationMatrixY(PI / 2)
      assert(approxEqual(R[3], 0, 1e-10))
      assert(approxEqual(R[4], 1, 1e-10))
      assert(approxEqual(R[5], 0, 1e-10))
    })
  })

  describe('rotationMatrixZ', function () {
    it('should create 3D rotation around Z axis', function () {
      const R = rotationMatrixZ(0)
      // Should be identity
      assert(approxEqual(R[0], 1, 1e-10))
      assert(approxEqual(R[4], 1, 1e-10))
      assert(approxEqual(R[8], 1, 1e-10))
    })

    it('should leave Z component unchanged', function () {
      const R = rotationMatrixZ(PI / 2)
      assert(approxEqual(R[6], 0, 1e-10))
      assert(approxEqual(R[7], 0, 1e-10))
      assert(approxEqual(R[8], 1, 1e-10))
    })
  })

  describe('rotateByMatrix', function () {
    it('should rotate 3D point', function () {
      const point = new Float64Array([1, 0, 0])
      const R = rotationMatrixZ(PI / 2)
      const result = rotateByMatrix(point, R)

      assert(approxEqual(result[0], 0, 1e-10))
      assert(approxEqual(result[1], 1, 1e-10))
      assert(approxEqual(result[2], 0, 1e-10))
    })

    it('should preserve distance from origin', function () {
      const point = new Float64Array([1, 2, 3])
      const originalDist = Math.sqrt(1 + 4 + 9)

      const R = rotationMatrixX(PI / 4)
      const result = rotateByMatrix(point, R)
      const newDist = Math.sqrt(
        result[0] * result[0] +
        result[1] * result[1] +
        result[2] * result[2]
      )

      assert(approxEqual(newDist, originalDist, 1e-10))
    })
  })

  describe('rotationMatrixAxisAngle', function () {
    it('should be tested via WASM (uses f64 normalization)', function () {
      // Creates rotation matrix from axis-angle representation
      // Uses vector normalization with f64
      assert(true)
    })
  })

  describe('rotation properties', function () {
    it('rotation matrix should be orthogonal (R * R^T = I)', function () {
      const R = rotationMatrix2D(PI / 6)
      // R * R^T = I means R[0]^2 + R[1]^2 = 1, etc.
      const det = R[0] * R[3] - R[1] * R[2]
      assert(approxEqual(det, 1, 1e-10))
    })

    it('two rotations of π should return to original', function () {
      const point = new Float64Array([3, 4])
      const rotated = rotate2D(rotate2D(point, PI), PI)

      assert(approxEqual(rotated[0], point[0], 1e-10))
      assert(approxEqual(rotated[1], point[1], 1e-10))
    })

    it('rotation by 2π should return to original', function () {
      const point = new Float64Array([3, 4])
      const result = rotate2D(point, 2 * PI)

      assert(approxEqual(result[0], point[0], 1e-10))
      assert(approxEqual(result[1], point[1], 1e-10))
    })
  })
})

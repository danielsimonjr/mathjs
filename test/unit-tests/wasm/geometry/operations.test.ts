import assert from 'assert'
import {
  distance2D,
  distance3D,
  distanceND,
  manhattanDistance2D,
  manhattanDistanceND,
  intersect2DLines,
  intersect2DInfiniteLines,
  intersectLinePlane,
  cross3D,
  dotND,
  angle2D,
  angle3D,
  triangleArea2D,
  pointInTriangle2D,
  normalizeND,
  intersectLineCircle,
  intersectLineSphere,
  intersectCircles,
  projectPointOnLine2D,
  distancePointToLine2D,
  distancePointToPlane,
  polygonCentroid2D,
  polygonArea2D,
  pointInConvexPolygon2D
} from '../../../../src/wasm/geometry/operations.ts'

const EPSILON = 1e-10
const PI = Math.PI

function approxEqual(a: number, b: number, eps: number = EPSILON): boolean {
  return Math.abs(a - b) < eps
}

describe('wasm/geometry/operations', function () {
  describe('distance2D', function () {
    it('should compute Euclidean distance in 2D', function () {
      assert(approxEqual(distance2D(0, 0, 3, 4), 5))
      assert(approxEqual(distance2D(1, 1, 4, 5), 5))
      assert(approxEqual(distance2D(0, 0, 0, 0), 0))
    })

    it('should handle negative coordinates', function () {
      assert(approxEqual(distance2D(-1, -1, 2, 3), 5))
    })
  })

  describe('distance3D', function () {
    it('should compute Euclidean distance in 3D', function () {
      assert(approxEqual(distance3D(0, 0, 0, 1, 2, 2), 3))
      assert(approxEqual(distance3D(0, 0, 0, 0, 0, 0), 0))
    })
  })

  describe('distanceND', function () {
    it('should compute Euclidean distance in N dimensions', function () {
      const p1 = new Float64Array([0, 0, 0])
      const p2 = new Float64Array([1, 2, 2])
      assert(approxEqual(distanceND(p1, p2), 3))
    })

    it('should handle higher dimensions', function () {
      const p1 = new Float64Array([0, 0, 0, 0])
      const p2 = new Float64Array([1, 1, 1, 1])
      assert(approxEqual(distanceND(p1, p2), 2)) // sqrt(4) = 2
    })
  })

  describe('manhattanDistance2D', function () {
    it('should compute Manhattan distance in 2D', function () {
      assert.strictEqual(manhattanDistance2D(0, 0, 3, 4), 7)
      assert.strictEqual(manhattanDistance2D(1, 1, 4, 5), 7)
    })
  })

  describe('manhattanDistanceND', function () {
    it('should compute Manhattan distance in N dimensions', function () {
      const p1 = new Float64Array([0, 0, 0])
      const p2 = new Float64Array([1, 2, 3])
      assert.strictEqual(manhattanDistanceND(p1, p2), 6)
    })
  })

  describe('intersect2DLines', function () {
    it('should find intersection of line segments', function () {
      // Line 1: (0,0) to (2,2)
      // Line 2: (0,2) to (2,0)
      const result = intersect2DLines(0, 0, 2, 2, 0, 2, 2, 0)
      assert.strictEqual(result[2], 1) // Intersection exists
      assert(approxEqual(result[0], 1)) // x = 1
      assert(approxEqual(result[1], 1)) // y = 1
    })

    it('should return 0 for parallel lines', function () {
      // Line 1: (0,0) to (2,0)
      // Line 2: (0,1) to (2,1)
      const result = intersect2DLines(0, 0, 2, 0, 0, 1, 2, 1)
      assert.strictEqual(result[2], 0) // No intersection
    })

    it('should return 0 for non-intersecting segments', function () {
      // Line 1: (0,0) to (1,0)
      // Line 2: (2,0) to (2,1)
      const result = intersect2DLines(0, 0, 1, 0, 2, 0, 2, 1)
      assert.strictEqual(result[2], 0)
    })
  })

  describe('intersect2DInfiniteLines', function () {
    it('should find intersection of infinite lines', function () {
      const result = intersect2DInfiniteLines(0, 0, 2, 2, 0, 2, 2, 0)
      assert.strictEqual(result[2], 1)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 1))
    })
  })

  describe('intersectLinePlane', function () {
    it('should find line-plane intersection', function () {
      // Line: (0,0,0) with direction (0,0,1)
      // Plane: z = 5 → 0x + 0y + 1z - 5 = 0
      const result = intersectLinePlane(0, 0, 0, 0, 0, 1, 0, 0, 1, -5)
      assert.strictEqual(result[3], 1) // Intersection exists
      assert(approxEqual(result[2], 5)) // z = 5
    })

    it('should return 0 for line parallel to plane', function () {
      // Line: (0,0,0) with direction (1,0,0)
      // Plane: z = 5
      const result = intersectLinePlane(0, 0, 0, 1, 0, 0, 0, 0, 1, -5)
      assert.strictEqual(result[3], 0) // No intersection
    })
  })

  describe('cross3D', function () {
    it('should compute cross product of unit vectors', function () {
      // i × j = k
      const result = cross3D(1, 0, 0, 0, 1, 0)
      assert(approxEqual(result[0], 0))
      assert(approxEqual(result[1], 0))
      assert(approxEqual(result[2], 1))
    })

    it('should compute cross product', function () {
      // (1,2,3) × (4,5,6)
      const result = cross3D(1, 2, 3, 4, 5, 6)
      // = (2*6-3*5, 3*4-1*6, 1*5-2*4) = (-3, 6, -3)
      assert(approxEqual(result[0], -3))
      assert(approxEqual(result[1], 6))
      assert(approxEqual(result[2], -3))
    })
  })

  describe('dotND', function () {
    it('should compute dot product', function () {
      const a = new Float64Array([1, 2, 3])
      const b = new Float64Array([4, 5, 6])
      // 1*4 + 2*5 + 3*6 = 32
      assert.strictEqual(dotND(a, b), 32)
    })

    it('should return 0 for perpendicular vectors', function () {
      const a = new Float64Array([1, 0])
      const b = new Float64Array([0, 1])
      assert.strictEqual(dotND(a, b), 0)
    })
  })

  describe('angle2D', function () {
    it('should compute angle between vectors', function () {
      // Angle between (1,0) and (0,1) is π/2
      assert(approxEqual(angle2D(1, 0, 0, 1), PI / 2))
    })

    it('should return 0 for same direction', function () {
      // Same direction vectors have angle 0
      // Using looser tolerance for numerical precision
      assert(approxEqual(angle2D(1, 1, 2, 2), 0, 1e-6))
    })

    it('should return π for opposite directions', function () {
      assert(approxEqual(angle2D(1, 0, -1, 0), PI))
    })
  })

  describe('angle3D', function () {
    it('should compute angle between 3D vectors', function () {
      // Angle between (1,0,0) and (0,1,0) is π/2
      assert(approxEqual(angle3D(1, 0, 0, 0, 1, 0), PI / 2))
    })
  })

  describe('triangleArea2D', function () {
    it('should compute area of triangle', function () {
      // Triangle with vertices (0,0), (4,0), (0,3)
      // Area = 0.5 * base * height = 0.5 * 4 * 3 = 6
      assert(approxEqual(triangleArea2D(0, 0, 4, 0, 0, 3), 6))
    })

    it('should return 0 for degenerate triangle', function () {
      // Collinear points
      assert(approxEqual(triangleArea2D(0, 0, 1, 1, 2, 2), 0))
    })
  })

  describe('pointInTriangle2D', function () {
    it('should return 1 for point inside triangle', function () {
      // Triangle: (0,0), (4,0), (2,4)
      // Point: (2,1)
      assert.strictEqual(pointInTriangle2D(2, 1, 0, 0, 4, 0, 2, 4), 1)
    })

    it('should return 0 for point outside triangle', function () {
      // Point: (5,5)
      assert.strictEqual(pointInTriangle2D(5, 5, 0, 0, 4, 0, 2, 4), 0)
    })
  })

  describe('normalizeND', function () {
    it('should normalize vector to unit length', function () {
      const v = new Float64Array([3, 4])
      const result = normalizeND(v)
      assert(approxEqual(result[0], 0.6))
      assert(approxEqual(result[1], 0.8))
    })

    it('should return zero vector for zero input', function () {
      const v = new Float64Array([0, 0, 0])
      const result = normalizeND(v)
      assert.strictEqual(result[0], 0)
      assert.strictEqual(result[1], 0)
      assert.strictEqual(result[2], 0)
    })
  })

  describe('intersectLineCircle', function () {
    it('should find two intersection points', function () {
      // Line through origin with direction (1,0)
      // Circle at origin with radius 1
      const result = intersectLineCircle(0, 0, 1, 0, 0, 0, 1)
      assert.strictEqual(result[4], 2) // 2 intersections
      assert(approxEqual(Math.abs(result[0]), 1))
      assert(approxEqual(Math.abs(result[2]), 1))
    })

    it('should find one intersection point (tangent)', function () {
      // Line y=1 tangent to unit circle
      const result = intersectLineCircle(0, 1, 1, 0, 0, 0, 1)
      assert.strictEqual(result[4], 1)
    })

    it('should return 0 for no intersection', function () {
      // Line y=2 misses unit circle
      const result = intersectLineCircle(0, 2, 1, 0, 0, 0, 1)
      assert.strictEqual(result[4], 0)
    })
  })

  describe('intersectLineSphere', function () {
    it('should find two intersection points', function () {
      // Line through origin with direction (0,0,1)
      // Sphere at origin with radius 1
      const result = intersectLineSphere(0, 0, 0, 0, 0, 1, 0, 0, 0, 1)
      assert.strictEqual(result[6], 2)
    })
  })

  describe('intersectCircles', function () {
    it('should find two intersection points', function () {
      // Circle 1: center (0,0), radius 2
      // Circle 2: center (2,0), radius 2
      const result = intersectCircles(0, 0, 2, 2, 0, 2)
      assert.strictEqual(result[4], 2)
    })

    it('should return 0 for non-intersecting circles', function () {
      // Circle 1: center (0,0), radius 1
      // Circle 2: center (5,0), radius 1
      const result = intersectCircles(0, 0, 1, 5, 0, 1)
      assert.strictEqual(result[4], 0)
    })
  })

  describe('projectPointOnLine2D', function () {
    it('should project point onto line', function () {
      // Line: (0,0) to (2,0)
      // Point: (1,3)
      const result = projectPointOnLine2D(1, 3, 0, 0, 2, 0)
      assert(approxEqual(result[0], 1)) // projected x
      assert(approxEqual(result[1], 0)) // projected y
    })
  })

  describe('distancePointToLine2D', function () {
    it('should compute perpendicular distance', function () {
      // Line: y = 0 (from (0,0) to (1,0))
      // Point: (0.5, 3)
      const dist = distancePointToLine2D(0.5, 3, 0, 0, 1, 0)
      assert(approxEqual(dist, 3))
    })
  })

  describe('distancePointToPlane', function () {
    it('should compute signed distance', function () {
      // Plane: z = 0 → 0x + 0y + 1z + 0 = 0
      // Point: (0,0,5)
      const dist = distancePointToPlane(0, 0, 5, 0, 0, 1, 0)
      assert(approxEqual(dist, 5))
    })
  })

  describe('polygonArea2D', function () {
    it('should compute area of square', function () {
      // Square: (0,0), (2,0), (2,2), (0,2)
      const vertices = new Float64Array([0, 0, 2, 0, 2, 2, 0, 2])
      assert(approxEqual(polygonArea2D(vertices), 4))
    })

    it('should compute area of triangle', function () {
      // Triangle: (0,0), (4,0), (0,3)
      const vertices = new Float64Array([0, 0, 4, 0, 0, 3])
      assert(approxEqual(polygonArea2D(vertices), 6))
    })
  })

  describe('polygonCentroid2D', function () {
    it('should compute centroid of triangle', function () {
      // Triangle: (0,0), (3,0), (0,3)
      // Centroid: (1,1)
      const vertices = new Float64Array([0, 0, 3, 0, 0, 3])
      const result = polygonCentroid2D(vertices)
      assert(approxEqual(result[0], 1))
      assert(approxEqual(result[1], 1))
    })
  })

  describe('pointInConvexPolygon2D', function () {
    it('should return 1 for point inside convex polygon', function () {
      // Square: (0,0), (2,0), (2,2), (0,2)
      const vertices = new Float64Array([0, 0, 2, 0, 2, 2, 0, 2])
      assert.strictEqual(pointInConvexPolygon2D(1, 1, vertices), 1)
    })

    it('should return 0 for point outside convex polygon', function () {
      const vertices = new Float64Array([0, 0, 2, 0, 2, 2, 0, 2])
      assert.strictEqual(pointInConvexPolygon2D(3, 3, vertices), 0)
    })
  })

  describe('geometry properties', function () {
    it('distance should be symmetric', function () {
      assert(approxEqual(distance2D(1, 2, 3, 4), distance2D(3, 4, 1, 2)))
    })

    it('normalized vector should have unit length', function () {
      const v = new Float64Array([3, 4, 5])
      const n = normalizeND(v)
      const length = Math.sqrt(n[0] ** 2 + n[1] ** 2 + n[2] ** 2)
      assert(approxEqual(length, 1))
    })

    it('cross product should be perpendicular to both inputs', function () {
      const a = [1, 2, 3]
      const b = [4, 5, 6]
      const c = cross3D(a[0], a[1], a[2], b[0], b[1], b[2])
      // c · a should be 0
      const dotA = c[0] * a[0] + c[1] * a[1] + c[2] * a[2]
      const dotB = c[0] * b[0] + c[1] * b[1] + c[2] * b[2]
      assert(approxEqual(dotA, 0))
      assert(approxEqual(dotB, 0))
    })

    it('triangle inequality should hold for distances', function () {
      const a = [0, 0]
      const b = [3, 0]
      const c = [0, 4]
      const ab = distance2D(a[0], a[1], b[0], b[1])
      const bc = distance2D(b[0], b[1], c[0], c[1])
      const ac = distance2D(a[0], a[1], c[0], c[1])
      assert(ab + bc >= ac)
      assert(ab + ac >= bc)
      assert(bc + ac >= ab)
    })
  })
})

/**
 * WASM-optimized geometry operations using AssemblyScript
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop
 */

/**
 * Calculate Euclidean distance between two points in 2D
 * @param x1 - X coordinate of first point
 * @param y1 - Y coordinate of first point
 * @param x2 - X coordinate of second point
 * @param y2 - Y coordinate of second point
 * @returns The distance
 */
export function distance2D(x1: f64, y1: f64, x2: f64, y2: f64): f64 {
  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Calculate Euclidean distance between two points in 3D
 * @param x1 - X coordinate of first point
 * @param y1 - Y coordinate of first point
 * @param z1 - Z coordinate of first point
 * @param x2 - X coordinate of second point
 * @param y2 - Y coordinate of second point
 * @param z2 - Z coordinate of second point
 * @returns The distance
 */
export function distance3D(
  x1: f64,
  y1: f64,
  z1: f64,
  x2: f64,
  y2: f64,
  z2: f64
): f64 {
  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const dz: f64 = z2 - z1
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculate Euclidean distance between two points in N dimensions
 * @param p1Ptr - Pointer to first point coordinates
 * @param p2Ptr - Pointer to second point coordinates
 * @param n - Number of dimensions
 * @returns The distance
 */
export function distanceND(p1Ptr: usize, p2Ptr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    const d: f64 = load<f64>(p2Ptr + offset) - load<f64>(p1Ptr + offset)
    sum += d * d
  }

  return Math.sqrt(sum)
}

/**
 * Calculate Manhattan distance between two points in 2D
 * @param x1 - X coordinate of first point
 * @param y1 - Y coordinate of first point
 * @param x2 - X coordinate of second point
 * @param y2 - Y coordinate of second point
 * @returns The Manhattan distance
 */
export function manhattanDistance2D(x1: f64, y1: f64, x2: f64, y2: f64): f64 {
  return Math.abs(x2 - x1) + Math.abs(y2 - y1)
}

/**
 * Calculate Manhattan distance between two points in N dimensions
 * @param p1Ptr - Pointer to first point coordinates
 * @param p2Ptr - Pointer to second point coordinates
 * @param n - Number of dimensions
 * @returns The Manhattan distance
 */
export function manhattanDistanceND(p1Ptr: usize, p2Ptr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    sum += Math.abs(load<f64>(p2Ptr + offset) - load<f64>(p1Ptr + offset))
  }

  return sum
}

/**
 * Calculate the intersection point of two 2D line segments
 * Line 1: (x1,y1) to (x2,y2)
 * Line 2: (x3,y3) to (x4,y4)
 * @param resultPtr - Pointer to output [x, y, exists] where exists is 1.0 if intersection exists, 0.0 otherwise
 */
export function intersect2DLines(
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64,
  x4: f64,
  y4: f64,
  resultPtr: usize
): void {
  const denom: f64 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  // Check if lines are parallel
  if (Math.abs(denom) < 1e-10) {
    store<f64>(resultPtr, 0.0)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, 0.0) // No intersection
    return
  }

  const t: f64 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u: f64 = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  // Check if intersection is within both line segments
  if (t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) {
    store<f64>(resultPtr, x1 + t * (x2 - x1))
    store<f64>(resultPtr + 8, y1 + t * (y2 - y1))
    store<f64>(resultPtr + 16, 1.0) // Intersection exists
  } else {
    store<f64>(resultPtr, x1 + t * (x2 - x1))
    store<f64>(resultPtr + 8, y1 + t * (y2 - y1))
    store<f64>(resultPtr + 16, 0.0) // Lines intersect but not within segments
  }
}

/**
 * Calculate the intersection point of two infinite 2D lines
 * Line 1: passes through (x1,y1) and (x2,y2)
 * Line 2: passes through (x3,y3) and (x4,y4)
 * @param resultPtr - Pointer to output [x, y, exists] where exists is 1.0 if intersection exists, 0.0 if parallel
 */
export function intersect2DInfiniteLines(
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64,
  x4: f64,
  y4: f64,
  resultPtr: usize
): void {
  const denom: f64 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  // Check if lines are parallel
  if (Math.abs(denom) < 1e-10) {
    store<f64>(resultPtr, 0.0)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, 0.0) // No intersection (parallel)
    return
  }

  const t: f64 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom

  store<f64>(resultPtr, x1 + t * (x2 - x1))
  store<f64>(resultPtr + 8, y1 + t * (y2 - y1))
  store<f64>(resultPtr + 16, 1.0) // Intersection exists
}

/**
 * Calculate the intersection of a line and a plane in 3D
 * Line: point (px,py,pz) with direction (dx,dy,dz)
 * Plane: ax + by + cz + d = 0
 * @param resultPtr - Pointer to output [x, y, z, exists] where exists is 1.0 if intersection exists
 */
export function intersectLinePlane(
  px: f64,
  py: f64,
  pz: f64,
  dx: f64,
  dy: f64,
  dz: f64,
  a: f64,
  b: f64,
  c: f64,
  d: f64,
  resultPtr: usize
): void {
  const denom: f64 = a * dx + b * dy + c * dz

  // Check if line is parallel to plane
  if (Math.abs(denom) < 1e-10) {
    store<f64>(resultPtr, 0.0)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, 0.0)
    store<f64>(resultPtr + 24, 0.0) // No intersection (parallel)
    return
  }

  const t: f64 = -(a * px + b * py + c * pz + d) / denom

  store<f64>(resultPtr, px + t * dx)
  store<f64>(resultPtr + 8, py + t * dy)
  store<f64>(resultPtr + 16, pz + t * dz)
  store<f64>(resultPtr + 24, 1.0) // Intersection exists
}

/**
 * Calculate the cross product of two 3D vectors
 * @param ax - X component of first vector
 * @param ay - Y component of first vector
 * @param az - Z component of first vector
 * @param bx - X component of second vector
 * @param by - Y component of second vector
 * @param bz - Z component of second vector
 * @param resultPtr - Pointer to output [x, y, z] components of cross product
 */
export function cross3D(
  ax: f64,
  ay: f64,
  az: f64,
  bx: f64,
  by: f64,
  bz: f64,
  resultPtr: usize
): void {
  store<f64>(resultPtr, ay * bz - az * by)
  store<f64>(resultPtr + 8, az * bx - ax * bz)
  store<f64>(resultPtr + 16, ax * by - ay * bx)
}

/**
 * Calculate the dot product of two vectors
 * @param aPtr - Pointer to first vector
 * @param bPtr - Pointer to second vector
 * @param n - Number of dimensions
 * @returns The dot product
 */
export function dotND(aPtr: usize, bPtr: usize, n: i32): f64 {
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    sum += load<f64>(aPtr + offset) * load<f64>(bPtr + offset)
  }

  return sum
}

/**
 * Calculate the angle between two 2D vectors
 * @param x1 - X component of first vector
 * @param y1 - Y component of first vector
 * @param x2 - X component of second vector
 * @param y2 - Y component of second vector
 * @returns The angle in radians
 */
export function angle2D(x1: f64, y1: f64, x2: f64, y2: f64): f64 {
  const dot: f64 = x1 * x2 + y1 * y2
  const mag1: f64 = Math.sqrt(x1 * x1 + y1 * y1)
  const mag2: f64 = Math.sqrt(x2 * x2 + y2 * y2)

  if (mag1 < 1e-10 || mag2 < 1e-10) {
    return 0.0
  }

  let cosAngle: f64 = dot / (mag1 * mag2)

  // Clamp to [-1, 1] to avoid NaN from acos
  if (cosAngle > 1.0) cosAngle = 1.0
  if (cosAngle < -1.0) cosAngle = -1.0

  return Math.acos(cosAngle)
}

/**
 * Calculate the angle between two 3D vectors
 * @param x1 - X component of first vector
 * @param y1 - Y component of first vector
 * @param z1 - Z component of first vector
 * @param x2 - X component of second vector
 * @param y2 - Y component of second vector
 * @param z2 - Z component of second vector
 * @returns The angle in radians
 */
export function angle3D(
  x1: f64,
  y1: f64,
  z1: f64,
  x2: f64,
  y2: f64,
  z2: f64
): f64 {
  const dot: f64 = x1 * x2 + y1 * y2 + z1 * z2
  const mag1: f64 = Math.sqrt(x1 * x1 + y1 * y1 + z1 * z1)
  const mag2: f64 = Math.sqrt(x2 * x2 + y2 * y2 + z2 * z2)

  if (mag1 < 1e-10 || mag2 < 1e-10) {
    return 0.0
  }

  let cosAngle: f64 = dot / (mag1 * mag2)

  // Clamp to [-1, 1] to avoid NaN from acos
  if (cosAngle > 1.0) cosAngle = 1.0
  if (cosAngle < -1.0) cosAngle = -1.0

  return Math.acos(cosAngle)
}

/**
 * Calculate the area of a triangle given three 2D points
 * @param x1 - X coordinate of first point
 * @param y1 - Y coordinate of first point
 * @param x2 - X coordinate of second point
 * @param y2 - Y coordinate of second point
 * @param x3 - X coordinate of third point
 * @param y3 - Y coordinate of third point
 * @returns The area of the triangle
 */
export function triangleArea2D(
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64
): f64 {
  return Math.abs((x1 * (y2 - y3) + x2 * (y3 - y1) + x3 * (y1 - y2)) / 2.0)
}

/**
 * Check if a point is inside a triangle (2D)
 * @param px - X coordinate of point
 * @param py - Y coordinate of point
 * @param x1 - X coordinate of first triangle vertex
 * @param y1 - Y coordinate of first triangle vertex
 * @param x2 - X coordinate of second triangle vertex
 * @param y2 - Y coordinate of second triangle vertex
 * @param x3 - X coordinate of third triangle vertex
 * @param y3 - Y coordinate of third triangle vertex
 * @returns 1.0 if inside, 0.0 if outside
 */
export function pointInTriangle2D(
  px: f64,
  py: f64,
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64
): f64 {
  const areaOrig: f64 = triangleArea2D(x1, y1, x2, y2, x3, y3)
  const area1: f64 = triangleArea2D(px, py, x2, y2, x3, y3)
  const area2: f64 = triangleArea2D(x1, y1, px, py, x3, y3)
  const area3: f64 = triangleArea2D(x1, y1, x2, y2, px, py)

  // Check if sum of sub-triangles equals original triangle
  if (Math.abs(areaOrig - (area1 + area2 + area3)) < 1e-10) {
    return 1.0
  }
  return 0.0
}

/**
 * Normalize a vector
 * @param vPtr - Pointer to input vector
 * @param n - Number of dimensions
 * @param resultPtr - Pointer to output normalized vector
 */
export function normalizeND(vPtr: usize, n: i32, resultPtr: usize): void {
  let mag: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    const val: f64 = load<f64>(vPtr + ((<usize>i) << 3))
    mag += val * val
  }
  mag = Math.sqrt(mag)

  if (mag < 1e-10) {
    // Return zero vector
    for (let i: i32 = 0; i < n; i++) {
      store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
    }
    return
  }

  for (let i: i32 = 0; i < n; i++) {
    const offset: usize = (<usize>i) << 3
    store<f64>(resultPtr + offset, load<f64>(vPtr + offset) / mag)
  }
}

/**
 * Calculate intersection points of a line and a circle in 2D
 * Line: point (px,py) with direction (dx,dy)
 * Circle: center (cx,cy) with radius r
 * @param resultPtr - Pointer to output [x1, y1, x2, y2, count] where count is 0, 1, or 2
 */
export function intersectLineCircle(
  px: f64,
  py: f64,
  dx: f64,
  dy: f64,
  cx: f64,
  cy: f64,
  r: f64,
  resultPtr: usize
): void {
  // Translate so circle is at origin
  const ox: f64 = px - cx
  const oy: f64 = py - cy

  // Quadratic coefficients: a*t^2 + b*t + c = 0
  const a: f64 = dx * dx + dy * dy
  const b: f64 = 2.0 * (ox * dx + oy * dy)
  const c: f64 = ox * ox + oy * oy - r * r

  const discriminant: f64 = b * b - 4.0 * a * c

  if (discriminant < 0 || a < 1e-14) {
    // No intersection
    store<f64>(resultPtr + 32, 0.0)
    return
  }

  if (discriminant < 1e-10) {
    // One intersection (tangent)
    const t: f64 = -b / (2.0 * a)
    store<f64>(resultPtr, px + t * dx)
    store<f64>(resultPtr + 8, py + t * dy)
    store<f64>(resultPtr + 32, 1.0)
    return
  }

  // Two intersections
  const sqrtDisc: f64 = Math.sqrt(discriminant)
  const t1: f64 = (-b - sqrtDisc) / (2.0 * a)
  const t2: f64 = (-b + sqrtDisc) / (2.0 * a)

  store<f64>(resultPtr, px + t1 * dx)
  store<f64>(resultPtr + 8, py + t1 * dy)
  store<f64>(resultPtr + 16, px + t2 * dx)
  store<f64>(resultPtr + 24, py + t2 * dy)
  store<f64>(resultPtr + 32, 2.0)
}

/**
 * Calculate intersection points of a line and a sphere in 3D
 * Line: point (px,py,pz) with direction (dx,dy,dz)
 * Sphere: center (cx,cy,cz) with radius r
 * @param resultPtr - Pointer to output [x1, y1, z1, x2, y2, z2, count] where count is 0, 1, or 2
 */
export function intersectLineSphere(
  px: f64,
  py: f64,
  pz: f64,
  dx: f64,
  dy: f64,
  dz: f64,
  cx: f64,
  cy: f64,
  cz: f64,
  r: f64,
  resultPtr: usize
): void {
  // Translate so sphere is at origin
  const ox: f64 = px - cx
  const oy: f64 = py - cy
  const oz: f64 = pz - cz

  // Quadratic coefficients: a*t^2 + b*t + c = 0
  const a: f64 = dx * dx + dy * dy + dz * dz
  const b: f64 = 2.0 * (ox * dx + oy * dy + oz * dz)
  const c: f64 = ox * ox + oy * oy + oz * oz - r * r

  const discriminant: f64 = b * b - 4.0 * a * c

  if (discriminant < 0 || a < 1e-14) {
    // No intersection
    store<f64>(resultPtr + 48, 0.0)
    return
  }

  if (discriminant < 1e-10) {
    // One intersection (tangent)
    const t: f64 = -b / (2.0 * a)
    store<f64>(resultPtr, px + t * dx)
    store<f64>(resultPtr + 8, py + t * dy)
    store<f64>(resultPtr + 16, pz + t * dz)
    store<f64>(resultPtr + 48, 1.0)
    return
  }

  // Two intersections
  const sqrtDisc: f64 = Math.sqrt(discriminant)
  const t1: f64 = (-b - sqrtDisc) / (2.0 * a)
  const t2: f64 = (-b + sqrtDisc) / (2.0 * a)

  store<f64>(resultPtr, px + t1 * dx)
  store<f64>(resultPtr + 8, py + t1 * dy)
  store<f64>(resultPtr + 16, pz + t1 * dz)
  store<f64>(resultPtr + 24, px + t2 * dx)
  store<f64>(resultPtr + 32, py + t2 * dy)
  store<f64>(resultPtr + 40, pz + t2 * dz)
  store<f64>(resultPtr + 48, 2.0)
}

/**
 * Calculate intersection points of two circles in 2D
 * Circle 1: center (x1,y1) with radius r1
 * Circle 2: center (x2,y2) with radius r2
 * @param resultPtr - Pointer to output [px1, py1, px2, py2, count] where count is 0, 1, or 2
 */
export function intersectCircles(
  x1: f64,
  y1: f64,
  r1: f64,
  x2: f64,
  y2: f64,
  r2: f64,
  resultPtr: usize
): void {
  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const d: f64 = Math.sqrt(dx * dx + dy * dy)

  // Check for no solution cases
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d < 1e-14) {
    store<f64>(resultPtr + 32, 0.0)
    return
  }

  const a: f64 = (r1 * r1 - r2 * r2 + d * d) / (2.0 * d)
  const h2: f64 = r1 * r1 - a * a

  if (h2 < 0) {
    store<f64>(resultPtr + 32, 0.0)
    return
  }

  const h: f64 = Math.sqrt(h2)

  // Point on line between centers at distance a from center 1
  const px: f64 = x1 + (a * dx) / d
  const py: f64 = y1 + (a * dy) / d

  if (h < 1e-10) {
    // One intersection (tangent)
    store<f64>(resultPtr, px)
    store<f64>(resultPtr + 8, py)
    store<f64>(resultPtr + 32, 1.0)
    return
  }

  // Two intersections
  store<f64>(resultPtr, px + (h * dy) / d)
  store<f64>(resultPtr + 8, py - (h * dx) / d)
  store<f64>(resultPtr + 16, px - (h * dy) / d)
  store<f64>(resultPtr + 24, py + (h * dx) / d)
  store<f64>(resultPtr + 32, 2.0)
}

/**
 * Project a point onto a line in 2D
 * Point: (px, py)
 * Line: passes through (x1, y1) and (x2, y2)
 * @param resultPtr - Pointer to output [projected_x, projected_y, t] where t is parameter on line
 */
export function projectPointOnLine2D(
  px: f64,
  py: f64,
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  resultPtr: usize
): void {
  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const lenSq: f64 = dx * dx + dy * dy

  if (lenSq < 1e-14) {
    store<f64>(resultPtr, x1)
    store<f64>(resultPtr + 8, y1)
    store<f64>(resultPtr + 16, 0.0)
    return
  }

  const t: f64 = ((px - x1) * dx + (py - y1) * dy) / lenSq

  store<f64>(resultPtr, x1 + t * dx)
  store<f64>(resultPtr + 8, y1 + t * dy)
  store<f64>(resultPtr + 16, t)
}

/**
 * Calculate distance from a point to a line in 2D
 * Point: (px, py)
 * Line: passes through (x1, y1) and (x2, y2)
 * @returns The perpendicular distance
 */
export function distancePointToLine2D(
  px: f64,
  py: f64,
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64
): f64 {
  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const len: f64 = Math.sqrt(dx * dx + dy * dy)

  if (len < 1e-14) {
    return Math.sqrt((px - x1) * (px - x1) + (py - y1) * (py - y1))
  }

  // |cross product| / |line direction|
  return Math.abs((px - x1) * dy - (py - y1) * dx) / len
}

/**
 * Calculate distance from a point to a plane in 3D
 * Point: (px, py, pz)
 * Plane: ax + by + cz + d = 0
 * @returns The perpendicular distance (signed)
 */
export function distancePointToPlane(
  px: f64,
  py: f64,
  pz: f64,
  a: f64,
  b: f64,
  c: f64,
  d: f64
): f64 {
  const norm: f64 = Math.sqrt(a * a + b * b + c * c)

  if (norm < 1e-14) {
    return 0.0
  }

  return (a * px + b * py + c * pz + d) / norm
}

/**
 * Calculate the centroid of a polygon in 2D
 * @param verticesPtr - Pointer to flat array of [x1, y1, x2, y2, ..., xn, yn]
 * @param n - Number of vertices
 * @param resultPtr - Pointer to output [cx, cy]
 */
export function polygonCentroid2D(
  verticesPtr: usize,
  n: i32,
  resultPtr: usize
): void {
  if (n < 3) {
    store<f64>(resultPtr, 0.0)
    store<f64>(resultPtr + 8, 0.0)
    return
  }

  let cx: f64 = 0.0
  let cy: f64 = 0.0
  let signedArea: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    const x0: f64 = load<f64>(verticesPtr + ((<usize>(i << 1)) << 3))
    const y0: f64 = load<f64>(verticesPtr + ((<usize>(i << 1)) << 3) + 8)
    const x1: f64 = load<f64>(verticesPtr + ((<usize>(j << 1)) << 3))
    const y1: f64 = load<f64>(verticesPtr + ((<usize>(j << 1)) << 3) + 8)

    const a: f64 = x0 * y1 - x1 * y0
    signedArea += a
    cx += (x0 + x1) * a
    cy += (y0 + y1) * a
  }

  signedArea *= 0.5

  if (Math.abs(signedArea) < 1e-14) {
    // Degenerate polygon - return average of vertices
    let sumX: f64 = 0.0
    let sumY: f64 = 0.0
    for (let i: i32 = 0; i < n; i++) {
      sumX += load<f64>(verticesPtr + ((<usize>(i << 1)) << 3))
      sumY += load<f64>(verticesPtr + ((<usize>(i << 1)) << 3) + 8)
    }
    store<f64>(resultPtr, sumX / f64(n))
    store<f64>(resultPtr + 8, sumY / f64(n))
    return
  }

  cx /= 6.0 * signedArea
  cy /= 6.0 * signedArea

  store<f64>(resultPtr, cx)
  store<f64>(resultPtr + 8, cy)
}

/**
 * Calculate the area of a polygon in 2D using shoelace formula
 * @param verticesPtr - Pointer to flat array of [x1, y1, x2, y2, ..., xn, yn]
 * @param n - Number of vertices
 * @returns The area (positive)
 */
export function polygonArea2D(verticesPtr: usize, n: i32): f64 {
  if (n < 3) {
    return 0.0
  }

  let area: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    area +=
      load<f64>(verticesPtr + ((<usize>(i << 1)) << 3)) *
      load<f64>(verticesPtr + ((<usize>(j << 1)) << 3) + 8)
    area -=
      load<f64>(verticesPtr + ((<usize>(j << 1)) << 3)) *
      load<f64>(verticesPtr + ((<usize>(i << 1)) << 3) + 8)
  }

  return Math.abs(area) / 2.0
}

/**
 * Check if a point is inside a convex polygon in 2D
 * Uses cross product method
 * @param px - X coordinate of point
 * @param py - Y coordinate of point
 * @param verticesPtr - Pointer to flat array of polygon vertices [x1, y1, x2, y2, ...]
 * @param n - Number of vertices
 * @returns 1.0 if inside, 0.0 if outside
 */
export function pointInConvexPolygon2D(
  px: f64,
  py: f64,
  verticesPtr: usize,
  n: i32
): f64 {
  if (n < 3) {
    return 0.0
  }

  let sign: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    const x1: f64 = load<f64>(verticesPtr + ((<usize>(i << 1)) << 3))
    const y1: f64 = load<f64>(verticesPtr + ((<usize>(i << 1)) << 3) + 8)
    const x2: f64 = load<f64>(verticesPtr + ((<usize>(j << 1)) << 3))
    const y2: f64 = load<f64>(verticesPtr + ((<usize>(j << 1)) << 3) + 8)

    const cross: f64 = (x2 - x1) * (py - y1) - (y2 - y1) * (px - x1)

    if (i === 0) {
      sign = cross >= 0 ? 1 : -1
    } else {
      const currentSign: i32 = cross >= 0 ? 1 : -1
      if (currentSign !== sign && Math.abs(cross) > 1e-10) {
        return 0.0
      }
    }
  }

  return 1.0
}

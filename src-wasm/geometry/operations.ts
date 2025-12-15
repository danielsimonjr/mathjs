/**
 * WASM-optimized geometry operations using AssemblyScript
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
 * @param p1 - First point coordinates
 * @param p2 - Second point coordinates
 * @returns The distance
 */
export function distanceND(p1: Float64Array, p2: Float64Array): f64 {
  const n: i32 = p1.length
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const d: f64 = p2[i] - p1[i]
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
 * @param p1 - First point coordinates
 * @param p2 - Second point coordinates
 * @returns The Manhattan distance
 */
export function manhattanDistanceND(p1: Float64Array, p2: Float64Array): f64 {
  const n: i32 = p1.length
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += Math.abs(p2[i] - p1[i])
  }

  return sum
}

/**
 * Calculate the intersection point of two 2D line segments
 * Line 1: (x1,y1) to (x2,y2)
 * Line 2: (x3,y3) to (x4,y4)
 * @returns Float64Array with [x, y, exists] where exists is 1.0 if intersection exists, 0.0 otherwise
 */
export function intersect2DLines(
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64,
  x4: f64,
  y4: f64
): Float64Array {
  const result = new Float64Array(3)

  const denom: f64 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  // Check if lines are parallel
  if (Math.abs(denom) < 1e-10) {
    result[0] = 0.0
    result[1] = 0.0
    result[2] = 0.0 // No intersection
    return result
  }

  const t: f64 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
  const u: f64 = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

  // Check if intersection is within both line segments
  if (t >= 0.0 && t <= 1.0 && u >= 0.0 && u <= 1.0) {
    result[0] = x1 + t * (x2 - x1)
    result[1] = y1 + t * (y2 - y1)
    result[2] = 1.0 // Intersection exists
  } else {
    result[0] = x1 + t * (x2 - x1)
    result[1] = y1 + t * (y2 - y1)
    result[2] = 0.0 // Lines intersect but not within segments
  }

  return result
}

/**
 * Calculate the intersection point of two infinite 2D lines
 * Line 1: passes through (x1,y1) and (x2,y2)
 * Line 2: passes through (x3,y3) and (x4,y4)
 * @returns Float64Array with [x, y, exists] where exists is 1.0 if intersection exists, 0.0 if parallel
 */
export function intersect2DInfiniteLines(
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64,
  x3: f64,
  y3: f64,
  x4: f64,
  y4: f64
): Float64Array {
  const result = new Float64Array(3)

  const denom: f64 = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

  // Check if lines are parallel
  if (Math.abs(denom) < 1e-10) {
    result[0] = 0.0
    result[1] = 0.0
    result[2] = 0.0 // No intersection (parallel)
    return result
  }

  const t: f64 = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom

  result[0] = x1 + t * (x2 - x1)
  result[1] = y1 + t * (y2 - y1)
  result[2] = 1.0 // Intersection exists

  return result
}

/**
 * Calculate the intersection of a line and a plane in 3D
 * Line: point (px,py,pz) with direction (dx,dy,dz)
 * Plane: ax + by + cz + d = 0
 * @returns Float64Array with [x, y, z, exists] where exists is 1.0 if intersection exists
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
  d: f64
): Float64Array {
  const result = new Float64Array(4)

  const denom: f64 = a * dx + b * dy + c * dz

  // Check if line is parallel to plane
  if (Math.abs(denom) < 1e-10) {
    result[0] = 0.0
    result[1] = 0.0
    result[2] = 0.0
    result[3] = 0.0 // No intersection (parallel)
    return result
  }

  const t: f64 = -(a * px + b * py + c * pz + d) / denom

  result[0] = px + t * dx
  result[1] = py + t * dy
  result[2] = pz + t * dz
  result[3] = 1.0 // Intersection exists

  return result
}

/**
 * Calculate the cross product of two 3D vectors
 * @param ax - X component of first vector
 * @param ay - Y component of first vector
 * @param az - Z component of first vector
 * @param bx - X component of second vector
 * @param by - Y component of second vector
 * @param bz - Z component of second vector
 * @returns Float64Array with [x, y, z] components of cross product
 */
export function cross3D(
  ax: f64,
  ay: f64,
  az: f64,
  bx: f64,
  by: f64,
  bz: f64
): Float64Array {
  const result = new Float64Array(3)
  result[0] = ay * bz - az * by
  result[1] = az * bx - ax * bz
  result[2] = ax * by - ay * bx
  return result
}

/**
 * Calculate the dot product of two vectors
 * @param a - First vector
 * @param b - Second vector
 * @returns The dot product
 */
export function dotND(a: Float64Array, b: Float64Array): f64 {
  const n: i32 = a.length
  let sum: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    sum += a[i] * b[i]
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
 * @param v - Input vector
 * @returns Normalized vector
 */
export function normalizeND(v: Float64Array): Float64Array {
  const n: i32 = v.length
  const result = new Float64Array(n)

  let mag: f64 = 0.0
  for (let i: i32 = 0; i < n; i++) {
    mag += v[i] * v[i]
  }
  mag = Math.sqrt(mag)

  if (mag < 1e-10) {
    return result // Return zero vector
  }

  for (let i: i32 = 0; i < n; i++) {
    result[i] = v[i] / mag
  }

  return result
}

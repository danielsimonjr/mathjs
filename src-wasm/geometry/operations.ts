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

/**
 * Calculate intersection points of a line and a circle in 2D
 * Line: point (px,py) with direction (dx,dy)
 * Circle: center (cx,cy) with radius r
 * @returns Float64Array with [x1, y1, x2, y2, count] where count is 0, 1, or 2
 */
export function intersectLineCircle(
  px: f64,
  py: f64,
  dx: f64,
  dy: f64,
  cx: f64,
  cy: f64,
  r: f64
): Float64Array {
  const result = new Float64Array(5)

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
    result[4] = 0.0
    return result
  }

  if (discriminant < 1e-10) {
    // One intersection (tangent)
    const t: f64 = -b / (2.0 * a)
    result[0] = px + t * dx
    result[1] = py + t * dy
    result[4] = 1.0
    return result
  }

  // Two intersections
  const sqrtDisc: f64 = Math.sqrt(discriminant)
  const t1: f64 = (-b - sqrtDisc) / (2.0 * a)
  const t2: f64 = (-b + sqrtDisc) / (2.0 * a)

  result[0] = px + t1 * dx
  result[1] = py + t1 * dy
  result[2] = px + t2 * dx
  result[3] = py + t2 * dy
  result[4] = 2.0

  return result
}

/**
 * Calculate intersection points of a line and a sphere in 3D
 * Line: point (px,py,pz) with direction (dx,dy,dz)
 * Sphere: center (cx,cy,cz) with radius r
 * @returns Float64Array with [x1, y1, z1, x2, y2, z2, count] where count is 0, 1, or 2
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
  r: f64
): Float64Array {
  const result = new Float64Array(7)

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
    result[6] = 0.0
    return result
  }

  if (discriminant < 1e-10) {
    // One intersection (tangent)
    const t: f64 = -b / (2.0 * a)
    result[0] = px + t * dx
    result[1] = py + t * dy
    result[2] = pz + t * dz
    result[6] = 1.0
    return result
  }

  // Two intersections
  const sqrtDisc: f64 = Math.sqrt(discriminant)
  const t1: f64 = (-b - sqrtDisc) / (2.0 * a)
  const t2: f64 = (-b + sqrtDisc) / (2.0 * a)

  result[0] = px + t1 * dx
  result[1] = py + t1 * dy
  result[2] = pz + t1 * dz
  result[3] = px + t2 * dx
  result[4] = py + t2 * dy
  result[5] = pz + t2 * dz
  result[6] = 2.0

  return result
}

/**
 * Calculate intersection points of two circles in 2D
 * Circle 1: center (x1,y1) with radius r1
 * Circle 2: center (x2,y2) with radius r2
 * @returns Float64Array with [px1, py1, px2, py2, count] where count is 0, 1, or 2
 */
export function intersectCircles(
  x1: f64,
  y1: f64,
  r1: f64,
  x2: f64,
  y2: f64,
  r2: f64
): Float64Array {
  const result = new Float64Array(5)

  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const d: f64 = Math.sqrt(dx * dx + dy * dy)

  // Check for no solution cases
  if (d > r1 + r2 || d < Math.abs(r1 - r2) || d < 1e-14) {
    result[4] = 0.0
    return result
  }

  const a: f64 = (r1 * r1 - r2 * r2 + d * d) / (2.0 * d)
  const h2: f64 = r1 * r1 - a * a

  if (h2 < 0) {
    result[4] = 0.0
    return result
  }

  const h: f64 = Math.sqrt(h2)

  // Point on line between centers at distance a from center 1
  const px: f64 = x1 + a * dx / d
  const py: f64 = y1 + a * dy / d

  if (h < 1e-10) {
    // One intersection (tangent)
    result[0] = px
    result[1] = py
    result[4] = 1.0
    return result
  }

  // Two intersections
  result[0] = px + h * dy / d
  result[1] = py - h * dx / d
  result[2] = px - h * dy / d
  result[3] = py + h * dx / d
  result[4] = 2.0

  return result
}

/**
 * Project a point onto a line in 2D
 * Point: (px, py)
 * Line: passes through (x1, y1) and (x2, y2)
 * @returns Float64Array with [projected_x, projected_y, t] where t is parameter on line
 */
export function projectPointOnLine2D(
  px: f64,
  py: f64,
  x1: f64,
  y1: f64,
  x2: f64,
  y2: f64
): Float64Array {
  const result = new Float64Array(3)

  const dx: f64 = x2 - x1
  const dy: f64 = y2 - y1
  const lenSq: f64 = dx * dx + dy * dy

  if (lenSq < 1e-14) {
    result[0] = x1
    result[1] = y1
    result[2] = 0.0
    return result
  }

  const t: f64 = ((px - x1) * dx + (py - y1) * dy) / lenSq

  result[0] = x1 + t * dx
  result[1] = y1 + t * dy
  result[2] = t

  return result
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
 * @param vertices - Flat array of [x1, y1, x2, y2, ..., xn, yn]
 * @returns Float64Array with [cx, cy]
 */
export function polygonCentroid2D(vertices: Float64Array): Float64Array {
  const result = new Float64Array(2)
  const n: i32 = (vertices.length / 2) as i32

  if (n < 3) {
    return result
  }

  let cx: f64 = 0.0
  let cy: f64 = 0.0
  let signedArea: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    const x0: f64 = vertices[i * 2]
    const y0: f64 = vertices[i * 2 + 1]
    const x1: f64 = vertices[j * 2]
    const y1: f64 = vertices[j * 2 + 1]

    const a: f64 = x0 * y1 - x1 * y0
    signedArea += a
    cx += (x0 + x1) * a
    cy += (y0 + y1) * a
  }

  signedArea *= 0.5

  if (Math.abs(signedArea) < 1e-14) {
    // Degenerate polygon - return average of vertices
    for (let i: i32 = 0; i < n; i++) {
      cx += vertices[i * 2]
      cy += vertices[i * 2 + 1]
    }
    result[0] = cx / f64(n)
    result[1] = cy / f64(n)
    return result
  }

  cx /= (6.0 * signedArea)
  cy /= (6.0 * signedArea)

  result[0] = cx
  result[1] = cy

  return result
}

/**
 * Calculate the area of a polygon in 2D using shoelace formula
 * @param vertices - Flat array of [x1, y1, x2, y2, ..., xn, yn]
 * @returns The area (positive)
 */
export function polygonArea2D(vertices: Float64Array): f64 {
  const n: i32 = (vertices.length / 2) as i32

  if (n < 3) {
    return 0.0
  }

  let area: f64 = 0.0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    area += vertices[i * 2] * vertices[j * 2 + 1]
    area -= vertices[j * 2] * vertices[i * 2 + 1]
  }

  return Math.abs(area) / 2.0
}

/**
 * Check if a point is inside a convex polygon in 2D
 * Uses cross product method
 * @param px - X coordinate of point
 * @param py - Y coordinate of point
 * @param vertices - Flat array of polygon vertices [x1, y1, x2, y2, ...]
 * @returns 1.0 if inside, 0.0 if outside
 */
export function pointInConvexPolygon2D(
  px: f64,
  py: f64,
  vertices: Float64Array
): f64 {
  const n: i32 = (vertices.length / 2) as i32

  if (n < 3) {
    return 0.0
  }

  let sign: i32 = 0

  for (let i: i32 = 0; i < n; i++) {
    const j: i32 = (i + 1) % n
    const x1: f64 = vertices[i * 2]
    const y1: f64 = vertices[i * 2 + 1]
    const x2: f64 = vertices[j * 2]
    const y2: f64 = vertices[j * 2 + 1]

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

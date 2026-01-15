/**
 * WASM-optimized rotation matrix operations
 *
 * Provides 2D and 3D rotation matrices, quaternion operations,
 * and various rotation representations.
 */

/**
 * Create a 2D rotation matrix
 * @param angle - Rotation angle in radians
 * @returns 2x2 rotation matrix (row-major)
 */
export function rotationMatrix2D(angle: f64): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  const result = new Float64Array(4)
  result[0] = c
  result[1] = -s
  result[2] = s
  result[3] = c

  return result
}

/**
 * Rotate a 2D point
 * @param point - Point [x, y]
 * @param angle - Rotation angle in radians
 * @returns Rotated point [x', y']
 */
export function rotate2D(point: Float64Array, angle: f64): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  const result = new Float64Array(2)
  result[0] = c * point[0] - s * point[1]
  result[1] = s * point[0] + c * point[1]

  return result
}

/**
 * Rotate a 2D point around a center point
 * @param point - Point [x, y]
 * @param center - Center of rotation [cx, cy]
 * @param angle - Rotation angle in radians
 * @returns Rotated point [x', y']
 */
export function rotate2DAroundPoint(
  point: Float64Array,
  center: Float64Array,
  angle: f64
): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  // Translate to origin
  const dx: f64 = point[0] - center[0]
  const dy: f64 = point[1] - center[1]

  // Rotate and translate back
  const result = new Float64Array(2)
  result[0] = c * dx - s * dy + center[0]
  result[1] = s * dx + c * dy + center[1]

  return result
}

/**
 * Create 3D rotation matrix around X axis
 * @param angle - Rotation angle in radians
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixX(angle: f64): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  const result = new Float64Array(9)
  result[0] = 1.0
  result[1] = 0.0
  result[2] = 0.0
  result[3] = 0.0
  result[4] = c
  result[5] = -s
  result[6] = 0.0
  result[7] = s
  result[8] = c

  return result
}

/**
 * Create 3D rotation matrix around Y axis
 * @param angle - Rotation angle in radians
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixY(angle: f64): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  const result = new Float64Array(9)
  result[0] = c
  result[1] = 0.0
  result[2] = s
  result[3] = 0.0
  result[4] = 1.0
  result[5] = 0.0
  result[6] = -s
  result[7] = 0.0
  result[8] = c

  return result
}

/**
 * Create 3D rotation matrix around Z axis
 * @param angle - Rotation angle in radians
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixZ(angle: f64): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  const result = new Float64Array(9)
  result[0] = c
  result[1] = -s
  result[2] = 0.0
  result[3] = s
  result[4] = c
  result[5] = 0.0
  result[6] = 0.0
  result[7] = 0.0
  result[8] = 1.0

  return result
}

/**
 * Create 3D rotation matrix from axis-angle representation
 * @param axis - Unit axis vector [x, y, z]
 * @param angle - Rotation angle in radians
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixAxisAngle(
  axis: Float64Array,
  angle: f64
): Float64Array {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)
  const t: f64 = 1.0 - c

  const x: f64 = axis[0]
  const y: f64 = axis[1]
  const z: f64 = axis[2]

  const result = new Float64Array(9)
  result[0] = t * x * x + c
  result[1] = t * x * y - s * z
  result[2] = t * x * z + s * y
  result[3] = t * x * y + s * z
  result[4] = t * y * y + c
  result[5] = t * y * z - s * x
  result[6] = t * x * z - s * y
  result[7] = t * y * z + s * x
  result[8] = t * z * z + c

  return result
}

/**
 * Create 3D rotation matrix from Euler angles (ZYX convention)
 * Also known as yaw-pitch-roll
 * @param yaw - Rotation around Z axis
 * @param pitch - Rotation around Y axis
 * @param roll - Rotation around X axis
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixEulerZYX(
  yaw: f64,
  pitch: f64,
  roll: f64
): Float64Array {
  const cy: f64 = Math.cos(yaw)
  const sy: f64 = Math.sin(yaw)
  const cp: f64 = Math.cos(pitch)
  const sp: f64 = Math.sin(pitch)
  const cr: f64 = Math.cos(roll)
  const sr: f64 = Math.sin(roll)

  const result = new Float64Array(9)
  result[0] = cy * cp
  result[1] = cy * sp * sr - sy * cr
  result[2] = cy * sp * cr + sy * sr
  result[3] = sy * cp
  result[4] = sy * sp * sr + cy * cr
  result[5] = sy * sp * cr - cy * sr
  result[6] = -sp
  result[7] = cp * sr
  result[8] = cp * cr

  return result
}

/**
 * Create 3D rotation matrix from Euler angles (XYZ convention)
 * @param alpha - Rotation around X axis
 * @param beta - Rotation around Y axis
 * @param gamma - Rotation around Z axis
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixEulerXYZ(
  alpha: f64,
  beta: f64,
  gamma: f64
): Float64Array {
  const ca: f64 = Math.cos(alpha)
  const sa: f64 = Math.sin(alpha)
  const cb: f64 = Math.cos(beta)
  const sb: f64 = Math.sin(beta)
  const cg: f64 = Math.cos(gamma)
  const sg: f64 = Math.sin(gamma)

  const result = new Float64Array(9)
  result[0] = cb * cg
  result[1] = -cb * sg
  result[2] = sb
  result[3] = ca * sg + sa * sb * cg
  result[4] = ca * cg - sa * sb * sg
  result[5] = -sa * cb
  result[6] = sa * sg - ca * sb * cg
  result[7] = sa * cg + ca * sb * sg
  result[8] = ca * cb

  return result
}

/**
 * Create 3D rotation matrix from quaternion
 * @param q - Quaternion [w, x, y, z]
 * @returns 3x3 rotation matrix (row-major)
 */
export function rotationMatrixFromQuaternion(q: Float64Array): Float64Array {
  const w: f64 = q[0]
  const x: f64 = q[1]
  const y: f64 = q[2]
  const z: f64 = q[3]

  const result = new Float64Array(9)
  result[0] = 1.0 - 2.0 * (y * y + z * z)
  result[1] = 2.0 * (x * y - w * z)
  result[2] = 2.0 * (x * z + w * y)
  result[3] = 2.0 * (x * y + w * z)
  result[4] = 1.0 - 2.0 * (x * x + z * z)
  result[5] = 2.0 * (y * z - w * x)
  result[6] = 2.0 * (x * z - w * y)
  result[7] = 2.0 * (y * z + w * x)
  result[8] = 1.0 - 2.0 * (x * x + y * y)

  return result
}

/**
 * Convert rotation matrix to quaternion
 * @param R - 3x3 rotation matrix (row-major)
 * @returns Quaternion [w, x, y, z]
 */
export function quaternionFromRotationMatrix(R: Float64Array): Float64Array {
  const result = new Float64Array(4)

  const trace: f64 = R[0] + R[4] + R[8]

  if (trace > 0) {
    const s: f64 = 0.5 / Math.sqrt(trace + 1.0)
    result[0] = 0.25 / s
    result[1] = (R[7] - R[5]) * s
    result[2] = (R[2] - R[6]) * s
    result[3] = (R[3] - R[1]) * s
  } else if (R[0] > R[4] && R[0] > R[8]) {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R[0] - R[4] - R[8])
    result[0] = (R[7] - R[5]) / s
    result[1] = 0.25 * s
    result[2] = (R[1] + R[3]) / s
    result[3] = (R[2] + R[6]) / s
  } else if (R[4] > R[8]) {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R[4] - R[0] - R[8])
    result[0] = (R[2] - R[6]) / s
    result[1] = (R[1] + R[3]) / s
    result[2] = 0.25 * s
    result[3] = (R[5] + R[7]) / s
  } else {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R[8] - R[0] - R[4])
    result[0] = (R[3] - R[1]) / s
    result[1] = (R[2] + R[6]) / s
    result[2] = (R[5] + R[7]) / s
    result[3] = 0.25 * s
  }

  // Normalize
  const norm: f64 = Math.sqrt(
    result[0] * result[0] +
      result[1] * result[1] +
      result[2] * result[2] +
      result[3] * result[3]
  )

  if (norm > 1e-14) {
    result[0] /= norm
    result[1] /= norm
    result[2] /= norm
    result[3] /= norm
  }

  return result
}

/**
 * Multiply two quaternions
 * @param q1 - First quaternion [w, x, y, z]
 * @param q2 - Second quaternion [w, x, y, z]
 * @returns Product quaternion [w, x, y, z]
 */
export function quaternionMultiply(
  q1: Float64Array,
  q2: Float64Array
): Float64Array {
  const result = new Float64Array(4)

  result[0] = q1[0] * q2[0] - q1[1] * q2[1] - q1[2] * q2[2] - q1[3] * q2[3]
  result[1] = q1[0] * q2[1] + q1[1] * q2[0] + q1[2] * q2[3] - q1[3] * q2[2]
  result[2] = q1[0] * q2[2] - q1[1] * q2[3] + q1[2] * q2[0] + q1[3] * q2[1]
  result[3] = q1[0] * q2[3] + q1[1] * q2[2] - q1[2] * q2[1] + q1[3] * q2[0]

  return result
}

/**
 * Spherical linear interpolation between quaternions
 * @param q1 - Start quaternion [w, x, y, z]
 * @param q2 - End quaternion [w, x, y, z]
 * @param t - Interpolation parameter (0 to 1)
 * @returns Interpolated quaternion [w, x, y, z]
 */
export function quaternionSlerp(
  q1: Float64Array,
  q2: Float64Array,
  t: f64
): Float64Array {
  // Compute dot product
  let dot: f64 = q1[0] * q2[0] + q1[1] * q2[1] + q1[2] * q2[2] + q1[3] * q2[3]

  // If dot is negative, negate one quaternion to take shorter path
  const q2Adj = new Float64Array(4)
  if (dot < 0) {
    dot = -dot
    q2Adj[0] = -q2[0]
    q2Adj[1] = -q2[1]
    q2Adj[2] = -q2[2]
    q2Adj[3] = -q2[3]
  } else {
    q2Adj[0] = q2[0]
    q2Adj[1] = q2[1]
    q2Adj[2] = q2[2]
    q2Adj[3] = q2[3]
  }

  const result = new Float64Array(4)

  if (dot > 0.9995) {
    // Linear interpolation for nearly identical quaternions
    result[0] = q1[0] + t * (q2Adj[0] - q1[0])
    result[1] = q1[1] + t * (q2Adj[1] - q1[1])
    result[2] = q1[2] + t * (q2Adj[2] - q1[2])
    result[3] = q1[3] + t * (q2Adj[3] - q1[3])
  } else {
    const theta: f64 = Math.acos(dot)
    const sinTheta: f64 = Math.sin(theta)
    const w1: f64 = Math.sin((1.0 - t) * theta) / sinTheta
    const w2: f64 = Math.sin(t * theta) / sinTheta

    result[0] = w1 * q1[0] + w2 * q2Adj[0]
    result[1] = w1 * q1[1] + w2 * q2Adj[1]
    result[2] = w1 * q1[2] + w2 * q2Adj[2]
    result[3] = w1 * q1[3] + w2 * q2Adj[3]
  }

  // Normalize
  const norm: f64 = Math.sqrt(
    result[0] * result[0] +
      result[1] * result[1] +
      result[2] * result[2] +
      result[3] * result[3]
  )

  if (norm > 1e-14) {
    result[0] /= norm
    result[1] /= norm
    result[2] /= norm
    result[3] /= norm
  }

  return result
}

/**
 * Create quaternion from axis-angle
 * @param axis - Unit rotation axis [x, y, z]
 * @param angle - Rotation angle in radians
 * @returns Quaternion [w, x, y, z]
 */
export function quaternionFromAxisAngle(
  axis: Float64Array,
  angle: f64
): Float64Array {
  const halfAngle: f64 = angle / 2.0
  const s: f64 = Math.sin(halfAngle)

  const result = new Float64Array(4)
  result[0] = Math.cos(halfAngle)
  result[1] = axis[0] * s
  result[2] = axis[1] * s
  result[3] = axis[2] * s

  return result
}

/**
 * Convert quaternion to axis-angle
 * @param q - Quaternion [w, x, y, z]
 * @returns [axis_x, axis_y, axis_z, angle]
 */
export function axisAngleFromQuaternion(q: Float64Array): Float64Array {
  const result = new Float64Array(4)

  const norm: f64 = Math.sqrt(q[1] * q[1] + q[2] * q[2] + q[3] * q[3])

  if (norm < 1e-14) {
    // No rotation
    result[0] = 1.0
    result[1] = 0.0
    result[2] = 0.0
    result[3] = 0.0
  } else {
    result[0] = q[1] / norm
    result[1] = q[2] / norm
    result[2] = q[3] / norm
    result[3] = 2.0 * Math.atan2(norm, q[0])
  }

  return result
}

/**
 * Rotate a 3D point using a quaternion
 * @param point - Point [x, y, z]
 * @param q - Quaternion [w, x, y, z]
 * @returns Rotated point [x', y', z']
 */
export function rotateByQuaternion(
  point: Float64Array,
  q: Float64Array
): Float64Array {
  // Convert point to quaternion form [0, x, y, z]
  const p = new Float64Array(4)
  p[0] = 0.0
  p[1] = point[0]
  p[2] = point[1]
  p[3] = point[2]

  // Conjugate of q
  const qConj = new Float64Array(4)
  qConj[0] = q[0]
  qConj[1] = -q[1]
  qConj[2] = -q[2]
  qConj[3] = -q[3]

  // q * p
  const qp = quaternionMultiply(q, p)

  // (q * p) * q^-1
  const result = quaternionMultiply(qp, qConj)

  const rotated = new Float64Array(3)
  rotated[0] = result[1]
  rotated[1] = result[2]
  rotated[2] = result[3]

  return rotated
}

/**
 * Rotate a 3D point using a rotation matrix
 * @param point - Point [x, y, z]
 * @param R - 3x3 rotation matrix (row-major)
 * @returns Rotated point [x', y', z']
 */
export function rotateByMatrix(
  point: Float64Array,
  R: Float64Array
): Float64Array {
  const result = new Float64Array(3)

  result[0] = R[0] * point[0] + R[1] * point[1] + R[2] * point[2]
  result[1] = R[3] * point[0] + R[4] * point[1] + R[5] * point[2]
  result[2] = R[6] * point[0] + R[7] * point[1] + R[8] * point[2]

  return result
}

/**
 * Extract Euler angles from rotation matrix (ZYX convention)
 * @param R - 3x3 rotation matrix (row-major)
 * @returns [yaw, pitch, roll]
 */
export function eulerFromRotationMatrix(R: Float64Array): Float64Array {
  const result = new Float64Array(3)

  // Handle gimbal lock
  if (Math.abs(R[6]) >= 1.0 - 1e-14) {
    result[0] = 0.0 // yaw
    if (R[6] < 0) {
      result[1] = Math.PI / 2.0 // pitch
      result[2] = Math.atan2(R[1], R[4]) // roll
    } else {
      result[1] = -Math.PI / 2.0 // pitch
      result[2] = Math.atan2(-R[1], R[4]) // roll
    }
  } else {
    result[1] = Math.asin(-R[6]) // pitch
    result[0] = Math.atan2(R[3], R[0]) // yaw
    result[2] = Math.atan2(R[7], R[8]) // roll
  }

  return result
}

/**
 * Compose multiple rotation matrices
 * @param matrices - Array of 3x3 rotation matrices concatenated
 * @param count - Number of matrices
 * @returns Combined 3x3 rotation matrix
 */
export function composeRotations(
  matrices: Float64Array,
  count: i32
): Float64Array {
  if (count <= 0) {
    // Return identity
    const identity = new Float64Array(9)
    identity[0] = 1.0
    identity[4] = 1.0
    identity[8] = 1.0
    return identity
  }

  // Start with first matrix
  let result = new Float64Array(9)
  for (let i: i32 = 0; i < 9; i++) {
    result[i] = matrices[i]
  }

  // Multiply remaining matrices
  for (let m: i32 = 1; m < count; m++) {
    const temp = new Float64Array(9)
    const offset: i32 = m * 9

    for (let i: i32 = 0; i < 3; i++) {
      for (let j: i32 = 0; j < 3; j++) {
        let sum: f64 = 0.0
        for (let k: i32 = 0; k < 3; k++) {
          sum += result[i * 3 + k] * matrices[offset + k * 3 + j]
        }
        temp[i * 3 + j] = sum
      }
    }

    result = temp
  }

  return result
}

/**
 * Check if a matrix is a valid rotation matrix
 * @param R - 3x3 matrix to check (row-major)
 * @param tol - Tolerance for checks
 * @returns true if R is orthogonal with det = 1
 */
export function isRotationMatrix(R: Float64Array, tol: f64): bool {
  if (R.length !== 9) {
    return false
  }

  // Check orthogonality: R^T * R = I
  for (let i: i32 = 0; i < 3; i++) {
    for (let j: i32 = 0; j < 3; j++) {
      let dot: f64 = 0.0
      for (let k: i32 = 0; k < 3; k++) {
        dot += R[k * 3 + i] * R[k * 3 + j]
      }
      const expected: f64 = i === j ? 1.0 : 0.0
      if (Math.abs(dot - expected) > tol) {
        return false
      }
    }
  }

  // Check determinant = 1
  const det: f64 =
    R[0] * (R[4] * R[8] - R[5] * R[7]) -
    R[1] * (R[3] * R[8] - R[5] * R[6]) +
    R[2] * (R[3] * R[7] - R[4] * R[6])

  if (Math.abs(det - 1.0) > tol) {
    return false
  }

  return true
}

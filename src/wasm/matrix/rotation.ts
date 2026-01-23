/**
 * WASM-optimized rotation matrix operations
 *
 * Provides 2D and 3D rotation matrices, quaternion operations,
 * and various rotation representations.
 *
 * All functions use raw memory pointers (usize) for proper WASM/JS interop.
 */

/**
 * Create a 2D rotation matrix
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to 2x2 rotation matrix output (f64, 4 elements, row-major)
 */
export function rotationMatrix2D(angle: f64, resultPtr: usize): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  store<f64>(resultPtr, c)
  store<f64>(resultPtr + 8, -s)
  store<f64>(resultPtr + 16, s)
  store<f64>(resultPtr + 24, c)
}

/**
 * Rotate a 2D point
 * @param pointPtr - Pointer to point [x, y] (f64, 2 elements)
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to rotated point [x', y'] (f64, 2 elements)
 */
export function rotate2D(pointPtr: usize, angle: f64, resultPtr: usize): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)
  const x: f64 = load<f64>(pointPtr)
  const y: f64 = load<f64>(pointPtr + 8)

  store<f64>(resultPtr, c * x - s * y)
  store<f64>(resultPtr + 8, s * x + c * y)
}

/**
 * Rotate a 2D point around a center point
 * @param pointPtr - Pointer to point [x, y] (f64, 2 elements)
 * @param centerPtr - Pointer to center of rotation [cx, cy] (f64, 2 elements)
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to rotated point [x', y'] (f64, 2 elements)
 */
export function rotate2DAroundPoint(
  pointPtr: usize,
  centerPtr: usize,
  angle: f64,
  resultPtr: usize
): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)
  const cx: f64 = load<f64>(centerPtr)
  const cy: f64 = load<f64>(centerPtr + 8)

  // Translate to origin
  const dx: f64 = load<f64>(pointPtr) - cx
  const dy: f64 = load<f64>(pointPtr + 8) - cy

  // Rotate and translate back
  store<f64>(resultPtr, c * dx - s * dy + cx)
  store<f64>(resultPtr + 8, s * dx + c * dy + cy)
}

/**
 * Create 3D rotation matrix around X axis
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixX(angle: f64, resultPtr: usize): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  store<f64>(resultPtr, 1.0)
  store<f64>(resultPtr + 8, 0.0)
  store<f64>(resultPtr + 16, 0.0)
  store<f64>(resultPtr + 24, 0.0)
  store<f64>(resultPtr + 32, c)
  store<f64>(resultPtr + 40, -s)
  store<f64>(resultPtr + 48, 0.0)
  store<f64>(resultPtr + 56, s)
  store<f64>(resultPtr + 64, c)
}

/**
 * Create 3D rotation matrix around Y axis
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixY(angle: f64, resultPtr: usize): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  store<f64>(resultPtr, c)
  store<f64>(resultPtr + 8, 0.0)
  store<f64>(resultPtr + 16, s)
  store<f64>(resultPtr + 24, 0.0)
  store<f64>(resultPtr + 32, 1.0)
  store<f64>(resultPtr + 40, 0.0)
  store<f64>(resultPtr + 48, -s)
  store<f64>(resultPtr + 56, 0.0)
  store<f64>(resultPtr + 64, c)
}

/**
 * Create 3D rotation matrix around Z axis
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixZ(angle: f64, resultPtr: usize): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)

  store<f64>(resultPtr, c)
  store<f64>(resultPtr + 8, -s)
  store<f64>(resultPtr + 16, 0.0)
  store<f64>(resultPtr + 24, s)
  store<f64>(resultPtr + 32, c)
  store<f64>(resultPtr + 40, 0.0)
  store<f64>(resultPtr + 48, 0.0)
  store<f64>(resultPtr + 56, 0.0)
  store<f64>(resultPtr + 64, 1.0)
}

/**
 * Create 3D rotation matrix from axis-angle representation
 * @param axisPtr - Pointer to unit axis vector [x, y, z] (f64, 3 elements)
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixAxisAngle(
  axisPtr: usize,
  angle: f64,
  resultPtr: usize
): void {
  const c: f64 = Math.cos(angle)
  const s: f64 = Math.sin(angle)
  const t: f64 = 1.0 - c

  const x: f64 = load<f64>(axisPtr)
  const y: f64 = load<f64>(axisPtr + 8)
  const z: f64 = load<f64>(axisPtr + 16)

  store<f64>(resultPtr, t * x * x + c)
  store<f64>(resultPtr + 8, t * x * y - s * z)
  store<f64>(resultPtr + 16, t * x * z + s * y)
  store<f64>(resultPtr + 24, t * x * y + s * z)
  store<f64>(resultPtr + 32, t * y * y + c)
  store<f64>(resultPtr + 40, t * y * z - s * x)
  store<f64>(resultPtr + 48, t * x * z - s * y)
  store<f64>(resultPtr + 56, t * y * z + s * x)
  store<f64>(resultPtr + 64, t * z * z + c)
}

/**
 * Create 3D rotation matrix from Euler angles (ZYX convention)
 * Also known as yaw-pitch-roll
 * @param yaw - Rotation around Z axis
 * @param pitch - Rotation around Y axis
 * @param roll - Rotation around X axis
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixEulerZYX(
  yaw: f64,
  pitch: f64,
  roll: f64,
  resultPtr: usize
): void {
  const cy: f64 = Math.cos(yaw)
  const sy: f64 = Math.sin(yaw)
  const cp: f64 = Math.cos(pitch)
  const sp: f64 = Math.sin(pitch)
  const cr: f64 = Math.cos(roll)
  const sr: f64 = Math.sin(roll)

  store<f64>(resultPtr, cy * cp)
  store<f64>(resultPtr + 8, cy * sp * sr - sy * cr)
  store<f64>(resultPtr + 16, cy * sp * cr + sy * sr)
  store<f64>(resultPtr + 24, sy * cp)
  store<f64>(resultPtr + 32, sy * sp * sr + cy * cr)
  store<f64>(resultPtr + 40, sy * sp * cr - cy * sr)
  store<f64>(resultPtr + 48, -sp)
  store<f64>(resultPtr + 56, cp * sr)
  store<f64>(resultPtr + 64, cp * cr)
}

/**
 * Create 3D rotation matrix from Euler angles (XYZ convention)
 * @param alpha - Rotation around X axis
 * @param beta - Rotation around Y axis
 * @param gamma - Rotation around Z axis
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixEulerXYZ(
  alpha: f64,
  beta: f64,
  gamma: f64,
  resultPtr: usize
): void {
  const ca: f64 = Math.cos(alpha)
  const sa: f64 = Math.sin(alpha)
  const cb: f64 = Math.cos(beta)
  const sb: f64 = Math.sin(beta)
  const cg: f64 = Math.cos(gamma)
  const sg: f64 = Math.sin(gamma)

  store<f64>(resultPtr, cb * cg)
  store<f64>(resultPtr + 8, -cb * sg)
  store<f64>(resultPtr + 16, sb)
  store<f64>(resultPtr + 24, ca * sg + sa * sb * cg)
  store<f64>(resultPtr + 32, ca * cg - sa * sb * sg)
  store<f64>(resultPtr + 40, -sa * cb)
  store<f64>(resultPtr + 48, sa * sg - ca * sb * cg)
  store<f64>(resultPtr + 56, sa * cg + ca * sb * sg)
  store<f64>(resultPtr + 64, ca * cb)
}

/**
 * Create 3D rotation matrix from quaternion
 * @param qPtr - Pointer to quaternion [w, x, y, z] (f64, 4 elements)
 * @param resultPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 */
export function rotationMatrixFromQuaternion(
  qPtr: usize,
  resultPtr: usize
): void {
  const w: f64 = load<f64>(qPtr)
  const x: f64 = load<f64>(qPtr + 8)
  const y: f64 = load<f64>(qPtr + 16)
  const z: f64 = load<f64>(qPtr + 24)

  store<f64>(resultPtr, 1.0 - 2.0 * (y * y + z * z))
  store<f64>(resultPtr + 8, 2.0 * (x * y - w * z))
  store<f64>(resultPtr + 16, 2.0 * (x * z + w * y))
  store<f64>(resultPtr + 24, 2.0 * (x * y + w * z))
  store<f64>(resultPtr + 32, 1.0 - 2.0 * (x * x + z * z))
  store<f64>(resultPtr + 40, 2.0 * (y * z - w * x))
  store<f64>(resultPtr + 48, 2.0 * (x * z - w * y))
  store<f64>(resultPtr + 56, 2.0 * (y * z + w * x))
  store<f64>(resultPtr + 64, 1.0 - 2.0 * (x * x + y * y))
}

/**
 * Convert rotation matrix to quaternion
 * @param RPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 * @param resultPtr - Pointer to quaternion output [w, x, y, z] (f64, 4 elements)
 */
export function quaternionFromRotationMatrix(
  RPtr: usize,
  resultPtr: usize
): void {
  const R0: f64 = load<f64>(RPtr)
  const R1: f64 = load<f64>(RPtr + 8)
  const R2: f64 = load<f64>(RPtr + 16)
  const R3: f64 = load<f64>(RPtr + 24)
  const R4: f64 = load<f64>(RPtr + 32)
  const R5: f64 = load<f64>(RPtr + 40)
  const R6: f64 = load<f64>(RPtr + 48)
  const R7: f64 = load<f64>(RPtr + 56)
  const R8: f64 = load<f64>(RPtr + 64)

  const trace: f64 = R0 + R4 + R8
  let w: f64, x: f64, y: f64, z: f64

  if (trace > 0) {
    const s: f64 = 0.5 / Math.sqrt(trace + 1.0)
    w = 0.25 / s
    x = (R7 - R5) * s
    y = (R2 - R6) * s
    z = (R3 - R1) * s
  } else if (R0 > R4 && R0 > R8) {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R0 - R4 - R8)
    w = (R7 - R5) / s
    x = 0.25 * s
    y = (R1 + R3) / s
    z = (R2 + R6) / s
  } else if (R4 > R8) {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R4 - R0 - R8)
    w = (R2 - R6) / s
    x = (R1 + R3) / s
    y = 0.25 * s
    z = (R5 + R7) / s
  } else {
    const s: f64 = 2.0 * Math.sqrt(1.0 + R8 - R0 - R4)
    w = (R3 - R1) / s
    x = (R2 + R6) / s
    y = (R5 + R7) / s
    z = 0.25 * s
  }

  // Normalize
  const norm: f64 = Math.sqrt(w * w + x * x + y * y + z * z)

  if (norm > 1e-14) {
    store<f64>(resultPtr, w / norm)
    store<f64>(resultPtr + 8, x / norm)
    store<f64>(resultPtr + 16, y / norm)
    store<f64>(resultPtr + 24, z / norm)
  } else {
    store<f64>(resultPtr, w)
    store<f64>(resultPtr + 8, x)
    store<f64>(resultPtr + 16, y)
    store<f64>(resultPtr + 24, z)
  }
}

/**
 * Multiply two quaternions
 * @param q1Ptr - Pointer to first quaternion [w, x, y, z] (f64, 4 elements)
 * @param q2Ptr - Pointer to second quaternion [w, x, y, z] (f64, 4 elements)
 * @param resultPtr - Pointer to product quaternion [w, x, y, z] (f64, 4 elements)
 */
export function quaternionMultiply(
  q1Ptr: usize,
  q2Ptr: usize,
  resultPtr: usize
): void {
  const q1w: f64 = load<f64>(q1Ptr)
  const q1x: f64 = load<f64>(q1Ptr + 8)
  const q1y: f64 = load<f64>(q1Ptr + 16)
  const q1z: f64 = load<f64>(q1Ptr + 24)

  const q2w: f64 = load<f64>(q2Ptr)
  const q2x: f64 = load<f64>(q2Ptr + 8)
  const q2y: f64 = load<f64>(q2Ptr + 16)
  const q2z: f64 = load<f64>(q2Ptr + 24)

  store<f64>(resultPtr, q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z)
  store<f64>(resultPtr + 8, q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y)
  store<f64>(resultPtr + 16, q1w * q2y - q1x * q2z + q1y * q2w + q1z * q2x)
  store<f64>(resultPtr + 24, q1w * q2z + q1x * q2y - q1y * q2x + q1z * q2w)
}

/**
 * Spherical linear interpolation between quaternions
 * @param q1Ptr - Pointer to start quaternion [w, x, y, z] (f64, 4 elements)
 * @param q2Ptr - Pointer to end quaternion [w, x, y, z] (f64, 4 elements)
 * @param t - Interpolation parameter (0 to 1)
 * @param resultPtr - Pointer to interpolated quaternion [w, x, y, z] (f64, 4 elements)
 */
export function quaternionSlerp(
  q1Ptr: usize,
  q2Ptr: usize,
  t: f64,
  resultPtr: usize
): void {
  const q1w: f64 = load<f64>(q1Ptr)
  const q1x: f64 = load<f64>(q1Ptr + 8)
  const q1y: f64 = load<f64>(q1Ptr + 16)
  const q1z: f64 = load<f64>(q1Ptr + 24)

  let q2w: f64 = load<f64>(q2Ptr)
  let q2x: f64 = load<f64>(q2Ptr + 8)
  let q2y: f64 = load<f64>(q2Ptr + 16)
  let q2z: f64 = load<f64>(q2Ptr + 24)

  // Compute dot product
  let dot: f64 = q1w * q2w + q1x * q2x + q1y * q2y + q1z * q2z

  // If dot is negative, negate one quaternion to take shorter path
  if (dot < 0) {
    dot = -dot
    q2w = -q2w
    q2x = -q2x
    q2y = -q2y
    q2z = -q2z
  }

  let rw: f64, rx: f64, ry: f64, rz: f64

  if (dot > 0.9995) {
    // Linear interpolation for nearly identical quaternions
    rw = q1w + t * (q2w - q1w)
    rx = q1x + t * (q2x - q1x)
    ry = q1y + t * (q2y - q1y)
    rz = q1z + t * (q2z - q1z)
  } else {
    const theta: f64 = Math.acos(dot)
    const sinTheta: f64 = Math.sin(theta)
    const w1: f64 = Math.sin((1.0 - t) * theta) / sinTheta
    const w2: f64 = Math.sin(t * theta) / sinTheta

    rw = w1 * q1w + w2 * q2w
    rx = w1 * q1x + w2 * q2x
    ry = w1 * q1y + w2 * q2y
    rz = w1 * q1z + w2 * q2z
  }

  // Normalize
  const norm: f64 = Math.sqrt(rw * rw + rx * rx + ry * ry + rz * rz)

  if (norm > 1e-14) {
    store<f64>(resultPtr, rw / norm)
    store<f64>(resultPtr + 8, rx / norm)
    store<f64>(resultPtr + 16, ry / norm)
    store<f64>(resultPtr + 24, rz / norm)
  } else {
    store<f64>(resultPtr, rw)
    store<f64>(resultPtr + 8, rx)
    store<f64>(resultPtr + 16, ry)
    store<f64>(resultPtr + 24, rz)
  }
}

/**
 * Create quaternion from axis-angle
 * @param axisPtr - Pointer to unit rotation axis [x, y, z] (f64, 3 elements)
 * @param angle - Rotation angle in radians
 * @param resultPtr - Pointer to quaternion [w, x, y, z] (f64, 4 elements)
 */
export function quaternionFromAxisAngle(
  axisPtr: usize,
  angle: f64,
  resultPtr: usize
): void {
  const halfAngle: f64 = angle / 2.0
  const s: f64 = Math.sin(halfAngle)

  store<f64>(resultPtr, Math.cos(halfAngle))
  store<f64>(resultPtr + 8, load<f64>(axisPtr) * s)
  store<f64>(resultPtr + 16, load<f64>(axisPtr + 8) * s)
  store<f64>(resultPtr + 24, load<f64>(axisPtr + 16) * s)
}

/**
 * Convert quaternion to axis-angle
 * @param qPtr - Pointer to quaternion [w, x, y, z] (f64, 4 elements)
 * @param resultPtr - Pointer to [axis_x, axis_y, axis_z, angle] (f64, 4 elements)
 */
export function axisAngleFromQuaternion(qPtr: usize, resultPtr: usize): void {
  const w: f64 = load<f64>(qPtr)
  const x: f64 = load<f64>(qPtr + 8)
  const y: f64 = load<f64>(qPtr + 16)
  const z: f64 = load<f64>(qPtr + 24)

  const norm: f64 = Math.sqrt(x * x + y * y + z * z)

  if (norm < 1e-14) {
    // No rotation
    store<f64>(resultPtr, 1.0)
    store<f64>(resultPtr + 8, 0.0)
    store<f64>(resultPtr + 16, 0.0)
    store<f64>(resultPtr + 24, 0.0)
  } else {
    store<f64>(resultPtr, x / norm)
    store<f64>(resultPtr + 8, y / norm)
    store<f64>(resultPtr + 16, z / norm)
    store<f64>(resultPtr + 24, 2.0 * Math.atan2(norm, w))
  }
}

/**
 * Rotate a 3D point using a quaternion
 * @param pointPtr - Pointer to point [x, y, z] (f64, 3 elements)
 * @param qPtr - Pointer to quaternion [w, x, y, z] (f64, 4 elements)
 * @param resultPtr - Pointer to rotated point [x', y', z'] (f64, 3 elements)
 * @param workPtr - Working memory for intermediate quaternions (f64, 8 elements)
 */
export function rotateByQuaternion(
  pointPtr: usize,
  qPtr: usize,
  resultPtr: usize,
  workPtr: usize
): void {
  // Convert point to quaternion form [0, x, y, z]
  store<f64>(workPtr, 0.0)
  store<f64>(workPtr + 8, load<f64>(pointPtr))
  store<f64>(workPtr + 16, load<f64>(pointPtr + 8))
  store<f64>(workPtr + 24, load<f64>(pointPtr + 16))

  // Conjugate of q
  const qConjPtr: usize = workPtr + 32
  store<f64>(qConjPtr, load<f64>(qPtr))
  store<f64>(qConjPtr + 8, -load<f64>(qPtr + 8))
  store<f64>(qConjPtr + 16, -load<f64>(qPtr + 16))
  store<f64>(qConjPtr + 24, -load<f64>(qPtr + 24))

  // q * p (store temporarily at resultPtr as scratch)
  quaternionMultiply(qPtr, workPtr, resultPtr)

  // (q * p) * q^-1 (use workPtr as temp storage for final result)
  quaternionMultiply(resultPtr, qConjPtr, workPtr)

  // Extract rotated point
  store<f64>(resultPtr, load<f64>(workPtr + 8))
  store<f64>(resultPtr + 8, load<f64>(workPtr + 16))
  store<f64>(resultPtr + 16, load<f64>(workPtr + 24))
}

/**
 * Rotate a 3D point using a rotation matrix
 * @param pointPtr - Pointer to point [x, y, z] (f64, 3 elements)
 * @param RPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 * @param resultPtr - Pointer to rotated point [x', y', z'] (f64, 3 elements)
 */
export function rotateByMatrix(
  pointPtr: usize,
  RPtr: usize,
  resultPtr: usize
): void {
  const px: f64 = load<f64>(pointPtr)
  const py: f64 = load<f64>(pointPtr + 8)
  const pz: f64 = load<f64>(pointPtr + 16)

  store<f64>(
    resultPtr,
    load<f64>(RPtr) * px + load<f64>(RPtr + 8) * py + load<f64>(RPtr + 16) * pz
  )
  store<f64>(
    resultPtr + 8,
    load<f64>(RPtr + 24) * px +
      load<f64>(RPtr + 32) * py +
      load<f64>(RPtr + 40) * pz
  )
  store<f64>(
    resultPtr + 16,
    load<f64>(RPtr + 48) * px +
      load<f64>(RPtr + 56) * py +
      load<f64>(RPtr + 64) * pz
  )
}

/**
 * Extract Euler angles from rotation matrix (ZYX convention)
 * @param RPtr - Pointer to 3x3 rotation matrix (f64, 9 elements, row-major)
 * @param resultPtr - Pointer to [yaw, pitch, roll] (f64, 3 elements)
 */
export function eulerFromRotationMatrix(RPtr: usize, resultPtr: usize): void {
  const R6: f64 = load<f64>(RPtr + 48)

  // Handle gimbal lock
  if (Math.abs(R6) >= 1.0 - 1e-14) {
    store<f64>(resultPtr, 0.0) // yaw
    if (R6 < 0) {
      store<f64>(resultPtr + 8, Math.PI / 2.0) // pitch
      store<f64>(
        resultPtr + 16,
        Math.atan2(load<f64>(RPtr + 8), load<f64>(RPtr + 32))
      ) // roll
    } else {
      store<f64>(resultPtr + 8, -Math.PI / 2.0) // pitch
      store<f64>(
        resultPtr + 16,
        Math.atan2(-load<f64>(RPtr + 8), load<f64>(RPtr + 32))
      ) // roll
    }
  } else {
    store<f64>(resultPtr + 8, Math.asin(-R6)) // pitch
    store<f64>(resultPtr, Math.atan2(load<f64>(RPtr + 24), load<f64>(RPtr))) // yaw
    store<f64>(
      resultPtr + 16,
      Math.atan2(load<f64>(RPtr + 56), load<f64>(RPtr + 64))
    ) // roll
  }
}

/**
 * Compose multiple rotation matrices
 * @param matricesPtr - Pointer to array of 3x3 rotation matrices concatenated (f64, count * 9 elements)
 * @param count - Number of matrices
 * @param resultPtr - Pointer to combined 3x3 rotation matrix (f64, 9 elements)
 * @param workPtr - Working memory (f64, 9 elements)
 */
export function composeRotations(
  matricesPtr: usize,
  count: i32,
  resultPtr: usize,
  workPtr: usize
): void {
  if (count <= 0) {
    // Return identity
    for (let i: i32 = 0; i < 9; i++) {
      store<f64>(resultPtr + ((<usize>i) << 3), 0.0)
    }
    store<f64>(resultPtr, 1.0)
    store<f64>(resultPtr + 32, 1.0)
    store<f64>(resultPtr + 64, 1.0)
    return
  }

  // Start with first matrix
  for (let i: i32 = 0; i < 9; i++) {
    store<f64>(
      resultPtr + ((<usize>i) << 3),
      load<f64>(matricesPtr + ((<usize>i) << 3))
    )
  }

  // Multiply remaining matrices
  for (let m: i32 = 1; m < count; m++) {
    const offset: usize = (<usize>(m * 9)) << 3

    for (let i: i32 = 0; i < 3; i++) {
      for (let j: i32 = 0; j < 3; j++) {
        let sum: f64 = 0.0
        for (let k: i32 = 0; k < 3; k++) {
          sum +=
            load<f64>(resultPtr + ((<usize>(i * 3 + k)) << 3)) *
            load<f64>(matricesPtr + offset + ((<usize>(k * 3 + j)) << 3))
        }
        store<f64>(workPtr + ((<usize>(i * 3 + j)) << 3), sum)
      }
    }

    // Copy temp to result
    for (let i: i32 = 0; i < 9; i++) {
      store<f64>(
        resultPtr + ((<usize>i) << 3),
        load<f64>(workPtr + ((<usize>i) << 3))
      )
    }
  }
}

/**
 * Check if a matrix is a valid rotation matrix
 * @param RPtr - Pointer to 3x3 matrix to check (f64, 9 elements, row-major)
 * @param tol - Tolerance for checks
 * @returns true if R is orthogonal with det = 1
 */
export function isRotationMatrix(RPtr: usize, tol: f64): bool {
  // Check orthogonality: R^T * R = I
  for (let i: i32 = 0; i < 3; i++) {
    for (let j: i32 = 0; j < 3; j++) {
      let dot: f64 = 0.0
      for (let k: i32 = 0; k < 3; k++) {
        dot +=
          load<f64>(RPtr + ((<usize>(k * 3 + i)) << 3)) *
          load<f64>(RPtr + ((<usize>(k * 3 + j)) << 3))
      }
      const expected: f64 = i === j ? 1.0 : 0.0
      if (Math.abs(dot - expected) > tol) {
        return false
      }
    }
  }

  // Check determinant = 1
  const R0: f64 = load<f64>(RPtr)
  const R1: f64 = load<f64>(RPtr + 8)
  const R2: f64 = load<f64>(RPtr + 16)
  const R3: f64 = load<f64>(RPtr + 24)
  const R4: f64 = load<f64>(RPtr + 32)
  const R5: f64 = load<f64>(RPtr + 40)
  const R6: f64 = load<f64>(RPtr + 48)
  const R7: f64 = load<f64>(RPtr + 56)
  const R8: f64 = load<f64>(RPtr + 64)

  const det: f64 =
    R0 * (R4 * R8 - R5 * R7) -
    R1 * (R3 * R8 - R5 * R6) +
    R2 * (R3 * R7 - R4 * R6)

  if (Math.abs(det - 1.0) > tol) {
    return false
  }

  return true
}

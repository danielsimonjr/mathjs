//! 2D/3D rotation matrices, quaternion operations, and Euler angles
//!
//! Port of AssemblyScript rotation.ts — 20 exported functions.
//! Uses libm for sin/cos/sqrt/atan2/acos/asin.

use libm::{acos, asin, atan2, cos, fabs, sin, sqrt};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

#[inline(always)]
unsafe fn ld(base: *const f64, off: usize) -> f64 {
    *base.add(off)
}
#[inline(always)]
unsafe fn st(base: *mut f64, off: usize, v: f64) {
    *base.add(off) = v;
}

// ---------------------------------------------------------------------------
// 2D rotations
// ---------------------------------------------------------------------------

/// Create a 2D rotation matrix (2x2, row-major).
#[no_mangle]
pub unsafe extern "C" fn rotationMatrix2D(angle: f64, result_ptr: i32) {
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    st(r, 0, c);
    st(r, 1, -s);
    st(r, 2, s);
    st(r, 3, c);
}

/// Rotate a 2D point.
#[no_mangle]
pub unsafe extern "C" fn rotate2D(point_ptr: i32, angle: f64, result_ptr: i32) {
    let p = point_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    let x = ld(p, 0);
    let y = ld(p, 1);
    st(r, 0, c * x - s * y);
    st(r, 1, s * x + c * y);
}

/// Rotate a 2D point around a center point.
#[no_mangle]
pub unsafe extern "C" fn rotate2DAroundPoint(
    point_ptr: i32,
    center_ptr: i32,
    angle: f64,
    result_ptr: i32,
) {
    let p = point_ptr as usize as *const f64;
    let ctr = center_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    let cx = ld(ctr, 0);
    let cy = ld(ctr, 1);
    let dx = ld(p, 0) - cx;
    let dy = ld(p, 1) - cy;
    st(r, 0, c * dx - s * dy + cx);
    st(r, 1, s * dx + c * dy + cy);
}

// ---------------------------------------------------------------------------
// 3D axis rotation matrices (3x3, row-major, 9 elements)
// ---------------------------------------------------------------------------

/// Create 3D rotation matrix around X axis.
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixX(angle: f64, result_ptr: i32) {
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    st(r, 0, 1.0);
    st(r, 1, 0.0);
    st(r, 2, 0.0);
    st(r, 3, 0.0);
    st(r, 4, c);
    st(r, 5, -s);
    st(r, 6, 0.0);
    st(r, 7, s);
    st(r, 8, c);
}

/// Create 3D rotation matrix around Y axis.
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixY(angle: f64, result_ptr: i32) {
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    st(r, 0, c);
    st(r, 1, 0.0);
    st(r, 2, s);
    st(r, 3, 0.0);
    st(r, 4, 1.0);
    st(r, 5, 0.0);
    st(r, 6, -s);
    st(r, 7, 0.0);
    st(r, 8, c);
}

/// Create 3D rotation matrix around Z axis.
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixZ(angle: f64, result_ptr: i32) {
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    st(r, 0, c);
    st(r, 1, -s);
    st(r, 2, 0.0);
    st(r, 3, s);
    st(r, 4, c);
    st(r, 5, 0.0);
    st(r, 6, 0.0);
    st(r, 7, 0.0);
    st(r, 8, 1.0);
}

/// Create 3D rotation matrix from axis-angle representation.
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixAxisAngle(axis_ptr: i32, angle: f64, result_ptr: i32) {
    let a = axis_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let c = cos(angle);
    let s = sin(angle);
    let t = 1.0 - c;
    let x = ld(a, 0);
    let y = ld(a, 1);
    let z = ld(a, 2);

    st(r, 0, t * x * x + c);
    st(r, 1, t * x * y - s * z);
    st(r, 2, t * x * z + s * y);
    st(r, 3, t * x * y + s * z);
    st(r, 4, t * y * y + c);
    st(r, 5, t * y * z - s * x);
    st(r, 6, t * x * z - s * y);
    st(r, 7, t * y * z + s * x);
    st(r, 8, t * z * z + c);
}

// ---------------------------------------------------------------------------
// Euler angle rotation matrices
// ---------------------------------------------------------------------------

/// Create 3D rotation matrix from Euler angles (ZYX / yaw-pitch-roll).
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixEulerZYX(yaw: f64, pitch: f64, roll: f64, result_ptr: i32) {
    let r = result_ptr as usize as *mut f64;
    let cy = cos(yaw);
    let sy = sin(yaw);
    let cp = cos(pitch);
    let sp = sin(pitch);
    let cr = cos(roll);
    let sr = sin(roll);

    st(r, 0, cy * cp);
    st(r, 1, cy * sp * sr - sy * cr);
    st(r, 2, cy * sp * cr + sy * sr);
    st(r, 3, sy * cp);
    st(r, 4, sy * sp * sr + cy * cr);
    st(r, 5, sy * sp * cr - cy * sr);
    st(r, 6, -sp);
    st(r, 7, cp * sr);
    st(r, 8, cp * cr);
}

/// Create 3D rotation matrix from Euler angles (XYZ).
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixEulerXYZ(
    alpha: f64,
    beta: f64,
    gamma: f64,
    result_ptr: i32,
) {
    let r = result_ptr as usize as *mut f64;
    let ca = cos(alpha);
    let sa = sin(alpha);
    let cb = cos(beta);
    let sb = sin(beta);
    let cg = cos(gamma);
    let sg = sin(gamma);

    st(r, 0, cb * cg);
    st(r, 1, -cb * sg);
    st(r, 2, sb);
    st(r, 3, ca * sg + sa * sb * cg);
    st(r, 4, ca * cg - sa * sb * sg);
    st(r, 5, -sa * cb);
    st(r, 6, sa * sg - ca * sb * cg);
    st(r, 7, sa * cg + ca * sb * sg);
    st(r, 8, ca * cb);
}

// ---------------------------------------------------------------------------
// Quaternion operations [w, x, y, z]
// ---------------------------------------------------------------------------

/// Create rotation matrix from quaternion [w,x,y,z].
#[no_mangle]
pub unsafe extern "C" fn rotationMatrixFromQuaternion(q_ptr: i32, result_ptr: i32) {
    let q = q_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let w = ld(q, 0);
    let x = ld(q, 1);
    let y = ld(q, 2);
    let z = ld(q, 3);

    st(r, 0, 1.0 - 2.0 * (y * y + z * z));
    st(r, 1, 2.0 * (x * y - w * z));
    st(r, 2, 2.0 * (x * z + w * y));
    st(r, 3, 2.0 * (x * y + w * z));
    st(r, 4, 1.0 - 2.0 * (x * x + z * z));
    st(r, 5, 2.0 * (y * z - w * x));
    st(r, 6, 2.0 * (x * z - w * y));
    st(r, 7, 2.0 * (y * z + w * x));
    st(r, 8, 1.0 - 2.0 * (x * x + y * y));
}

/// Convert rotation matrix to quaternion [w,x,y,z].
#[no_mangle]
pub unsafe extern "C" fn quaternionFromRotationMatrix(r_ptr: i32, result_ptr: i32) {
    let m = r_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    let r0 = ld(m, 0);
    let r1 = ld(m, 1);
    let r2 = ld(m, 2);
    let r3 = ld(m, 3);
    let r4 = ld(m, 4);
    let r5 = ld(m, 5);
    let r6 = ld(m, 6);
    let r7 = ld(m, 7);
    let r8 = ld(m, 8);

    let trace = r0 + r4 + r8;
    let (w, x, y, z);

    if trace > 0.0 {
        let s = 0.5 / sqrt(trace + 1.0);
        w = 0.25 / s;
        x = (r7 - r5) * s;
        y = (r2 - r6) * s;
        z = (r3 - r1) * s;
    } else if r0 > r4 && r0 > r8 {
        let s = 2.0 * sqrt(1.0 + r0 - r4 - r8);
        w = (r7 - r5) / s;
        x = 0.25 * s;
        y = (r1 + r3) / s;
        z = (r2 + r6) / s;
    } else if r4 > r8 {
        let s = 2.0 * sqrt(1.0 + r4 - r0 - r8);
        w = (r2 - r6) / s;
        x = (r1 + r3) / s;
        y = 0.25 * s;
        z = (r5 + r7) / s;
    } else {
        let s = 2.0 * sqrt(1.0 + r8 - r0 - r4);
        w = (r3 - r1) / s;
        x = (r2 + r6) / s;
        y = (r5 + r7) / s;
        z = 0.25 * s;
    }

    let norm = sqrt(w * w + x * x + y * y + z * z);
    if norm > 1e-14 {
        st(res, 0, w / norm);
        st(res, 1, x / norm);
        st(res, 2, y / norm);
        st(res, 3, z / norm);
    } else {
        st(res, 0, w);
        st(res, 1, x);
        st(res, 2, y);
        st(res, 3, z);
    }
}

/// Multiply two quaternions.
#[no_mangle]
pub unsafe extern "C" fn quaternionMultiply(q1_ptr: i32, q2_ptr: i32, result_ptr: i32) {
    let q1 = q1_ptr as usize as *const f64;
    let q2 = q2_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;

    let q1w = ld(q1, 0);
    let q1x = ld(q1, 1);
    let q1y = ld(q1, 2);
    let q1z = ld(q1, 3);
    let q2w = ld(q2, 0);
    let q2x = ld(q2, 1);
    let q2y = ld(q2, 2);
    let q2z = ld(q2, 3);

    st(r, 0, q1w * q2w - q1x * q2x - q1y * q2y - q1z * q2z);
    st(r, 1, q1w * q2x + q1x * q2w + q1y * q2z - q1z * q2y);
    st(r, 2, q1w * q2y - q1x * q2z + q1y * q2w + q1z * q2x);
    st(r, 3, q1w * q2z + q1x * q2y - q1y * q2x + q1z * q2w);
}

/// Spherical linear interpolation between quaternions.
#[no_mangle]
pub unsafe extern "C" fn quaternionSlerp(q1_ptr: i32, q2_ptr: i32, t: f64, result_ptr: i32) {
    let q1 = q1_ptr as usize as *const f64;
    let q2 = q2_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;

    let q1w = ld(q1, 0);
    let q1x = ld(q1, 1);
    let q1y = ld(q1, 2);
    let q1z = ld(q1, 3);

    let mut q2w = ld(q2, 0);
    let mut q2x = ld(q2, 1);
    let mut q2y = ld(q2, 2);
    let mut q2z = ld(q2, 3);

    let mut dot = q1w * q2w + q1x * q2x + q1y * q2y + q1z * q2z;

    if dot < 0.0 {
        dot = -dot;
        q2w = -q2w;
        q2x = -q2x;
        q2y = -q2y;
        q2z = -q2z;
    }

    let (rw, rx, ry, rz);

    if dot > 0.9995 {
        rw = q1w + t * (q2w - q1w);
        rx = q1x + t * (q2x - q1x);
        ry = q1y + t * (q2y - q1y);
        rz = q1z + t * (q2z - q1z);
    } else {
        let theta = acos(dot);
        let sin_theta = sin(theta);
        let w1 = sin((1.0 - t) * theta) / sin_theta;
        let w2 = sin(t * theta) / sin_theta;

        rw = w1 * q1w + w2 * q2w;
        rx = w1 * q1x + w2 * q2x;
        ry = w1 * q1y + w2 * q2y;
        rz = w1 * q1z + w2 * q2z;
    }

    let norm = sqrt(rw * rw + rx * rx + ry * ry + rz * rz);
    if norm > 1e-14 {
        st(r, 0, rw / norm);
        st(r, 1, rx / norm);
        st(r, 2, ry / norm);
        st(r, 3, rz / norm);
    } else {
        st(r, 0, rw);
        st(r, 1, rx);
        st(r, 2, ry);
        st(r, 3, rz);
    }
}

/// Create quaternion from axis-angle.
#[no_mangle]
pub unsafe extern "C" fn quaternionFromAxisAngle(axis_ptr: i32, angle: f64, result_ptr: i32) {
    let a = axis_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let half = angle / 2.0;
    let s = sin(half);

    st(r, 0, cos(half));
    st(r, 1, ld(a, 0) * s);
    st(r, 2, ld(a, 1) * s);
    st(r, 3, ld(a, 2) * s);
}

/// Convert quaternion to axis-angle [axis_x, axis_y, axis_z, angle].
#[no_mangle]
pub unsafe extern "C" fn axisAngleFromQuaternion(q_ptr: i32, result_ptr: i32) {
    let q = q_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let w = ld(q, 0);
    let x = ld(q, 1);
    let y = ld(q, 2);
    let z = ld(q, 3);

    let norm = sqrt(x * x + y * y + z * z);

    if norm < 1e-14 {
        st(r, 0, 1.0);
        st(r, 1, 0.0);
        st(r, 2, 0.0);
        st(r, 3, 0.0);
    } else {
        st(r, 0, x / norm);
        st(r, 1, y / norm);
        st(r, 2, z / norm);
        st(r, 3, 2.0 * atan2(norm, w));
    }
}

/// Rotate a 3D point using a quaternion (q*p*q^-1).
#[no_mangle]
pub unsafe extern "C" fn rotateByQuaternion(
    point_ptr: i32,
    q_ptr: i32,
    result_ptr: i32,
    work_ptr: i32,
) {
    let pt = point_ptr as usize as *const f64;
    let q = q_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    let work = work_ptr as usize as *mut f64;

    // Point as quaternion [0, x, y, z]
    st(work, 0, 0.0);
    st(work, 1, ld(pt, 0));
    st(work, 2, ld(pt, 1));
    st(work, 3, ld(pt, 2));

    // Conjugate q*
    let q_conj = work.add(4);
    st(q_conj, 0, ld(q, 0));
    st(q_conj, 1, -ld(q, 1));
    st(q_conj, 2, -ld(q, 2));
    st(q_conj, 3, -ld(q, 3));

    // q * p -> res (temp)
    quaternionMultiply(q_ptr, work as usize as i32, result_ptr);

    // (q*p) * q* -> work
    quaternionMultiply(result_ptr, q_conj as usize as i32, work_ptr);

    // Extract xyz
    st(res, 0, ld(work, 1));
    st(res, 1, ld(work, 2));
    st(res, 2, ld(work, 3));
}

/// Rotate a 3D point using a rotation matrix.
#[no_mangle]
pub unsafe extern "C" fn rotateByMatrix(point_ptr: i32, r_ptr: i32, result_ptr: i32) {
    let p = point_ptr as usize as *const f64;
    let m = r_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let px = ld(p, 0);
    let py = ld(p, 1);
    let pz = ld(p, 2);

    st(r, 0, ld(m, 0) * px + ld(m, 1) * py + ld(m, 2) * pz);
    st(r, 1, ld(m, 3) * px + ld(m, 4) * py + ld(m, 5) * pz);
    st(r, 2, ld(m, 6) * px + ld(m, 7) * py + ld(m, 8) * pz);
}

/// Extract Euler angles from rotation matrix (ZYX convention).
/// Result: [yaw, pitch, roll].
#[no_mangle]
pub unsafe extern "C" fn eulerFromRotationMatrix(r_ptr: i32, result_ptr: i32) {
    let m = r_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let r6 = ld(m, 6);
    let pi = core::f64::consts::PI;

    if fabs(r6) >= 1.0 - 1e-14 {
        st(r, 0, 0.0); // yaw
        if r6 < 0.0 {
            st(r, 1, pi / 2.0);
            st(r, 2, atan2(ld(m, 1), ld(m, 4)));
        } else {
            st(r, 1, -pi / 2.0);
            st(r, 2, atan2(-ld(m, 1), ld(m, 4)));
        }
    } else {
        st(r, 1, asin(-r6));
        st(r, 0, atan2(ld(m, 3), ld(m, 0)));
        st(r, 2, atan2(ld(m, 7), ld(m, 8)));
    }
}

/// Compose multiple rotation matrices (3x3, concatenated).
#[no_mangle]
pub unsafe extern "C" fn composeRotations(
    matrices_ptr: i32,
    count: i32,
    result_ptr: i32,
    work_ptr: i32,
) {
    let mats = matrices_ptr as usize as *const f64;
    let r = result_ptr as usize as *mut f64;
    let tmp = work_ptr as usize as *mut f64;

    if count <= 0 {
        for i in 0..9usize {
            st(r, i, 0.0);
        }
        st(r, 0, 1.0);
        st(r, 4, 1.0);
        st(r, 8, 1.0);
        return;
    }

    // Copy first matrix
    for i in 0..9usize {
        st(r, i, ld(mats, i));
    }

    // Multiply remaining
    for m in 1..count {
        let offset = (m as usize) * 9;

        for i in 0..3i32 {
            for j in 0..3i32 {
                let mut sum = 0.0f64;
                for k in 0..3i32 {
                    sum += ld(r, (i * 3 + k) as usize) * ld(mats, offset + (k * 3 + j) as usize);
                }
                st(tmp, (i * 3 + j) as usize, sum);
            }
        }

        for i in 0..9usize {
            st(r, i, ld(tmp, i));
        }
    }
}

/// Check if a matrix is a valid rotation matrix (orthogonal, det = 1).
/// Returns 1 if valid, 0 otherwise.
#[no_mangle]
pub unsafe extern "C" fn isRotationMatrix(r_ptr: i32, tol: f64) -> i32 {
    let m = r_ptr as usize as *const f64;

    // Check R^T * R = I
    for i in 0..3i32 {
        for j in 0..3i32 {
            let mut dot = 0.0f64;
            for k in 0..3i32 {
                dot += ld(m, (k * 3 + i) as usize) * ld(m, (k * 3 + j) as usize);
            }
            let expected = if i == j { 1.0 } else { 0.0 };
            if fabs(dot - expected) > tol {
                return 0;
            }
        }
    }

    // Check det = 1
    let r0 = ld(m, 0);
    let r1 = ld(m, 1);
    let r2 = ld(m, 2);
    let r3 = ld(m, 3);
    let r4 = ld(m, 4);
    let r5 = ld(m, 5);
    let r6 = ld(m, 6);
    let r7 = ld(m, 7);
    let r8 = ld(m, 8);

    let det = r0 * (r4 * r8 - r5 * r7) - r1 * (r3 * r8 - r5 * r6) + r2 * (r3 * r7 - r4 * r6);

    if fabs(det - 1.0) > tol {
        return 0;
    }

    1
}

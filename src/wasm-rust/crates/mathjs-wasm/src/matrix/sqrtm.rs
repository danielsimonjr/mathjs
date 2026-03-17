//! WASM-optimized matrix square root operations.
//!
//! Implements Denman-Beavers iteration, Newton-Schulz iteration,
//! and Cholesky-based square root for symmetric positive definite matrices.
//!
//! All matrices are flat arrays in row-major order (f64).
//! Return convention: 1 = success, 0 = failure.

use libm::{fabs, sqrt};

// ============================================
// HELPER: matrix multiply C = A * B  (n x n)
// ============================================
unsafe fn mat_mul(a: *const f64, b: *const f64, c: *mut f64, n: usize) {
    for i in 0..n {
        for j in 0..n {
            let mut sum = 0.0_f64;
            for k in 0..n {
                sum += *a.add(i * n + k) * *b.add(k * n + j);
            }
            *c.add(i * n + j) = sum;
        }
    }
}

// ============================================
// HELPER: Gauss-Jordan inverse (destroys `a`)
// ============================================
unsafe fn mat_inverse(a: *mut f64, inv: *mut f64, n: usize) -> bool {
    for i in 0..n {
        for j in 0..n {
            *inv.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }
    for col in 0..n {
        let mut max_val = fabs(*a.add(col * n + col));
        let mut max_row = col;
        for row in (col + 1)..n {
            let v = fabs(*a.add(row * n + col));
            if v > max_val {
                max_val = v;
                max_row = row;
            }
        }
        if max_val < 1e-15 {
            return false;
        }
        if max_row != col {
            for j in 0..n {
                let ci = col * n + j;
                let mi = max_row * n + j;
                let ta = *a.add(ci);
                *a.add(ci) = *a.add(mi);
                *a.add(mi) = ta;
                let ti = *inv.add(ci);
                *inv.add(ci) = *inv.add(mi);
                *inv.add(mi) = ti;
            }
        }
        let pivot = *a.add(col * n + col);
        for j in 0..n {
            let idx = col * n + j;
            *a.add(idx) /= pivot;
            *inv.add(idx) /= pivot;
        }
        for row in 0..n {
            if row != col {
                let factor = *a.add(row * n + col);
                for j in 0..n {
                    let ri = row * n + j;
                    let ci = col * n + j;
                    *a.add(ri) -= factor * *a.add(ci);
                    *inv.add(ri) -= factor * *inv.add(ci);
                }
            }
        }
    }
    true
}

// ============================================
// EXPORTED FUNCTIONS
// ============================================

/// Compute principal matrix square root using Denman-Beavers iteration.
///
/// * `matrix_ptr`     – input matrix A (f64, N x N, row-major)
/// * `n`              – matrix dimension
/// * `result_ptr`     – output sqrt(A) (f64, N x N)
/// * `tolerance`      – convergence tolerance (e.g. 1e-6)
/// * `max_iterations` – maximum iterations (e.g. 1000)
/// * `work_ptr`       – workspace (f64, at least 5*N*N)
///
/// Returns 1 on success, 0 on failure (singular or not converged).
#[no_mangle]
pub unsafe extern "C" fn sqrtm(
    matrix_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    tolerance: f64,
    max_iterations: i32,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let nn = n * n;

    // Workspace: Y | Z | Yk | invZ | invYk   (each nn f64s)
    let y_ptr = work_ptr;
    let z_ptr = work_ptr.add(nn);
    let yk_ptr = work_ptr.add(2 * nn);
    let inv_z = work_ptr.add(3 * nn);
    let inv_yk = work_ptr.add(4 * nn);

    // Y = A
    for i in 0..nn {
        *y_ptr.add(i) = *matrix_ptr.add(i);
    }

    // Z = I
    for i in 0..n {
        for j in 0..n {
            *z_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    for _iter in 0..max_iterations {
        // Save Yk
        for i in 0..nn {
            *yk_ptr.add(i) = *y_ptr.add(i);
        }

        // We need copies of Z and Yk for inversion (Gauss-Jordan destroys input).
        // Copy Z -> invZ workspace, then invert in-place; result goes to inv_z.
        // Actually, mat_inverse(a, inv, n) destroys a and writes inverse to inv.
        // We need to keep Z intact for the update step, so copy Z first.

        // Copy Z -> inv_z (to be destroyed), compute inverse into yk_ptr-area?
        // Instead let's use a two-step approach: copy Z into inv_z, invert inv_z into yk_ptr (temp).
        // But yk_ptr is holding the saved Yk... We need it later.
        // Let's restructure: copy Z into a scratch area, invert into inv_z.
        // We have 5 buffers. After saving Yk, yk_ptr holds Yk (needed).
        // We can copy Z into inv_yk (scratch), invert into inv_z.
        for i in 0..nn {
            *inv_yk.add(i) = *z_ptr.add(i);
        }
        if !mat_inverse(inv_yk, inv_z, n) {
            // Copy best so far
            for i in 0..nn {
                *result_ptr.add(i) = *y_ptr.add(i);
            }
            return 0;
        }

        // Now compute Yk^{-1}. Copy Yk into inv_yk (scratch), invert into inv_yk area...
        // We need a separate output. Let's re-use approach: copy Yk into one buf, invert into another.
        // Copy Yk into inv_yk (will be destroyed), compute Yk^{-1} into... we need a 6th buffer.
        // Alternative: we can use result_ptr as temporary scratch for inverse.
        for i in 0..nn {
            *inv_yk.add(i) = *yk_ptr.add(i);
        }
        // Invert into result_ptr (temporary)
        if !mat_inverse(inv_yk, result_ptr, n) {
            for i in 0..nn {
                *result_ptr.add(i) = *y_ptr.add(i);
            }
            return 0;
        }
        // Now result_ptr holds Yk^{-1}, inv_z holds Z^{-1}

        // Y = 0.5 * (Yk + Z^{-1})
        // Z = 0.5 * (Z + Yk^{-1})
        // Note: Z was destroyed by the copy to inv_yk above... no, we copied Z into inv_yk,
        // then inv_yk was destroyed. Z_ptr still has original Z? No, z_ptr was not touched.
        // Actually z_ptr was not passed to mat_inverse, inv_yk was. So z_ptr is intact. Good.
        for i in 0..nn {
            *y_ptr.add(i) = 0.5 * (*yk_ptr.add(i) + *inv_z.add(i));
            *z_ptr.add(i) = 0.5 * (*z_ptr.add(i) + *result_ptr.add(i));
        }

        // Convergence check: max|Y - Yk|
        let mut max_diff = 0.0_f64;
        for i in 0..nn {
            let d = fabs(*y_ptr.add(i) - *yk_ptr.add(i));
            if d > max_diff {
                max_diff = d;
            }
        }

        if max_diff <= tolerance {
            for i in 0..nn {
                *result_ptr.add(i) = *y_ptr.add(i);
            }
            return 1;
        }
    }

    // Not converged — copy best approximation
    for i in 0..nn {
        *result_ptr.add(i) = *y_ptr.add(i);
    }
    0
}

/// Compute matrix square root using Newton-Schulz iteration (no matrix inversion).
///
/// * `matrix_ptr`     – input matrix A (f64, N x N)
/// * `n`              – matrix dimension
/// * `result_ptr`     – output sqrt(A) (f64, N x N)
/// * `tolerance`      – convergence tolerance
/// * `max_iterations` – max iterations
/// * `work_ptr`       – workspace (f64, at least 3*N*N)
///
/// Returns 1 on success, 0 if not converged.
#[no_mangle]
pub unsafe extern "C" fn sqrtmNewtonSchulz(
    matrix_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    tolerance: f64,
    max_iterations: i32,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let nn = n * n;

    let y_ptr = work_ptr;
    let z_ptr = work_ptr.add(nn);
    let temp_ptr = work_ptr.add(2 * nn);

    // Frobenius norm
    let mut norm_a = 0.0_f64;
    for i in 0..nn {
        let v = *matrix_ptr.add(i);
        norm_a += v * v;
    }
    norm_a = sqrt(norm_a);

    if norm_a < 1e-15 {
        for i in 0..nn {
            *result_ptr.add(i) = 0.0;
        }
        return 1;
    }

    // Y = A / ||A||, Z = I
    let inv_norm = 1.0 / norm_a;
    for i in 0..nn {
        *y_ptr.add(i) = *matrix_ptr.add(i) * inv_norm;
    }
    for i in 0..n {
        for j in 0..n {
            *z_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    for _iter in 0..max_iterations {
        // temp = Z * Y
        mat_mul(z_ptr as *const f64, y_ptr as *const f64, temp_ptr, n);

        // Convergence: ||ZY - I||_max
        let mut max_diff = 0.0_f64;
        for i in 0..n {
            for j in 0..n {
                let expected = if i == j { 1.0 } else { 0.0 };
                let d = fabs(*temp_ptr.add(i * n + j) - expected);
                if d > max_diff {
                    max_diff = d;
                }
            }
        }

        if max_diff <= tolerance {
            let sqrt_norm = sqrt(norm_a);
            for i in 0..nn {
                *result_ptr.add(i) = *y_ptr.add(i) * sqrt_norm;
            }
            return 1;
        }

        // temp = 3I - ZY  (overwrite temp in-place)
        for i in 0..n {
            for j in 0..n {
                let idx = i * n + j;
                let diag = if i == j { 3.0 } else { 0.0 };
                *temp_ptr.add(idx) = diag - *temp_ptr.add(idx);
            }
        }

        // new_Y = 0.5 * Y * temp  → store in result_ptr temporarily
        for i in 0..n {
            for j in 0..n {
                let mut s = 0.0_f64;
                for k in 0..n {
                    s += *y_ptr.add(i * n + k) * *temp_ptr.add(k * n + j);
                }
                *result_ptr.add(i * n + j) = 0.5 * s;
            }
        }

        // new_Z = 0.5 * temp * Z  → store into z_ptr
        // (We read Z and write Z, so we need care — use y_ptr as scratch after copying new_Y.)
        // Actually let's compute new_Z into y_ptr (it will be overwritten next), then swap.
        // Step: compute new_Z into y_ptr
        for i in 0..n {
            for j in 0..n {
                let mut s = 0.0_f64;
                for k in 0..n {
                    s += *temp_ptr.add(i * n + k) * *z_ptr.add(k * n + j);
                }
                *y_ptr.add(i * n + j) = 0.5 * s;
            }
        }
        // Copy new_Z from y_ptr -> z_ptr, new_Y from result_ptr -> y_ptr
        for i in 0..nn {
            *z_ptr.add(i) = *y_ptr.add(i);
            *y_ptr.add(i) = *result_ptr.add(i);
        }
    }

    // Not converged
    let sqrt_norm = sqrt(norm_a);
    for i in 0..nn {
        *result_ptr.add(i) = *y_ptr.add(i) * sqrt_norm;
    }
    0
}

/// Compute matrix square root for symmetric positive definite matrices via Cholesky.
///
/// * `matrix_ptr` – input SPD matrix (f64, N x N)
/// * `n`          – matrix dimension
/// * `result_ptr` – output (f64, N x N) — the Cholesky factor L such that A = L L^T
/// * `work_ptr`   – workspace (f64, at least N*N)
///
/// Returns 1 on success, 0 if not positive definite.
#[no_mangle]
pub unsafe extern "C" fn sqrtmCholesky(
    matrix_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let nn = n * n;
    let l_ptr = work_ptr;

    // Init L = 0
    for i in 0..nn {
        *l_ptr.add(i) = 0.0;
    }

    // Cholesky: A = L * L^T
    for i in 0..n {
        for j in 0..=i {
            let mut sum = *matrix_ptr.add(i * n + j);
            for k in 0..j {
                sum -= *l_ptr.add(i * n + k) * *l_ptr.add(j * n + k);
            }
            if i == j {
                if sum <= 0.0 {
                    return 0;
                }
                *l_ptr.add(i * n + j) = sqrt(sum);
            } else {
                let ljj = *l_ptr.add(j * n + j);
                if fabs(ljj) < 1e-15 {
                    return 0;
                }
                *l_ptr.add(i * n + j) = sum / ljj;
            }
        }
    }

    // Copy L to result
    for i in 0..nn {
        *result_ptr.add(i) = *l_ptr.add(i);
    }

    1
}

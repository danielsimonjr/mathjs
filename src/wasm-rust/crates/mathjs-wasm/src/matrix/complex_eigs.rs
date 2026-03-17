//! WASM-optimized complex eigenvalue decomposition.
//!
//! Implements matrix balancing, Hessenberg reduction, 2x2 eigenvalues,
//! QR iteration steps, and the full QR algorithm for general real matrices.
//!
//! All matrices are flat arrays in row-major order (f64).
//! Return convention (where applicable): 1 = success, 0 = failure.

use libm::{fabs, sqrt};

/// Helper: minimum of two usize values.
#[inline]
fn min_usize(a: usize, b: usize) -> usize {
    if a < b {
        a
    } else {
        b
    }
}

// ============================================
// EXPORTED FUNCTIONS
// ============================================

/// Balance a matrix to improve eigenvalue computation stability.
///
/// Applies diagonal similarity transformations to equalize row/column norms.
///
/// * `matrix_ptr` – input/output matrix (f64, N x N, row-major)
/// * `n`          – matrix dimension
/// * `result_ptr` – diagonal transformation matrix D (f64, N x N)
/// * `perm_ptr`   – permutation array (f64, N); stores the diagonal scale factors
/// * `work_ptr`   – workspace (unused, reserved for future use)
#[no_mangle]
pub unsafe extern "C" fn balanceMatrix(
    matrix_ptr: *mut f64,
    n: i32,
    result_ptr: *mut f64,
    perm_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    let _ = work_ptr; // reserved
    let radix: f64 = 2.0;
    let radix_sq: f64 = 4.0;

    // Init result = I, perm = [1, 1, ..., 1]
    for i in 0..n {
        *perm_ptr.add(i) = 1.0;
        for j in 0..n {
            *result_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    let mut converged = false;
    let mut _iters = 0_i32;

    while !converged && _iters < 100 {
        converged = true;
        _iters += 1;

        for i in 0..n {
            let mut col_norm = 0.0_f64;
            let mut row_norm = 0.0_f64;

            for j in 0..n {
                if i == j {
                    continue;
                }
                col_norm += fabs(*matrix_ptr.add(j * n + i));
                row_norm += fabs(*matrix_ptr.add(i * n + j));
            }

            if col_norm > 1e-15 && row_norm > 1e-15 {
                let mut f = 1.0_f64;
                let mut c = col_norm;
                let row_div = row_norm / radix;
                let row_mul = row_norm * radix;

                while c < row_div {
                    c *= radix_sq;
                    f *= radix;
                }
                while c > row_mul {
                    c /= radix_sq;
                    f /= radix;
                }

                if (c + row_norm) / f < 0.95 * (col_norm + row_norm) {
                    converged = false;
                    let g = 1.0 / f;

                    for j in 0..n {
                        if i != j {
                            let ij = i * n + j;
                            let ji = j * n + i;
                            *matrix_ptr.add(ij) *= g;
                            *matrix_ptr.add(ji) *= f;
                        }
                    }

                    // Update transform
                    for j in 0..n {
                        *result_ptr.add(i * n + j) *= g;
                    }
                    *perm_ptr.add(i) *= g;
                }
            }
        }
    }
}

/// Reduce matrix to upper Hessenberg form using similarity transformations.
///
/// * `matrix_ptr` – input/output matrix (f64, N x N, row-major)
/// * `n`          – matrix dimension
/// * `result_ptr` – transformation matrix Q (f64, N x N)
/// * `work_ptr`   – workspace (unused, reserved)
#[no_mangle]
pub unsafe extern "C" fn reduceToHessenberg(
    matrix_ptr: *mut f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    let _ = work_ptr;
    let tol = 1e-15_f64;

    // Init result = I
    for i in 0..n {
        for j in 0..n {
            *result_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    if n < 3 {
        return;
    }

    for i in 0..(n - 2) {
        // Find largest sub-diagonal in column i
        let mut max_idx = i + 1;
        let mut max_val = fabs(*matrix_ptr.add((i + 1) * n + i));

        for j in (i + 2)..n {
            let v = fabs(*matrix_ptr.add(j * n + i));
            if v > max_val {
                max_val = v;
                max_idx = j;
            }
        }

        if max_val < tol {
            continue;
        }

        // Swap rows & cols if needed
        if max_idx != i + 1 {
            // Swap rows max_idx and i+1
            for k in 0..n {
                let a = max_idx * n + k;
                let b = (i + 1) * n + k;
                let tmp = *matrix_ptr.add(a);
                *matrix_ptr.add(a) = *matrix_ptr.add(b);
                *matrix_ptr.add(b) = tmp;
            }
            // Swap cols max_idx and i+1
            for k in 0..n {
                let a = k * n + max_idx;
                let b = k * n + (i + 1);
                let tmp = *matrix_ptr.add(a);
                *matrix_ptr.add(a) = *matrix_ptr.add(b);
                *matrix_ptr.add(b) = tmp;
            }
            // Swap rows in transform
            for k in 0..n {
                let a = max_idx * n + k;
                let b = (i + 1) * n + k;
                let tmp = *result_ptr.add(a);
                *result_ptr.add(a) = *result_ptr.add(b);
                *result_ptr.add(b) = tmp;
            }
        }

        let pivot = *matrix_ptr.add((i + 1) * n + i);

        for j in (i + 2)..n {
            let factor = *matrix_ptr.add(j * n + i) / pivot;
            if fabs(factor) < tol {
                continue;
            }
            // Row op: row[j] -= factor * row[i+1]
            for k in 0..n {
                *matrix_ptr.add(j * n + k) -= factor * *matrix_ptr.add((i + 1) * n + k);
            }
            // Col op: col[i+1] += factor * col[j]
            for k in 0..n {
                *matrix_ptr.add(k * n + (i + 1)) += factor * *matrix_ptr.add(k * n + j);
            }
            // Transform
            for k in 0..n {
                *result_ptr.add(j * n + k) -= factor * *result_ptr.add((i + 1) * n + k);
            }
        }
    }
}

/// Compute eigenvalues of a 2x2 matrix [a b; c d].
///
/// * `a`, `b`, `c`, `d` – matrix elements
/// * `real_ptr` – output real parts (f64, size 2)
/// * `imag_ptr` – output imaginary parts (f64, size 2)
#[no_mangle]
pub unsafe extern "C" fn eigenvalues2x2(
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    real_ptr: *mut f64,
    imag_ptr: *mut f64,
) {
    let trace = a + d;
    let det = a * d - b * c;
    let disc = trace * trace - 4.0 * det;

    if disc >= 0.0 {
        let sq = sqrt(disc);
        *real_ptr = (trace + sq) / 2.0;
        *imag_ptr = 0.0;
        *real_ptr.add(1) = (trace - sq) / 2.0;
        *imag_ptr.add(1) = 0.0;
    } else {
        let sq = sqrt(-disc);
        *real_ptr = trace / 2.0;
        *imag_ptr = sq / 2.0;
        *real_ptr.add(1) = trace / 2.0;
        *imag_ptr.add(1) = -sq / 2.0;
    }
}

/// Perform one step of QR iteration with implicit shift on a Hessenberg matrix.
///
/// * `h_ptr`    – Hessenberg matrix (f64, N x N, row-major), modified in place
/// * `n`        – working dimension
/// * `shift_re` – real part of shift
/// * `shift_im` – imaginary part of shift (unused for real Givens; reserved)
/// * `work_ptr` – workspace (unused, reserved)
#[no_mangle]
pub unsafe extern "C" fn qrIterationStep(
    h_ptr: *mut f64,
    n: i32,
    shift_re: f64,
    shift_im: f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    let _ = shift_im;
    let _ = work_ptr;

    if n < 2 {
        return;
    }

    // Apply shift: H -= shift_re * I
    for i in 0..n {
        *h_ptr.add(i * n + i) -= shift_re;
    }

    // Givens rotations for QR on Hessenberg matrix
    for i in 0..(n - 1) {
        let a_ii = *h_ptr.add(i * n + i);
        let a_ip1i = *h_ptr.add((i + 1) * n + i);
        let r = sqrt(a_ii * a_ii + a_ip1i * a_ip1i);
        if r < 1e-15 {
            continue;
        }
        let cos = a_ii / r;
        let sin = a_ip1i / r;

        // Apply rotation to rows i, i+1
        for j in i..n {
            let ij = i * n + j;
            let ip1j = (i + 1) * n + j;
            let v0 = *h_ptr.add(ij);
            let v1 = *h_ptr.add(ip1j);
            *h_ptr.add(ij) = cos * v0 + sin * v1;
            *h_ptr.add(ip1j) = -sin * v0 + cos * v1;
        }

        // Apply rotation to columns i, i+1 (RQ product)
        let col_limit = min_usize(i + 3, n);
        for j in 0..col_limit {
            let ji = j * n + i;
            let jip1 = j * n + (i + 1);
            let v0 = *h_ptr.add(ji);
            let v1 = *h_ptr.add(jip1);
            *h_ptr.add(ji) = cos * v0 + sin * v1;
            *h_ptr.add(jip1) = -sin * v0 + cos * v1;
        }
    }

    // Remove shift: H += shift_re * I
    for i in 0..n {
        *h_ptr.add(i * n + i) += shift_re;
    }
}

/// Full QR algorithm for eigenvalue computation.
///
/// Transforms matrix to quasi-triangular (Schur) form and extracts eigenvalues.
///
/// * `matrix_ptr`          – input matrix (f64, N x N, row-major)
/// * `n`                   – matrix dimension
/// * `eigenvalues_real_ptr` – output real parts (f64, size N)
/// * `eigenvalues_imag_ptr` – output imaginary parts (f64, size N)
/// * `work_ptr`            – workspace (f64, at least 2*N*N + 4)
/// * `max_iter`            – maximum QR iterations
/// * `precision`           – convergence tolerance
///
/// Returns 1 on success, 0 if not converged.
#[no_mangle]
pub unsafe extern "C" fn qrAlgorithm(
    matrix_ptr: *const f64,
    n: i32,
    eigenvalues_real_ptr: *mut f64,
    eigenvalues_imag_ptr: *mut f64,
    work_ptr: *mut f64,
    max_iter: i32,
    precision: f64,
) -> i32 {
    let n = n as usize;
    let nn = n * n;

    // Workspace: work_matrix (nn) | transform (nn) | scratch (4)
    let wm = work_ptr;
    let _tr = work_ptr.add(nn);

    // Copy input matrix to working copy
    for i in 0..nn {
        *wm.add(i) = *matrix_ptr.add(i);
    }

    // Balance
    // We'll do a simplified inline balance (no separate perm needed here)
    {
        let radix: f64 = 2.0;
        let radix_sq: f64 = 4.0;
        let mut converged = false;
        let mut iters = 0;
        while !converged && iters < 100 {
            converged = true;
            iters += 1;
            for i in 0..n {
                let mut cn = 0.0_f64;
                let mut rn = 0.0_f64;
                for j in 0..n {
                    if i == j {
                        continue;
                    }
                    cn += fabs(*wm.add(j * n + i));
                    rn += fabs(*wm.add(i * n + j));
                }
                if cn > 1e-15 && rn > 1e-15 {
                    let mut f = 1.0_f64;
                    let mut c = cn;
                    let rd = rn / radix;
                    let rm = rn * radix;
                    while c < rd {
                        c *= radix_sq;
                        f *= radix;
                    }
                    while c > rm {
                        c /= radix_sq;
                        f /= radix;
                    }
                    if (c + rn) / f < 0.95 * (cn + rn) {
                        converged = false;
                        let g = 1.0 / f;
                        for j in 0..n {
                            if i != j {
                                *wm.add(i * n + j) *= g;
                                *wm.add(j * n + i) *= f;
                            }
                        }
                    }
                }
            }
        }
    }

    // Reduce to Hessenberg (in-place, no transform needed for eigenvalues-only)
    {
        let tol = precision;
        if n >= 3 {
            for i in 0..(n - 2) {
                let mut max_idx = i + 1;
                let mut max_v = fabs(*wm.add((i + 1) * n + i));
                for j in (i + 2)..n {
                    let v = fabs(*wm.add(j * n + i));
                    if v > max_v {
                        max_v = v;
                        max_idx = j;
                    }
                }
                if max_v < tol {
                    continue;
                }
                if max_idx != i + 1 {
                    for k in 0..n {
                        let a = max_idx * n + k;
                        let b = (i + 1) * n + k;
                        let tmp = *wm.add(a);
                        *wm.add(a) = *wm.add(b);
                        *wm.add(b) = tmp;
                    }
                    for k in 0..n {
                        let a = k * n + max_idx;
                        let b = k * n + (i + 1);
                        let tmp = *wm.add(a);
                        *wm.add(a) = *wm.add(b);
                        *wm.add(b) = tmp;
                    }
                }
                let piv = *wm.add((i + 1) * n + i);
                for j in (i + 2)..n {
                    let factor = *wm.add(j * n + i) / piv;
                    if fabs(factor) < tol {
                        continue;
                    }
                    for k in 0..n {
                        *wm.add(j * n + k) -= factor * *wm.add((i + 1) * n + k);
                    }
                    for k in 0..n {
                        *wm.add(k * n + (i + 1)) += factor * *wm.add(k * n + j);
                    }
                }
            }
        }
    }

    // QR iteration
    let mut num_eigs: usize = 0;
    let mut current_n = n;
    let mut iter_since_deflation: i32 = 0;

    while current_n > 0 && iter_since_deflation < max_iter {
        iter_since_deflation += 1;

        if current_n == 1 {
            *eigenvalues_real_ptr.add(num_eigs) = *wm.add((current_n - 1) * n + (current_n - 1));
            *eigenvalues_imag_ptr.add(num_eigs) = 0.0;
            num_eigs += 1;
            current_n -= 1;
            iter_since_deflation = 0;
        } else {
            let subdiag = fabs(*wm.add((current_n - 1) * n + (current_n - 2)));
            let diag_n1 = fabs(*wm.add((current_n - 1) * n + (current_n - 1)));
            let diag_n2 = fabs(*wm.add((current_n - 2) * n + (current_n - 2)));

            if subdiag < precision * (diag_n1 + diag_n2 + 1e-15) {
                // 1x1 deflation
                *eigenvalues_real_ptr.add(num_eigs) =
                    *wm.add((current_n - 1) * n + (current_n - 1));
                *eigenvalues_imag_ptr.add(num_eigs) = 0.0;
                num_eigs += 1;
                current_n -= 1;
                iter_since_deflation = 0;
            } else if current_n >= 2 {
                let mut subdiag2 = 0.0_f64;
                if current_n > 2 {
                    subdiag2 = fabs(*wm.add((current_n - 2) * n + (current_n - 3)));
                }
                let diag_n3 = if current_n > 2 {
                    fabs(*wm.add((current_n - 3) * n + (current_n - 3)))
                } else {
                    0.0
                };

                if current_n == 2 || subdiag2 < precision * (diag_n2 + diag_n3 + 1e-15) {
                    // 2x2 block
                    let a = *wm.add((current_n - 2) * n + (current_n - 2));
                    let b = *wm.add((current_n - 2) * n + (current_n - 1));
                    let c = *wm.add((current_n - 1) * n + (current_n - 2));
                    let d = *wm.add((current_n - 1) * n + (current_n - 1));
                    let trace = a + d;
                    let det = a * d - b * c;
                    let disc = trace * trace - 4.0 * det;

                    if disc >= 0.0 {
                        let sq = sqrt(disc);
                        *eigenvalues_real_ptr.add(num_eigs) = (trace + sq) / 2.0;
                        *eigenvalues_imag_ptr.add(num_eigs) = 0.0;
                        num_eigs += 1;
                        *eigenvalues_real_ptr.add(num_eigs) = (trace - sq) / 2.0;
                        *eigenvalues_imag_ptr.add(num_eigs) = 0.0;
                        num_eigs += 1;
                    } else {
                        let sq = sqrt(-disc);
                        *eigenvalues_real_ptr.add(num_eigs) = trace / 2.0;
                        *eigenvalues_imag_ptr.add(num_eigs) = sq / 2.0;
                        num_eigs += 1;
                        *eigenvalues_real_ptr.add(num_eigs) = trace / 2.0;
                        *eigenvalues_imag_ptr.add(num_eigs) = -sq / 2.0;
                        num_eigs += 1;
                    }
                    current_n -= 2;
                    iter_since_deflation = 0;
                } else {
                    // QR step with Wilkinson shift
                    let cn = current_n;
                    let a = *wm.add((cn - 2) * n + (cn - 2));
                    let b = *wm.add((cn - 2) * n + (cn - 1));
                    let c = *wm.add((cn - 1) * n + (cn - 2));
                    let d = *wm.add((cn - 1) * n + (cn - 1));
                    let trace = a + d;
                    let det = a * d - b * c;
                    let disc = trace * trace - 4.0 * det;

                    let shift = if disc >= 0.0 {
                        let sq = sqrt(disc);
                        let l1 = (trace + sq) / 2.0;
                        let l2 = (trace - sq) / 2.0;
                        if fabs(l1 - d) < fabs(l2 - d) {
                            l1
                        } else {
                            l2
                        }
                    } else {
                        d
                    };

                    // Apply shift
                    for ii in 0..cn {
                        *wm.add(ii * n + ii) -= shift;
                    }

                    // Givens QR on Hessenberg
                    for ii in 0..(cn - 1) {
                        let v0 = *wm.add(ii * n + ii);
                        let v1 = *wm.add((ii + 1) * n + ii);
                        let r = sqrt(v0 * v0 + v1 * v1);
                        if r < 1e-15 {
                            continue;
                        }
                        let cos = v0 / r;
                        let sin = v1 / r;

                        for j in ii..cn {
                            let p0 = ii * n + j;
                            let p1 = (ii + 1) * n + j;
                            let x = *wm.add(p0);
                            let y = *wm.add(p1);
                            *wm.add(p0) = cos * x + sin * y;
                            *wm.add(p1) = -sin * x + cos * y;
                        }
                        let cl = min_usize(ii + 3, cn);
                        for j in 0..cl {
                            let p0 = j * n + ii;
                            let p1 = j * n + (ii + 1);
                            let x = *wm.add(p0);
                            let y = *wm.add(p1);
                            *wm.add(p0) = cos * x + sin * y;
                            *wm.add(p1) = -sin * x + cos * y;
                        }
                    }

                    // Remove shift
                    for ii in 0..cn {
                        *wm.add(ii * n + ii) += shift;
                    }
                }
            }
        }
    }

    // Sort eigenvalues by magnitude (selection sort)
    for i in 0..num_eigs.saturating_sub(1) {
        let mut min_idx = i;
        let ri = *eigenvalues_real_ptr.add(i);
        let ii_val = *eigenvalues_imag_ptr.add(i);
        let mut min_mag = sqrt(ri * ri + ii_val * ii_val);

        for j in (i + 1)..num_eigs {
            let rj = *eigenvalues_real_ptr.add(j);
            let ij = *eigenvalues_imag_ptr.add(j);
            let mag = sqrt(rj * rj + ij * ij);
            if mag < min_mag {
                min_mag = mag;
                min_idx = j;
            }
        }
        if min_idx != i {
            let tr = *eigenvalues_real_ptr.add(i);
            *eigenvalues_real_ptr.add(i) = *eigenvalues_real_ptr.add(min_idx);
            *eigenvalues_real_ptr.add(min_idx) = tr;
            let ti = *eigenvalues_imag_ptr.add(i);
            *eigenvalues_imag_ptr.add(i) = *eigenvalues_imag_ptr.add(min_idx);
            *eigenvalues_imag_ptr.add(min_idx) = ti;
        }
    }

    if iter_since_deflation < max_iter {
        1
    } else {
        0
    }
}

/// Hessenberg QR step without forming Q (faster for eigenvalues only).
///
/// * `h_ptr`    – Hessenberg matrix (f64, N x N), modified in place
/// * `n`        – working dimension
/// * `p`        – full matrix dimension (stride)
/// * `q`        – unused (reserved for future double-shift)
/// * `work_ptr` – workspace (unused, reserved)
#[no_mangle]
pub unsafe extern "C" fn hessenbergQRStep(
    h_ptr: *mut f64,
    n: i32,
    p: i32,
    q: i32,
    work_ptr: *mut f64,
) {
    let n_work = n as usize;
    let full_n = p as usize;
    let _ = q;
    let _ = work_ptr;

    if n_work < 2 {
        return;
    }

    // Wilkinson shift from bottom-right 2x2
    let a = *h_ptr.add((n_work - 2) * full_n + (n_work - 2));
    let b = *h_ptr.add((n_work - 2) * full_n + (n_work - 1));
    let c = *h_ptr.add((n_work - 1) * full_n + (n_work - 2));
    let d = *h_ptr.add((n_work - 1) * full_n + (n_work - 1));

    let trace = a + d;
    let det = a * d - b * c;
    let disc = trace * trace - 4.0 * det;

    let shift = if disc >= 0.0 {
        let sq = sqrt(disc);
        let l1 = (trace + sq) / 2.0;
        let l2 = (trace - sq) / 2.0;
        if fabs(l1 - d) < fabs(l2 - d) {
            l1
        } else {
            l2
        }
    } else {
        d
    };

    // Apply shift
    for i in 0..n_work {
        *h_ptr.add(i * full_n + i) -= shift;
    }

    // Givens rotations
    for i in 0..(n_work - 1) {
        let v0 = *h_ptr.add(i * full_n + i);
        let v1 = *h_ptr.add((i + 1) * full_n + i);
        let r = sqrt(v0 * v0 + v1 * v1);
        if r < 1e-15 {
            continue;
        }
        let cos = v0 / r;
        let sin = v1 / r;

        // Rows
        for j in i..n_work {
            let p0 = i * full_n + j;
            let p1 = (i + 1) * full_n + j;
            let x = *h_ptr.add(p0);
            let y = *h_ptr.add(p1);
            *h_ptr.add(p0) = cos * x + sin * y;
            *h_ptr.add(p1) = -sin * x + cos * y;
        }

        // Columns (RQ)
        let cl = min_usize(i + 3, n_work);
        for j in 0..cl {
            let p0 = j * full_n + i;
            let p1 = j * full_n + (i + 1);
            let x = *h_ptr.add(p0);
            let y = *h_ptr.add(p1);
            *h_ptr.add(p0) = cos * x + sin * y;
            *h_ptr.add(p1) = -sin * x + cos * y;
        }
    }

    // Remove shift
    for i in 0..n_work {
        *h_ptr.add(i * full_n + i) += shift;
    }
}

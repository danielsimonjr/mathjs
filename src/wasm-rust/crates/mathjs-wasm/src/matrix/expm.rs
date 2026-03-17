//! WASM-optimized matrix exponential operations.
//!
//! Implements Padé approximation with scaling-and-squaring,
//! Taylor series for small matrices, and matrix-exponential-times-vector.
//!
//! All matrices are flat arrays in row-major order (f64).
//! Return convention: 1 = success, 0 = failure.

use libm::{exp, fabs, pow};

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
// HELPER: matrix inverse via Gauss-Jordan
// Returns true on success.  `a` is DESTROYED.
// `inv` receives the inverse.  `work` is unused
// (pivoting is done in-place).
// ============================================
unsafe fn mat_inverse(a: *mut f64, inv: *mut f64, n: usize) -> bool {
    // Init inv = I
    for i in 0..n {
        for j in 0..n {
            *inv.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    for col in 0..n {
        // Partial pivoting
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
            *a.add(idx) = *a.add(idx) / pivot;
            *inv.add(idx) = *inv.add(idx) / pivot;
        }
        for row in 0..n {
            if row != col {
                let factor = *a.add(row * n + col);
                for j in 0..n {
                    let ri = row * n + j;
                    let ci = col * n + j;
                    *a.add(ri) = *a.add(ri) - factor * *a.add(ci);
                    *inv.add(ri) = *inv.add(ri) - factor * *inv.add(ci);
                }
            }
        }
    }
    true
}

// ============================================
// HELPER: infinity norm (max row-sum of |a_ij|)
// ============================================
unsafe fn infinity_norm(m: *const f64, n: usize) -> f64 {
    let mut max_norm = 0.0_f64;
    for i in 0..n {
        let mut row_sum = 0.0_f64;
        for j in 0..n {
            row_sum += fabs(*m.add(i * n + j));
        }
        if row_sum > max_norm {
            max_norm = row_sum;
        }
    }
    max_norm
}

// ============================================
// HELPER: error estimate for Padé order q, scaling j
// ============================================
fn error_estimate(inf_norm: f64, q: i32, j: i32) -> f64 {
    let mut qfac = 1.0_f64;
    for i in 2..=q {
        qfac *= i as f64;
    }
    let mut twoqfac = qfac;
    for i in (q + 1)..=(2 * q) {
        twoqfac *= i as f64;
    }
    let twoqp1fac = twoqfac * (2 * q + 1) as f64;
    let scaled = inf_norm / pow(2.0, j as f64);
    (8.0 * pow(scaled, (2 * q) as f64) * qfac * qfac) / (twoqfac * twoqp1fac)
}

// ============================================
// HELPER: find optimal Padé parameters (q, j)
// ============================================
fn find_params(inf_norm: f64, eps: f64) -> (i32, i32) {
    let max_search = 30;
    for k in 0..max_search {
        for q in 0..=k {
            let j = k - q;
            if error_estimate(inf_norm, q, j) < eps {
                return (q, j);
            }
        }
    }
    (13, 0)
}

// ============================================
// EXPORTED FUNCTIONS
// ============================================

/// Compute matrix exponential e^A using Padé approximation with scaling-and-squaring.
///
/// * `matrix_ptr` – input matrix A (f64, N x N, row-major)
/// * `n`          – matrix dimension
/// * `result_ptr` – output e^A (f64, N x N)
/// * `work_ptr`   – workspace (f64, at least 6*N*N)
///
/// Returns 1 on success, 0 on failure.
#[no_mangle]
pub unsafe extern "C" fn expm(
    matrix_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let nn = n * n;
    let eps = 1e-15_f64;

    // Workspace layout: Apos | N | D | AposToI | temp1 | temp2   (each nn f64s)
    let a_pos = work_ptr;
    let n_mat = work_ptr.add(nn);
    let d_mat = work_ptr.add(2 * nn);
    let a_pow = work_ptr.add(3 * nn);
    let temp1 = work_ptr.add(4 * nn);
    let _temp2 = work_ptr.add(5 * nn);

    let inf = infinity_norm(matrix_ptr, n);
    let (q, j) = find_params(inf, eps);

    // Scale: Apos = A * 2^{-j}
    let scale = pow(2.0, -(j as f64));
    for i in 0..nn {
        *a_pos.add(i) = *matrix_ptr.add(i) * scale;
    }

    // N = I, D = I
    for i in 0..n {
        for k in 0..n {
            let v = if i == k { 1.0 } else { 0.0 };
            *n_mat.add(i * n + k) = v;
            *d_mat.add(i * n + k) = v;
        }
    }

    // AposToI = Apos (power = 1)
    for i in 0..nn {
        *a_pow.add(i) = *a_pos.add(i);
    }

    let mut factor = 1.0_f64;
    let mut alternate = -1.0_f64;

    for i in 1..=(q as usize) {
        let ii = i as i32;
        if i > 1 {
            // AposToI = AposToI * Apos
            mat_mul(a_pow as *const f64, a_pos as *const f64, temp1, n);
            for k in 0..nn {
                *a_pow.add(k) = *temp1.add(k);
            }
            alternate = -alternate;
        }

        factor = (factor * (q - ii + 1) as f64) / ((2 * q - ii + 1) as f64 * ii as f64);

        for k in 0..nn {
            let aval = *a_pow.add(k);
            *n_mat.add(k) = *n_mat.add(k) + factor * aval;
            *d_mat.add(k) = *d_mat.add(k) + factor * alternate * aval;
        }
    }

    // Compute D^{-1}  (D is destroyed, inverse goes into temp1)
    if !mat_inverse(d_mat, temp1, n) {
        return 0; // failure
    }

    // result = D^{-1} * N
    mat_mul(temp1 as *const f64, n_mat as *const f64, result_ptr, n);

    // Squaring phase: result = result^{2^j}
    for _ in 0..j {
        mat_mul(result_ptr as *const f64, result_ptr as *const f64, temp1, n);
        for k in 0..nn {
            *result_ptr.add(k) = *temp1.add(k);
        }
    }

    1 // success
}

/// Taylor-series matrix exponential for small matrices (n <= 3).
///
/// * `matrix_ptr` – input matrix (f64, N x N)
/// * `n`          – dimension (1, 2, or 3)
/// * `result_ptr` – output (f64, N x N)
/// * `num_terms`  – number of Taylor terms
#[no_mangle]
pub unsafe extern "C" fn expmSmall(
    matrix_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    num_terms: i32,
) {
    let n = n as usize;

    // Init result = I
    for i in 0..n {
        for j in 0..n {
            *result_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    if n == 1 {
        *result_ptr = exp(*matrix_ptr);
        return;
    }

    if n == 2 {
        let a00 = *matrix_ptr;
        let a01 = *matrix_ptr.add(1);
        let a10 = *matrix_ptr.add(2);
        let a11 = *matrix_ptr.add(3);

        let (mut t00, mut t01) = (1.0_f64, 0.0_f64);
        let (mut t10, mut t11) = (0.0_f64, 1.0_f64);
        let (mut r00, mut r01) = (1.0_f64, 0.0_f64);
        let (mut r10, mut r11) = (0.0_f64, 1.0_f64);

        for k in 1..=(num_terms as usize) {
            let inv_k = 1.0 / k as f64;
            let n00 = (t00 * a00 + t01 * a10) * inv_k;
            let n01 = (t00 * a01 + t01 * a11) * inv_k;
            let n10 = (t10 * a00 + t11 * a10) * inv_k;
            let n11 = (t10 * a01 + t11 * a11) * inv_k;
            t00 = n00;
            t01 = n01;
            t10 = n10;
            t11 = n11;
            r00 += t00;
            r01 += t01;
            r10 += t10;
            r11 += t11;
            if fabs(t00) + fabs(t01) + fabs(t10) + fabs(t11) < 1e-16 {
                break;
            }
        }

        *result_ptr = r00;
        *result_ptr.add(1) = r01;
        *result_ptr.add(2) = r10;
        *result_ptr.add(3) = r11;
        return;
    }

    // n == 3 — general small Taylor via workspace on "stack" (9 f64 term matrix)
    if n == 3 {
        // term[9] and result already initialised to I
        let mut term = [0.0_f64; 9];
        term[0] = 1.0;
        term[4] = 1.0;
        term[8] = 1.0;

        for k in 1..=(num_terms as usize) {
            let inv_k = 1.0 / k as f64;
            let mut new_term = [0.0_f64; 9];
            for i in 0..3usize {
                for j in 0..3usize {
                    let mut s = 0.0_f64;
                    for p in 0..3usize {
                        s += term[i * 3 + p] * *matrix_ptr.add(p * 3 + j);
                    }
                    new_term[i * 3 + j] = s * inv_k;
                }
            }
            term = new_term;
            let mut norm = 0.0_f64;
            for idx in 0..9 {
                *result_ptr.add(idx) = *result_ptr.add(idx) + term[idx];
                norm += fabs(term[idx]);
            }
            if norm < 1e-16 {
                break;
            }
        }
    }
}

/// Compute y = e^A * x via truncated Taylor series (without forming the full exponential).
///
/// * `matrix_ptr` – input matrix A (f64, N x N)
/// * `n`          – dimension
/// * `x_ptr`      – input vector (f64, N)
/// * `y_ptr`      – output vector (f64, N)
/// * `work_ptr`   – workspace (f64, at least 2*N)
/// * `num_terms`  – number of Taylor terms
#[no_mangle]
pub unsafe extern "C" fn expmv(
    matrix_ptr: *const f64,
    n: i32,
    x_ptr: *const f64,
    y_ptr: *mut f64,
    work_ptr: *mut f64,
    num_terms: i32,
) {
    let n = n as usize;
    let term_ptr = work_ptr;
    let temp_ptr = work_ptr.add(n);

    // term = x, y = x
    for i in 0..n {
        let v = *x_ptr.add(i);
        *term_ptr.add(i) = v;
        *y_ptr.add(i) = v;
    }

    for k in 1..=(num_terms as usize) {
        let inv_k = 1.0 / k as f64;
        // temp = A * term / k
        for i in 0..n {
            let mut s = 0.0_f64;
            for j in 0..n {
                s += *matrix_ptr.add(i * n + j) * *term_ptr.add(j);
            }
            *temp_ptr.add(i) = s * inv_k;
        }

        let mut norm2 = 0.0_f64;
        for i in 0..n {
            let v = *temp_ptr.add(i);
            *term_ptr.add(i) = v;
            *y_ptr.add(i) = *y_ptr.add(i) + v;
            norm2 += v * v;
        }
        if norm2 < 1e-30 {
            break;
        }
    }
}

//! Dense matrix decompositions: LU, QR, Cholesky (with SIMD variants).
//!
//! All matrices are row-major f64 flat arrays. Permutations are i32 arrays.

// ============================================
// LU DECOMPOSITION
// ============================================

/// LU decomposition with partial pivoting: PA = LU.
/// Matrix a is modified in-place to contain L (below) and U (on/above diagonal).
/// Returns 0 on success, 1 if singular.
#[no_mangle]
pub unsafe extern "C" fn luDecomposition(a_ptr: *mut f64, n: i32, perm_ptr: *mut i32) -> i32 {
    let n = n as usize;

    // Initialize permutation
    for i in 0..n {
        *perm_ptr.add(i) = i as i32;
    }

    for k in 0..n.saturating_sub(1) {
        // Find pivot
        let mut max_val = libm::fabs(*a_ptr.add(k * n + k));
        let mut pivot_row = k;

        for i in (k + 1)..n {
            let val = libm::fabs(*a_ptr.add(i * n + k));
            if val > max_val {
                max_val = val;
                pivot_row = i;
            }
        }

        if max_val < 1e-14 {
            return 1; // Singular
        }

        // Swap rows
        if pivot_row != k {
            for j in 0..n {
                let idx1 = k * n + j;
                let idx2 = pivot_row * n + j;
                let temp = *a_ptr.add(idx1);
                *a_ptr.add(idx1) = *a_ptr.add(idx2);
                *a_ptr.add(idx2) = temp;
            }
            let temp = *perm_ptr.add(k);
            *perm_ptr.add(k) = *perm_ptr.add(pivot_row);
            *perm_ptr.add(pivot_row) = temp;
        }

        // Eliminate column
        let pivot = *a_ptr.add(k * n + k);
        for i in (k + 1)..n {
            let factor = *a_ptr.add(i * n + k) / pivot;
            *a_ptr.add(i * n + k) = factor; // Store L factor

            for j in (k + 1)..n {
                *a_ptr.add(i * n + j) -= factor * *a_ptr.add(k * n + j);
            }
        }
    }

    0 // Success
}

// ============================================
// QR DECOMPOSITION
// ============================================

/// QR decomposition using Householder reflections.
/// a_ptr (m x n) will contain R. q_ptr (m x m) will contain Q.
#[no_mangle]
pub unsafe extern "C" fn qrDecomposition(a_ptr: *mut f64, m: i32, n: i32, q_ptr: *mut f64) {
    let m = m as usize;
    let n = n as usize;

    // Initialize Q as identity
    for i in 0..m {
        for j in 0..m {
            *q_ptr.add(i * m + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    let min_dim = if m < n { m } else { n };

    for k in 0..min_dim {
        // Compute norm of column below diagonal
        let mut norm: f64 = 0.0;
        for i in k..m {
            let val = *a_ptr.add(i * n + k);
            norm += val * val;
        }
        norm = libm::sqrt(norm);

        if norm < 1e-14 {
            continue;
        }

        let akk = *a_ptr.add(k * n + k);
        let sign = if akk >= 0.0 { 1.0 } else { -1.0 };
        let u1 = akk + sign * norm;

        // Compute tau = 2 / (v^T * v)
        let mut v_dot_v: f64 = 1.0;
        for i in (k + 1)..m {
            let vi = *a_ptr.add(i * n + k) / u1;
            v_dot_v += vi * vi;
        }
        let tau = 2.0 / v_dot_v;

        // Apply Householder to R (a)
        for j in k..n {
            let mut v_dot_col = *a_ptr.add(k * n + j);
            for i in (k + 1)..m {
                let vi = *a_ptr.add(i * n + k) / u1;
                v_dot_col += vi * *a_ptr.add(i * n + j);
            }
            let factor = tau * v_dot_col;
            *a_ptr.add(k * n + j) -= factor;
            for i in (k + 1)..m {
                let vi = *a_ptr.add(i * n + k) / u1;
                *a_ptr.add(i * n + j) -= factor * vi;
            }
        }

        // Apply Householder to Q
        for j in 0..m {
            let mut v_dot_col = *q_ptr.add(k * m + j);
            for i in (k + 1)..m {
                let vi = *a_ptr.add(i * n + k) / u1;
                v_dot_col += vi * *q_ptr.add(i * m + j);
            }
            let factor = tau * v_dot_col;
            *q_ptr.add(k * m + j) -= factor;
            for i in (k + 1)..m {
                let vi = *a_ptr.add(i * n + k) / u1;
                *q_ptr.add(i * m + j) -= factor * vi;
            }
        }

        // Zero out below diagonal
        for i in (k + 1)..m {
            *a_ptr.add(i * n + k) = 0.0;
        }
    }
}

// ============================================
// CHOLESKY DECOMPOSITION
// ============================================

/// Cholesky decomposition: A = L * L^T.
/// Returns 0 on success, 1 if not positive-definite.
#[no_mangle]
pub unsafe extern "C" fn choleskyDecomposition(a_ptr: *const f64, n: i32, l_ptr: *mut f64) -> i32 {
    let n = n as usize;

    // Initialize L to zero
    for i in 0..(n * n) {
        *l_ptr.add(i) = 0.0;
    }

    for i in 0..n {
        for j in 0..=i {
            let mut sum = *a_ptr.add(i * n + j);

            for k in 0..j {
                sum -= *l_ptr.add(i * n + k) * *l_ptr.add(j * n + k);
            }

            if i == j {
                if sum <= 0.0 {
                    return 1; // Not positive-definite
                }
                *l_ptr.add(i * n + j) = libm::sqrt(sum);
            } else {
                let ljj = *l_ptr.add(j * n + j);
                *l_ptr.add(i * n + j) = sum / ljj;
            }
        }
    }

    0 // Success
}

// ============================================
// LU SOLVE
// ============================================

/// Solve Ax = b using LU decomposition.
#[no_mangle]
pub unsafe extern "C" fn luSolve(
    lu_ptr: *const f64,
    n: i32,
    perm_ptr: *const i32,
    b_ptr: *const f64,
    x_ptr: *mut f64,
) {
    let n = n as usize;

    // Forward substitution: Ly = Pb
    for i in 0..n {
        let pi = *perm_ptr.add(i) as usize;
        let mut sum = *b_ptr.add(pi);
        for j in 0..i {
            sum -= *lu_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum;
    }

    // Check if last diagonal is near-zero (singular)
    let last_diag = *lu_ptr.add((n - 1) * n + (n - 1));
    if last_diag.abs() < 1e-14 {
        return; // singular, cannot solve
    }

    // Backward substitution: Ux = y
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *x_ptr.add(i);
        for j in (i + 1)..n {
            sum -= *lu_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum / *lu_ptr.add(i * n + i);
    }
}

// ============================================
// LU DETERMINANT
// ============================================

/// Compute determinant from LU decomposition.
#[no_mangle]
pub unsafe extern "C" fn luDeterminant(lu_ptr: *const f64, n: i32, perm_ptr: *const i32) -> f64 {
    let n = n as usize;
    let mut det: f64 = 1.0;

    for i in 0..n {
        det *= *lu_ptr.add(i * n + i);
    }

    // Compute parity by walking permutation cycles
    let mut sign = 1.0_f64;
    let mut visited = alloc::vec![false; n];
    for i in 0..n {
        if visited[i] {
            continue;
        }
        let mut j = i;
        let mut cycle_len = 0;
        while !visited[j] {
            visited[j] = true;
            j = *perm_ptr.add(j) as usize;
            cycle_len += 1;
        }
        if cycle_len % 2 == 0 {
            sign = -sign;
        }
    }

    det * sign
}

// ============================================
// SIMD VARIANTS (scalar fallbacks in WASM)
// ============================================

/// SIMD-accelerated LU (scalar fallback for wasm32).
#[no_mangle]
pub unsafe extern "C" fn luDecompositionSIMD(a_ptr: *mut f64, n: i32, perm_ptr: *mut i32) -> i32 {
    luDecomposition(a_ptr, n, perm_ptr)
}

/// SIMD-accelerated QR (scalar fallback for wasm32).
#[no_mangle]
pub unsafe extern "C" fn qrDecompositionSIMD(a_ptr: *mut f64, m: i32, n: i32, q_ptr: *mut f64) {
    qrDecomposition(a_ptr, m, n, q_ptr)
}

/// SIMD-accelerated Cholesky (scalar fallback for wasm32).
#[no_mangle]
pub unsafe extern "C" fn choleskyDecompositionSIMD(
    a_ptr: *const f64,
    n: i32,
    l_ptr: *mut f64,
) -> i32 {
    choleskyDecomposition(a_ptr, n, l_ptr)
}

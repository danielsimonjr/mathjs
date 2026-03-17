//! Matrix equation solvers: Sylvester (AX + XB = C), Lyapunov, discrete Lyapunov.
//! Uses vectorization (Kronecker product) approach.

// ============================================
// INTERNAL HELPERS
// ============================================

unsafe fn mat_transpose(a_ptr: *const f64, rows: usize, cols: usize, result_ptr: *mut f64) {
    for i in 0..rows {
        for j in 0..cols {
            *result_ptr.add(j * rows + i) = *a_ptr.add(i * cols + j);
        }
    }
}

unsafe fn mat_eye(n: usize, result_ptr: *mut f64) {
    let n2 = n * n;
    for i in 0..n2 {
        *result_ptr.add(i) = 0.0;
    }
    for i in 0..n {
        *result_ptr.add(i * n + i) = 1.0;
    }
}

unsafe fn mat_kron(
    a: *const f64,
    a_rows: usize,
    a_cols: usize,
    b: *const f64,
    b_rows: usize,
    b_cols: usize,
    result: *mut f64,
) {
    let result_cols = a_cols * b_cols;
    for i in 0..a_rows {
        for j in 0..a_cols {
            let a_val = *a.add(i * a_cols + j);
            for k in 0..b_rows {
                for l in 0..b_cols {
                    let row = i * b_rows + k;
                    let col = j * b_cols + l;
                    *result.add(row * result_cols + col) = a_val * *b.add(k * b_cols + l);
                }
            }
        }
    }
}

/// Solve Ax = b via LU with partial pivoting. Returns 1 on success, 0 if singular.
unsafe fn solve_linear(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: usize,
    x_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let lu_ptr = work_ptr;
    let perm_ptr = work_ptr.add(n * n) as *mut i32;

    // Copy a to lu
    for i in 0..(n * n) {
        *lu_ptr.add(i) = *a_ptr.add(i);
    }
    for i in 0..n {
        *perm_ptr.add(i) = i as i32;
    }

    for k in 0..n.saturating_sub(1) {
        let mut max_val = libm::fabs(*lu_ptr.add(k * n + k));
        let mut pivot_row = k;
        for i in (k + 1)..n {
            let val = libm::fabs(*lu_ptr.add(i * n + k));
            if val > max_val {
                max_val = val;
                pivot_row = i;
            }
        }
        if max_val < 1e-14 {
            return 0;
        }
        if pivot_row != k {
            for j in 0..n {
                let t = *lu_ptr.add(k * n + j);
                *lu_ptr.add(k * n + j) = *lu_ptr.add(pivot_row * n + j);
                *lu_ptr.add(pivot_row * n + j) = t;
            }
            let t = *perm_ptr.add(k);
            *perm_ptr.add(k) = *perm_ptr.add(pivot_row);
            *perm_ptr.add(pivot_row) = t;
        }
        let pivot = *lu_ptr.add(k * n + k);
        for i in (k + 1)..n {
            let factor = *lu_ptr.add(i * n + k) / pivot;
            *lu_ptr.add(i * n + k) = factor;
            for j in (k + 1)..n {
                *lu_ptr.add(i * n + j) -= factor * *lu_ptr.add(k * n + j);
            }
        }
    }

    if libm::fabs(*lu_ptr.add((n - 1) * n + (n - 1))) < 1e-14 {
        return 0;
    }

    // Forward substitution
    for i in 0..n {
        let pi = *perm_ptr.add(i) as usize;
        let mut sum = *b_ptr.add(pi);
        for j in 0..i {
            sum -= *lu_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum;
    }

    // Backward substitution
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *x_ptr.add(i);
        for j in (i + 1)..n {
            sum -= *lu_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum / *lu_ptr.add(i * n + i);
    }

    1
}

// ============================================
// SYLVESTER: AX + XB = C
// ============================================

/// Solve Sylvester equation AX + XB = C.
/// Returns 1 on success, 0 if no unique solution.
#[no_mangle]
pub unsafe extern "C" fn sylvester(
    a_ptr: *const f64,
    n: i32,
    b_ptr: *const f64,
    m: i32,
    c_ptr: *const f64,
    x_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let nu = n as usize;
    let mu = m as usize;
    let nm = nu * mu;
    let nm2 = nm * nm;

    // Work layout: I_n, I_m, BT, term1, term2, coeff, vecC, vecX, solveWork
    let i_n_ptr = work_ptr;
    let i_m_ptr = i_n_ptr.add(nu * nu);
    let bt_ptr = i_m_ptr.add(mu * mu);
    let term1_ptr = bt_ptr.add(mu * mu);
    let term2_ptr = term1_ptr.add(nm2);
    let coeff_ptr = term2_ptr.add(nm2);
    let vec_c_ptr = coeff_ptr.add(nm2);
    let vec_x_ptr = vec_c_ptr.add(nm);
    let solve_work_ptr = vec_x_ptr.add(nm);

    mat_eye(nu, i_n_ptr);
    mat_eye(mu, i_m_ptr);
    mat_transpose(b_ptr, mu, mu, bt_ptr);

    // I_m kron A
    mat_kron(i_m_ptr, mu, mu, a_ptr, nu, nu, term1_ptr);
    // B^T kron I_n
    mat_kron(bt_ptr, mu, mu, i_n_ptr, nu, nu, term2_ptr);

    // coeff = term1 + term2
    for i in 0..nm2 {
        *coeff_ptr.add(i) = *term1_ptr.add(i) + *term2_ptr.add(i);
    }

    // vec(C): stack columns
    for j in 0..mu {
        for i in 0..nu {
            *vec_c_ptr.add(j * nu + i) = *c_ptr.add(i * mu + j);
        }
    }

    let success = solve_linear(coeff_ptr, vec_c_ptr, nm, vec_x_ptr, solve_work_ptr);
    if success == 0 {
        return 0;
    }

    // Unvectorize
    for j in 0..mu {
        for i in 0..nu {
            *x_ptr.add(i * mu + j) = *vec_x_ptr.add(j * nu + i);
        }
    }

    1
}

// ============================================
// LYAPUNOV: AX + XA^T = Q
// ============================================

/// Solve continuous Lyapunov equation AX + XA^T = Q.
#[no_mangle]
pub unsafe extern "C" fn lyap(
    a_ptr: *const f64,
    n: i32,
    q_ptr: *const f64,
    x_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let nu = n as usize;
    let n2 = nu * nu;
    let n4 = n2 * n2;

    let i_n_ptr = work_ptr;
    let term1_ptr = i_n_ptr.add(n2);
    let term2_ptr = term1_ptr.add(n4);
    let coeff_ptr = term2_ptr.add(n4);
    let vec_q_ptr = coeff_ptr.add(n4);
    let vec_x_ptr = vec_q_ptr.add(n2);
    let solve_work_ptr = vec_x_ptr.add(n2);

    mat_eye(nu, i_n_ptr);
    mat_kron(i_n_ptr, nu, nu, a_ptr, nu, nu, term1_ptr);
    mat_kron(a_ptr, nu, nu, i_n_ptr, nu, nu, term2_ptr);

    for i in 0..n4 {
        *coeff_ptr.add(i) = *term1_ptr.add(i) + *term2_ptr.add(i);
    }

    for j in 0..nu {
        for i in 0..nu {
            *vec_q_ptr.add(j * nu + i) = *q_ptr.add(i * nu + j);
        }
    }

    let success = solve_linear(coeff_ptr, vec_q_ptr, n2, vec_x_ptr, solve_work_ptr);
    if success == 0 {
        return 0;
    }

    for j in 0..nu {
        for i in 0..nu {
            *x_ptr.add(i * nu + j) = *vec_x_ptr.add(j * nu + i);
        }
    }

    1
}

// ============================================
// DISCRETE LYAPUNOV: AXA^T - X = Q
// ============================================

/// Solve discrete Lyapunov equation AXA^T - X = Q.
#[no_mangle]
pub unsafe extern "C" fn dlyap(
    a_ptr: *const f64,
    n: i32,
    q_ptr: *const f64,
    x_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let nu = n as usize;
    let n2 = nu * nu;
    let n4 = n2 * n2;

    let a_kron_a_ptr = work_ptr;
    let coeff_ptr = a_kron_a_ptr.add(n4);
    let vec_q_ptr = coeff_ptr.add(n4);
    let vec_x_ptr = vec_q_ptr.add(n2);
    let solve_work_ptr = vec_x_ptr.add(n2);

    mat_kron(a_ptr, nu, nu, a_ptr, nu, nu, a_kron_a_ptr);

    // coeff = A kron A - I
    for i in 0..n4 {
        *coeff_ptr.add(i) = *a_kron_a_ptr.add(i);
    }
    for i in 0..n2 {
        *coeff_ptr.add(i * n2 + i) -= 1.0;
    }

    for j in 0..nu {
        for i in 0..nu {
            *vec_q_ptr.add(j * nu + i) = *q_ptr.add(i * nu + j);
        }
    }

    let success = solve_linear(coeff_ptr, vec_q_ptr, n2, vec_x_ptr, solve_work_ptr);
    if success == 0 {
        return 0;
    }

    for j in 0..nu {
        for i in 0..nu {
            *x_ptr.add(i * nu + j) = *vec_x_ptr.add(j * nu + i);
        }
    }

    1
}

// ============================================
// RESIDUALS
// ============================================

/// Frobenius norm of residual ||AX + XB - C||.
#[no_mangle]
pub unsafe extern "C" fn sylvesterResidual(
    a_ptr: *const f64,
    n: i32,
    x_ptr: *const f64,
    b_ptr: *const f64,
    m: i32,
    c_ptr: *const f64,
    work_ptr: *mut f64,
) -> f64 {
    let nu = n as usize;
    let mu = m as usize;
    let ax_ptr = work_ptr;
    let xb_ptr = ax_ptr.add(nu * mu);

    // AX
    for i in 0..nu {
        for j in 0..mu {
            let mut sum = 0.0;
            for k in 0..nu {
                sum += *a_ptr.add(i * nu + k) * *x_ptr.add(k * mu + j);
            }
            *ax_ptr.add(i * mu + j) = sum;
        }
    }

    // XB
    for i in 0..nu {
        for j in 0..mu {
            let mut sum = 0.0;
            for k in 0..mu {
                sum += *x_ptr.add(i * mu + k) * *b_ptr.add(k * mu + j);
            }
            *xb_ptr.add(i * mu + j) = sum;
        }
    }

    let mut norm_sq: f64 = 0.0;
    for i in 0..(nu * mu) {
        let diff = *ax_ptr.add(i) + *xb_ptr.add(i) - *c_ptr.add(i);
        norm_sq += diff * diff;
    }

    libm::sqrt(norm_sq)
}

/// Frobenius norm of residual ||AX + XA^T - Q||.
#[no_mangle]
pub unsafe extern "C" fn lyapResidual(
    a_ptr: *const f64,
    n: i32,
    x_ptr: *const f64,
    q_ptr: *const f64,
    work_ptr: *mut f64,
) -> f64 {
    let nu = n as usize;
    let n2 = nu * nu;
    let ax_ptr = work_ptr;
    let xat_ptr = ax_ptr.add(n2);

    // AX
    for i in 0..nu {
        for j in 0..nu {
            let mut sum = 0.0;
            for k in 0..nu {
                sum += *a_ptr.add(i * nu + k) * *x_ptr.add(k * nu + j);
            }
            *ax_ptr.add(i * nu + j) = sum;
        }
    }

    // XA^T
    for i in 0..nu {
        for j in 0..nu {
            let mut sum = 0.0;
            for k in 0..nu {
                sum += *x_ptr.add(i * nu + k) * *a_ptr.add(j * nu + k);
            }
            *xat_ptr.add(i * nu + j) = sum;
        }
    }

    let mut norm_sq: f64 = 0.0;
    for i in 0..n2 {
        let diff = *ax_ptr.add(i) + *xat_ptr.add(i) - *q_ptr.add(i);
        norm_sq += diff * diff;
    }

    libm::sqrt(norm_sq)
}

/// Frobenius norm of residual ||AXA^T - X - Q||.
#[no_mangle]
pub unsafe extern "C" fn dlyapResidual(
    a_ptr: *const f64,
    n: i32,
    x_ptr: *const f64,
    q_ptr: *const f64,
    work_ptr: *mut f64,
) -> f64 {
    let nu = n as usize;
    let n2 = nu * nu;
    let ax_ptr = work_ptr;
    let axat_ptr = ax_ptr.add(n2);

    // AX
    for i in 0..nu {
        for j in 0..nu {
            let mut sum = 0.0;
            for k in 0..nu {
                sum += *a_ptr.add(i * nu + k) * *x_ptr.add(k * nu + j);
            }
            *ax_ptr.add(i * nu + j) = sum;
        }
    }

    // (AX)A^T
    for i in 0..nu {
        for j in 0..nu {
            let mut sum = 0.0;
            for k in 0..nu {
                sum += *ax_ptr.add(i * nu + k) * *a_ptr.add(j * nu + k);
            }
            *axat_ptr.add(i * nu + j) = sum;
        }
    }

    let mut norm_sq: f64 = 0.0;
    for i in 0..n2 {
        let diff = *axat_ptr.add(i) - *x_ptr.add(i) - *q_ptr.add(i);
        norm_sq += diff * diff;
    }

    libm::sqrt(norm_sq)
}

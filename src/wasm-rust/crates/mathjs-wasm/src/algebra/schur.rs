//! Real Schur decomposition: A = Q * T * Q^T.
//! Francis double-shift QR algorithm with Hessenberg reduction.

// ============================================
// HESSENBERG REDUCTION (internal)
// ============================================

unsafe fn hessenberg(a_ptr: *mut f64, q_ptr: *mut f64, n: usize, work_ptr: *mut f64) {
    for k in 0..n.saturating_sub(2) {
        let mut norm: f64 = 0.0;
        for i in (k + 1)..n {
            let val = *a_ptr.add(i * n + k);
            norm += val * val;
        }
        norm = libm::sqrt(norm);

        if norm < 1e-14 {
            continue;
        }

        let akp1k = *a_ptr.add((k + 1) * n + k);
        let sign = if akp1k >= 0.0 { 1.0 } else { -1.0 };
        let u1 = akp1k + sign * norm;

        // Store v in work
        let v_ptr = work_ptr;
        *v_ptr = 1.0;
        let len = n - k - 1;
        for i in 1..len {
            *v_ptr.add(i) = *a_ptr.add((k + 1 + i) * n + k) / u1;
        }

        let mut v_dot_v: f64 = 0.0;
        for i in 0..len {
            let vi = *v_ptr.add(i);
            v_dot_v += vi * vi;
        }
        let tau = 2.0 / v_dot_v;

        // Apply from left: A = H * A
        for j in k..n {
            let mut dot: f64 = 0.0;
            for i in 0..len {
                dot += *v_ptr.add(i) * *a_ptr.add((k + 1 + i) * n + j);
            }
            dot *= tau;
            for i in 0..len {
                *a_ptr.add((k + 1 + i) * n + j) -= dot * *v_ptr.add(i);
            }
        }

        // Apply from right: A = A * H
        for i in 0..n {
            let mut dot: f64 = 0.0;
            for j in 0..len {
                dot += *v_ptr.add(j) * *a_ptr.add(i * n + (k + 1 + j));
            }
            dot *= tau;
            for j in 0..len {
                *a_ptr.add(i * n + (k + 1 + j)) -= dot * *v_ptr.add(j);
            }
        }

        // Accumulate Q
        for i in 0..n {
            let mut dot: f64 = 0.0;
            for j in 0..len {
                dot += *v_ptr.add(j) * *q_ptr.add(i * n + (k + 1 + j));
            }
            dot *= tau;
            for j in 0..len {
                *q_ptr.add(i * n + (k + 1 + j)) -= dot * *v_ptr.add(j);
            }
        }
    }
}

// ============================================
// SCHUR DECOMPOSITION
// ============================================

/// Compute real Schur decomposition A = Q*T*Q^T.
/// Returns 1 on success, 0 on failure.
#[no_mangle]
pub unsafe extern "C" fn schur(
    a_ptr: *const f64,
    n: i32,
    max_iter: i32,
    tol: f64,
    q_ptr: *mut f64,
    t_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    if n == 0 {
        return 0;
    }

    let n2 = n * n;

    // Initialize Q as identity
    for i in 0..n2 {
        *q_ptr.add(i) = 0.0;
    }
    for i in 0..n {
        *q_ptr.add(i * n + i) = 1.0;
    }

    // Copy A to T
    for i in 0..n2 {
        *t_ptr.add(i) = *a_ptr.add(i);
    }

    // Reduce to upper Hessenberg
    hessenberg(t_ptr, q_ptr, n, work_ptr);

    // Francis QR iteration
    let mut p = n - 1;

    while p > 0 {
        let q_idx = p - 1;

        // Check for deflation
        let tpp = *t_ptr.add(p * n + p);
        let tqq = *t_ptr.add(q_idx * n + q_idx);
        let tpq = *t_ptr.add(p * n + q_idx);
        let scale = libm::fabs(tpp) + libm::fabs(tqq);
        if libm::fabs(tpq) < tol * scale || libm::fabs(tpq) < 1e-14 {
            *t_ptr.add(p * n + q_idx) = 0.0;
            p -= 1;
            continue;
        }

        // Find start of active block
        let mut l: usize = 0;
        for ii in 0..q_idx {
            let i = q_idx - ii;
            let tii = *t_ptr.add(i * n + i);
            let tim1 = *t_ptr.add((i - 1) * n + (i - 1));
            let ti_im1 = *t_ptr.add(i * n + (i - 1));
            let scale_i = libm::fabs(tii) + libm::fabs(tim1);
            if libm::fabs(ti_im1) < tol * scale_i || libm::fabs(ti_im1) < 1e-14 {
                *t_ptr.add(i * n + (i - 1)) = 0.0;
                l = i;
                break;
            }
        }

        let mut converged = false;
        for _iter in 0..max_iter as usize {
            // Wilkinson shift from bottom 2x2
            let a11 = *t_ptr.add(q_idx * n + q_idx);
            let a12 = *t_ptr.add(q_idx * n + p);
            let a21 = *t_ptr.add(p * n + q_idx);
            let a22 = *t_ptr.add(p * n + p);

            let trace = a11 + a22;
            let det = a11 * a22 - a12 * a21;

            // First column of implicit double shift
            let tll = *t_ptr.add(l * n + l);
            let tl_lp1 = *t_ptr.add(l * n + (l + 1));
            let tlp1_l = *t_ptr.add((l + 1) * n + l);
            let tlp1_lp1 = *t_ptr.add((l + 1) * n + (l + 1));

            let mut x = tll * tll + tl_lp1 * tlp1_l - trace * tll + det;
            let mut y = tlp1_l * (tll + tlp1_lp1 - trace);
            let mut z = if l + 2 <= p {
                *t_ptr.add((l + 2) * n + (l + 1)) * tlp1_l
            } else {
                0.0
            };

            // Householder chase
            for k in l..p {
                let size = if k < p - 1 { 3 } else { 2 };

                let norm = if size == 3 {
                    libm::sqrt(x * x + y * y + z * z)
                } else {
                    libm::sqrt(x * x + y * y)
                };

                if norm > 1e-14 {
                    let sign = if x >= 0.0 { 1.0 } else { -1.0 };
                    let u1 = x + sign * norm;
                    let vv = u1 * u1 + y * y + if size == 3 { z * z } else { 0.0 };
                    let tau2 = 2.0 / vv;

                    // Apply from left
                    for j in k..n {
                        let mut dot = u1 * *t_ptr.add(k * n + j) + y * *t_ptr.add((k + 1) * n + j);
                        if size == 3 {
                            dot += z * *t_ptr.add((k + 2) * n + j);
                        }
                        let t_val = tau2 * dot;
                        *t_ptr.add(k * n + j) -= t_val * u1;
                        *t_ptr.add((k + 1) * n + j) -= t_val * y;
                        if size == 3 {
                            *t_ptr.add((k + 2) * n + j) -= t_val * z;
                        }
                    }

                    // Apply from right
                    let j_end = if k + size < p + 1 {
                        k + size + 1
                    } else {
                        p + 1
                    };
                    for i in 0..j_end {
                        let mut dot = u1 * *t_ptr.add(i * n + k) + y * *t_ptr.add(i * n + (k + 1));
                        if size == 3 {
                            dot += z * *t_ptr.add(i * n + (k + 2));
                        }
                        let t_val = tau2 * dot;
                        *t_ptr.add(i * n + k) -= t_val * u1;
                        *t_ptr.add(i * n + (k + 1)) -= t_val * y;
                        if size == 3 {
                            *t_ptr.add(i * n + (k + 2)) -= t_val * z;
                        }
                    }

                    // Accumulate Q
                    for i in 0..n {
                        let mut dot = u1 * *q_ptr.add(i * n + k) + y * *q_ptr.add(i * n + (k + 1));
                        if size == 3 {
                            dot += z * *q_ptr.add(i * n + (k + 2));
                        }
                        let t_val = tau2 * dot;
                        *q_ptr.add(i * n + k) -= t_val * u1;
                        *q_ptr.add(i * n + (k + 1)) -= t_val * y;
                        if size == 3 {
                            *q_ptr.add(i * n + (k + 2)) -= t_val * z;
                        }
                    }
                }

                // Set up next iteration
                if k < p - 1 {
                    x = *t_ptr.add((k + 1) * n + k);
                    y = *t_ptr.add((k + 2) * n + k);
                    z = if k + 3 <= p {
                        *t_ptr.add((k + 3) * n + k)
                    } else {
                        0.0
                    };
                }
            }

            // Check convergence
            let tpp_check = *t_ptr.add(p * n + p);
            let tqq_check = *t_ptr.add(q_idx * n + q_idx);
            let tpq_check = *t_ptr.add(p * n + q_idx);
            let scale_check = libm::fabs(tpp_check) + libm::fabs(tqq_check);
            if libm::fabs(tpq_check) < tol * scale_check || libm::fabs(tpq_check) < 1e-14 {
                *t_ptr.add(p * n + q_idx) = 0.0;
                converged = true;
                break;
            }
        }

        if !converged {
            return 0; // max iterations exceeded without convergence
        }

        p -= 1;
    }

    // Clean up small subdiagonal elements
    for i in 1..n {
        let tii = *t_ptr.add(i * n + i);
        let tim1 = *t_ptr.add((i - 1) * n + (i - 1));
        let ti_im1 = *t_ptr.add(i * n + (i - 1));
        let scale = libm::fabs(tii) + libm::fabs(tim1);
        if libm::fabs(ti_im1) < tol * scale {
            *t_ptr.add(i * n + (i - 1)) = 0.0;
        }
    }

    1
}

// ============================================
// EXTRACT Q, T
// ============================================

/// Copy Q from packed result.
#[no_mangle]
pub unsafe extern "C" fn getSchurQ(result_ptr: *const f64, n: i32, q_ptr: *mut f64) {
    let n2 = (n as usize) * (n as usize);
    for i in 0..n2 {
        *q_ptr.add(i) = *result_ptr.add(i);
    }
}

/// Copy T from packed result (T is stored after Q).
#[no_mangle]
pub unsafe extern "C" fn getSchurT(result_ptr: *const f64, n: i32, t_ptr: *mut f64) {
    let n2 = (n as usize) * (n as usize);
    for i in 0..n2 {
        *t_ptr.add(i) = *result_ptr.add(n2 + i);
    }
}

// ============================================
// EIGENVALUES FROM SCHUR FORM
// ============================================

/// Extract eigenvalues from quasi-triangular T.
#[no_mangle]
pub unsafe extern "C" fn schurEigenvalues(
    t_ptr: *const f64,
    n: i32,
    real_ptr: *mut f64,
    imag_ptr: *mut f64,
) {
    let n = n as usize;
    let mut i = 0;
    while i < n {
        if i == n - 1 || libm::fabs(*t_ptr.add((i + 1) * n + i)) < 1e-14 {
            *real_ptr.add(i) = *t_ptr.add(i * n + i);
            *imag_ptr.add(i) = 0.0;
            i += 1;
        } else {
            let a = *t_ptr.add(i * n + i);
            let b = *t_ptr.add(i * n + (i + 1));
            let c = *t_ptr.add((i + 1) * n + i);
            let d = *t_ptr.add((i + 1) * n + (i + 1));

            let trace = a + d;
            let det = a * d - b * c;
            let disc = trace * trace - 4.0 * det;

            if disc >= 0.0 {
                let sqrt_disc = libm::sqrt(disc);
                *real_ptr.add(i) = (trace + sqrt_disc) / 2.0;
                *real_ptr.add(i + 1) = (trace - sqrt_disc) / 2.0;
                *imag_ptr.add(i) = 0.0;
                *imag_ptr.add(i + 1) = 0.0;
            } else {
                let sqrt_neg_disc = libm::sqrt(-disc);
                *real_ptr.add(i) = trace / 2.0;
                *real_ptr.add(i + 1) = trace / 2.0;
                *imag_ptr.add(i) = sqrt_neg_disc / 2.0;
                *imag_ptr.add(i + 1) = -sqrt_neg_disc / 2.0;
            }
            i += 2;
        }
    }
}

// ============================================
// RESIDUALS
// ============================================

/// Compute ||A - Q*T*Q^T||_F.
#[no_mangle]
pub unsafe extern "C" fn schurResidual(
    a_ptr: *const f64,
    q_ptr: *const f64,
    t_ptr: *const f64,
    n: i32,
    work_ptr: *mut f64,
) -> f64 {
    let n = n as usize;

    // Compute QT
    for i in 0..n {
        for j in 0..n {
            let mut sum = 0.0;
            for k in 0..n {
                sum += *q_ptr.add(i * n + k) * *t_ptr.add(k * n + j);
            }
            *work_ptr.add(i * n + j) = sum;
        }
    }

    // Compute ||QT * Q^T - A||
    let mut residual: f64 = 0.0;
    for i in 0..n {
        for j in 0..n {
            let mut sum = 0.0;
            for k in 0..n {
                sum += *work_ptr.add(i * n + k) * *q_ptr.add(j * n + k);
            }
            let diff = sum - *a_ptr.add(i * n + j);
            residual += diff * diff;
        }
    }

    libm::sqrt(residual)
}

/// Compute ||Q^T * Q - I||_F.
#[no_mangle]
pub unsafe extern "C" fn schurOrthogonalityError(q_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut error: f64 = 0.0;

    for i in 0..n {
        for j in 0..n {
            let mut dot = 0.0;
            for k in 0..n {
                dot += *q_ptr.add(k * n + i) * *q_ptr.add(k * n + j);
            }
            let expected = if i == j { 1.0 } else { 0.0 };
            let diff = dot - expected;
            error += diff * diff;
        }
    }

    libm::sqrt(error)
}

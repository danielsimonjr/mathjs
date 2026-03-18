//! Sparse LU decomposition (CSparse-based).
//! Left-looking LU factorization for CSC sparse matrices.

// ============================================
// SPARSE LU
// ============================================

/// Sparse LU decomposition: L * U = P * A * Q.
/// Returns nnz in L, or -1 on failure. nnz in U via uptrPtr.
#[no_mangle]
pub unsafe extern "C" fn sparseLu(
    avalues_ptr: *const f64,
    aindex_ptr: *const i32,
    aptr_ptr: *const i32,
    n: i32,
    q_ptr: *const i32,
    tol: f64,
    lvalues_ptr: *mut f64,
    lindex_ptr: *mut i32,
    lptr_ptr: *mut i32,
    uvalues_ptr: *mut f64,
    uindex_ptr: *mut i32,
    uptr_ptr: *mut i32,
    pinv_ptr: *mut i32,
    work_ptr: *mut u8,
) -> i32 {
    let nu = n as usize;

    // Workspace: x (n f64), xi (2n i32)
    let x_ptr = work_ptr as *mut f64;
    let _xi_ptr = (work_ptr.add(nu * 8)) as *mut i32;

    for i in 0..nu {
        *x_ptr.add(i) = 0.0;
        *pinv_ptr.add(i) = -1;
    }

    let mut lnz: i32 = 0;
    let mut unz: i32 = 0;

    for k in 0..nu {
        *lptr_ptr.add(k) = lnz;
        *uptr_ptr.add(k) = unz;

        let col = if !q_ptr.is_null() {
            *q_ptr.add(k) as usize
        } else {
            k
        };

        // Scatter A(:,col) into x
        let a_start = *aptr_ptr.add(col) as usize;
        let a_end = *aptr_ptr.add(col + 1) as usize;

        // Zero x for nonzero rows
        for i in 0..nu {
            *x_ptr.add(i) = 0.0;
        }

        for p in a_start..a_end {
            let i = *aindex_ptr.add(p) as usize;
            *x_ptr.add(i) = *avalues_ptr.add(p);
        }

        // Solve L(:,0:k-1) * x = A(:,col)
        for j in 0..k {
            let pinv_j = *pinv_ptr.add(j);
            if pinv_j < 0 {
                continue;
            }
            let xj = *x_ptr.add(j);
            if xj == 0.0 {
                continue;
            }

            let l_start = *lptr_ptr.add(pinv_j as usize) as usize;
            let l_end = if (pinv_j as usize + 1) <= k {
                *lptr_ptr.add(pinv_j as usize + 1) as usize
            } else {
                lnz as usize
            };

            for p in (l_start + 1)..l_end {
                let li = *lindex_ptr.add(p) as usize;
                *x_ptr.add(li) -= *lvalues_ptr.add(p) * xj;
            }
        }

        // Find pivot
        let mut ipiv: i32 = -1;
        let mut max_abs: f64 = -1.0;

        for i in 0..nu {
            if *pinv_ptr.add(i) >= 0 {
                // Already pivotal -> goes to U
                let u = unz as usize;
                *uindex_ptr.add(u) = *pinv_ptr.add(i);
                *uvalues_ptr.add(u) = *x_ptr.add(i);
                unz += 1;
            } else {
                let x_abs = libm::fabs(*x_ptr.add(i));
                if x_abs > max_abs {
                    max_abs = x_abs;
                    ipiv = i as i32;
                }
            }
        }

        if ipiv < 0 || max_abs <= 0.0 {
            return -1;
        }

        // Prefer diagonal pivot if large enough
        if !q_ptr.is_null() {
            let diag = col;
            if *pinv_ptr.add(diag) < 0 {
                let x_diag = libm::fabs(*x_ptr.add(diag));
                if x_diag >= max_abs * tol {
                    ipiv = diag as i32;
                }
            }
        }

        let pivot = *x_ptr.add(ipiv as usize);

        // U(k,k)
        let u = unz as usize;
        *uindex_ptr.add(u) = k as i32;
        *uvalues_ptr.add(u) = pivot;
        unz += 1;

        *pinv_ptr.add(ipiv as usize) = k as i32;

        // L(k,k) = 1
        let l = lnz as usize;
        *lindex_ptr.add(l) = ipiv;
        *lvalues_ptr.add(l) = 1.0;
        lnz += 1;

        // L(k+1:n, k) = x / pivot
        for i in 0..nu {
            if *pinv_ptr.add(i) < 0 && *x_ptr.add(i) != 0.0 {
                let l = lnz as usize;
                *lindex_ptr.add(l) = i as i32;
                *lvalues_ptr.add(l) = *x_ptr.add(i) / pivot;
                lnz += 1;
            }
        }
    }

    *lptr_ptr.add(nu) = lnz;
    *uptr_ptr.add(nu) = unz;

    // Fix row indices using pinv
    for p in 0..(lnz as usize) {
        let old_idx = *lindex_ptr.add(p) as usize;
        *lindex_ptr.add(p) = *pinv_ptr.add(old_idx);
    }

    lnz
}

// ============================================
// SPARSE FORWARD SOLVE
// ============================================

/// Sparse forward solve: L*x = b, b overwritten with solution.
#[no_mangle]
pub unsafe extern "C" fn sparseForwardSolve(
    lvalues_ptr: *const f64,
    lindex_ptr: *const i32,
    lptr_ptr: *const i32,
    n: i32,
    b_ptr: *mut f64,
) {
    let nu = n as usize;

    for j in 0..nu {
        let l_start = *lptr_ptr.add(j) as usize;
        let l_end = *lptr_ptr.add(j + 1) as usize;
        if l_start >= l_end {
            continue;
        }

        let diag = *lvalues_ptr.add(l_start);
        let bj = *b_ptr.add(j) / diag;
        *b_ptr.add(j) = bj;

        for p in (l_start + 1)..l_end {
            let i = *lindex_ptr.add(p) as usize;
            *b_ptr.add(i) -= *lvalues_ptr.add(p) * bj;
        }
    }
}

// ============================================
// SPARSE BACKWARD SOLVE
// ============================================

/// Sparse backward solve: U*x = b, b overwritten with solution.
#[no_mangle]
pub unsafe extern "C" fn sparseBackwardSolve(
    uvalues_ptr: *const f64,
    uindex_ptr: *const i32,
    uptr_ptr: *const i32,
    n: i32,
    b_ptr: *mut f64,
) {
    let nu = n as usize;

    for jj in 0..nu {
        let j = nu - 1 - jj;
        let u_start = *uptr_ptr.add(j) as usize;
        let u_end = *uptr_ptr.add(j + 1) as usize;
        if u_start >= u_end {
            continue;
        }

        // Search for diagonal entry with index j in the column
        let mut diag = 0.0;
        let mut diag_pos = u_end; // sentinel: not found
        for p in u_start..u_end {
            if *uindex_ptr.add(p) == j as i32 {
                diag = *uvalues_ptr.add(p);
                diag_pos = p;
                break;
            }
        }
        if diag == 0.0 {
            continue; // singular column, skip
        }
        let bj = *b_ptr.add(j) / diag;
        *b_ptr.add(j) = bj;

        for p in u_start..u_end {
            if p == diag_pos {
                continue; // skip diagonal entry
            }
            let i = *uindex_ptr.add(p) as usize;
            *b_ptr.add(i) -= *uvalues_ptr.add(p) * bj;
        }
    }
}

// ============================================
// SPARSE LU SOLVE
// ============================================

/// Solve A*x = b using precomputed LU factors.
/// b is overwritten with the solution.
#[no_mangle]
pub unsafe extern "C" fn sparseLuSolve(
    lvalues_ptr: *const f64,
    lindex_ptr: *const i32,
    lptr_ptr: *const i32,
    uvalues_ptr: *const f64,
    uindex_ptr: *const i32,
    uptr_ptr: *const i32,
    pinv_ptr: *const i32,
    q_ptr: *const i32,
    n: i32,
    b_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let nu = n as usize;

    // Apply row permutation: work = P*b
    for i in 0..nu {
        let pi = *pinv_ptr.add(i) as usize;
        *work_ptr.add(pi) = *b_ptr.add(i);
    }

    // Solve L*y = P*b
    sparseForwardSolve(lvalues_ptr, lindex_ptr, lptr_ptr, n, work_ptr);

    // Solve U*z = y
    sparseBackwardSolve(uvalues_ptr, uindex_ptr, uptr_ptr, n, work_ptr);

    // Apply column permutation: x = Q*z
    if !q_ptr.is_null() {
        for i in 0..nu {
            let qi = *q_ptr.add(i) as usize;
            *b_ptr.add(qi) = *work_ptr.add(i);
        }
    } else {
        for i in 0..nu {
            *b_ptr.add(i) = *work_ptr.add(i);
        }
    }
}

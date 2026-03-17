//! Sparse matrix factorization operations.
//!
//! Implements sparseMatVec, sparseTranspose, symbolicCholesky, sparseCholesky,
//! sparseLU, sparseLsolve, sparseUsolve, sparseQR, sparsePermute (re-export).

use super::utilities::{csCumsum, csEtree};

// ============================================
// SPARSE MATRIX-VECTOR MULTIPLY
// ============================================

/// Sparse matrix-vector multiply: y = A * x (CSC format).
#[no_mangle]
pub unsafe extern "C" fn sparseMatVec(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    m: i32,
    n: i32,
    x_ptr: *const f64,
    y_ptr: *mut f64,
) {
    let m = m as usize;
    let n = n as usize;

    for i in 0..m {
        *y_ptr.add(i) = 0.0;
    }

    for j in 0..n {
        let xj = *x_ptr.add(j);
        if xj != 0.0 {
            let ptr_j = *ptr_ptr.add(j) as usize;
            let ptr_j1 = *ptr_ptr.add(j + 1) as usize;
            for p in ptr_j..ptr_j1 {
                let i = *index_ptr.add(p) as usize;
                let val = *values_ptr.add(p);
                *y_ptr.add(i) += val * xj;
            }
        }
    }
}

// ============================================
// SPARSE TRANSPOSE
// ============================================

/// Sparse matrix transpose: C = A^T in CSC format.
/// workPtr needs 2*m i32 space.
#[no_mangle]
pub unsafe extern "C" fn sparseTranspose(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    m: i32,
    n: i32,
    nnz: i32,
    c_values_ptr: *mut f64,
    c_index_ptr: *mut i32,
    c_ptr_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let m = m as usize;
    let n = n as usize;
    let nnz = nnz as usize;

    let row_count_ptr = work_ptr;
    let temp_work_ptr = work_ptr.add(m);

    // Initialize row counts
    for i in 0..m {
        *row_count_ptr.add(i) = 0;
    }

    // Count entries in each row
    for p in 0..nnz {
        let row = *index_ptr.add(p) as usize;
        *row_count_ptr.add(row) += 1;
    }

    // Compute column pointers for A^T
    csCumsum(c_ptr_ptr, row_count_ptr, m as i32);

    // Initialize work with column positions
    for i in 0..m {
        *temp_work_ptr.add(i) = *c_ptr_ptr.add(i);
    }

    // Fill in the transpose
    for j in 0..n {
        let ptr_j = *ptr_ptr.add(j) as usize;
        let ptr_j1 = *ptr_ptr.add(j + 1) as usize;
        for p in ptr_j..ptr_j1 {
            let i = *index_ptr.add(p) as usize;
            let q = *temp_work_ptr.add(i) as usize;
            *temp_work_ptr.add(i) = (q + 1) as i32;
            *c_index_ptr.add(q) = j as i32;
            *c_values_ptr.add(q) = *values_ptr.add(p);
        }
    }
}

// ============================================
// SYMBOLIC CHOLESKY
// ============================================

/// Symbolic Cholesky analysis: computes elimination tree, postorder, column counts.
/// workPtr needs 7*n i32 space.
#[no_mangle]
pub unsafe extern "C" fn symbolicCholesky(
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    n: i32,
    parent_ptr: *mut i32,
    post_ptr: *mut i32,
    col_count_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let nu = n as usize;

    let ancestor_ptr = work_ptr;
    let _stack_ptr = work_ptr.add(nu);
    let first_ptr = work_ptr.add(2 * nu);
    let _maxfirst_ptr = work_ptr.add(3 * nu);
    let _prevleaf_ptr = work_ptr.add(4 * nu);
    let delta_ptr = work_ptr.add(5 * nu);
    let etree_work_ptr = work_ptr.add(6 * nu);

    // Compute elimination tree
    csEtree(index_ptr, ptr_ptr, n, n, parent_ptr, etree_work_ptr);

    // Simple postorder using child lists
    let first_child = work_ptr.add(2 * nu);
    let next_sibling = work_ptr.add(3 * nu);
    let stack = work_ptr.add(4 * nu);

    for i in 0..nu {
        *first_child.add(i) = -1;
    }
    for i in (0..nu).rev() {
        let p = *parent_ptr.add(i);
        if p != -1 {
            let pu = p as usize;
            *next_sibling.add(i) = *first_child.add(pu);
            *first_child.add(pu) = i as i32;
        }
    }

    let mut k: usize = 0;
    for root in 0..nu {
        if *parent_ptr.add(root) != -1 {
            continue;
        }
        let mut top: usize = 0;
        *stack.add(top) = root as i32;
        top += 1;

        while top > 0 {
            top -= 1;
            let node = *stack.add(top) as usize;
            let fc = *first_child.add(node);
            if fc != -1 {
                *first_child.add(node) = *next_sibling.add(fc as usize);
                *stack.add(top) = node as i32;
                top += 1;
                *stack.add(top) = fc;
                top += 1;
            } else {
                *post_ptr.add(k) = node as i32;
                k += 1;
            }
        }
    }

    // Compute column counts using postorder
    for i in 0..nu {
        *ancestor_ptr.add(i) = i as i32;
        *delta_ptr.add(i) = 0;
    }

    for k2 in 0..nu {
        let j = *post_ptr.add(k2) as usize;

        let parent_j = *parent_ptr.add(j);
        if parent_j != -1 {
            *delta_ptr.add(j) = 1;
        }

        let ptr_j = *ptr_ptr.add(j) as usize;
        let ptr_j1 = *ptr_ptr.add(j + 1) as usize;

        for p in ptr_j..ptr_j1 {
            let mut i = *index_ptr.add(p) as usize;

            // Find root with path compression
            while *ancestor_ptr.add(i) != i as i32 {
                let next = *ancestor_ptr.add(i) as usize;
                *ancestor_ptr.add(i) = j as i32;
                i = next;
            }
            *ancestor_ptr.add(i) = j as i32;

            if i < j {
                let dj = *delta_ptr.add(j);
                *delta_ptr.add(j) = dj + 1;
            }
        }

        if parent_j != -1 {
            let pju = parent_j as usize;
            let dp = *delta_ptr.add(pju);
            let dj = *delta_ptr.add(j);
            *delta_ptr.add(pju) = dp + dj - 1;
        }
    }

    for i in 0..nu {
        *col_count_ptr.add(i) = *delta_ptr.add(i);
    }
}

// ============================================
// NUMERIC SPARSE CHOLESKY
// ============================================

/// Numeric sparse Cholesky: A = L * L^T (lower triangle only input).
/// workPtr needs 8*n + 2*n bytes (n f64 + 2n i32).
/// Returns nnz in L, or -1 if not SPD.
#[no_mangle]
pub unsafe extern "C" fn sparseCholesky(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    n: i32,
    l_values_ptr: *mut f64,
    l_index_ptr: *mut i32,
    l_ptr_ptr: *mut i32,
    work_ptr: *mut u8,
) -> i32 {
    let nu = n as usize;

    // Layout: x (n f64), c (n i32), parent (n i32), etree_work (n i32)
    let x_ptr = work_ptr as *mut f64;
    let c_ptr = (work_ptr.add(nu * 8)) as *mut i32;
    let parent_ptr = (work_ptr.add(nu * 8 + nu * 4)) as *mut i32;
    let etree_work_ptr = (work_ptr.add(nu * 8 + 2 * nu * 4)) as *mut i32;

    // Build elimination tree
    csEtree(index_ptr, ptr_ptr, n, n, parent_ptr, etree_work_ptr);

    let mut nnz_l: i32 = 0;
    *l_ptr_ptr.add(0) = 0;

    for k in 0..nu {
        *x_ptr.add(k) = 0.0;
        *c_ptr.add(k) = k as i32;

        // Scatter A(:,k) into x
        let ptr_k = *ptr_ptr.add(k) as usize;
        let ptr_k1 = *ptr_ptr.add(k + 1) as usize;
        for p in ptr_k..ptr_k1 {
            let i = *index_ptr.add(p) as usize;
            if i >= k {
                *x_ptr.add(i) = *values_ptr.add(p);
            }
        }

        let mut d = *x_ptr.add(k);
        *x_ptr.add(k) = 0.0;

        // Solve L(0:k-1, 0:k-1) * x = A(0:k-1, k)
        for j in 0..k {
            let xj = *x_ptr.add(j);
            if xj == 0.0 {
                continue;
            }
            let l_ptr_j = *l_ptr_ptr.add(j) as usize;
            let ljj = *l_values_ptr.add(l_ptr_j);
            let lkj = xj / ljj;
            *x_ptr.add(j) = lkj;

            let l_ptr_j1 = *l_ptr_ptr.add(j + 1) as usize;
            for p in (l_ptr_j + 1)..l_ptr_j1 {
                let i = *l_index_ptr.add(p) as usize;
                if i >= k {
                    *x_ptr.add(i) -= *l_values_ptr.add(p) * lkj;
                }
            }

            d -= lkj * lkj;
        }

        if d <= 0.0 {
            return -1; // Not positive definite
        }

        // Store L(:,k)
        let nnz_u = nnz_l as usize;
        *l_values_ptr.add(nnz_u) = libm::sqrt(d);
        *l_index_ptr.add(nnz_u) = k as i32;
        nnz_l += 1;

        let lkk_idx = nnz_u;
        for i in (k + 1)..nu {
            let xi = *x_ptr.add(i);
            if xi != 0.0 {
                let lkk = *l_values_ptr.add(lkk_idx);
                let nnz_u = nnz_l as usize;
                *l_values_ptr.add(nnz_u) = xi / lkk;
                *l_index_ptr.add(nnz_u) = i as i32;
                nnz_l += 1;
                *x_ptr.add(i) = 0.0;
            }
        }

        *l_ptr_ptr.add(k + 1) = nnz_l;
    }

    nnz_l
}

// ============================================
// SPARSE LU
// ============================================

/// Sparse LU factorization with partial pivoting: PA = LU.
/// Returns packed (nnzL | nnzU << 32) as i64, or -1 if singular.
#[no_mangle]
pub unsafe extern "C" fn sparseLU(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    n: i32,
    tol: f64,
    l_values_ptr: *mut f64,
    l_index_ptr: *mut i32,
    l_ptr_ptr: *mut i32,
    u_values_ptr: *mut f64,
    u_index_ptr: *mut i32,
    u_ptr_ptr: *mut i32,
    perm_ptr: *mut i32,
    work_ptr: *mut u8,
) -> i64 {
    let nu = n as usize;

    // Layout: x (n f64), pinv (n i32), xi (2n i32)
    let x_ptr = work_ptr as *mut f64;
    let pinv_ptr = (work_ptr.add(nu * 8)) as *mut i32;

    for i in 0..nu {
        *perm_ptr.add(i) = i as i32;
        *pinv_ptr.add(i) = i as i32;
    }

    let mut nnz_l: i32 = 0;
    let mut nnz_u: i32 = 0;

    *l_ptr_ptr.add(0) = 0;
    *u_ptr_ptr.add(0) = 0;

    for k in 0..nu {
        // Zero x
        for i in 0..nu {
            *x_ptr.add(i) = 0.0;
        }

        // Scatter A(:,k) into x with row permutation
        let ptr_k = *ptr_ptr.add(k) as usize;
        let ptr_k1 = *ptr_ptr.add(k + 1) as usize;
        for p in ptr_k..ptr_k1 {
            let orig_idx = *index_ptr.add(p) as usize;
            let i = *pinv_ptr.add(orig_idx) as usize;
            *x_ptr.add(i) = *values_ptr.add(p);
        }

        // Solve L(:,0:k-1) \ A(:,k)
        for j in 0..k {
            let xj = *x_ptr.add(j);
            if xj == 0.0 {
                continue;
            }
            let l_ptr_j = *l_ptr_ptr.add(j) as usize;
            let ljj = *l_values_ptr.add(l_ptr_j);
            let xj_div = xj / ljj;
            *x_ptr.add(j) = xj_div;

            let l_ptr_j1 = *l_ptr_ptr.add(j + 1) as usize;
            for p in (l_ptr_j + 1)..l_ptr_j1 {
                let i = *l_index_ptr.add(p) as usize;
                *x_ptr.add(i) -= *l_values_ptr.add(p) * xj_div;
            }
        }

        // Find pivot
        let mut pivot_row = k;
        let mut pivot_val = libm::fabs(*x_ptr.add(k));

        if tol < 1.0 {
            for i in (k + 1)..nu {
                let abs_xi = libm::fabs(*x_ptr.add(i));
                if abs_xi > pivot_val {
                    pivot_val = abs_xi;
                    pivot_row = i;
                }
            }
        }

        // Swap if needed
        if pivot_row != k {
            let pk = *perm_ptr.add(k);
            let pp = *perm_ptr.add(pivot_row);
            *perm_ptr.add(k) = pp;
            *perm_ptr.add(pivot_row) = pk;
            *pinv_ptr.add(pk as usize) = pivot_row as i32;
            *pinv_ptr.add(pp as usize) = k as i32;

            let temp_x = *x_ptr.add(k);
            *x_ptr.add(k) = *x_ptr.add(pivot_row);
            *x_ptr.add(pivot_row) = temp_x;

            // Swap rows in L
            for j in 0..k {
                let l_ptr_j = *l_ptr_ptr.add(j) as usize;
                let l_ptr_j1 = *l_ptr_ptr.add(j + 1) as usize;
                for p in l_ptr_j..l_ptr_j1 {
                    let l_idx = *l_index_ptr.add(p) as usize;
                    if l_idx == k {
                        *l_index_ptr.add(p) = pivot_row as i32;
                    } else if l_idx == pivot_row {
                        *l_index_ptr.add(p) = k as i32;
                    }
                }
            }
        }

        // Store U(:,k)
        for i in 0..=k {
            let xi = *x_ptr.add(i);
            if xi != 0.0 {
                let u = nnz_u as usize;
                *u_values_ptr.add(u) = xi;
                *u_index_ptr.add(u) = i as i32;
                nnz_u += 1;
            }
        }
        *u_ptr_ptr.add(k + 1) = nnz_u;

        let xk = *x_ptr.add(k);
        if xk == 0.0 {
            return -1; // Singular
        }

        // Store L(:,k)
        let lu = nnz_l as usize;
        *l_values_ptr.add(lu) = 1.0;
        *l_index_ptr.add(lu) = k as i32;
        nnz_l += 1;

        for i in (k + 1)..nu {
            let xi = *x_ptr.add(i);
            if xi != 0.0 {
                let lu = nnz_l as usize;
                *l_values_ptr.add(lu) = xi / xk;
                *l_index_ptr.add(lu) = i as i32;
                nnz_l += 1;
            }
        }
        *l_ptr_ptr.add(k + 1) = nnz_l;
    }

    (nnz_l as i64) | ((nnz_u as i64) << 32)
}

// ============================================
// SPARSE TRIANGULAR SOLVE (L)
// ============================================

/// Solve sparse lower triangular system: L*x = b.
#[no_mangle]
pub unsafe extern "C" fn sparseLsolve(
    l_values_ptr: *const f64,
    l_index_ptr: *const i32,
    l_ptr_ptr: *const i32,
    b_ptr: *const f64,
    x_ptr: *mut f64,
    n: i32,
) {
    let n = n as usize;

    // Copy b to x
    for i in 0..n {
        *x_ptr.add(i) = *b_ptr.add(i);
    }

    for j in 0..n {
        let xj = *x_ptr.add(j);
        if xj == 0.0 {
            continue;
        }

        let p1 = *l_ptr_ptr.add(j) as usize;
        let p2 = *l_ptr_ptr.add(j + 1) as usize;

        let ljj = *l_values_ptr.add(p1);
        *x_ptr.add(j) = xj / ljj;
        let xj_new = *x_ptr.add(j);

        for p in (p1 + 1)..p2 {
            let i = *l_index_ptr.add(p) as usize;
            *x_ptr.add(i) -= *l_values_ptr.add(p) * xj_new;
        }
    }
}

// ============================================
// SPARSE TRIANGULAR SOLVE (U)
// ============================================

/// Solve sparse upper triangular system: U*x = b.
#[no_mangle]
pub unsafe extern "C" fn sparseUsolve(
    u_values_ptr: *const f64,
    u_index_ptr: *const i32,
    u_ptr_ptr: *const i32,
    b_ptr: *const f64,
    x_ptr: *mut f64,
    n: i32,
) {
    let n = n as usize;

    for i in 0..n {
        *x_ptr.add(i) = *b_ptr.add(i);
    }

    for j in (0..n).rev() {
        let p1 = *u_ptr_ptr.add(j) as usize;
        let p2 = *u_ptr_ptr.add(j + 1) as usize;

        if p2 == p1 {
            continue;
        }

        // Find diagonal (last entry in column for upper triangular)
        let mut diag_idx: i32 = -1;
        for p in (p1..p2).rev() {
            if *u_index_ptr.add(p) == j as i32 {
                diag_idx = p as i32;
                break;
            }
        }

        if diag_idx < 0 {
            continue;
        }
        let diag_u = diag_idx as usize;
        let ujj = *u_values_ptr.add(diag_u);
        if ujj == 0.0 {
            continue;
        }

        let xj = *x_ptr.add(j);
        *x_ptr.add(j) = xj / ujj;
        let xj_new = *x_ptr.add(j);

        for p in p1..diag_u {
            let i = *u_index_ptr.add(p) as usize;
            *x_ptr.add(i) -= *u_values_ptr.add(p) * xj_new;
        }
    }
}

// ============================================
// SPARSE QR
// ============================================

/// Sparse QR factorization via dense Householder.
/// workPtr needs m*n*8 + n*8 bytes.
/// Returns nnz in R, or -1 if underdetermined.
#[no_mangle]
pub unsafe extern "C" fn sparseQR(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    m: i32,
    n: i32,
    r_values_ptr: *mut f64,
    r_index_ptr: *mut i32,
    r_ptr_ptr: *mut i32,
    work_ptr: *mut u8,
) -> i32 {
    let mu = m as usize;
    let nu = n as usize;

    if mu < nu {
        return -1;
    }

    let a_ptr = work_ptr as *mut f64;

    // Initialize dense A to zero
    for i in 0..(mu * nu) {
        *a_ptr.add(i) = 0.0;
    }

    // Scatter sparse into dense
    for j in 0..nu {
        let ptr_j = *ptr_ptr.add(j) as usize;
        let ptr_j1 = *ptr_ptr.add(j + 1) as usize;
        for p in ptr_j..ptr_j1 {
            let i = *index_ptr.add(p) as usize;
            *a_ptr.add(i * nu + j) = *values_ptr.add(p);
        }
    }

    // Householder QR
    for k in 0..nu {
        let mut norm_x: f64 = 0.0;
        for i in k..mu {
            let aik = *a_ptr.add(i * nu + k);
            norm_x += aik * aik;
        }
        norm_x = libm::sqrt(norm_x);

        if norm_x == 0.0 {
            continue;
        }

        let akk = *a_ptr.add(k * nu + k);
        let alpha = if akk >= 0.0 { -norm_x } else { norm_x };
        let u0 = akk - alpha;
        *a_ptr.add(k * nu + k) = alpha;

        let mut norm_u: f64 = u0 * u0;
        for i in (k + 1)..mu {
            let aik = *a_ptr.add(i * nu + k);
            norm_u += aik * aik;
        }
        norm_u = libm::sqrt(norm_u);
        if norm_u == 0.0 {
            continue;
        }

        let tau = 2.0 / (norm_u * norm_u);

        for j in (k + 1)..nu {
            let mut dot = u0 * *a_ptr.add(k * nu + j);
            for i in (k + 1)..mu {
                dot += *a_ptr.add(i * nu + k) * *a_ptr.add(i * nu + j);
            }
            dot *= tau;
            *a_ptr.add(k * nu + j) -= dot * u0;
            for i in (k + 1)..mu {
                let aik = *a_ptr.add(i * nu + k);
                *a_ptr.add(i * nu + j) -= dot * aik;
            }
        }

        *a_ptr.add(k * nu + k) = alpha;
        for i in (k + 1)..mu {
            *a_ptr.add(i * nu + k) = 0.0;
        }
    }

    // Extract R as sparse
    let mut nnz_r: i32 = 0;
    for j in 0..nu {
        *r_ptr_ptr.add(j) = nnz_r;
        let imax = if j < mu { j + 1 } else { mu };
        for i in 0..imax {
            let val = *a_ptr.add(i * nu + j);
            if libm::fabs(val) > 1e-14 {
                let u = nnz_r as usize;
                *r_values_ptr.add(u) = val;
                *r_index_ptr.add(u) = i as i32;
                nnz_r += 1;
            }
        }
    }
    *r_ptr_ptr.add(nu) = nnz_r;

    nnz_r
}

// sparsePermute is re-exported from utilities via csPermute — no separate
// function needed here since the AS version imports from utilities too.

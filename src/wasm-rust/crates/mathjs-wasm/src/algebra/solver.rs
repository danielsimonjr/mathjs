//! Triangular system solvers: lsolve, usolve, banded, tridiagonal, inverse,
//! matrix-vector, rank, and all-solutions variants.

// ============================================
// BASIC TRIANGULAR SOLVERS
// ============================================

/// Solve lower triangular system Lx = b.
#[no_mangle]
pub unsafe extern "C" fn lsolve(l_ptr: *const f64, b_ptr: *const f64, n: i32, x_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let mut sum = *b_ptr.add(i);
        for j in 0..i {
            sum -= *l_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        let diag = *l_ptr.add(i * n + i);
        *x_ptr.add(i) = if diag == 0.0 { f64::NAN } else { sum / diag };
    }
}

/// Solve unit lower triangular system Lx = b (diagonal = 1).
#[no_mangle]
pub unsafe extern "C" fn lsolveUnit(l_ptr: *const f64, b_ptr: *const f64, n: i32, x_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..n {
        let mut sum = *b_ptr.add(i);
        for j in 0..i {
            sum -= *l_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum;
    }
}

/// Solve upper triangular system Ux = b.
#[no_mangle]
pub unsafe extern "C" fn usolve(u_ptr: *const f64, b_ptr: *const f64, n: i32, x_ptr: *mut f64) {
    let n = n as usize;
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *b_ptr.add(i);
        for j in (i + 1)..n {
            sum -= *u_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        let diag = *u_ptr.add(i * n + i);
        *x_ptr.add(i) = if diag == 0.0 { f64::NAN } else { sum / diag };
    }
}

/// Solve unit upper triangular system Ux = b (diagonal = 1).
#[no_mangle]
pub unsafe extern "C" fn usolveUnit(u_ptr: *const f64, b_ptr: *const f64, n: i32, x_ptr: *mut f64) {
    let n = n as usize;
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *b_ptr.add(i);
        for j in (i + 1)..n {
            sum -= *u_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *x_ptr.add(i) = sum;
    }
}

// ============================================
// MULTIPLE RIGHT-HAND SIDES
// ============================================

/// Solve Lx = B for multiple RHS (n x m).
#[no_mangle]
pub unsafe extern "C" fn lsolveMultiple(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    m: i32,
    x_ptr: *mut f64,
) {
    let n = n as usize;
    let m = m as usize;
    for k in 0..m {
        for i in 0..n {
            let mut sum = *b_ptr.add(i * m + k);
            for j in 0..i {
                sum -= *l_ptr.add(i * n + j) * *x_ptr.add(j * m + k);
            }
            let diag = *l_ptr.add(i * n + i);
            *x_ptr.add(i * m + k) = if diag == 0.0 { f64::NAN } else { sum / diag };
        }
    }
}

/// Solve Ux = B for multiple RHS (n x m).
#[no_mangle]
pub unsafe extern "C" fn usolveMultiple(
    u_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    m: i32,
    x_ptr: *mut f64,
) {
    let n = n as usize;
    let m = m as usize;
    for k in 0..m {
        for ii in 0..n {
            let i = n - 1 - ii;
            let mut sum = *b_ptr.add(i * m + k);
            for j in (i + 1)..n {
                sum -= *u_ptr.add(i * n + j) * *x_ptr.add(j * m + k);
            }
            let diag = *u_ptr.add(i * n + i);
            *x_ptr.add(i * m + k) = if diag == 0.0 { f64::NAN } else { sum / diag };
        }
    }
}

// ============================================
// HAS SOLUTION CHECKS
// ============================================

/// Check if lower triangular system has unique solution (all diag != 0).
#[no_mangle]
pub unsafe extern "C" fn lsolveHasSolution(l_ptr: *const f64, n: i32) -> i32 {
    let n = n as usize;
    for i in 0..n {
        if *l_ptr.add(i * n + i) == 0.0 {
            return 0;
        }
    }
    1
}

/// Check if upper triangular system has unique solution.
#[no_mangle]
pub unsafe extern "C" fn usolveHasSolution(u_ptr: *const f64, n: i32) -> i32 {
    let n = n as usize;
    for i in 0..n {
        if *u_ptr.add(i * n + i) == 0.0 {
            return 0;
        }
    }
    1
}

// ============================================
// BANDED SOLVERS
// ============================================

/// Forward substitution for banded lower triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn lsolveBanded(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    bw: i32,
    x_ptr: *mut f64,
) {
    let n = n as usize;
    let bw = bw as usize;
    for i in 0..n {
        let mut sum = *b_ptr.add(i);
        let j_start = if i > bw { i - bw } else { 0 };
        for j in j_start..i {
            sum -= *l_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        let diag = *l_ptr.add(i * n + i);
        *x_ptr.add(i) = if diag == 0.0 { f64::NAN } else { sum / diag };
    }
}

/// Backward substitution for banded upper triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn usolveBanded(
    u_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    bw: i32,
    x_ptr: *mut f64,
) {
    let n = n as usize;
    let bw = bw as usize;
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *b_ptr.add(i);
        let j_end = if i + bw + 1 < n { i + bw + 1 } else { n };
        for j in (i + 1)..j_end {
            sum -= *u_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        let diag = *u_ptr.add(i * n + i);
        *x_ptr.add(i) = if diag == 0.0 { f64::NAN } else { sum / diag };
    }
}

// ============================================
// TRIDIAGONAL (Thomas algorithm)
// ============================================

/// Solve tridiagonal system using Thomas algorithm.
/// workPtr needs 2*n f64 space.
#[no_mangle]
pub unsafe extern "C" fn solveTridiagonal(
    a_ptr: *const f64,
    b_ptr: *const f64,
    c_ptr: *const f64,
    d_ptr: *const f64,
    n: i32,
    x_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let n = n as usize;
    let c_prime = work_ptr;
    let d_prime = work_ptr.add(n);

    // Forward sweep
    *c_prime.add(0) = *c_ptr.add(0) / *b_ptr.add(0);
    *d_prime.add(0) = *d_ptr.add(0) / *b_ptr.add(0);

    for i in 1..n {
        let denom = *b_ptr.add(i) - *a_ptr.add(i) * *c_prime.add(i - 1);
        if i < n - 1 {
            *c_prime.add(i) = *c_ptr.add(i) / denom;
        }
        *d_prime.add(i) = (*d_ptr.add(i) - *a_ptr.add(i) * *d_prime.add(i - 1)) / denom;
    }

    // Back substitution
    *x_ptr.add(n - 1) = *d_prime.add(n - 1);
    for ii in 1..n {
        let i = n - 1 - ii;
        *x_ptr.add(i) = *d_prime.add(i) - *c_prime.add(i) * *x_ptr.add(i + 1);
    }
}

// ============================================
// TRIANGULAR MATRIX-VECTOR
// ============================================

/// y = L * x for lower triangular L.
#[no_mangle]
pub unsafe extern "C" fn lowerTriangularMV(
    l_ptr: *const f64,
    x_ptr: *const f64,
    n: i32,
    y_ptr: *mut f64,
) {
    let n = n as usize;
    for i in 0..n {
        let mut sum = 0.0;
        for j in 0..=i {
            sum += *l_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *y_ptr.add(i) = sum;
    }
}

/// y = U * x for upper triangular U.
#[no_mangle]
pub unsafe extern "C" fn upperTriangularMV(
    u_ptr: *const f64,
    x_ptr: *const f64,
    n: i32,
    y_ptr: *mut f64,
) {
    let n = n as usize;
    for i in 0..n {
        let mut sum = 0.0;
        for j in i..n {
            sum += *u_ptr.add(i * n + j) * *x_ptr.add(j);
        }
        *y_ptr.add(i) = sum;
    }
}

// ============================================
// TRIANGULAR INVERSE
// ============================================

/// Compute inverse of lower triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn lowerTriangularInverse(l_ptr: *const f64, n: i32, inv_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..(n * n) {
        *inv_ptr.add(i) = 0.0;
    }

    for j in 0..n {
        for i in 0..n {
            let rhs = if i == j { 1.0 } else { 0.0 };
            let mut sum = rhs;
            for k in 0..i {
                sum -= *l_ptr.add(i * n + k) * *inv_ptr.add(k * n + j);
            }
            *inv_ptr.add(i * n + j) = sum / *l_ptr.add(i * n + i);
        }
    }
}

/// Compute inverse of upper triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn upperTriangularInverse(u_ptr: *const f64, n: i32, inv_ptr: *mut f64) {
    let n = n as usize;
    for i in 0..(n * n) {
        *inv_ptr.add(i) = 0.0;
    }

    for j in 0..n {
        for ii in 0..n {
            let i = n - 1 - ii;
            let rhs = if i == j { 1.0 } else { 0.0 };
            let mut sum = rhs;
            for k in (i + 1)..n {
                sum -= *u_ptr.add(i * n + k) * *inv_ptr.add(k * n + j);
            }
            *inv_ptr.add(i * n + j) = sum / *u_ptr.add(i * n + i);
        }
    }
}

// ============================================
// DETERMINANT
// ============================================

/// Product of diagonal elements (determinant of triangular matrix).
#[no_mangle]
pub unsafe extern "C" fn triangularDeterminant(t_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut det: f64 = 1.0;
    for i in 0..n {
        det *= *t_ptr.add(i * n + i);
    }
    det
}

// ============================================
// ALL-SOLUTIONS SOLVERS
// ============================================

/// Solve Lx = b finding ALL solutions for singular L.
/// infoPtr: [numSolutions, numFreeVars, isConsistent] (3 x i32).
#[no_mangle]
pub unsafe extern "C" fn lsolveAll(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    solutions_ptr: *mut f64,
    info_ptr: *mut i32,
    work_ptr: *mut u8,
) {
    let n = n as usize;
    let tol: f64 = 1e-14;

    let is_free_ptr = work_ptr as *mut i32;
    let particular_ptr = (work_ptr as *mut f64).add(n); // after n i32s (but aligned)
                                                        // Use byte offset: is_free = n*4 bytes, particular starts at work + n*4
    let particular_ptr = (work_ptr.add(n * 4)) as *mut f64;

    let mut num_free: i32 = 0;
    for i in 0..n {
        if libm::fabs(*l_ptr.add(i * n + i)) < tol {
            *is_free_ptr.add(i) = 1;
            num_free += 1;
        } else {
            *is_free_ptr.add(i) = 0;
        }
    }

    let mut is_consistent: i32 = 1;
    for i in 0..n {
        let mut sum = *b_ptr.add(i);
        for j in 0..i {
            sum -= *l_ptr.add(i * n + j) * *particular_ptr.add(j);
        }
        if *is_free_ptr.add(i) == 1 {
            if libm::fabs(sum) > tol {
                is_consistent = 0;
                break;
            }
            *particular_ptr.add(i) = 0.0;
        } else {
            *particular_ptr.add(i) = sum / *l_ptr.add(i * n + i);
        }
    }

    *info_ptr.add(2) = is_consistent;
    if is_consistent == 0 {
        *info_ptr.add(0) = 0;
        *info_ptr.add(1) = 0;
        return;
    }

    if num_free == 0 {
        *info_ptr.add(0) = 1;
        *info_ptr.add(1) = 0;
        for i in 0..n {
            *solutions_ptr.add(i) = *particular_ptr.add(i);
        }
        return;
    }

    let num_cols = (1 + num_free) as usize;
    *info_ptr.add(0) = num_cols as i32;
    *info_ptr.add(1) = num_free;

    // Store particular solution in first column
    for i in 0..n {
        *solutions_ptr.add(i * num_cols) = *particular_ptr.add(i);
    }

    // Null space basis vectors
    let mut free_idx: usize = 0;
    for k in 0..n {
        if *is_free_ptr.add(k) == 1 {
            for i in 0..n {
                if i == k {
                    *solutions_ptr.add(i * num_cols + 1 + free_idx) = 1.0;
                } else if *is_free_ptr.add(i) == 1 {
                    *solutions_ptr.add(i * num_cols + 1 + free_idx) = 0.0;
                } else {
                    let mut sum = 0.0;
                    for j in 0..i {
                        sum -=
                            *l_ptr.add(i * n + j) * *solutions_ptr.add(j * num_cols + 1 + free_idx);
                    }
                    if libm::fabs(*l_ptr.add(i * n + i)) > tol {
                        *solutions_ptr.add(i * num_cols + 1 + free_idx) =
                            sum / *l_ptr.add(i * n + i);
                    } else {
                        *solutions_ptr.add(i * num_cols + 1 + free_idx) = 0.0;
                    }
                }
            }
            free_idx += 1;
        }
    }
}

/// Solve Ux = b finding ALL solutions for singular U.
#[no_mangle]
pub unsafe extern "C" fn usolveAll(
    u_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    solutions_ptr: *mut f64,
    info_ptr: *mut i32,
    work_ptr: *mut u8,
) {
    let n = n as usize;
    let tol: f64 = 1e-14;

    let is_free_ptr = work_ptr as *mut i32;
    let particular_ptr = (work_ptr.add(n * 4)) as *mut f64;

    let mut num_free: i32 = 0;
    for i in 0..n {
        if libm::fabs(*u_ptr.add(i * n + i)) < tol {
            *is_free_ptr.add(i) = 1;
            num_free += 1;
        } else {
            *is_free_ptr.add(i) = 0;
        }
    }

    let mut is_consistent: i32 = 1;
    for ii in 0..n {
        let i = n - 1 - ii;
        let mut sum = *b_ptr.add(i);
        for j in (i + 1)..n {
            sum -= *u_ptr.add(i * n + j) * *particular_ptr.add(j);
        }
        if *is_free_ptr.add(i) == 1 {
            if libm::fabs(sum) > tol {
                is_consistent = 0;
                break;
            }
            *particular_ptr.add(i) = 0.0;
        } else {
            *particular_ptr.add(i) = sum / *u_ptr.add(i * n + i);
        }
    }

    *info_ptr.add(2) = is_consistent;
    if is_consistent == 0 {
        *info_ptr.add(0) = 0;
        *info_ptr.add(1) = 0;
        return;
    }

    if num_free == 0 {
        *info_ptr.add(0) = 1;
        *info_ptr.add(1) = 0;
        for i in 0..n {
            *solutions_ptr.add(i) = *particular_ptr.add(i);
        }
        return;
    }

    let num_cols = (1 + num_free) as usize;
    *info_ptr.add(0) = num_cols as i32;
    *info_ptr.add(1) = num_free;

    for i in 0..n {
        *solutions_ptr.add(i * num_cols) = *particular_ptr.add(i);
    }

    let mut free_idx: usize = 0;
    for k in 0..n {
        if *is_free_ptr.add(k) == 1 {
            for ii in 0..n {
                let i = n - 1 - ii;
                if i == k {
                    *solutions_ptr.add(i * num_cols + 1 + free_idx) = 1.0;
                } else if *is_free_ptr.add(i) == 1 {
                    *solutions_ptr.add(i * num_cols + 1 + free_idx) = 0.0;
                } else {
                    let mut sum = 0.0;
                    for j in (i + 1)..n {
                        sum -=
                            *u_ptr.add(i * n + j) * *solutions_ptr.add(j * num_cols + 1 + free_idx);
                    }
                    if libm::fabs(*u_ptr.add(i * n + i)) > tol {
                        *solutions_ptr.add(i * num_cols + 1 + free_idx) =
                            sum / *u_ptr.add(i * n + i);
                    } else {
                        *solutions_ptr.add(i * num_cols + 1 + free_idx) = 0.0;
                    }
                }
            }
            free_idx += 1;
        }
    }
}

// ============================================
// TRIANGULAR RANK
// ============================================

/// Count rank of lower triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn lowerTriangularRank(l_ptr: *const f64, n: i32) -> i32 {
    let n = n as usize;
    let tol = 1e-14;
    let mut rank: i32 = 0;
    for i in 0..n {
        if libm::fabs(*l_ptr.add(i * n + i)) > tol {
            rank += 1;
        }
    }
    rank
}

/// Count rank of upper triangular matrix.
#[no_mangle]
pub unsafe extern "C" fn upperTriangularRank(u_ptr: *const f64, n: i32) -> i32 {
    let n = n as usize;
    let tol = 1e-14;
    let mut rank: i32 = 0;
    for i in 0..n {
        if libm::fabs(*u_ptr.add(i * n + i)) > tol {
            rank += 1;
        }
    }
    rank
}

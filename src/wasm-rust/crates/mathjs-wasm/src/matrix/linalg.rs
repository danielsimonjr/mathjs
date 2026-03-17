//! WASM-optimized linear algebra operations using raw memory pointers.
//!
//! All functions use raw memory pointers (usize-equivalent `*const f64` / `*mut f64`)
//! for array parameters to ensure proper interop with JavaScript/TypeScript callers.
//!
//! Includes: determinant, inverse, norms, Kronecker product, cross product,
//! linear system solvers, triangular solvers, rank, and condition numbers.
//! All matrices are flat arrays in row-major order.

use libm::{fabs, pow, sqrt};

// ============================================
// DETERMINANT
// ============================================

/// Compute the determinant of a square matrix using LU decomposition.
///
/// * `a_ptr` - Pointer to input matrix (n x n, row-major)
/// * `n` - Size of the matrix
/// * `work_ptr` - Pointer to work buffer (n*n f64 values)
#[no_mangle]
pub unsafe extern "C" fn det(a_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    let n = n as usize;

    if n == 1 {
        return *a_ptr;
    }

    if n == 2 {
        return *a_ptr * *a_ptr.add(3) - *a_ptr.add(1) * *a_ptr.add(2);
    }

    if n == 3 {
        let a00 = *a_ptr;
        let a01 = *a_ptr.add(1);
        let a02 = *a_ptr.add(2);
        let a10 = *a_ptr.add(3);
        let a11 = *a_ptr.add(4);
        let a12 = *a_ptr.add(5);
        let a20 = *a_ptr.add(6);
        let a21 = *a_ptr.add(7);
        let a22 = *a_ptr.add(8);
        return a00 * a11 * a22 + a01 * a12 * a20 + a02 * a10 * a21
            - a02 * a11 * a20
            - a01 * a10 * a22
            - a00 * a12 * a21;
    }

    // Copy to work buffer for LU decomposition
    let nn = n * n;
    for i in 0..nn {
        *work_ptr.add(i) = *a_ptr.add(i);
    }

    let mut sign: f64 = 1.0;

    // Gaussian elimination with partial pivoting
    for k in 0..n - 1 {
        // Find pivot
        let mut max_val = fabs(*work_ptr.add(k * n + k));
        let mut pivot_row = k;

        for i in k + 1..n {
            let val = fabs(*work_ptr.add(i * n + k));
            if val > max_val {
                max_val = val;
                pivot_row = i;
            }
        }

        // Check for singularity
        if max_val < 1e-14 {
            return 0.0;
        }

        // Swap rows if necessary
        if pivot_row != k {
            for j in 0..n {
                let k_idx = k * n + j;
                let p_idx = pivot_row * n + j;
                let temp = *work_ptr.add(k_idx);
                *work_ptr.add(k_idx) = *work_ptr.add(p_idx);
                *work_ptr.add(p_idx) = temp;
            }
            sign = -sign;
        }

        // Eliminate column
        let pivot = *work_ptr.add(k * n + k);
        for i in k + 1..n {
            let factor = *work_ptr.add(i * n + k) / pivot;
            for j in k + 1..n {
                let idx = i * n + j;
                *work_ptr.add(idx) = *work_ptr.add(idx) - factor * *work_ptr.add(k * n + j);
            }
        }
    }

    // Product of diagonal
    let mut result = sign;
    for i in 0..n {
        result *= *work_ptr.add(i * n + i);
    }

    result
}

// ============================================
// MATRIX INVERSE
// ============================================

/// Compute the inverse of a square matrix using Gauss-Jordan elimination.
///
/// * `a_ptr` - Pointer to input matrix (n x n, row-major)
/// * `n` - Size of the matrix
/// * `result_ptr` - Pointer to output matrix (n x n)
/// * `work_ptr` - Pointer to work buffer (n * 2n f64 values for augmented matrix)
///
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn inv(
    a_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let width = 2 * n;

    // Create augmented matrix [A | I] in work buffer
    for i in 0..n {
        for j in 0..n {
            *work_ptr.add(i * width + j) = *a_ptr.add(i * n + j);
            *work_ptr.add(i * width + n + j) = if i == j { 1.0 } else { 0.0 };
        }
    }

    // Forward elimination with partial pivoting
    for k in 0..n {
        // Find pivot
        let mut max_val = fabs(*work_ptr.add(k * width + k));
        let mut pivot_row = k;

        for i in k + 1..n {
            let val = fabs(*work_ptr.add(i * width + k));
            if val > max_val {
                max_val = val;
                pivot_row = i;
            }
        }

        // Check for singularity
        if max_val < 1e-14 {
            return 0; // Singular matrix
        }

        // Swap rows if necessary
        if pivot_row != k {
            for j in 0..width {
                let k_idx = k * width + j;
                let p_idx = pivot_row * width + j;
                let temp = *work_ptr.add(k_idx);
                *work_ptr.add(k_idx) = *work_ptr.add(p_idx);
                *work_ptr.add(p_idx) = temp;
            }
        }

        // Scale pivot row
        let pivot = *work_ptr.add(k * width + k);
        for j in 0..width {
            let idx = k * width + j;
            *work_ptr.add(idx) = *work_ptr.add(idx) / pivot;
        }

        // Eliminate column
        for i in 0..n {
            if i != k {
                let factor = *work_ptr.add(i * width + k);
                for j in 0..width {
                    let idx = i * width + j;
                    *work_ptr.add(idx) = *work_ptr.add(idx) - factor * *work_ptr.add(k * width + j);
                }
            }
        }
    }

    // Extract inverse from right half
    for i in 0..n {
        for j in 0..n {
            *result_ptr.add(i * n + j) = *work_ptr.add(i * width + n + j);
        }
    }

    1
}

// ============================================
// VECTOR AND MATRIX NORMS
// ============================================

/// Compute the L1 norm (sum of absolute values) of a vector.
#[no_mangle]
pub unsafe extern "C" fn norm1(x_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut sum: f64 = 0.0;
    for i in 0..n {
        sum += fabs(*x_ptr.add(i));
    }
    sum
}

/// Compute the L2 norm (Euclidean norm) of a vector.
#[no_mangle]
pub unsafe extern "C" fn norm2(x_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut sum: f64 = 0.0;
    for i in 0..n {
        let val = *x_ptr.add(i);
        sum += val * val;
    }
    sqrt(sum)
}

/// Compute the Lp norm of a vector.
#[no_mangle]
pub unsafe extern "C" fn normP(x_ptr: *const f64, n: i32, p: f64) -> f64 {
    if p == 1.0 {
        return norm1(x_ptr, n);
    }
    if p == 2.0 {
        return norm2(x_ptr, n);
    }

    let n_usize = n as usize;
    let mut sum: f64 = 0.0;
    for i in 0..n_usize {
        sum += pow(fabs(*x_ptr.add(i)), p);
    }
    pow(sum, 1.0 / p)
}

/// Compute the infinity norm (max absolute value) of a vector.
#[no_mangle]
pub unsafe extern "C" fn normInf(x_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut max_val: f64 = 0.0;
    for i in 0..n {
        let abs_val = fabs(*x_ptr.add(i));
        if abs_val > max_val {
            max_val = abs_val;
        }
    }
    max_val
}

/// Compute the Frobenius norm of a matrix.
#[no_mangle]
pub unsafe extern "C" fn normFro(a_ptr: *const f64, size: i32) -> f64 {
    norm2(a_ptr, size)
}

/// Compute the 1-norm (max column sum) of a matrix.
#[no_mangle]
pub unsafe extern "C" fn matrixNorm1(a_ptr: *const f64, rows: i32, cols: i32) -> f64 {
    let rows = rows as usize;
    let cols = cols as usize;
    let mut max_col_sum: f64 = 0.0;

    for j in 0..cols {
        let mut col_sum: f64 = 0.0;
        for i in 0..rows {
            col_sum += fabs(*a_ptr.add(i * cols + j));
        }
        if col_sum > max_col_sum {
            max_col_sum = col_sum;
        }
    }

    max_col_sum
}

/// Compute the infinity-norm (max row sum) of a matrix.
#[no_mangle]
pub unsafe extern "C" fn matrixNormInf(a_ptr: *const f64, rows: i32, cols: i32) -> f64 {
    let rows = rows as usize;
    let cols = cols as usize;
    let mut max_row_sum: f64 = 0.0;

    for i in 0..rows {
        let mut row_sum: f64 = 0.0;
        for j in 0..cols {
            row_sum += fabs(*a_ptr.add(i * cols + j));
        }
        if row_sum > max_row_sum {
            max_row_sum = row_sum;
        }
    }

    max_row_sum
}

/// Normalize a vector to unit length (in-place).
/// Returns the original norm (0 if vector was zero).
#[no_mangle]
pub unsafe extern "C" fn normalize(x_ptr: *mut f64, n: i32) -> f64 {
    let norm_val = norm2(x_ptr, n);

    if norm_val < 1e-14 {
        return 0.0;
    }

    let n = n as usize;
    for i in 0..n {
        *x_ptr.add(i) = *x_ptr.add(i) / norm_val;
    }

    norm_val
}

// ============================================
// KRONECKER PRODUCT
// ============================================

/// Compute the Kronecker product of two matrices: C = A (x) B.
#[no_mangle]
pub unsafe extern "C" fn kron(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    b_rows: i32,
    b_cols: i32,
    result_ptr: *mut f64,
) {
    let a_rows = a_rows as usize;
    let a_cols = a_cols as usize;
    let b_rows = b_rows as usize;
    let b_cols = b_cols as usize;
    let result_cols = a_cols * b_cols;

    for i in 0..a_rows {
        for j in 0..a_cols {
            let a_val = *a_ptr.add(i * a_cols + j);
            for k in 0..b_rows {
                for l in 0..b_cols {
                    let row = i * b_rows + k;
                    let col = j * b_cols + l;
                    let b_val = *b_ptr.add(k * b_cols + l);
                    *result_ptr.add(row * result_cols + col) = a_val * b_val;
                }
            }
        }
    }
}

// ============================================
// CROSS PRODUCT
// ============================================

/// Compute the cross product of two 3D vectors.
#[no_mangle]
pub unsafe extern "C" fn cross(a_ptr: *const f64, b_ptr: *const f64, result_ptr: *mut f64) {
    let a0 = *a_ptr;
    let a1 = *a_ptr.add(1);
    let a2 = *a_ptr.add(2);
    let b0 = *b_ptr;
    let b1 = *b_ptr.add(1);
    let b2 = *b_ptr.add(2);

    *result_ptr = a1 * b2 - a2 * b1;
    *result_ptr.add(1) = a2 * b0 - a0 * b2;
    *result_ptr.add(2) = a0 * b1 - a1 * b0;
}

/// Compute the dot product of two vectors.
#[no_mangle]
pub unsafe extern "C" fn dot(a_ptr: *const f64, b_ptr: *const f64, n: i32) -> f64 {
    let n = n as usize;
    let mut sum: f64 = 0.0;
    for i in 0..n {
        sum += *a_ptr.add(i) * *b_ptr.add(i);
    }
    sum
}

// ============================================
// OUTER PRODUCT
// ============================================

/// Compute the outer product of two vectors: C = a * b^T.
#[no_mangle]
pub unsafe extern "C" fn outer(
    a_ptr: *const f64,
    m: i32,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    let m = m as usize;
    let n = n as usize;
    for i in 0..m {
        let a_val = *a_ptr.add(i);
        for j in 0..n {
            *result_ptr.add(i * n + j) = a_val * *b_ptr.add(j);
        }
    }
}

// ============================================
// RANK
// ============================================

/// Estimate the rank of a matrix using Gaussian elimination.
#[no_mangle]
pub unsafe extern "C" fn rank(
    a_ptr: *const f64,
    rows: i32,
    cols: i32,
    tol: f64,
    work_ptr: *mut f64,
) -> i32 {
    let rows = rows as usize;
    let cols = cols as usize;

    // Copy matrix to work buffer
    let size = rows * cols;
    for i in 0..size {
        *work_ptr.add(i) = *a_ptr.add(i);
    }

    let mut r: usize = 0;
    let min_dim = if rows < cols { rows } else { cols };

    for k in 0..min_dim {
        // Find pivot
        let mut max_val: f64 = 0.0;
        let mut pivot_row: isize = -1;

        for i in r..rows {
            let val = fabs(*work_ptr.add(i * cols + k));
            if val > max_val {
                max_val = val;
                pivot_row = i as isize;
            }
        }

        if max_val <= tol {
            continue; // Skip this column
        }

        let pivot_row = pivot_row as usize;

        // Swap rows
        if pivot_row != r {
            for j in 0..cols {
                let r_idx = r * cols + j;
                let p_idx = pivot_row * cols + j;
                let temp = *work_ptr.add(r_idx);
                *work_ptr.add(r_idx) = *work_ptr.add(p_idx);
                *work_ptr.add(p_idx) = temp;
            }
        }

        // Eliminate
        let pivot = *work_ptr.add(r * cols + k);
        for i in r + 1..rows {
            let factor = *work_ptr.add(i * cols + k) / pivot;
            for j in k..cols {
                let idx = i * cols + j;
                *work_ptr.add(idx) = *work_ptr.add(idx) - factor * *work_ptr.add(r * cols + j);
            }
        }

        r += 1;
    }

    r as i32
}

// ============================================
// SOLVE LINEAR SYSTEM
// ============================================

/// Solve a linear system Ax = b using LU decomposition.
///
/// * `work_ptr` - Work buffer (n*n + n for LU and permutation, permutation stored as i32)
///
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn solve(
    a_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
    work_ptr: *mut u8,
) -> i32 {
    let n = n as usize;
    let lu_ptr = work_ptr as *mut f64;
    // Permutation array stored after the n*n f64 LU matrix
    let perm_ptr = work_ptr.add(n * n * 8) as *mut i32;

    // Copy A to LU
    for i in 0..n * n {
        *lu_ptr.add(i) = *a_ptr.add(i);
    }

    // Initialize permutation
    for i in 0..n {
        *perm_ptr.add(i) = i as i32;
    }

    // LU decomposition with partial pivoting
    for k in 0..n.saturating_sub(1) {
        // Find pivot
        let mut max_val = fabs(*lu_ptr.add(k * n + k));
        let mut pivot_row = k;

        for i in k + 1..n {
            let val = fabs(*lu_ptr.add(i * n + k));
            if val > max_val {
                max_val = val;
                pivot_row = i;
            }
        }

        if max_val < 1e-14 {
            return 0; // Singular
        }

        if pivot_row != k {
            // Swap rows in LU
            for j in 0..n {
                let k_idx = k * n + j;
                let p_idx = pivot_row * n + j;
                let temp = *lu_ptr.add(k_idx);
                *lu_ptr.add(k_idx) = *lu_ptr.add(p_idx);
                *lu_ptr.add(p_idx) = temp;
            }

            // Swap in permutation
            let temp_p = *perm_ptr.add(k);
            *perm_ptr.add(k) = *perm_ptr.add(pivot_row);
            *perm_ptr.add(pivot_row) = temp_p;
        }

        // Eliminate
        let pivot = *lu_ptr.add(k * n + k);
        for i in k + 1..n {
            let factor_idx = i * n + k;
            let factor = *lu_ptr.add(factor_idx) / pivot;
            *lu_ptr.add(factor_idx) = factor;

            for j in k + 1..n {
                let idx = i * n + j;
                *lu_ptr.add(idx) = *lu_ptr.add(idx) - factor * *lu_ptr.add(k * n + j);
            }
        }
    }

    // Check last pivot for singularity
    if fabs(*lu_ptr.add((n - 1) * n + (n - 1))) < 1e-14 {
        return 0; // Singular
    }

    // Forward substitution: Ly = Pb
    for i in 0..n {
        let perm_i = *perm_ptr.add(i) as usize;
        let mut sum = *b_ptr.add(perm_i);
        for j in 0..i {
            sum -= *lu_ptr.add(i * n + j) * *result_ptr.add(j);
        }
        *result_ptr.add(i) = sum;
    }

    // Backward substitution: Ux = y
    let mut i_signed = n as isize - 1;
    while i_signed >= 0 {
        let i = i_signed as usize;
        let mut sum = *result_ptr.add(i);
        for j in i + 1..n {
            sum -= *lu_ptr.add(i * n + j) * *result_ptr.add(j);
        }
        *result_ptr.add(i) = sum / *lu_ptr.add(i * n + i);
        i_signed -= 1;
    }

    1
}

// ============================================
// TRIANGULAR SOLVERS
// ============================================

/// Forward substitution: Solve L*x = b where L is lower triangular.
/// Returns 1 if successful, 0 if singular (zero diagonal).
#[no_mangle]
pub unsafe extern "C" fn lsolve(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    for j in 0..n {
        let ljj = *l_ptr.add(j * n + j);
        if fabs(ljj) < 1e-14 {
            return 0;
        }
        let mut sum = *b_ptr.add(j);
        for k in 0..j {
            sum -= *l_ptr.add(j * n + k) * *result_ptr.add(k);
        }
        *result_ptr.add(j) = sum / ljj;
    }
    1
}

/// Backward substitution: Solve U*x = b where U is upper triangular.
/// Returns 1 if successful, 0 if singular (zero diagonal).
#[no_mangle]
pub unsafe extern "C" fn usolve(
    u_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let mut j_signed = n as isize - 1;
    while j_signed >= 0 {
        let j = j_signed as usize;
        let ujj = *u_ptr.add(j * n + j);
        if fabs(ujj) < 1e-14 {
            return 0;
        }
        let mut sum = *b_ptr.add(j);
        for k in j + 1..n {
            sum -= *u_ptr.add(j * n + k) * *result_ptr.add(k);
        }
        *result_ptr.add(j) = sum / ujj;
        j_signed -= 1;
    }
    1
}

/// Forward substitution for unit lower triangular matrix (diagonal = 1).
#[no_mangle]
pub unsafe extern "C" fn lsolveUnit(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    result_ptr: *mut f64,
) {
    let n = n as usize;
    for j in 0..n {
        let mut sum = *b_ptr.add(j);
        for k in 0..j {
            sum -= *l_ptr.add(j * n + k) * *result_ptr.add(k);
        }
        *result_ptr.add(j) = sum;
    }
}

/// Vectorized forward substitution: Solve L*X = B for multiple right-hand sides.
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn lsolveMultiple(
    l_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    m: i32,
    result_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let m = m as usize;
    for col in 0..m {
        for j in 0..n {
            let ljj = *l_ptr.add(j * n + j);
            if fabs(ljj) < 1e-14 {
                return 0;
            }
            let mut sum = *b_ptr.add(j * m + col);
            for k in 0..j {
                sum -= *l_ptr.add(j * n + k) * *result_ptr.add(k * m + col);
            }
            *result_ptr.add(j * m + col) = sum / ljj;
        }
    }
    1
}

/// Vectorized backward substitution: Solve U*X = B for multiple right-hand sides.
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn usolveMultiple(
    u_ptr: *const f64,
    b_ptr: *const f64,
    n: i32,
    m: i32,
    result_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let m = m as usize;
    for col in 0..m {
        let mut j_signed = n as isize - 1;
        while j_signed >= 0 {
            let j = j_signed as usize;
            let ujj = *u_ptr.add(j * n + j);
            if fabs(ujj) < 1e-14 {
                return 0;
            }
            let mut sum = *b_ptr.add(j * m + col);
            for k in j + 1..n {
                sum -= *u_ptr.add(j * n + k) * *result_ptr.add(k * m + col);
            }
            *result_ptr.add(j * m + col) = sum / ujj;
            j_signed -= 1;
        }
    }
    1
}

// ============================================
// OPTIMIZED 2x2 INVERSE
// ============================================

/// Compute the inverse of a 2x2 matrix using direct formula.
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn inv2x2(a_ptr: *const f64, result_ptr: *mut f64) -> i32 {
    let a = *a_ptr;
    let b = *a_ptr.add(1);
    let c = *a_ptr.add(2);
    let d = *a_ptr.add(3);

    let det_val = a * d - b * c;

    if fabs(det_val) < 1e-14 {
        return 0;
    }

    let inv_det = 1.0 / det_val;

    *result_ptr = d * inv_det;
    *result_ptr.add(1) = -b * inv_det;
    *result_ptr.add(2) = -c * inv_det;
    *result_ptr.add(3) = a * inv_det;

    1
}

// ============================================
// OPTIMIZED 3x3 INVERSE
// ============================================

/// Compute the inverse of a 3x3 matrix using direct formula (cofactors).
/// Returns 1 if successful, 0 if singular.
#[no_mangle]
pub unsafe extern "C" fn inv3x3(a_ptr: *const f64, result_ptr: *mut f64) -> i32 {
    let a00 = *a_ptr;
    let a01 = *a_ptr.add(1);
    let a02 = *a_ptr.add(2);
    let a10 = *a_ptr.add(3);
    let a11 = *a_ptr.add(4);
    let a12 = *a_ptr.add(5);
    let a20 = *a_ptr.add(6);
    let a21 = *a_ptr.add(7);
    let a22 = *a_ptr.add(8);

    // Compute cofactors
    let c00 = a11 * a22 - a12 * a21;
    let c01 = a12 * a20 - a10 * a22;
    let c02 = a10 * a21 - a11 * a20;
    let c10 = a02 * a21 - a01 * a22;
    let c11 = a00 * a22 - a02 * a20;
    let c12 = a01 * a20 - a00 * a21;
    let c20 = a01 * a12 - a02 * a11;
    let c21 = a02 * a10 - a00 * a12;
    let c22 = a00 * a11 - a01 * a10;

    // Determinant via first row expansion
    let det_val = a00 * c00 + a01 * c01 + a02 * c02;

    if fabs(det_val) < 1e-14 {
        return 0;
    }

    let inv_det = 1.0 / det_val;

    // Inverse is adjugate (transpose of cofactor) divided by determinant
    *result_ptr = c00 * inv_det;
    *result_ptr.add(1) = c10 * inv_det;
    *result_ptr.add(2) = c20 * inv_det;
    *result_ptr.add(3) = c01 * inv_det;
    *result_ptr.add(4) = c11 * inv_det;
    *result_ptr.add(5) = c21 * inv_det;
    *result_ptr.add(6) = c02 * inv_det;
    *result_ptr.add(7) = c12 * inv_det;
    *result_ptr.add(8) = c22 * inv_det;

    1
}

// ============================================
// CONDITION NUMBER
// ============================================

/// Compute the condition number of a matrix using 1-norm.
/// cond1(A) = ||A||_1 * ||A^(-1)||_1.
///
/// Returns Infinity if singular.
#[no_mangle]
pub unsafe extern "C" fn cond1(a_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    let n_usize = n as usize;
    let inv_a_ptr = work_ptr;
    let inv_work_ptr = work_ptr.add(n_usize * n_usize);

    // Compute ||A||_1
    let norm_a = matrixNorm1(a_ptr, n, n);

    // Compute inverse
    let success = inv(a_ptr, n, inv_a_ptr, inv_work_ptr);
    if success == 0 {
        return f64::INFINITY;
    }

    // Compute ||A^(-1)||_1
    let norm_a_inv = matrixNorm1(inv_a_ptr, n, n);

    norm_a * norm_a_inv
}

/// Compute the condition number of a matrix using infinity-norm.
/// condInf(A) = ||A||_inf * ||A^(-1)||_inf.
///
/// Returns Infinity if singular.
#[no_mangle]
pub unsafe extern "C" fn condInf(a_ptr: *const f64, n: i32, work_ptr: *mut f64) -> f64 {
    let n_usize = n as usize;
    let inv_a_ptr = work_ptr;
    let inv_work_ptr = work_ptr.add(n_usize * n_usize);

    // Compute ||A||_inf
    let norm_a = matrixNormInf(a_ptr, n, n);

    // Compute inverse
    let success = inv(a_ptr, n, inv_a_ptr, inv_work_ptr);
    if success == 0 {
        return f64::INFINITY;
    }

    // Compute ||A^(-1)||_inf
    let norm_a_inv = matrixNormInf(inv_a_ptr, n, n);

    norm_a * norm_a_inv
}

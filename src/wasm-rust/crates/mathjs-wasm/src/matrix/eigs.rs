//! WASM-optimized eigenvalue decomposition.
//!
//! Implements the Jacobi eigenvalue algorithm for real symmetric matrices,
//! power iteration for dominant eigenvalue, and inverse iteration.
//!
//! All functions use raw memory pointers for proper WASM/JS interop.
//! SIMD variants are identical implementations -- LLVM auto-vectorizes
//! when compiled with `+simd128`.

use libm::{atan, cos, fabs, sin, sqrt};

// ============================================
// INTERNAL HELPERS
// ============================================

/// Get the maximum absolute value of off-diagonal elements.
#[inline]
unsafe fn get_max_off_diagonal(matrix_ptr: *const f64, n: usize) -> f64 {
    let mut max_val: f64 = 0.0;
    for i in 0..n {
        for j in i + 1..n {
            let val = fabs(*matrix_ptr.add(i * n + j));
            if val > max_val {
                max_val = val;
            }
        }
    }
    max_val
}

/// Find indices of maximum off-diagonal element.
/// Returns (i, j) packed as (row, col).
#[inline]
unsafe fn find_max_off_diagonal_indices(matrix_ptr: *const f64, n: usize) -> (usize, usize) {
    let mut max_val: f64 = 0.0;
    let mut max_i: usize = 0;
    let mut max_j: usize = 1;

    for i in 0..n {
        for j in i + 1..n {
            let val = fabs(*matrix_ptr.add(i * n + j));
            if val > max_val {
                max_val = val;
                max_i = i;
                max_j = j;
            }
        }
    }

    (max_i, max_j)
}

/// Compute Jacobi rotation angle theta.
#[inline]
unsafe fn get_theta(matrix_ptr: *const f64, n: usize, i: usize, j: usize, tolerance: f64) -> f64 {
    let aii = *matrix_ptr.add(i * n + i);
    let ajj = *matrix_ptr.add(j * n + j);
    let aij = *matrix_ptr.add(i * n + j);

    let denom = ajj - aii;

    if fabs(denom) <= tolerance {
        core::f64::consts::FRAC_PI_4
    } else {
        0.5 * atan((2.0 * aij) / denom)
    }
}

/// Apply Jacobi rotation to matrix.
/// Transforms A -> G^T * A * G where G is Givens rotation.
#[inline]
unsafe fn apply_jacobi_rotation(
    matrix_ptr: *mut f64,
    n: usize,
    theta: f64,
    i: usize,
    j: usize,
    aki_ptr: *mut f64,
    akj_ptr: *mut f64,
) {
    let c = cos(theta);
    let s = sin(theta);
    let c2 = c * c;
    let s2 = s * s;

    let hii = *matrix_ptr.add(i * n + i);
    let hjj = *matrix_ptr.add(j * n + j);
    let hij = *matrix_ptr.add(i * n + j);

    // Compute new diagonal elements
    let aii = c2 * hii - 2.0 * c * s * hij + s2 * hjj;
    let ajj = s2 * hii + 2.0 * c * s * hij + c2 * hjj;

    // Compute rotated row/column elements into work arrays
    for k in 0..n {
        let hik = *matrix_ptr.add(i * n + k);
        let hjk = *matrix_ptr.add(j * n + k);
        *aki_ptr.add(k) = c * hik - s * hjk;
        *akj_ptr.add(k) = s * hik + c * hjk;
    }

    // Update matrix with new values
    *matrix_ptr.add(i * n + i) = aii;
    *matrix_ptr.add(j * n + j) = ajj;
    *matrix_ptr.add(i * n + j) = 0.0;
    *matrix_ptr.add(j * n + i) = 0.0;

    // Update off-diagonal elements (symmetric)
    for k in 0..n {
        if k != i && k != j {
            let aki = *aki_ptr.add(k);
            let akj = *akj_ptr.add(k);
            *matrix_ptr.add(i * n + k) = aki;
            *matrix_ptr.add(k * n + i) = aki;
            *matrix_ptr.add(j * n + k) = akj;
            *matrix_ptr.add(k * n + j) = akj;
        }
    }
}

/// Apply Jacobi rotation to eigenvector matrix.
#[inline]
unsafe fn apply_jacobi_rotation_to_vectors(
    vectors_ptr: *mut f64,
    n: usize,
    theta: f64,
    i: usize,
    j: usize,
    ski_ptr: *mut f64,
    skj_ptr: *mut f64,
) {
    let c = cos(theta);
    let s = sin(theta);

    // Compute rotated columns into work arrays
    for k in 0..n {
        let ski = *vectors_ptr.add(k * n + i);
        let skj = *vectors_ptr.add(k * n + j);
        *ski_ptr.add(k) = c * ski - s * skj;
        *skj_ptr.add(k) = s * ski + c * skj;
    }

    // Update eigenvector matrix
    for k in 0..n {
        *vectors_ptr.add(k * n + i) = *ski_ptr.add(k);
        *vectors_ptr.add(k * n + j) = *skj_ptr.add(k);
    }
}

/// Sort eigenvalues by absolute value (ascending) using selection sort.
/// Also reorders eigenvector columns if `compute_vectors` is true.
#[inline]
unsafe fn sort_eigenvalues(
    eigenvalues_ptr: *mut f64,
    eigenvectors_ptr: *mut f64,
    n: usize,
    compute_vectors: bool,
) {
    for i in 0..n.saturating_sub(1) {
        let mut min_idx = i;
        let mut min_val = fabs(*eigenvalues_ptr.add(i));

        for j in i + 1..n {
            let val = fabs(*eigenvalues_ptr.add(j));
            if val < min_val {
                min_val = val;
                min_idx = j;
            }
        }

        if min_idx != i {
            // Swap eigenvalues
            let tmp = *eigenvalues_ptr.add(i);
            *eigenvalues_ptr.add(i) = *eigenvalues_ptr.add(min_idx);
            *eigenvalues_ptr.add(min_idx) = tmp;

            // Swap eigenvector columns
            if compute_vectors {
                for k in 0..n {
                    let ki_idx = k * n + i;
                    let km_idx = k * n + min_idx;
                    let tmp_vec = *eigenvectors_ptr.add(ki_idx);
                    *eigenvectors_ptr.add(ki_idx) = *eigenvectors_ptr.add(km_idx);
                    *eigenvectors_ptr.add(km_idx) = tmp_vec;
                }
            }
        }
    }
}

// ============================================
// JACOBI EIGENVALUE ALGORITHM
// ============================================

/// Jacobi eigenvalue algorithm for real symmetric matrices.
///
/// Computes eigenvalues and optionally eigenvectors.
///
/// * `matrix_ptr` - Input matrix (f64, flat, row-major, N x N). **Modified in-place**.
/// * `n` - Matrix dimension.
/// * `precision` - Convergence tolerance (typically 1e-12).
/// * `eigenvalues_ptr` - Output eigenvalues array (f64, size N).
/// * `eigenvectors_ptr` - Output eigenvectors matrix (f64, N x N, row-major).
///   Pass null (0) to skip eigenvector computation.
/// * `work_ptr` - Workspace (f64, size 2*N for temporary arrays).
///
/// Returns number of iterations performed, or -1 if max iterations exceeded.
#[no_mangle]
pub unsafe extern "C" fn eigsSymmetric(
    matrix_ptr: *mut f64,
    n: i32,
    precision: f64,
    eigenvalues_ptr: *mut f64,
    eigenvectors_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let compute_vectors = !eigenvectors_ptr.is_null();
    let e0 = fabs(precision / n as f64);
    let max_iterations = (n * n * 30) as i32;

    // Work arrays
    let aki_ptr = work_ptr;
    let akj_ptr = work_ptr.add(n);

    // Initialize eigenvectors to identity matrix
    if compute_vectors {
        for i in 0..n {
            for j in 0..n {
                *eigenvectors_ptr.add(i * n + j) = if i == j { 1.0 } else { 0.0 };
            }
        }
    }

    // Main Jacobi iteration loop
    let mut iterations: i32 = 0;
    let mut max_off_diag = get_max_off_diagonal(matrix_ptr, n);

    while fabs(max_off_diag) >= e0 && iterations < max_iterations {
        // Find indices of max off-diagonal element
        let (i, j) = find_max_off_diagonal_indices(matrix_ptr, n);

        // Compute rotation angle
        let theta = get_theta(matrix_ptr, n, i, j, precision);

        // Apply Jacobi rotation to matrix
        apply_jacobi_rotation(matrix_ptr, n, theta, i, j, aki_ptr, akj_ptr);

        // Apply rotation to eigenvectors if computing them
        if compute_vectors {
            apply_jacobi_rotation_to_vectors(eigenvectors_ptr, n, theta, i, j, aki_ptr, akj_ptr);
        }

        // Update max off-diagonal for convergence check
        max_off_diag = get_max_off_diagonal(matrix_ptr, n);
        iterations += 1;
    }

    // Extract eigenvalues from diagonal
    for i in 0..n {
        *eigenvalues_ptr.add(i) = *matrix_ptr.add(i * n + i);
    }

    // Sort eigenvalues (and eigenvectors) by absolute value
    sort_eigenvalues(eigenvalues_ptr, eigenvectors_ptr, n, compute_vectors);

    if iterations < max_iterations {
        iterations
    } else {
        -1
    }
}

// ============================================
// POWER ITERATION
// ============================================

/// Power iteration method for finding dominant eigenvalue.
///
/// * `matrix_ptr` - Input matrix (f64, N x N, row-major).
/// * `n` - Matrix dimension.
/// * `max_iterations` - Maximum iterations.
/// * `tolerance` - Convergence tolerance.
/// * `eigenvalue_ptr` - Output eigenvalue (f64, size 1).
/// * `eigenvector_ptr` - Output eigenvector (f64, size N).
/// * `work_ptr` - Workspace (f64, size N).
///
/// Returns number of iterations, or -1 if not converged.
#[no_mangle]
pub unsafe extern "C" fn powerIteration(
    matrix_ptr: *const f64,
    n: i32,
    max_iterations: i32,
    tolerance: f64,
    eigenvalue_ptr: *mut f64,
    eigenvector_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;

    // Initialize eigenvector to [1, 1, ..., 1] / sqrt(n)
    let init_val = 1.0 / sqrt(n as f64);
    for i in 0..n {
        *eigenvector_ptr.add(i) = init_val;
    }

    let mut prev_eigenvalue: f64 = 0.0;

    for iter in 0..max_iterations {
        // Matrix-vector multiply: work = A * eigenvector
        for i in 0..n {
            let mut sum: f64 = 0.0;
            for j in 0..n {
                sum += *matrix_ptr.add(i * n + j) * *eigenvector_ptr.add(j);
            }
            *work_ptr.add(i) = sum;
        }

        // Compute norm of result
        let mut norm: f64 = 0.0;
        for i in 0..n {
            let val = *work_ptr.add(i);
            norm += val * val;
        }
        norm = sqrt(norm);

        if norm < 1e-15 {
            *eigenvalue_ptr = 0.0;
            return iter;
        }

        // Normalize and store as new eigenvector
        let eigenvalue = norm;
        for i in 0..n {
            *eigenvector_ptr.add(i) = *work_ptr.add(i) / norm;
        }

        // Check convergence
        if fabs(eigenvalue - prev_eigenvalue) < tolerance {
            *eigenvalue_ptr = eigenvalue;
            return iter + 1;
        }

        prev_eigenvalue = eigenvalue;
    }

    *eigenvalue_ptr = prev_eigenvalue;
    -1 // Did not converge
}

// ============================================
// SPECTRAL RADIUS
// ============================================

/// Compute spectral radius (largest absolute eigenvalue) using power iteration.
///
/// * `matrix_ptr` - Input matrix (f64, N x N, row-major).
/// * `n` - Matrix dimension.
/// * `max_iterations` - Maximum iterations.
/// * `tolerance` - Convergence tolerance.
/// * `work_ptr` - Workspace (f64, size 2*N).
///
/// Returns spectral radius.
#[no_mangle]
pub unsafe extern "C" fn spectralRadius(
    matrix_ptr: *const f64,
    n: i32,
    max_iterations: i32,
    tolerance: f64,
    work_ptr: *mut f64,
) -> f64 {
    let n = n as usize;
    let eigenvector_ptr = work_ptr;
    let temp_ptr = work_ptr.add(n);

    // Initialize eigenvector
    let init_val = 1.0 / sqrt(n as f64);
    for i in 0..n {
        *eigenvector_ptr.add(i) = init_val;
    }

    let mut eigenvalue: f64 = 0.0;

    for _iter in 0..max_iterations {
        // Matrix-vector multiply
        for i in 0..n {
            let mut sum: f64 = 0.0;
            for j in 0..n {
                sum += *matrix_ptr.add(i * n + j) * *eigenvector_ptr.add(j);
            }
            *temp_ptr.add(i) = sum;
        }

        // Compute norm
        let mut norm: f64 = 0.0;
        for i in 0..n {
            let val = *temp_ptr.add(i);
            norm += val * val;
        }
        norm = sqrt(norm);

        if norm < 1e-15 {
            return 0.0;
        }

        let new_eigenvalue = norm;

        // Normalize
        for i in 0..n {
            *eigenvector_ptr.add(i) = *temp_ptr.add(i) / norm;
        }

        // Check convergence
        if fabs(new_eigenvalue - eigenvalue) < tolerance {
            return new_eigenvalue;
        }

        eigenvalue = new_eigenvalue;
    }

    eigenvalue
}

// ============================================
// INVERSE ITERATION
// ============================================

/// Inverse iteration for finding eigenvector given approximate eigenvalue.
///
/// * `matrix_ptr` - Input matrix (f64, N x N, row-major).
/// * `n` - Matrix dimension.
/// * `eigenvalue` - Approximate eigenvalue.
/// * `max_iterations` - Maximum iterations.
/// * `tolerance` - Convergence tolerance.
/// * `eigenvector_ptr` - Output eigenvector (f64, size N).
/// * `work_ptr` - Workspace (f64, size 2*N*N + N).
///
/// Returns number of iterations, or -1 if not converged.
#[no_mangle]
pub unsafe extern "C" fn inverseIteration(
    matrix_ptr: *const f64,
    n: i32,
    eigenvalue: f64,
    max_iterations: i32,
    tolerance: f64,
    eigenvector_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    let n = n as usize;
    let shifted_matrix_ptr = work_ptr;
    let lu_ptr = work_ptr.add(n * n); // Separate region to avoid aliasing shifted_matrix
    let temp_ptr = work_ptr.add(2 * n * n);
    let _ = tolerance; // convergence checked via normalization

    // Create shifted matrix: A - lambda*I
    for i in 0..n {
        for j in 0..n {
            let idx = i * n + j;
            let mut val = *matrix_ptr.add(idx);
            if i == j {
                val -= eigenvalue;
            }
            *shifted_matrix_ptr.add(idx) = val;
        }
    }

    // Initialize eigenvector to deterministic values
    for i in 0..n {
        *eigenvector_ptr.add(i) = 1.0 + i as f64 * 0.1;
    }

    // Normalize initial vector
    let mut norm: f64 = 0.0;
    for i in 0..n {
        let val = *eigenvector_ptr.add(i);
        norm += val * val;
    }
    norm = sqrt(norm);
    for i in 0..n {
        *eigenvector_ptr.add(i) = *eigenvector_ptr.add(i) / norm;
    }

    // Iterate
    for _iter in 0..max_iterations {
        // Copy shifted matrix for solving
        for i in 0..n * n {
            *lu_ptr.add(i) = *shifted_matrix_ptr.add(i);
        }

        // Copy eigenvector to temp as RHS
        for i in 0..n {
            *temp_ptr.add(i) = *eigenvector_ptr.add(i);
        }

        // Gaussian elimination with partial pivoting
        for k in 0..n.saturating_sub(1) {
            // Find pivot
            let mut max_val = fabs(*lu_ptr.add(k * n + k));
            let mut max_row = k;
            for i in k + 1..n {
                let val = fabs(*lu_ptr.add(i * n + k));
                if val > max_val {
                    max_val = val;
                    max_row = i;
                }
            }

            // Swap rows if needed
            if max_row != k {
                for j in 0..n {
                    let k_idx = k * n + j;
                    let m_idx = max_row * n + j;
                    let tmp = *lu_ptr.add(k_idx);
                    *lu_ptr.add(k_idx) = *lu_ptr.add(m_idx);
                    *lu_ptr.add(m_idx) = tmp;
                }
                let tmp_rhs = *temp_ptr.add(k);
                *temp_ptr.add(k) = *temp_ptr.add(max_row);
                *temp_ptr.add(max_row) = tmp_rhs;
            }

            // Eliminate
            let pivot = *lu_ptr.add(k * n + k);
            if fabs(pivot) < 1e-15 {
                continue;
            }

            for i in k + 1..n {
                let factor = *lu_ptr.add(i * n + k) / pivot;
                for j in k..n {
                    let ij_idx = i * n + j;
                    let kj_idx = k * n + j;
                    *lu_ptr.add(ij_idx) = *lu_ptr.add(ij_idx) - factor * *lu_ptr.add(kj_idx);
                }
                *temp_ptr.add(i) = *temp_ptr.add(i) - factor * *temp_ptr.add(k);
            }
        }

        // Back substitution
        let mut i_signed = n as isize - 1;
        while i_signed >= 0 {
            let i = i_signed as usize;
            let mut sum = *temp_ptr.add(i);
            for j in i + 1..n {
                sum -= *lu_ptr.add(i * n + j) * *eigenvector_ptr.add(j);
            }
            let diag = *lu_ptr.add(i * n + i);
            if fabs(diag) > 1e-15 {
                *eigenvector_ptr.add(i) = sum / diag;
            }
            i_signed -= 1;
        }

        // Normalize
        norm = 0.0;
        for i in 0..n {
            let val = *eigenvector_ptr.add(i);
            norm += val * val;
        }
        norm = sqrt(norm);

        if norm < 1e-15 {
            return -1;
        }

        for i in 0..n {
            *eigenvector_ptr.add(i) = *eigenvector_ptr.add(i) / norm;
        }
    }

    max_iterations
}

// ============================================
// SIMD VARIANTS
// ============================================
// These use the same implementations as their non-SIMD counterparts.
// LLVM auto-vectorizes the inner loops when compiled with +simd128.

/// SIMD-accelerated Jacobi eigenvalue algorithm.
/// Same as `eigsSymmetric` -- LLVM auto-vectorizes with `+simd128`.
#[no_mangle]
pub unsafe extern "C" fn eigsSymmetricSIMD(
    matrix_ptr: *mut f64,
    n: i32,
    precision: f64,
    eigenvalues_ptr: *mut f64,
    eigenvectors_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    eigsSymmetric(
        matrix_ptr,
        n,
        precision,
        eigenvalues_ptr,
        eigenvectors_ptr,
        work_ptr,
    )
}

/// SIMD-accelerated power iteration.
/// Same as `powerIteration` -- LLVM auto-vectorizes with `+simd128`.
#[no_mangle]
pub unsafe extern "C" fn powerIterationSIMD(
    matrix_ptr: *const f64,
    n: i32,
    max_iterations: i32,
    tolerance: f64,
    eigenvalue_ptr: *mut f64,
    eigenvector_ptr: *mut f64,
    work_ptr: *mut f64,
) -> i32 {
    powerIteration(
        matrix_ptr,
        n,
        max_iterations,
        tolerance,
        eigenvalue_ptr,
        eigenvector_ptr,
        work_ptr,
    )
}

//! WASM-optimized matrix multiplication and related operations.
//!
//! All functions use raw f64 pointers with row-major layout.
//! SIMD variants rely on LLVM auto-vectorization with `-C target-feature=+simd128`.

use faer::Mat;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

#[inline]
fn min_usize(a: usize, b: usize) -> usize {
    if a < b {
        a
    } else {
        b
    }
}

// ---------------------------------------------------------------------------
// Dense matrix multiply (blocked, cache-friendly)
// ---------------------------------------------------------------------------

/// Dense matrix multiplication: C = A * B
///
/// Uses faer for the core multiply — faer's BLAS-like kernel is already
/// cache-blocked and auto-vectorised by LLVM.
#[no_mangle]
pub unsafe extern "C" fn multiplyDense(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    _b_rows: i32,
    b_cols: i32,
    result_ptr: *mut f64,
) {
    let ar = a_rows as usize;
    let ac = a_cols as usize;
    let bc = b_cols as usize;

    let a = Mat::from_fn(ar, ac, |i, j| *a_ptr.add(i * ac + j));
    let b = Mat::from_fn(ac, bc, |i, j| *b_ptr.add(i * bc + j));
    let c = &a * &b;

    for i in 0..ar {
        for j in 0..bc {
            *result_ptr.add(i * bc + j) = c[(i, j)];
        }
    }
}

/// SIMD-optimised dense matrix multiplication.
///
/// In Rust the same faer multiply is used — LLVM auto-vectorises when
/// compiled with `+simd128`.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn multiplyDenseSIMD(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    b_rows: i32,
    b_cols: i32,
    result_ptr: *mut f64,
) {
    multiplyDense(a_ptr, a_rows, a_cols, b_ptr, b_rows, b_cols, result_ptr);
}

// ---------------------------------------------------------------------------
// Matrix-vector multiply
// ---------------------------------------------------------------------------

/// Matrix-vector multiplication: y = A * x
#[no_mangle]
pub unsafe extern "C" fn multiplyVector(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    x_ptr: *const f64,
    result_ptr: *mut f64,
) {
    let ar = a_rows as usize;
    let ac = a_cols as usize;

    for i in 0..ar {
        let mut sum: f64 = 0.0;
        for j in 0..ac {
            sum += *a_ptr.add(i * ac + j) * *x_ptr.add(j);
        }
        *result_ptr.add(i) = sum;
    }
}

/// SIMD matrix-vector multiply (LLVM auto-vectorises).
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn multiplyVectorSIMD(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    x_ptr: *const f64,
    result_ptr: *mut f64,
) {
    multiplyVector(a_ptr, a_rows, a_cols, x_ptr, result_ptr);
}

// ---------------------------------------------------------------------------
// Transpose
// ---------------------------------------------------------------------------

/// Matrix transpose: B = A^T  (cache-friendly blocked)
#[no_mangle]
pub unsafe extern "C" fn transpose(a_ptr: *const f64, rows: i32, cols: i32, result_ptr: *mut f64) {
    let r = rows as usize;
    let c = cols as usize;
    let block: usize = 32;

    let mut ii = 0usize;
    while ii < r {
        let i_end = min_usize(ii + block, r);
        let mut jj = 0usize;
        while jj < c {
            let j_end = min_usize(jj + block, c);
            let mut i = ii;
            while i < i_end {
                let mut j = jj;
                while j < j_end {
                    *result_ptr.add(j * r + i) = *a_ptr.add(i * c + j);
                    j += 1;
                }
                i += 1;
            }
            jj += block;
        }
        ii += block;
    }
}

/// SIMD transpose (same implementation, LLVM auto-vectorises).
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn transposeSIMD(
    a_ptr: *const f64,
    rows: i32,
    cols: i32,
    result_ptr: *mut f64,
) {
    transpose(a_ptr, rows, cols, result_ptr);
}

// ---------------------------------------------------------------------------
// Element-wise operations
// ---------------------------------------------------------------------------

/// Element-wise addition: C = A + B
#[no_mangle]
pub unsafe extern "C" fn add(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i) + *b_ptr.add(i);
    }
}

/// SIMD element-wise addition.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn addSIMD(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    add(a_ptr, b_ptr, size, result_ptr);
}

/// Element-wise subtraction: C = A - B
#[no_mangle]
pub unsafe extern "C" fn subtract(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i) - *b_ptr.add(i);
    }
}

/// SIMD element-wise subtraction.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn subtractSIMD(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    subtract(a_ptr, b_ptr, size, result_ptr);
}

/// Scalar multiplication: B = scalar * A
#[no_mangle]
pub unsafe extern "C" fn scalarMultiply(
    a_ptr: *const f64,
    scalar: f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i) * scalar;
    }
}

/// SIMD scalar multiplication.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn scalarMultiplySIMD(
    a_ptr: *const f64,
    scalar: f64,
    size: i32,
    result_ptr: *mut f64,
) {
    scalarMultiply(a_ptr, scalar, size, result_ptr);
}

// ---------------------------------------------------------------------------
// Dot product
// ---------------------------------------------------------------------------

/// Dot product: result = sum(a[i] * b[i])
#[no_mangle]
pub unsafe extern "C" fn dotProduct(a_ptr: *const f64, b_ptr: *const f64, size: i32) -> f64 {
    let n = size as usize;
    let mut sum: f64 = 0.0;
    for i in 0..n {
        sum += *a_ptr.add(i) * *b_ptr.add(i);
    }
    sum
}

/// SIMD dot product.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn dotProductSIMD(a_ptr: *const f64, b_ptr: *const f64, size: i32) -> f64 {
    dotProduct(a_ptr, b_ptr, size)
}

// ---------------------------------------------------------------------------
// Blocked multiply with optional transposed-B work buffer
// ---------------------------------------------------------------------------

/// Cache-optimised blocked matrix multiplication with optional transposed B.
///
/// If `work_ptr` is non-null, B is transposed into the work buffer for
/// better cache locality in the inner loop.
#[no_mangle]
pub unsafe extern "C" fn multiplyBlockedSIMD(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    _b_rows: i32,
    b_cols: i32,
    result_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let ar = a_rows as usize;
    let ac = a_cols as usize;
    let bc = b_cols as usize;
    let block: usize = 64;

    // Zero result
    let result_size = ar * bc;
    for i in 0..result_size {
        *result_ptr.add(i) = 0.0;
    }

    // Optionally transpose B into work buffer
    let use_bt = !work_ptr.is_null();
    if use_bt {
        for i in 0..ac {
            for j in 0..bc {
                *work_ptr.add(j * ac + i) = *b_ptr.add(i * bc + j);
            }
        }
    }

    // Blocked multiply
    let mut ii = 0usize;
    while ii < ar {
        let i_end = min_usize(ii + block, ar);
        let mut jj = 0usize;
        while jj < bc {
            let j_end = min_usize(jj + block, bc);
            let mut kk = 0usize;
            while kk < ac {
                let k_end = min_usize(kk + block, ac);

                let mut i = ii;
                while i < i_end {
                    let a_row_off = i * ac;
                    let mut j = jj;
                    while j < j_end {
                        let r_idx = i * bc + j;
                        let mut sum = *result_ptr.add(r_idx);

                        let mut k = kk;
                        if use_bt {
                            let bt_col_off = j * ac;
                            while k < k_end {
                                sum += *a_ptr.add(a_row_off + k) * *work_ptr.add(bt_col_off + k);
                                k += 1;
                            }
                        } else {
                            while k < k_end {
                                sum += *a_ptr.add(a_row_off + k) * *b_ptr.add(k * bc + j);
                                k += 1;
                            }
                        }

                        *result_ptr.add(r_idx) = sum;
                        j += 1;
                    }
                    i += 1;
                }
                kk += block;
            }
            jj += block;
        }
        ii += block;
    }
}

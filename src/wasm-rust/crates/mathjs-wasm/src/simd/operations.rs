//! SIMD-style vector operations.
//!
//! Implemented as regular Rust loops -- LLVM auto-vectorizes with simd128 target.
//! All functions match the AssemblyScript SIMD API names exactly.

/// Vector addition: result[i] = a[i] + b[i].
#[no_mangle]
pub unsafe extern "C" fn simdAddF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) + *b_ptr.add(i);
    }
}

/// Vector subtraction: result[i] = a[i] - b[i].
#[no_mangle]
pub unsafe extern "C" fn simdSubF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) - *b_ptr.add(i);
    }
}

/// Vector multiply: result[i] = a[i] * b[i].
#[no_mangle]
pub unsafe extern "C" fn simdMulF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) * *b_ptr.add(i);
    }
}

/// Vector divide: result[i] = a[i] / b[i].
#[no_mangle]
pub unsafe extern "C" fn simdDivF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) / *b_ptr.add(i);
    }
}

/// Scalar multiply: result[i] = a[i] * scalar.
#[no_mangle]
pub unsafe extern "C" fn simdScaleF64(
    a_ptr: *const f64,
    scalar: f64,
    result_ptr: *mut f64,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) * scalar;
    }
}

/// Dot product: sum(a[i] * b[i]).
#[no_mangle]
pub unsafe extern "C" fn simdDotF64(a_ptr: *const f64, b_ptr: *const f64, length: i32) -> f64 {
    let mut sum = 0.0_f64;
    for i in 0..length as usize {
        sum += *a_ptr.add(i) * *b_ptr.add(i);
    }
    sum
}

/// Sum of array elements.
#[no_mangle]
pub unsafe extern "C" fn simdSumF64(a_ptr: *const f64, length: i32) -> f64 {
    let mut sum = 0.0_f64;
    for i in 0..length as usize {
        sum += *a_ptr.add(i);
    }
    sum
}

/// Sum of squares: sum(a[i]^2).
#[no_mangle]
pub unsafe extern "C" fn simdSumSquaresF64(a_ptr: *const f64, length: i32) -> f64 {
    let mut sum = 0.0_f64;
    for i in 0..length as usize {
        let v = *a_ptr.add(i);
        sum += v * v;
    }
    sum
}

/// L2 norm: sqrt(sum(a[i]^2)).
#[no_mangle]
pub unsafe extern "C" fn simdNormF64(a_ptr: *const f64, length: i32) -> f64 {
    libm::sqrt(unsafe { simdSumSquaresF64(a_ptr, length) })
}

/// Minimum element.
#[no_mangle]
pub unsafe extern "C" fn simdMinF64(a_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut min_val = *a_ptr;
    for i in 1..length as usize {
        let v = *a_ptr.add(i);
        if v < min_val {
            min_val = v;
        }
    }
    min_val
}

/// Maximum element.
#[no_mangle]
pub unsafe extern "C" fn simdMaxF64(a_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    let mut max_val = *a_ptr;
    for i in 1..length as usize {
        let v = *a_ptr.add(i);
        if v > max_val {
            max_val = v;
        }
    }
    max_val
}

/// Absolute value: result[i] = |a[i]|.
#[no_mangle]
pub unsafe extern "C" fn simdAbsF64(a_ptr: *const f64, result_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *result_ptr.add(i) = libm::fabs(*a_ptr.add(i));
    }
}

/// Square root: result[i] = sqrt(a[i]).
#[no_mangle]
pub unsafe extern "C" fn simdSqrtF64(a_ptr: *const f64, result_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *result_ptr.add(i) = libm::sqrt(*a_ptr.add(i));
    }
}

/// Negation: result[i] = -a[i].
#[no_mangle]
pub unsafe extern "C" fn simdNegF64(a_ptr: *const f64, result_ptr: *mut f64, length: i32) {
    for i in 0..length as usize {
        *result_ptr.add(i) = -*a_ptr.add(i);
    }
}

/// Matrix-vector multiply: result = A * x. A is m x n.
#[no_mangle]
pub unsafe extern "C" fn simdMatVecMulF64(
    a_ptr: *const f64,
    x_ptr: *const f64,
    result_ptr: *mut f64,
    m: i32,
    n: i32,
) {
    let n = n as usize;
    for i in 0..m as usize {
        let mut sum = 0.0_f64;
        let row_off = i * n;
        for j in 0..n {
            sum += *a_ptr.add(row_off + j) * *x_ptr.add(j);
        }
        *result_ptr.add(i) = sum;
    }
}

/// Matrix addition: C = A + B (m x n).
#[no_mangle]
pub unsafe extern "C" fn simdMatAddF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    c_ptr: *mut f64,
    m: i32,
    n: i32,
) {
    simdAddF64(a_ptr, b_ptr, c_ptr, m * n);
}

/// Matrix subtraction: C = A - B (m x n).
#[no_mangle]
pub unsafe extern "C" fn simdMatSubF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    c_ptr: *mut f64,
    m: i32,
    n: i32,
) {
    simdSubF64(a_ptr, b_ptr, c_ptr, m * n);
}

/// Element-wise matrix multiply (Hadamard): C = A .* B.
#[no_mangle]
pub unsafe extern "C" fn simdMatDotMulF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    c_ptr: *mut f64,
    m: i32,
    n: i32,
) {
    simdMulF64(a_ptr, b_ptr, c_ptr, m * n);
}

/// Scalar matrix multiply: B = scalar * A.
#[no_mangle]
pub unsafe extern "C" fn simdMatScaleF64(
    a_ptr: *const f64,
    scalar: f64,
    b_ptr: *mut f64,
    m: i32,
    n: i32,
) {
    simdScaleF64(a_ptr, scalar, b_ptr, m * n);
}

/// Matrix multiply: C = A * B. A is m x k, B is k x n.
#[no_mangle]
pub unsafe extern "C" fn simdMatMulF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    c_ptr: *mut f64,
    m: i32,
    k: i32,
    n: i32,
) {
    let k = k as usize;
    let n = n as usize;
    for i in 0..m as usize {
        let row_a = i * k;
        let row_c = i * n;
        for j in 0..n {
            let mut sum = 0.0_f64;
            for p in 0..k {
                sum += *a_ptr.add(row_a + p) * *b_ptr.add(p * n + j);
            }
            *c_ptr.add(row_c + j) = sum;
        }
    }
}

/// Matrix transpose: B = A^T. A is m x n, B is n x m.
#[no_mangle]
pub unsafe extern "C" fn simdMatTransposeF64(a_ptr: *const f64, b_ptr: *mut f64, m: i32, n: i32) {
    let m = m as usize;
    let n = n as usize;
    for i in 0..m {
        for j in 0..n {
            *b_ptr.add(j * m + i) = *a_ptr.add(i * n + j);
        }
    }
}

/// Mean of array.
#[no_mangle]
pub unsafe extern "C" fn simdMeanF64(a_ptr: *const f64, length: i32) -> f64 {
    if length == 0 {
        return f64::NAN;
    }
    simdSumF64(a_ptr, length) / length as f64
}

/// Variance of array (two-pass).
#[no_mangle]
pub unsafe extern "C" fn simdVarianceF64(a_ptr: *const f64, length: i32, ddof: i32) -> f64 {
    if length <= ddof {
        return f64::NAN;
    }
    let mean = simdMeanF64(a_ptr, length);
    let mut sum_sq = 0.0_f64;
    for i in 0..length as usize {
        let diff = *a_ptr.add(i) - mean;
        sum_sq += diff * diff;
    }
    sum_sq / (length - ddof) as f64
}

/// Standard deviation of array.
#[no_mangle]
pub unsafe extern "C" fn simdStdF64(a_ptr: *const f64, length: i32, ddof: i32) -> f64 {
    libm::sqrt(unsafe { simdVarianceF64(a_ptr, length, ddof) })
}

// f32 variants

/// f32 vector addition.
#[no_mangle]
pub unsafe extern "C" fn simdAddF32(
    a_ptr: *const f32,
    b_ptr: *const f32,
    result_ptr: *mut f32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) + *b_ptr.add(i);
    }
}

/// f32 vector multiply.
#[no_mangle]
pub unsafe extern "C" fn simdMulF32(
    a_ptr: *const f32,
    b_ptr: *const f32,
    result_ptr: *mut f32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = *a_ptr.add(i) * *b_ptr.add(i);
    }
}

/// f32 dot product.
#[no_mangle]
pub unsafe extern "C" fn simdDotF32(a_ptr: *const f32, b_ptr: *const f32, length: i32) -> f32 {
    let mut sum = 0.0_f32;
    for i in 0..length as usize {
        sum += *a_ptr.add(i) * *b_ptr.add(i);
    }
    sum
}

/// f32 sum.
#[no_mangle]
pub unsafe extern "C" fn simdSumF32(a_ptr: *const f32, length: i32) -> f32 {
    let mut sum = 0.0_f32;
    for i in 0..length as usize {
        sum += *a_ptr.add(i);
    }
    sum
}

// i32 variants

/// i32 vector addition.
#[no_mangle]
pub unsafe extern "C" fn simdAddI32(
    a_ptr: *const i32,
    b_ptr: *const i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = (*a_ptr.add(i)).wrapping_add(*b_ptr.add(i));
    }
}

/// i32 vector multiply.
#[no_mangle]
pub unsafe extern "C" fn simdMulI32(
    a_ptr: *const i32,
    b_ptr: *const i32,
    result_ptr: *mut i32,
    length: i32,
) {
    for i in 0..length as usize {
        *result_ptr.add(i) = (*a_ptr.add(i)).wrapping_mul(*b_ptr.add(i));
    }
}

/// Complex multiply: (a+bi)(c+di) stored interleaved.
#[no_mangle]
pub unsafe extern "C" fn simdComplexMulF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    count: i32,
) {
    for i in 0..count as usize {
        let off = i * 2;
        let ar = *a_ptr.add(off);
        let ai = *a_ptr.add(off + 1);
        let br = *b_ptr.add(off);
        let bi = *b_ptr.add(off + 1);
        *result_ptr.add(off) = ar * br - ai * bi;
        *result_ptr.add(off + 1) = ar * bi + ai * br;
    }
}

/// Complex addition (just pairwise f64 add).
#[no_mangle]
pub unsafe extern "C" fn simdComplexAddF64(
    a_ptr: *const f64,
    b_ptr: *const f64,
    result_ptr: *mut f64,
    count: i32,
) {
    simdAddF64(a_ptr, b_ptr, result_ptr, count * 2);
}

/// Check SIMD support (always true for compiled WASM).
#[no_mangle]
pub extern "C" fn simdSupported() -> i32 {
    1
}

/// Optimal f64 SIMD vector size.
#[no_mangle]
pub extern "C" fn simdVectorSizeF64() -> i32 {
    2
}

/// Optimal f32 SIMD vector size.
#[no_mangle]
pub extern "C" fn simdVectorSizeF32() -> i32 {
    4
}

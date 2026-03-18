//! Basic matrix operations: creation, diagnostics, row/column ops, reductions.
//!
//! All matrices are flat f64 arrays in row-major order.
//! Element (i, j) in a matrix with `cols` columns lives at index `i * cols + j`.
//! Pure pointer arithmetic -- no crate dependencies required.

use core::ptr;

// ============================================
// MATRIX CREATION
// ============================================

/// Create a zero matrix (rows * cols elements).
#[no_mangle]
pub unsafe extern "C" fn zeros(rows: i32, cols: i32, result_ptr: *mut f64) {
    let n = (rows as usize) * (cols as usize);
    for i in 0..n {
        *result_ptr.add(i) = 0.0;
    }
}

/// Create a ones matrix (rows * cols elements).
#[no_mangle]
pub unsafe extern "C" fn ones(rows: i32, cols: i32, result_ptr: *mut f64) {
    let n = (rows as usize) * (cols as usize);
    for i in 0..n {
        *result_ptr.add(i) = 1.0;
    }
}

/// Create an n x n identity matrix.
#[no_mangle]
pub unsafe extern "C" fn identity(n: i32, result_ptr: *mut f64) {
    let sz = n as usize;
    let total = sz * sz;
    for i in 0..total {
        *result_ptr.add(i) = 0.0;
    }
    for i in 0..sz {
        *result_ptr.add(i * sz + i) = 1.0;
    }
}

/// Fill a matrix with a constant value.
#[no_mangle]
pub unsafe extern "C" fn fill(rows: i32, cols: i32, value: f64, result_ptr: *mut f64) {
    let n = (rows as usize) * (cols as usize);
    for i in 0..n {
        *result_ptr.add(i) = value;
    }
}

/// Create a diagonal matrix from a vector.
#[no_mangle]
pub unsafe extern "C" fn diagFromVector(diag_ptr: *const f64, n: i32, result_ptr: *mut f64) {
    let sz = n as usize;
    let total = sz * sz;
    for i in 0..total {
        *result_ptr.add(i) = 0.0;
    }
    for i in 0..sz {
        *result_ptr.add(i * sz + i) = *diag_ptr.add(i);
    }
}

/// Create a matrix with ones on the k-th diagonal.
///
/// k=0 is main diagonal, k>0 upper, k<0 lower.
#[no_mangle]
pub unsafe extern "C" fn eye(n: i32, k: i32, result_ptr: *mut f64) {
    let sz = n as usize;
    let total = sz * sz;
    for i in 0..total {
        *result_ptr.add(i) = 0.0;
    }

    if k >= 0 {
        let ku = k as usize;
        if ku < sz {
            let count = sz - ku;
            for i in 0..count {
                *result_ptr.add(i * sz + (i + ku)) = 1.0;
            }
        }
    } else {
        let ku = (-k) as usize;
        if ku < sz {
            let count = sz - ku;
            for i in 0..count {
                *result_ptr.add((i + ku) * sz + i) = 1.0;
            }
        }
    }
}

// ============================================
// DIAGONAL OPERATIONS
// ============================================

/// Extract the main diagonal from a matrix. Returns element count.
#[no_mangle]
pub unsafe extern "C" fn diag(
    a_ptr: *const f64,
    rows: i32,
    cols: i32,
    result_ptr: *mut f64,
) -> i32 {
    let r = rows as usize;
    let c = cols as usize;
    let n = if r < c { r } else { c };
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i * c + i);
    }
    n as i32
}

/// Extract the k-th diagonal from a matrix. Returns element count.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn diagK(
    a_ptr: *const f64,
    rows: i32,
    cols: i32,
    k: i32,
    result_ptr: *mut f64,
) -> i32 {
    let r = rows as usize;
    let c = cols as usize;

    let (n, start_row, start_col) = if k >= 0 {
        let ku = k as usize;
        if ku >= c {
            return 0;
        }
        let remaining = c - ku;
        let n = if r < remaining { r } else { remaining };
        (n, 0usize, ku)
    } else {
        let ku = (-k) as usize;
        if ku >= r {
            return 0;
        }
        let remaining = r - ku;
        let n = if remaining < c { remaining } else { c };
        (n, ku, 0usize)
    };

    if n == 0 {
        return 0;
    }

    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add((start_row + i) * c + (start_col + i));
    }
    n as i32
}

/// Trace of a square matrix (sum of diagonal).
#[no_mangle]
pub unsafe extern "C" fn trace(a_ptr: *const f64, n: i32) -> f64 {
    let sz = n as usize;
    let mut sum: f64 = 0.0;
    for i in 0..sz {
        sum += *a_ptr.add(i * sz + i);
    }
    sum
}

/// Trace of a rectangular matrix.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn traceRect(a_ptr: *const f64, rows: i32, cols: i32) -> f64 {
    let r = rows as usize;
    let c = cols as usize;
    let n = if r < c { r } else { c };
    let mut sum: f64 = 0.0;
    for i in 0..n {
        sum += *a_ptr.add(i * c + i);
    }
    sum
}

// ============================================
// RESHAPE AND FLATTEN
// ============================================

/// Flatten (copy) a matrix to a 1-D array.
#[no_mangle]
pub unsafe extern "C" fn flatten(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    ptr::copy_nonoverlapping(a_ptr, result_ptr, n);
}

/// Reshape a matrix. Returns 1 on success, 0 if sizes do not match.
#[no_mangle]
pub unsafe extern "C" fn reshape(
    a_ptr: *const f64,
    old_rows: i32,
    old_cols: i32,
    new_rows: i32,
    new_cols: i32,
    result_ptr: *mut f64,
) -> i32 {
    let old_size = (old_rows as usize) * (old_cols as usize);
    let new_size = (new_rows as usize) * (new_cols as usize);
    if old_size != new_size {
        return 0;
    }
    ptr::copy_nonoverlapping(a_ptr, result_ptr, new_size);
    1
}

/// Squeeze (copy). For flat arrays this is just a copy.
#[no_mangle]
pub unsafe extern "C" fn squeeze(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    ptr::copy_nonoverlapping(a_ptr, result_ptr, n);
}

// ============================================
// MATRIX PROPERTIES
// ============================================

/// Count non-zero elements.
#[no_mangle]
pub unsafe extern "C" fn countNonZero(a_ptr: *const f64, size: i32) -> i32 {
    let n = size as usize;
    let mut count: i32 = 0;
    for i in 0..n {
        if *a_ptr.add(i) != 0.0 {
            count += 1;
        }
    }
    count
}

/// Minimum value. Returns NaN for empty arrays.
#[export_name = "matrixMin"]
pub unsafe extern "C" fn matrix_min(a_ptr: *const f64, size: i32) -> f64 {
    let n = size as usize;
    if n == 0 {
        return f64::NAN;
    }
    let mut val = *a_ptr;
    for i in 1..n {
        let v = *a_ptr.add(i);
        if v < val {
            val = v;
        }
    }
    val
}

/// Maximum value. Returns NaN for empty arrays.
#[export_name = "matrixMax"]
pub unsafe extern "C" fn matrix_max(a_ptr: *const f64, size: i32) -> f64 {
    let n = size as usize;
    if n == 0 {
        return f64::NAN;
    }
    let mut val = *a_ptr;
    for i in 1..n {
        let v = *a_ptr.add(i);
        if v > val {
            val = v;
        }
    }
    val
}

/// Index of minimum value. Returns -1 for empty arrays.
#[export_name = "matrixArgmin"]
pub unsafe extern "C" fn matrix_argmin(a_ptr: *const f64, size: i32) -> i32 {
    let n = size as usize;
    if n == 0 {
        return -1;
    }
    let mut idx: usize = 0;
    let mut val = *a_ptr;
    for i in 1..n {
        let v = *a_ptr.add(i);
        if v < val {
            val = v;
            idx = i;
        }
    }
    idx as i32
}

/// Index of maximum value. Returns -1 for empty arrays.
#[export_name = "matrixArgmax"]
pub unsafe extern "C" fn matrix_argmax(a_ptr: *const f64, size: i32) -> i32 {
    let n = size as usize;
    if n == 0 {
        return -1;
    }
    let mut idx: usize = 0;
    let mut val = *a_ptr;
    for i in 1..n {
        let v = *a_ptr.add(i);
        if v > val {
            val = v;
            idx = i;
        }
    }
    idx as i32
}

// ============================================
// ROW AND COLUMN OPERATIONS
// ============================================

/// Extract a row from a matrix.
#[no_mangle]
pub unsafe extern "C" fn getRow(a_ptr: *const f64, cols: i32, row: i32, result_ptr: *mut f64) {
    let c = cols as usize;
    let off = (row as usize) * c;
    ptr::copy_nonoverlapping(a_ptr.add(off), result_ptr, c);
}

/// Extract a column from a matrix.
#[no_mangle]
pub unsafe extern "C" fn getColumn(
    a_ptr: *const f64,
    rows: i32,
    cols: i32,
    col: i32,
    result_ptr: *mut f64,
) {
    let r = rows as usize;
    let c = cols as usize;
    let co = col as usize;
    for i in 0..r {
        *result_ptr.add(i) = *a_ptr.add(i * c + co);
    }
}

/// Set a row in a matrix (in-place).
#[no_mangle]
pub unsafe extern "C" fn setRow(a_ptr: *mut f64, cols: i32, row: i32, values_ptr: *const f64) {
    let c = cols as usize;
    let off = (row as usize) * c;
    ptr::copy_nonoverlapping(values_ptr, a_ptr.add(off), c);
}

/// Set a column in a matrix (in-place).
#[no_mangle]
pub unsafe extern "C" fn setColumn(
    a_ptr: *mut f64,
    rows: i32,
    cols: i32,
    col: i32,
    values_ptr: *const f64,
) {
    let r = rows as usize;
    let c = cols as usize;
    let co = col as usize;
    for i in 0..r {
        *a_ptr.add(i * c + co) = *values_ptr.add(i);
    }
}

/// Swap two rows in a matrix (in-place).
#[no_mangle]
pub unsafe extern "C" fn swapRows(a_ptr: *mut f64, cols: i32, row1: i32, row2: i32) {
    let c = cols as usize;
    let off1 = (row1 as usize) * c;
    let off2 = (row2 as usize) * c;
    for j in 0..c {
        let tmp = *a_ptr.add(off1 + j);
        *a_ptr.add(off1 + j) = *a_ptr.add(off2 + j);
        *a_ptr.add(off2 + j) = tmp;
    }
}

/// Swap two columns in a matrix (in-place).
#[no_mangle]
pub unsafe extern "C" fn swapColumns(a_ptr: *mut f64, rows: i32, cols: i32, col1: i32, col2: i32) {
    let r = rows as usize;
    let c = cols as usize;
    let c1 = col1 as usize;
    let c2 = col2 as usize;
    for i in 0..r {
        let idx1 = i * c + c1;
        let idx2 = i * c + c2;
        let tmp = *a_ptr.add(idx1);
        *a_ptr.add(idx1) = *a_ptr.add(idx2);
        *a_ptr.add(idx2) = tmp;
    }
}

// ============================================
// ELEMENT-WISE OPERATIONS
// ============================================

/// Element-wise multiplication (Hadamard product).
#[no_mangle]
pub unsafe extern "C" fn dotMultiply(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i) * *b_ptr.add(i);
    }
}

/// Element-wise division.
#[no_mangle]
pub unsafe extern "C" fn dotDivide(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = *a_ptr.add(i) / *b_ptr.add(i);
    }
}

/// Element-wise power.
#[no_mangle]
pub unsafe extern "C" fn dotPow(
    a_ptr: *const f64,
    b_ptr: *const f64,
    size: i32,
    result_ptr: *mut f64,
) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = libm::pow(*a_ptr.add(i), *b_ptr.add(i));
    }
}

/// Element-wise absolute value.
#[export_name = "matrixAbs"]
pub unsafe extern "C" fn matrix_abs(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    for i in 0..n {
        let v = *a_ptr.add(i);
        *result_ptr.add(i) = if v >= 0.0 { v } else { -v };
    }
}

/// Element-wise square root.
#[export_name = "matrixSqrt"]
pub unsafe extern "C" fn matrix_sqrt(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    for i in 0..n {
        *result_ptr.add(i) = libm::sqrt(*a_ptr.add(i));
    }
}

/// Element-wise square.
#[export_name = "matrixSquare"]
pub unsafe extern "C" fn matrix_square(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    for i in 0..n {
        let v = *a_ptr.add(i);
        *result_ptr.add(i) = v * v;
    }
}

// ============================================
// REDUCTION OPERATIONS
// ============================================

/// Sum of all elements.
#[export_name = "matrixSum"]
pub unsafe extern "C" fn matrix_sum(a_ptr: *const f64, size: i32) -> f64 {
    let n = size as usize;
    let mut total: f64 = 0.0;
    for i in 0..n {
        total += *a_ptr.add(i);
    }
    total
}

/// Product of all elements.
#[export_name = "matrixProd"]
pub unsafe extern "C" fn matrix_prod(a_ptr: *const f64, size: i32) -> f64 {
    let n = size as usize;
    let mut total: f64 = 1.0;
    for i in 0..n {
        total *= *a_ptr.add(i);
    }
    total
}

/// Sum along rows -- result is a vector of length `rows`.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn sumRows(a_ptr: *const f64, rows: i32, cols: i32, result_ptr: *mut f64) {
    let r = rows as usize;
    let c = cols as usize;
    for i in 0..r {
        let mut s: f64 = 0.0;
        let off = i * c;
        for j in 0..c {
            s += *a_ptr.add(off + j);
        }
        *result_ptr.add(i) = s;
    }
}

/// Sum along columns -- result is a vector of length `cols`.
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn sumCols(a_ptr: *const f64, rows: i32, cols: i32, result_ptr: *mut f64) {
    let r = rows as usize;
    let c = cols as usize;
    for j in 0..c {
        *result_ptr.add(j) = 0.0;
    }
    for i in 0..r {
        for j in 0..c {
            *result_ptr.add(j) += *a_ptr.add(i * c + j);
        }
    }
}

// ============================================
// COPY AND CLONE
// ============================================

/// Clone (copy) a matrix.
#[no_mangle]
pub unsafe extern "C" fn clone(a_ptr: *const f64, size: i32, result_ptr: *mut f64) {
    let n = size as usize;
    ptr::copy_nonoverlapping(a_ptr, result_ptr, n);
}

/// Copy values from source to destination.
#[no_mangle]
pub unsafe extern "C" fn copy(src_ptr: *const f64, dst_ptr: *mut f64, size: i32) {
    let n = size as usize;
    ptr::copy_nonoverlapping(src_ptr, dst_ptr, n);
}

/// Fill a matrix with a value (in-place).
#[inline(never)]
#[no_mangle]
pub unsafe extern "C" fn fillInPlace(a_ptr: *mut f64, size: i32, value: f64) {
    let n = size as usize;
    for i in 0..n {
        *a_ptr.add(i) = value;
    }
}

// ============================================
// CONCATENATION
// ============================================

/// Concatenate two matrices horizontally (same row count).
#[no_mangle]
pub unsafe extern "C" fn concatHorizontal(
    a_ptr: *const f64,
    a_rows: i32,
    a_cols: i32,
    b_ptr: *const f64,
    b_cols: i32,
    result_ptr: *mut f64,
) {
    let r = a_rows as usize;
    let ac = a_cols as usize;
    let bc = b_cols as usize;
    let nc = ac + bc;

    for i in 0..r {
        for j in 0..ac {
            *result_ptr.add(i * nc + j) = *a_ptr.add(i * ac + j);
        }
        for j in 0..bc {
            *result_ptr.add(i * nc + ac + j) = *b_ptr.add(i * bc + j);
        }
    }
}

/// Concatenate two matrices vertically (same column count).
#[no_mangle]
pub unsafe extern "C" fn concatVertical(
    a_ptr: *const f64,
    a_rows: i32,
    cols: i32,
    b_ptr: *const f64,
    b_rows: i32,
    result_ptr: *mut f64,
) {
    let a_size = (a_rows as usize) * (cols as usize);
    let b_size = (b_rows as usize) * (cols as usize);

    ptr::copy_nonoverlapping(a_ptr, result_ptr, a_size);
    ptr::copy_nonoverlapping(b_ptr, result_ptr.add(a_size), b_size);
}

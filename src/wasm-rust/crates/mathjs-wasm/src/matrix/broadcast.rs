//! Broadcasting element-wise operations
//!
//! Port of AssemblyScript broadcast.ts — 16 exported functions.
//! Implements NumPy-style broadcasting for element-wise ops between
//! matrices of compatible but different shapes.
//! Pure pointer arithmetic, no crate dependencies.

use libm::pow;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

#[inline(always)]
unsafe fn ld_i32(base: *const i32, off: usize) -> i32 {
    *base.add(off)
}
#[inline(always)]
unsafe fn st_i32(base: *mut i32, off: usize, v: i32) {
    *base.add(off) = v;
}
#[inline(always)]
unsafe fn ld_f64(base: *const f64, off: usize) -> f64 {
    *base.add(off)
}
#[inline(always)]
unsafe fn st_f64(base: *mut f64, off: usize, v: f64) {
    *base.add(off) = v;
}

#[inline(always)]
fn get_broadcast_index(
    out_idx: i32,
    _out_rows: i32,
    out_cols: i32,
    in_rows: i32,
    in_cols: i32,
) -> i32 {
    let out_row = out_idx / out_cols;
    let out_col = out_idx % out_cols;
    let in_row = if in_rows == 1 { 0 } else { out_row };
    let in_col = if in_cols == 1 { 0 } else { out_col };
    in_row * in_cols + in_col
}

#[inline(always)]
fn broadcast_out_dim(d1: i32, d2: i32) -> i32 {
    if d1 > d2 {
        d1
    } else if d2 > 1 {
        d2
    } else {
        d1
    }
}

#[inline(always)]
fn check_compat(r1: i32, c1: i32, r2: i32, c2: i32) -> bool {
    (r1 == r2 || r1 == 1 || r2 == 1) && (c1 == c2 || c1 == 1 || c2 == 1)
}

// ---------------------------------------------------------------------------
// Shape utilities
// ---------------------------------------------------------------------------

/// Check if two shapes are compatible for broadcasting.
#[no_mangle]
pub unsafe extern "C" fn canBroadcast(shape1_ptr: i32, n1: i32, shape2_ptr: i32, n2: i32) -> i32 {
    let s1 = shape1_ptr as usize as *const i32;
    let s2 = shape2_ptr as usize as *const i32;
    let max_len = if n1 > n2 { n1 } else { n2 };

    for i in 0..max_len {
        let d1 = if i < n1 {
            ld_i32(s1, (n1 - 1 - i) as usize)
        } else {
            1
        };
        let d2 = if i < n2 {
            ld_i32(s2, (n2 - 1 - i) as usize)
        } else {
            1
        };
        if d1 != d2 && d1 != 1 && d2 != 1 {
            return 0;
        }
    }
    1
}

/// Compute the output shape after broadcasting two shapes.
/// Returns length of result shape, or 0 if incompatible.
#[no_mangle]
pub unsafe extern "C" fn broadcastShape(
    shape1_ptr: i32,
    n1: i32,
    shape2_ptr: i32,
    n2: i32,
    result_ptr: i32,
) -> i32 {
    let s1 = shape1_ptr as usize as *const i32;
    let s2 = shape2_ptr as usize as *const i32;
    let r = result_ptr as usize as *mut i32;
    let max_len = if n1 > n2 { n1 } else { n2 };

    for i in 0..max_len {
        let d1 = if i < n1 {
            ld_i32(s1, (n1 - 1 - i) as usize)
        } else {
            1
        };
        let d2 = if i < n2 {
            ld_i32(s2, (n2 - 1 - i) as usize)
        } else {
            1
        };

        if d1 == d2 {
            st_i32(r, (max_len - 1 - i) as usize, d1);
        } else if d1 == 1 {
            st_i32(r, (max_len - 1 - i) as usize, d2);
        } else if d2 == 1 {
            st_i32(r, (max_len - 1 - i) as usize, d1);
        } else {
            return 0;
        }
    }

    max_len
}

// ---------------------------------------------------------------------------
// Matrix-Matrix broadcast operations
// ---------------------------------------------------------------------------

/// Broadcast multiply two matrices element-wise.
#[no_mangle]
pub unsafe extern "C" fn broadcastMultiply(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, ld_f64(a, ia) * ld_f64(b, ib));
    }
    1
}

/// Broadcast divide two matrices element-wise (A / B).
#[no_mangle]
pub unsafe extern "C" fn broadcastDivide(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, ld_f64(a, ia) / ld_f64(b, ib));
    }
    1
}

/// Broadcast add two matrices element-wise.
#[no_mangle]
pub unsafe extern "C" fn broadcastAdd(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, ld_f64(a, ia) + ld_f64(b, ib));
    }
    1
}

/// Broadcast subtract two matrices element-wise (A - B).
#[no_mangle]
pub unsafe extern "C" fn broadcastSubtract(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, ld_f64(a, ia) - ld_f64(b, ib));
    }
    1
}

/// Broadcast power two matrices element-wise (A ^ B).
#[no_mangle]
pub unsafe extern "C" fn broadcastPow(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, pow(ld_f64(a, ia), ld_f64(b, ib)));
    }
    1
}

/// Broadcast minimum of two matrices element-wise.
#[no_mangle]
pub unsafe extern "C" fn broadcastMin(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        let va = ld_f64(a, ia);
        let vb = ld_f64(b, ib);
        st_f64(res, i as usize, if va < vb { va } else { vb });
    }
    1
}

/// Broadcast maximum of two matrices element-wise.
#[no_mangle]
pub unsafe extern "C" fn broadcastMax(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        let va = ld_f64(a, ia);
        let vb = ld_f64(b, ib);
        st_f64(res, i as usize, if va > vb { va } else { vb });
    }
    1
}

/// Broadcast modulo of two matrices element-wise (A % B).
#[no_mangle]
pub unsafe extern "C" fn broadcastMod(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(res, i as usize, libm::fmod(ld_f64(a, ia), ld_f64(b, ib)));
    }
    1
}

/// Broadcast equality comparison (A == B), returns 1.0 or 0.0.
#[no_mangle]
pub unsafe extern "C" fn broadcastEqual(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    tol: f64,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        let v = if libm::fabs(ld_f64(a, ia) - ld_f64(b, ib)) < tol {
            1.0
        } else {
            0.0
        };
        st_f64(res, i as usize, v);
    }
    1
}

/// Broadcast less-than comparison (A < B), returns 1.0 or 0.0.
#[no_mangle]
pub unsafe extern "C" fn broadcastLess(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(
            res,
            i as usize,
            if ld_f64(a, ia) < ld_f64(b, ib) {
                1.0
            } else {
                0.0
            },
        );
    }
    1
}

/// Broadcast greater-than comparison (A > B), returns 1.0 or 0.0.
#[no_mangle]
pub unsafe extern "C" fn broadcastGreater(
    a_ptr: i32,
    rows1: i32,
    cols1: i32,
    b_ptr: i32,
    rows2: i32,
    cols2: i32,
    result_ptr: i32,
    out_rows_ptr: i32,
    out_cols_ptr: i32,
) -> i32 {
    if !check_compat(rows1, cols1, rows2, cols2) {
        return 0;
    }
    let out_rows = broadcast_out_dim(rows1, rows2);
    let out_cols = broadcast_out_dim(cols1, cols2);
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    st_i32(out_rows_ptr as usize as *mut i32, 0, out_rows);
    st_i32(out_cols_ptr as usize as *mut i32, 0, out_cols);
    let total = out_rows * out_cols;
    for i in 0..total {
        let ia = get_broadcast_index(i, out_rows, out_cols, rows1, cols1) as usize;
        let ib = get_broadcast_index(i, out_rows, out_cols, rows2, cols2) as usize;
        st_f64(
            res,
            i as usize,
            if ld_f64(a, ia) > ld_f64(b, ib) {
                1.0
            } else {
                0.0
            },
        );
    }
    1
}

// ---------------------------------------------------------------------------
// Scalar broadcast operations
// ---------------------------------------------------------------------------

/// Scalar broadcast - multiply matrix by scalar.
#[no_mangle]
pub unsafe extern "C" fn broadcastScalarMultiply(a_ptr: i32, n: i32, scalar: f64, result_ptr: i32) {
    let a = a_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    for i in 0..n as usize {
        st_f64(res, i, ld_f64(a, i) * scalar);
    }
}

/// Scalar broadcast - add scalar to matrix.
#[no_mangle]
pub unsafe extern "C" fn broadcastScalarAdd(a_ptr: i32, n: i32, scalar: f64, result_ptr: i32) {
    let a = a_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;
    for i in 0..n as usize {
        st_f64(res, i, ld_f64(a, i) + scalar);
    }
}

/// Apply operation element-wise on same-shape matrices.
/// op: 0=add, 1=sub, 2=mul, 3=div, 4=pow, 5=min, 6=max, 7=mod.
#[no_mangle]
pub unsafe extern "C" fn broadcastApply(
    a_ptr: i32,
    b_ptr: i32,
    n: i32,
    op: i32,
    result_ptr: i32,
) -> i32 {
    let a = a_ptr as usize as *const f64;
    let b = b_ptr as usize as *const f64;
    let res = result_ptr as usize as *mut f64;

    for i in 0..n as usize {
        let va = ld_f64(a, i);
        let vb = ld_f64(b, i);
        let r = match op {
            0 => va + vb,
            1 => va - vb,
            2 => va * vb,
            3 => va / vb,
            4 => pow(va, vb),
            5 => {
                if va < vb {
                    va
                } else {
                    vb
                }
            }
            6 => {
                if va > vb {
                    va
                } else {
                    vb
                }
            }
            7 => libm::fmod(va, vb),
            _ => 0.0,
        };
        st_f64(res, i, r);
    }

    1
}

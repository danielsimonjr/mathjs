//! Dense/sparse combination algorithms for binary operators
//!
//! Port of AssemblyScript algorithms.ts — 8 exported functions.
//! These implement MatAlgo01–MatAlgo08 from math.js for combining
//! dense and sparse matrices under binary operations.
//! Pure pointer arithmetic, no crate dependencies.

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
fn apply_operation(a: f64, b: f64, operation: i32) -> f64 {
    match operation {
        0 => a + b,
        1 => a - b,
        2 => a * b,
        3 => a / b,
        _ => 0.0,
    }
}

// ---------------------------------------------------------------------------
// Algorithm 01: Dense-Sparse Identity
// ---------------------------------------------------------------------------

/// Dense-Sparse Identity (Algorithm 01).
/// C(i,j) = f(D(i,j), S(i,j)) for S(i,j) != 0, else D(i,j).
/// Result is dense.
#[no_mangle]
pub unsafe extern "C" fn algo01DenseSparseDensity(
    dense_data_ptr: i32,
    rows: i32,
    cols: i32,
    sparse_values_ptr: i32,
    sparse_index_ptr: i32,
    sparse_ptr_ptr: i32,
    result_ptr: i32,
    operation: i32,
) {
    let dd = dense_data_ptr as usize as *const f64;
    let sv = sparse_values_ptr as usize as *const f64;
    let si = sparse_index_ptr as usize as *const i32;
    let sp = sparse_ptr_ptr as usize as *const i32;
    let res = result_ptr as usize as *mut f64;
    let size = (rows * cols) as usize;

    // Copy dense to result
    for i in 0..size {
        st_f64(res, i, ld_f64(dd, i));
    }

    // Process each column
    for j in 0..cols {
        let ju = j as usize;
        let p_start = ld_i32(sp, ju);
        let p_end = ld_i32(sp, ju + 1);

        for k in p_start..p_end {
            let ku = k as usize;
            let i = ld_i32(si, ku);
            let idx = (i * cols + j) as usize;
            let dense_val = ld_f64(dd, idx);
            let sparse_val = ld_f64(sv, ku);
            st_f64(res, idx, apply_operation(dense_val, sparse_val, operation));
        }
    }
}

// ---------------------------------------------------------------------------
// Algorithm 02: Dense-Sparse Zero
// ---------------------------------------------------------------------------

/// Dense-Sparse Zero (Algorithm 02).
/// Result is sparse: C(i,j) = f(D(i,j), S(i,j)) for S(i,j) != 0, else 0.
/// Returns number of nonzeros in result.
#[no_mangle]
pub unsafe extern "C" fn algo02DenseSparseZero(
    dense_data_ptr: i32,
    rows: i32,
    cols: i32,
    sparse_values_ptr: i32,
    sparse_index_ptr: i32,
    sparse_ptr_ptr: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
) -> i32 {
    let dd = dense_data_ptr as usize as *const f64;
    let sv = sparse_values_ptr as usize as *const f64;
    let si = sparse_index_ptr as usize as *const i32;
    let sp = sparse_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let p_start = ld_i32(sp, ju);
        let p_end = ld_i32(sp, ju + 1);

        for k in p_start..p_end {
            let ku = k as usize;
            let i = ld_i32(si, ku);
            let dense_val = ld_f64(dd, (i * cols + j) as usize);
            let sparse_val = ld_f64(sv, ku);
            let value = apply_operation(dense_val, sparse_val, operation);

            if value != 0.0 {
                let nzu = nnz as usize;
                st_f64(rv, nzu, value);
                st_i32(ri, nzu, i);
                nnz += 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

// ---------------------------------------------------------------------------
// Algorithm 03: Dense-Sparse Function
// ---------------------------------------------------------------------------

/// Dense-Sparse Function (Algorithm 03).
/// Processes all elements: f(D(i,j), S(i,j)) or f(D(i,j), 0).
/// Result is dense.
#[no_mangle]
pub unsafe extern "C" fn algo03DenseSparseFunction(
    dense_data_ptr: i32,
    rows: i32,
    cols: i32,
    sparse_values_ptr: i32,
    sparse_index_ptr: i32,
    sparse_ptr_ptr: i32,
    result_ptr: i32,
    operation: i32,
    work_ptr: i32,
) {
    let dd = dense_data_ptr as usize as *const f64;
    let sv = sparse_values_ptr as usize as *const f64;
    let si = sparse_index_ptr as usize as *const i32;
    let sp = sparse_ptr_ptr as usize as *const i32;
    let res = result_ptr as usize as *mut f64;
    let ru = rows as usize;

    let workspace = work_ptr as usize as *mut f64;
    let marks = (work_ptr as usize as *mut u8).add(ru * 8) as *mut i32;

    for j in 0..cols {
        let ju = j as usize;
        let mark = j + 1;
        let p_start = ld_i32(sp, ju);
        let p_end = ld_i32(sp, ju + 1);

        for k in p_start..p_end {
            let ku = k as usize;
            let i = ld_i32(si, ku);
            let iu = i as usize;
            let dense_val = ld_f64(dd, (i * cols + j) as usize);
            let sparse_val = ld_f64(sv, ku);
            st_f64(
                workspace,
                iu,
                apply_operation(dense_val, sparse_val, operation),
            );
            st_i32(marks, iu, mark);
        }

        for i in 0..rows {
            let iu = i as usize;
            let idx = (i * cols + j) as usize;
            if ld_i32(marks, iu) == mark {
                st_f64(res, idx, ld_f64(workspace, iu));
            } else {
                st_f64(res, idx, apply_operation(ld_f64(dd, idx), 0.0, operation));
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Algorithm 04: Sparse-Sparse Identity-Identity
// ---------------------------------------------------------------------------

/// Sparse-Sparse Identity (Algorithm 04).
/// Union of nonzeros: C(i,j) = f(A,B) if both, else A or B.
/// Returns number of nonzeros.
#[no_mangle]
pub unsafe extern "C" fn algo04SparseIdentity(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    rows: i32,
    cols: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;
    let ru = rows as usize;

    let xa = work_ptr as usize as *mut f64;
    let xb = xa.add(ru);
    let wa = (work_ptr as usize as *mut u8).add(ru * 16) as *mut i32;
    let wb = wa.add(ru);

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let mark = j + 1;
        let col_start = nnz;

        // Scatter A(:,j)
        let a_start = ld_i32(ap, ju);
        let a_end = ld_i32(ap, ju + 1);
        for k in a_start..a_end {
            let ku = k as usize;
            let i = ld_i32(ai, ku) as usize;
            st_i32(ri, nnz as usize, i as i32);
            nnz += 1;
            st_i32(wa, i, mark);
            st_f64(xa, i, ld_f64(av, ku));
        }

        // Scatter B(:,j) and merge
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);
        for k in b_start..b_end {
            let ku = k as usize;
            let i = ld_i32(bi, ku) as usize;
            if ld_i32(wa, i) == mark {
                st_f64(
                    xa,
                    i,
                    apply_operation(ld_f64(xa, i), ld_f64(bv, ku), operation),
                );
            } else {
                st_i32(ri, nnz as usize, i as i32);
                nnz += 1;
                st_i32(wb, i, mark);
                st_f64(xb, i, ld_f64(bv, ku));
            }
        }

        // Gather values
        let mut p = col_start;
        while p < nnz {
            let i = ld_i32(ri, p as usize) as usize;
            if ld_i32(wa, i) == mark {
                st_f64(rv, p as usize, ld_f64(xa, i));
                p += 1;
            } else if ld_i32(wb, i) == mark {
                st_f64(rv, p as usize, ld_f64(xb, i));
                p += 1;
            } else {
                // Remove
                for q in p..(nnz - 1) {
                    st_i32(ri, q as usize, ld_i32(ri, (q + 1) as usize));
                }
                nnz -= 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

// ---------------------------------------------------------------------------
// Algorithm 05: Sparse-Sparse Function-Function
// ---------------------------------------------------------------------------

/// Sparse-Sparse Function-Function (Algorithm 05).
/// Union of nonzeros, treating missing as 0.
/// Returns number of nonzeros.
#[no_mangle]
pub unsafe extern "C" fn algo05SparseFunctionFunction(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    rows: i32,
    cols: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;
    let ru = rows as usize;

    let xa = work_ptr as usize as *mut f64;
    let xb = xa.add(ru);
    let wa = (work_ptr as usize as *mut u8).add(ru * 16) as *mut i32;
    let wb = wa.add(ru);

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let mark = j + 1;
        let col_start = nnz;

        // Scatter A(:,j)
        let a_start = ld_i32(ap, ju);
        let a_end = ld_i32(ap, ju + 1);
        for k in a_start..a_end {
            let ku = k as usize;
            let i = ld_i32(ai, ku) as usize;
            st_i32(ri, nnz as usize, i as i32);
            nnz += 1;
            st_i32(wa, i, mark);
            st_f64(xa, i, ld_f64(av, ku));
        }

        // Scatter B(:,j)
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);
        for k in b_start..b_end {
            let ku = k as usize;
            let i = ld_i32(bi, ku) as usize;
            if ld_i32(wa, i) != mark {
                st_i32(ri, nnz as usize, i as i32);
                nnz += 1;
            }
            st_i32(wb, i, mark);
            st_f64(xb, i, ld_f64(bv, ku));
        }

        // Compute and gather
        let mut p = col_start;
        while p < nnz {
            let i = ld_i32(ri, p as usize) as usize;
            let va = if ld_i32(wa, i) == mark {
                ld_f64(xa, i)
            } else {
                0.0
            };
            let vb = if ld_i32(wb, i) == mark {
                ld_f64(xb, i)
            } else {
                0.0
            };
            let vc = apply_operation(va, vb, operation);

            if vc != 0.0 {
                st_f64(rv, p as usize, vc);
                p += 1;
            } else {
                for q in p..(nnz - 1) {
                    st_i32(ri, q as usize, ld_i32(ri, (q + 1) as usize));
                }
                nnz -= 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

// ---------------------------------------------------------------------------
// Algorithm 06: Sparse-Sparse Zero-Zero
// ---------------------------------------------------------------------------

/// Sparse-Sparse Zero-Zero (Algorithm 06).
/// Intersection only: C(i,j) = f(A,B) where both nonzero.
/// Returns number of nonzeros.
#[no_mangle]
pub unsafe extern "C" fn algo06SparseZeroZero(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    rows: i32,
    cols: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;
    let ru = rows as usize;

    let workspace = work_ptr as usize as *mut f64;
    let wa = (work_ptr as usize as *mut u8).add(ru * 8) as *mut i32;
    let updated = wa.add(ru);

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let mark = j + 1;
        let col_start = nnz;

        // Scatter A(:,j)
        let a_start = ld_i32(ap, ju);
        let a_end = ld_i32(ap, ju + 1);
        for k in a_start..a_end {
            let ku = k as usize;
            let i = ld_i32(ai, ku) as usize;
            st_i32(ri, nnz as usize, i as i32);
            nnz += 1;
            st_i32(wa, i, mark);
            st_f64(workspace, i, ld_f64(av, ku));
        }

        // Process B(:,j)
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);
        for k in b_start..b_end {
            let ku = k as usize;
            let i = ld_i32(bi, ku) as usize;
            if ld_i32(wa, i) == mark {
                st_f64(
                    workspace,
                    i,
                    apply_operation(ld_f64(workspace, i), ld_f64(bv, ku), operation),
                );
                st_i32(updated, i, mark);
            }
        }

        // Keep only intersection
        let mut p = col_start;
        while p < nnz {
            let i = ld_i32(ri, p as usize) as usize;
            if ld_i32(updated, i) == mark {
                let val = ld_f64(workspace, i);
                if val != 0.0 {
                    st_f64(rv, p as usize, val);
                    p += 1;
                } else {
                    for q in p..(nnz - 1) {
                        st_i32(ri, q as usize, ld_i32(ri, (q + 1) as usize));
                    }
                    nnz -= 1;
                }
            } else {
                for q in p..(nnz - 1) {
                    st_i32(ri, q as usize, ld_i32(ri, (q + 1) as usize));
                }
                nnz -= 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

// ---------------------------------------------------------------------------
// Algorithm 07: Sparse-Sparse Full
// ---------------------------------------------------------------------------

/// Sparse-Sparse Full (Algorithm 07).
/// All elements: C(i,j) = f(A,B) treating missing as 0. Result is sparse.
/// Returns number of nonzeros.
#[no_mangle]
pub unsafe extern "C" fn algo07SparseSparseFull(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    rows: i32,
    cols: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;
    let ru = rows as usize;

    let xa = work_ptr as usize as *mut f64;
    let xb = xa.add(ru);
    let wa = (work_ptr as usize as *mut u8).add(ru * 16) as *mut i32;
    let wb = wa.add(ru);

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let mark = j + 1;

        // Scatter A(:,j)
        let a_start = ld_i32(ap, ju);
        let a_end = ld_i32(ap, ju + 1);
        for k in a_start..a_end {
            let ku = k as usize;
            let i = ld_i32(ai, ku) as usize;
            st_i32(wa, i, mark);
            st_f64(xa, i, ld_f64(av, ku));
        }

        // Scatter B(:,j)
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);
        for k in b_start..b_end {
            let ku = k as usize;
            let i = ld_i32(bi, ku) as usize;
            st_i32(wb, i, mark);
            st_f64(xb, i, ld_f64(bv, ku));
        }

        // Process all rows
        for i in 0..rows {
            let iu = i as usize;
            let va = if ld_i32(wa, iu) == mark {
                ld_f64(xa, iu)
            } else {
                0.0
            };
            let vb = if ld_i32(wb, iu) == mark {
                ld_f64(xb, iu)
            } else {
                0.0
            };
            let vc = apply_operation(va, vb, operation);

            if vc != 0.0 {
                st_i32(ri, nnz as usize, i);
                st_f64(rv, nnz as usize, vc);
                nnz += 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

// ---------------------------------------------------------------------------
// Algorithm 08: Sparse-Sparse Zero-Identity
// ---------------------------------------------------------------------------

/// Sparse-Sparse Zero-Identity (Algorithm 08).
/// A's nonzeros: f(A,B) where both, else A if nonzero, else 0.
/// Returns number of nonzeros.
#[no_mangle]
pub unsafe extern "C" fn algo08SparseZeroIdentity(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    rows: i32,
    cols: i32,
    result_values_ptr: i32,
    result_index_ptr: i32,
    result_ptr_ptr: i32,
    operation: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let rv = result_values_ptr as usize as *mut f64;
    let ri = result_index_ptr as usize as *mut i32;
    let rp = result_ptr_ptr as usize as *mut i32;
    let ru = rows as usize;

    let workspace = work_ptr as usize as *mut f64;
    let marks = (work_ptr as usize as *mut u8).add(ru * 8) as *mut i32;

    let mut nnz: i32 = 0;

    for j in 0..cols {
        let ju = j as usize;
        st_i32(rp, ju, nnz);
        let mark = j + 1;
        let col_start = nnz;

        // Scatter A(:,j)
        let a_start = ld_i32(ap, ju);
        let a_end = ld_i32(ap, ju + 1);
        for k in a_start..a_end {
            let ku = k as usize;
            let i = ld_i32(ai, ku) as usize;
            st_i32(marks, i, mark);
            st_f64(workspace, i, ld_f64(av, ku));
            st_i32(ri, nnz as usize, i as i32);
            nnz += 1;
        }

        // Update where B also has values
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);
        for k in b_start..b_end {
            let ku = k as usize;
            let i = ld_i32(bi, ku) as usize;
            if ld_i32(marks, i) == mark {
                st_f64(
                    workspace,
                    i,
                    apply_operation(ld_f64(workspace, i), ld_f64(bv, ku), operation),
                );
            }
        }

        // Gather non-zero values
        let mut p = col_start;
        while p < nnz {
            let i = ld_i32(ri, p as usize) as usize;
            let v = ld_f64(workspace, i);

            if v != 0.0 {
                st_f64(rv, p as usize, v);
                p += 1;
            } else {
                for q in p..(nnz - 1) {
                    st_i32(ri, q as usize, ld_i32(ri, (q + 1) as usize));
                }
                nnz -= 1;
            }
        }
    }

    st_i32(rp, cols as usize, nnz);
    nnz
}

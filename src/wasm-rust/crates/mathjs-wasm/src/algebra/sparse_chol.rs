//! Sparse Cholesky decomposition (CSparse-based).
//! L * L^T = P * A * P^T for symmetric positive definite A.

// ============================================
// SPARSE CHOLESKY
// ============================================

/// Sparse Cholesky factorization.
/// Returns nnz in L, or -1 if not positive definite.
#[no_mangle]
pub unsafe extern "C" fn sparseChol(
    avalues_ptr: *const f64,
    aindex_ptr: *const i32,
    aptr_ptr: *const i32,
    n: i32,
    parent_ptr: *const i32,
    cp_ptr: *const i32,
    pinv_ptr: *const i32,
    lvalues_ptr: *mut f64,
    lindex_ptr: *mut i32,
    lptr_ptr: *mut i32,
    work_ptr: *mut u8,
) -> i32 {
    let nu = n as usize;

    // Workspace: x (n f64), c (n i32), s (n i32), pinv_inv (n i32)
    let x_ptr = work_ptr as *mut f64;
    let c_ptr = (work_ptr.add(nu * 8)) as *mut i32;
    let s_ptr = (work_ptr.add(nu * 8 + nu * 4)) as *mut i32;
    let pinv_inv_ptr = (work_ptr.add(nu * 8 + nu * 4 + nu * 4)) as *mut i32;

    // Precompute inverse permutation lookup: pinv_inv[pinv[i]] = i
    if !pinv_ptr.is_null() {
        for i in 0..nu {
            let pi = *pinv_ptr.add(i) as usize;
            *pinv_inv_ptr.add(pi) = i as i32;
        }
    }

    // Initialize column pointers and counts
    for k in 0..nu {
        let cpk = *cp_ptr.add(k);
        *lptr_ptr.add(k) = cpk;
        *c_ptr.add(k) = cpk;
    }
    *lptr_ptr.add(nu) = *cp_ptr.add(nu);

    // Compute L column by column
    for k in 0..nu {
        // Compute reach using elimination tree
        let top = ereach(
            k as i32,
            aptr_ptr,
            aindex_ptr,
            parent_ptr,
            s_ptr,
            c_ptr,
            pinv_ptr,
            pinv_inv_ptr,
            n,
        );

        // Clear x[k]
        *x_ptr.add(k) = 0.0;

        // Get column k of A (permuted if pinv provided)
        let pk = if !pinv_ptr.is_null() {
            *pinv_ptr.add(k) as usize
        } else {
            k
        };
        let a_start = *aptr_ptr.add(pk) as usize;
        let a_end = *aptr_ptr.add(pk + 1) as usize;

        // Scatter A(:,k) into x
        for p in a_start..a_end {
            let mut i = *aindex_ptr.add(p) as usize;
            if !pinv_ptr.is_null() {
                // Use precomputed inverse permutation lookup
                i = *pinv_inv_ptr.add(i) as usize;
            }
            if i <= k {
                *x_ptr.add(i) = *avalues_ptr.add(p);
            }
        }

        let mut d = *x_ptr.add(k);
        *x_ptr.add(k) = 0.0;

        // Solve L(0:k-1) * x = A(:,k)
        for t in (top as usize)..nu {
            let i = *s_ptr.add(t) as usize;
            let l_start_i = *lptr_ptr.add(i) as usize;

            let lii = *lvalues_ptr.add(l_start_i);
            let lki = *x_ptr.add(i) / lii;
            *x_ptr.add(i) = 0.0;

            let ci = *c_ptr.add(i) as usize;
            for p in (l_start_i + 1)..ci {
                let r = *lindex_ptr.add(p) as usize;
                *x_ptr.add(r) -= *lvalues_ptr.add(p) * lki;
            }

            d -= lki * lki;

            let p_store = *c_ptr.add(i) as usize;
            *lindex_ptr.add(p_store) = k as i32;
            *lvalues_ptr.add(p_store) = lki;
            *c_ptr.add(i) = (p_store + 1) as i32;
        }

        if d <= 0.0 {
            return -1; // Not positive definite
        }

        let p_k = *c_ptr.add(k) as usize;
        *lindex_ptr.add(p_k) = k as i32;
        *lvalues_ptr.add(p_k) = libm::sqrt(d);
        *c_ptr.add(k) = (p_k + 1) as i32;
    }

    *cp_ptr.add(nu)
}

/// Elimination tree reach (internal).
/// Uses sign-flip marking (-(val)-1) to preserve original c_ptr values,
/// avoiding the bug where setting to -1 then restoring with & 0x7FFFFFFF
/// would turn -1 into MAX_INT.
unsafe fn ereach(
    k: i32,
    aptr_ptr: *const i32,
    aindex_ptr: *const i32,
    parent_ptr: *const i32,
    s_ptr: *mut i32,
    c_ptr: *mut i32,
    pinv_ptr: *const i32,
    pinv_inv_ptr: *const i32,
    n: i32,
) -> i32 {
    let nu = n as usize;
    let ku = k as usize;
    let mut top = n;

    // Mark k as visited using sign-flip: -(val) - 1 (maps non-negative to negative)
    *c_ptr.add(ku) = -*c_ptr.add(ku) - 1;

    let pk = if !pinv_ptr.is_null() {
        *pinv_ptr.add(ku) as usize
    } else {
        ku
    };
    let a_start = *aptr_ptr.add(pk) as usize;
    let a_end = *aptr_ptr.add(pk + 1) as usize;

    for p in a_start..a_end {
        let mut i = *aindex_ptr.add(p) as usize;

        if !pinv_ptr.is_null() {
            // Use precomputed inverse permutation lookup
            i = *pinv_inv_ptr.add(i) as usize;
        }

        if i >= ku {
            continue;
        }

        let mut len: i32 = 0;
        let mut node = i as i32;

        while node != -1 && (node as usize) < ku {
            if *c_ptr.add(node as usize) < 0 {
                // Already marked (visited)
                break;
            }
            *s_ptr.add(len as usize) = node;
            len += 1;
            // Mark using sign-flip to preserve original value
            let val = *c_ptr.add(node as usize);
            *c_ptr.add(node as usize) = -val - 1;
            node = *parent_ptr.add(node as usize);
        }

        while len > 0 {
            len -= 1;
            top -= 1;
            *s_ptr.add(top as usize) = *s_ptr.add(len as usize);
        }
    }

    // Restore column counts by reversing the sign-flip: -(marked) - 1 = original
    *c_ptr.add(ku) = -*c_ptr.add(ku) - 1;
    for t in (top as usize)..nu {
        let node = *s_ptr.add(t) as usize;
        *c_ptr.add(node) = -*c_ptr.add(node) - 1;
    }

    top
}

// ============================================
// SPARSE CHOLESKY SOLVE
// ============================================

/// Solve L*L^T*x = b using sparse Cholesky factors.
/// b is overwritten with the solution.
#[no_mangle]
pub unsafe extern "C" fn sparseCholSolve(
    lvalues_ptr: *const f64,
    lindex_ptr: *const i32,
    lptr_ptr: *const i32,
    n: i32,
    pinv_ptr: *const i32,
    b_ptr: *mut f64,
    work_ptr: *mut f64,
) {
    let nu = n as usize;

    // Apply permutation: work = P*b
    if !pinv_ptr.is_null() {
        for i in 0..nu {
            let pi = *pinv_ptr.add(i) as usize;
            *work_ptr.add(pi) = *b_ptr.add(i);
        }
    } else {
        for i in 0..nu {
            *work_ptr.add(i) = *b_ptr.add(i);
        }
    }

    // Forward solve: L*y = P*b
    for j in 0..nu {
        let l_start = *lptr_ptr.add(j) as usize;
        let l_end = *lptr_ptr.add(j + 1) as usize;
        if l_start >= l_end {
            continue;
        }

        let diag = *lvalues_ptr.add(l_start);
        let wj = *work_ptr.add(j) / diag;
        *work_ptr.add(j) = wj;

        for p in (l_start + 1)..l_end {
            let i = *lindex_ptr.add(p) as usize;
            *work_ptr.add(i) -= *lvalues_ptr.add(p) * wj;
        }
    }

    // Backward solve: L^T*z = y
    for jj in 0..nu {
        let j = nu - 1 - jj;
        let l_start = *lptr_ptr.add(j) as usize;
        let l_end = *lptr_ptr.add(j + 1) as usize;
        if l_start >= l_end {
            continue;
        }

        let mut wj = *work_ptr.add(j);
        for p in (l_start + 1)..l_end {
            let i = *lindex_ptr.add(p) as usize;
            wj -= *lvalues_ptr.add(p) * *work_ptr.add(i);
        }

        let diag = *lvalues_ptr.add(l_start);
        *work_ptr.add(j) = wj / diag;
    }

    // Apply inverse permutation: x = P^T*z
    if !pinv_ptr.is_null() {
        for i in 0..nu {
            let pi = *pinv_ptr.add(i) as usize;
            *b_ptr.add(i) = *work_ptr.add(pi);
        }
    } else {
        for i in 0..nu {
            *b_ptr.add(i) = *work_ptr.add(i);
        }
    }
}

// ============================================
// ELIMINATION TREE
// ============================================

/// Compute elimination tree for sparse Cholesky.
#[no_mangle]
pub unsafe extern "C" fn eliminationTree(
    aindex_ptr: *const i32,
    aptr_ptr: *const i32,
    n: i32,
    parent_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let nu = n as usize;
    let ancestor_ptr = work_ptr;

    for k in 0..nu {
        *parent_ptr.add(k) = -1;
        *ancestor_ptr.add(k) = -1;
    }

    for k in 0..nu {
        let a_start = *aptr_ptr.add(k) as usize;
        let a_end = *aptr_ptr.add(k + 1) as usize;

        for p in a_start..a_end {
            let i = *aindex_ptr.add(p) as usize;
            if i >= k {
                continue;
            }

            // Find root
            let mut root = i;
            loop {
                let anc = *ancestor_ptr.add(root);
                if anc < 0 || anc == k as i32 {
                    break;
                }
                root = anc as usize;
            }

            // Path compression
            let mut node = i;
            while node != root {
                let next = *ancestor_ptr.add(node) as usize;
                *ancestor_ptr.add(node) = k as i32;
                node = next;
            }

            if *parent_ptr.add(root) < 0 {
                *parent_ptr.add(root) = k as i32;
            }
            *ancestor_ptr.add(root) = k as i32;
        }
    }
}

// ============================================
// COLUMN COUNTS
// ============================================

/// Count column entries in L for Cholesky.
/// workPtr needs 3*n i32 space.
#[no_mangle]
pub unsafe extern "C" fn columnCounts(
    parent_ptr: *const i32,
    aptr_ptr: *const i32,
    aindex_ptr: *const i32,
    n: i32,
    cp_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let nu = n as usize;

    let post_ptr = work_ptr;
    let first_ptr = work_ptr.add(nu);
    let _level_ptr = work_ptr.add(2 * nu);

    // Simple postorder
    postorder(parent_ptr, nu, post_ptr, work_ptr.add(2 * nu));

    // Initialize
    for k in 0..nu {
        *first_ptr.add(k) = -1;
        *cp_ptr.add(k) = 0;
    }

    for k in 0..nu {
        let j = *post_ptr.add(k) as usize;

        let a_start = *aptr_ptr.add(j) as usize;
        let a_end = *aptr_ptr.add(j + 1) as usize;

        for p in a_start..a_end {
            let i = *aindex_ptr.add(p) as usize;
            if i > j {
                continue;
            }

            let mut q = i;
            while *first_ptr.add(q) != -1 && *first_ptr.add(q) != j as i32 {
                let _next = *first_ptr.add(q) as usize;
                *first_ptr.add(q) = j as i32;
                let cnt = *cp_ptr.add(q);
                *cp_ptr.add(q) = cnt + 1;
                let parent_q = *parent_ptr.add(q);
                if parent_q < 0 {
                    break;
                }
                q = parent_q as usize;
            }

            if *first_ptr.add(i) == -1 {
                *first_ptr.add(i) = j as i32;
            }
        }

        // Add diagonal
        let cnt = *cp_ptr.add(j);
        *cp_ptr.add(j) = cnt + 1;
    }

    // Convert to cumulative sum
    let mut sum: i32 = 0;
    for k in 0..nu {
        let cnt = *cp_ptr.add(k);
        *cp_ptr.add(k) = sum;
        sum += cnt;
    }
    *cp_ptr.add(nu) = sum;
}

unsafe fn postorder(parent_ptr: *const i32, n: usize, post_ptr: *mut i32, stack_ptr: *mut i32) {
    let mut post_count: usize = 0;

    for root in 0..n {
        if *parent_ptr.add(root) != -1 {
            continue;
        }

        let mut stack_top: usize = 0;
        *stack_ptr.add(stack_top) = root as i32;
        stack_top += 1;

        while stack_top > 0 {
            let node = *stack_ptr.add(stack_top - 1) as usize;

            // Find unvisited child
            let mut found_child = false;
            for c in 0..n {
                if *parent_ptr.add(c) as usize == node {
                    let mut processed = false;
                    for p in 0..post_count {
                        if *post_ptr.add(p) as usize == c {
                            processed = true;
                            break;
                        }
                    }
                    if !processed {
                        *stack_ptr.add(stack_top) = c as i32;
                        stack_top += 1;
                        found_child = true;
                        break;
                    }
                }
            }

            if !found_child {
                stack_top -= 1;
                *post_ptr.add(post_count) = node as i32;
                post_count += 1;
            }
        }
    }
}

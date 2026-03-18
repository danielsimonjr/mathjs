//! Sparse matrix utility operations based on CSparse.
//!
//! Provides csFlip, csUnflip, csMarked, csMark, csCumsum, csPermute,
//! csLeaf, csEtree, csPost, csTdfs, csDfs.

// ============================================
// FLIP / MARK UTILITIES
// ============================================

/// Flip a value about -1: returns -(i+2).
#[no_mangle]
pub extern "C" fn csFlip(i: i32) -> i32 {
    -(i + 2)
}

/// Unflip a value: if i >= 0 returns i, else returns -(i+2).
#[no_mangle]
pub extern "C" fn csUnflip(i: i32) -> i32 {
    if i < 0 {
        -(i + 2)
    } else {
        i
    }
}

/// Check if node j is marked (w[j] < 0).
#[no_mangle]
pub unsafe extern "C" fn csMarked(w_ptr: *const i32, j: i32) -> i32 {
    let val = *w_ptr.add(j as usize);
    if val < 0 {
        1
    } else {
        0
    }
}

/// Mark node j by flipping w[j].
#[no_mangle]
pub unsafe extern "C" fn csMark(w_ptr: *mut i32, j: i32) {
    let idx = j as usize;
    let val = *w_ptr.add(idx);
    *w_ptr.add(idx) = csFlip(val);
}

// ============================================
// CUMULATIVE SUM
// ============================================

/// Cumulative sum: p[0..n] = cumsum of c[0..n-1], then c = copy of p[0..n-1].
/// Returns total sum.
#[no_mangle]
pub unsafe extern "C" fn csCumsum(p_ptr: *mut i32, c_ptr: *mut i32, n: i32) -> i32 {
    let n = n as usize;
    let mut nz: i32 = 0;
    for i in 0..n {
        *p_ptr.add(i) = nz;
        let ci = *c_ptr.add(i);
        nz += ci;
        *c_ptr.add(i) = *p_ptr.add(i);
    }
    *p_ptr.add(n) = nz;
    nz
}

// ============================================
// PERMUTATION
// ============================================

/// Sparse matrix permutation C = P*A*Q in CSC format.
#[export_name = "csUtilPermute"]
pub unsafe extern "C" fn cs_util_permute(
    values_ptr: *const f64,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    _m: i32,
    n: i32,
    pinv_ptr: *const i32,
    q_ptr: *const i32,
    c_values_ptr: *mut f64,
    c_index_ptr: *mut i32,
    c_ptr_ptr: *mut i32,
) {
    let n = n as usize;
    let mut nz: usize = 0;

    for k in 0..n {
        *c_ptr_ptr.add(k) = nz as i32;
        let j = if !q_ptr.is_null() {
            *q_ptr.add(k) as usize
        } else {
            k
        };

        let ptr_j = *ptr_ptr.add(j) as usize;
        let ptr_j1 = *ptr_ptr.add(j + 1) as usize;

        for t in ptr_j..ptr_j1 {
            let index_t = *index_ptr.add(t) as usize;
            let i = if !pinv_ptr.is_null() {
                *pinv_ptr.add(index_t)
            } else {
                index_t as i32
            };

            *c_index_ptr.add(nz) = i;
            *c_values_ptr.add(nz) = *values_ptr.add(t);
            nz += 1;
        }
    }
    *c_ptr_ptr.add(n) = nz as i32;
}

// ============================================
// ELIMINATION TREE LEAF
// ============================================

/// Find a leaf in the elimination tree.
#[no_mangle]
pub unsafe extern "C" fn csLeaf(
    i: i32,
    j: i32,
    first_ptr: *const i32,
    maxfirst_ptr: *mut i32,
    prevleaf_ptr: *mut i32,
    ancestor_ptr: *mut i32,
) -> i32 {
    let iu = i as usize;
    let ju = j as usize;

    let first_j = *first_ptr.add(ju);
    let maxfirst_i = *maxfirst_ptr.add(iu);

    if i <= j || first_j <= maxfirst_i {
        return 0; // not a leaf
    }

    *maxfirst_ptr.add(iu) = first_j;
    let jprev = *prevleaf_ptr.add(iu);
    *prevleaf_ptr.add(iu) = j;

    if jprev == -1 {
        return i; // first leaf
    }

    // Find least common ancestor
    let mut s: i32 = -1;
    let mut q = jprev;
    while q != -1 && q != j {
        s = q;
        q = *ancestor_ptr.add(q as usize);
    }

    let jleaf = if s != -1 && q == j { s } else { -1 };

    // Path compression
    q = jprev;
    while q != s {
        let sparent = *ancestor_ptr.add(q as usize);
        *ancestor_ptr.add(q as usize) = j;
        q = sparent;
    }

    jleaf
}

// ============================================
// ELIMINATION TREE
// ============================================

/// Compute elimination tree of A (or A'A if m > n).
#[export_name = "csUtilEtree"]
pub unsafe extern "C" fn cs_util_etree(
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    _m: i32,
    n: i32,
    parent_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let n = n as usize;

    for i in 0..n {
        *parent_ptr.add(i) = -1;
        *work_ptr.add(i) = -1; // ancestor
    }

    for k in 0..n {
        let ptr_k = *ptr_ptr.add(k) as usize;
        let ptr_k1 = *ptr_ptr.add(k + 1) as usize;

        for p in ptr_k..ptr_k1 {
            let mut i = *index_ptr.add(p);

            while i != -1 && (i as usize) < k {
                let iu = i as usize;
                let inext = *work_ptr.add(iu);
                *work_ptr.add(iu) = k as i32;

                if inext == -1 {
                    *parent_ptr.add(iu) = k as i32;
                }

                i = inext;
            }
        }
    }
}

// ============================================
// POSTORDER
// ============================================

/// Compute postorder of elimination tree.
#[export_name = "csUtilPost"]
pub unsafe extern "C" fn cs_util_post(
    parent_ptr: *const i32,
    n: i32,
    post_ptr: *mut i32,
    work_ptr: *mut i32,
) {
    let n = n as usize;
    // work layout: first_child (n), next_sibling (n), stack (n)
    let first_child = work_ptr;
    let next_sibling = work_ptr.add(n);
    let stack = work_ptr.add(2 * n);

    // Build child lists
    for i in 0..n {
        *first_child.add(i) = -1;
    }
    // Process in reverse so children are in order
    for i in (0..n).rev() {
        let p = *parent_ptr.add(i);
        if p != -1 {
            let pu = p as usize;
            *next_sibling.add(i) = *first_child.add(pu);
            *first_child.add(pu) = i as i32;
        }
    }

    let mut k: usize = 0;

    for root in 0..n {
        if *parent_ptr.add(root) != -1 {
            continue;
        }
        // DFS from root
        let mut top: usize = 0;
        *stack.add(top) = root as i32;
        top += 1;

        while top > 0 {
            top -= 1;
            let node = *stack.add(top) as usize;

            let fc = *first_child.add(node);
            if fc != -1 {
                // Push node back, then push children in reverse order
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
}

// ============================================
// TREE DFS (for reach)
// ============================================

/// Tree DFS traversal for sparse operations.
/// Writes topological order into xi[top..n-1]. Returns new top.
#[no_mangle]
pub unsafe extern "C" fn csTdfs(
    j: i32,
    k: i32,
    head_ptr: *mut i32,
    next_ptr: *const i32,
    post_ptr: *mut i32,
    stack_ptr: *mut i32,
) -> i32 {
    let mut top: i32 = 0;
    let mut k = k;
    *stack_ptr.add(0) = j;
    top += 1;

    while top > 0 {
        let p = *stack_ptr.add((top - 1) as usize);
        let pu = p as usize;
        let i = *head_ptr.add(pu);

        if i == -1 {
            top -= 1;
            *post_ptr.add(k as usize) = p;
            k += 1;
        } else {
            *head_ptr.add(pu) = *next_ptr.add(i as usize);
            *stack_ptr.add(top as usize) = i;
            top += 1;
        }
    }

    k
}

// ============================================
// DFS for nonzero pattern
// ============================================

/// Depth-first search for nonzero pattern in sparse solve.
#[export_name = "csUtilDfs"]
pub unsafe extern "C" fn cs_util_dfs(
    j: i32,
    index_ptr: *const i32,
    ptr_ptr: *const i32,
    mut top: i32,
    xi_ptr: *mut i32,
    pstack_ptr: *mut i32,
    pinv_ptr: *const i32,
    marked_ptr: *mut i32,
) -> i32 {
    let mut head: i32 = 0;

    *xi_ptr.add(0) = j;

    while head >= 0 {
        let j = *xi_ptr.add(head as usize);
        let jnew = if !pinv_ptr.is_null() {
            *pinv_ptr.add(j as usize)
        } else {
            j
        };

        if *marked_ptr.add(j as usize) >= 0 {
            // Not yet marked
            let flipped = csFlip(*marked_ptr.add(j as usize));
            *marked_ptr.add(j as usize) = flipped;
            let pstack_val = if jnew < 0 {
                0
            } else {
                *ptr_ptr.add(jnew as usize)
            };
            *pstack_ptr.add(head as usize) = pstack_val;
        }

        let p2 = if jnew < 0 {
            0
        } else {
            *ptr_ptr.add((jnew + 1) as usize)
        };

        let mut done = true;
        let mut p = *pstack_ptr.add(head as usize);
        while p < p2 {
            let i = *index_ptr.add(p as usize);
            if *marked_ptr.add(i as usize) < 0 {
                // Already marked
                p += 1;
                continue;
            }
            *pstack_ptr.add(head as usize) = p;
            head += 1;
            *xi_ptr.add(head as usize) = i;
            done = false;
            break;
        }

        if done {
            head -= 1;
            top -= 1;
            *xi_ptr.add(top as usize) = j;
        }
    }

    top
}

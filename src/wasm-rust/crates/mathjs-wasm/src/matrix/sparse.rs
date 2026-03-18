//! Sparse matrix graph algorithms and decompositions (CSC format)
//!
//! Port of AssemblyScript sparse.ts — 17 exported functions.
//! All matrices use CSC (Compressed Sparse Column) format:
//! - values: *f64 (non-zero values)
//! - index:  *i32 (row indices)
//! - ptr:    *i32 (column pointers)

use libm::{fabs, sqrt};

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

// ---------------------------------------------------------------------------
// Graph Algorithms
// ---------------------------------------------------------------------------

/// Depth-first search on graph of sparse matrix G starting from node j.
#[no_mangle]
pub unsafe extern "C" fn csDfs(
    g_index_ptr: i32,
    g_ptr_ptr: i32,
    j: i32,
    top: i32,
    xi_ptr: i32,
    pinv_ptr: i32,
    n: i32,
    work_ptr: i32,
) -> i32 {
    let gi = g_index_ptr as usize as *const i32;
    let gp = g_ptr_ptr as usize as *const i32;
    let xi = xi_ptr as usize as *mut i32;
    let pinv = pinv_ptr as usize as *const i32;
    let nu = n as usize;

    let stack_node = work_ptr as usize as *mut i32;
    let stack_adj = stack_node.add(nu);
    let done = stack_adj.add(nu);

    let mut top = top;

    // Determine starting mapped node
    if pinv_ptr != 0 {
        let mapped = ld_i32(pinv, j as usize);
        if mapped < 0 {
            return top;
        }
    }

    st_i32(stack_node, 0, j);
    st_i32(stack_adj, 0, ld_i32(gp, j as usize));
    let mut tail: usize = 1;

    while tail > 0 {
        let p = tail - 1;
        let i = ld_i32(stack_node, p) as usize;
        let mut k = ld_i32(stack_adj, p);
        let p_end = ld_i32(gp, i + 1);

        let mut found = false;
        while k < p_end {
            let neighbor = ld_i32(gi, k as usize) as usize;
            k += 1;
            if ld_i32(done, neighbor) == 0 {
                st_i32(stack_adj, p, k);
                st_i32(stack_node, tail, neighbor as i32);
                st_i32(stack_adj, tail, ld_i32(gp, neighbor));
                tail += 1;
                found = true;
                break;
            }
        }

        if !found {
            st_i32(done, i, 1);
            top -= 1;
            st_i32(xi, top as usize, i as i32);
            tail -= 1;
        }
    }

    top
}

/// Compute reachability of nodes in B[:,k] in the graph of L.
#[no_mangle]
pub unsafe extern "C" fn csReach(
    g_index_ptr: i32,
    g_ptr_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    k: i32,
    xi_ptr: i32,
    pinv_ptr: i32,
    n: i32,
    work_ptr: i32,
) -> i32 {
    let gi = g_index_ptr as usize as *const i32;
    let gp = g_ptr_ptr as usize as *const i32;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let xi = xi_ptr as usize as *mut i32;
    let pinv = pinv_ptr as usize as *const i32;
    let nu = n as usize;

    let mark = work_ptr as usize as *mut i32;
    let mut top = n;

    let b_start = ld_i32(bp, k as usize);
    let b_end = ld_i32(bp, k as usize + 1);

    for p in b_start..b_end {
        let i = ld_i32(bi, p as usize);
        if ld_i32(mark, i as usize) == 0 {
            top = cs_dfs_reach(
                gi,
                gp,
                i,
                top,
                xi,
                mark,
                pinv,
                pinv_ptr,
                n,
                nu,
                (work_ptr as usize as *mut i32).add(nu),
            );
        }
    }

    // Clear marks for all visited nodes so mark array is clean for next call
    for t in top..n {
        let node = ld_i32(xi, t as usize);
        st_i32(mark, node as usize, 0);
    }

    top
}

/// DFS helper for csReach.
unsafe fn cs_dfs_reach(
    gi: *const i32,
    gp: *const i32,
    j: i32,
    mut top: i32,
    xi: *mut i32,
    mark: *mut i32,
    pinv: *const i32,
    pinv_ptr: i32,
    _n: i32,
    nu: usize,
    work: *mut i32,
) -> i32 {
    let stack = work;
    let stack_pos = work.add(nu);
    let mut depth: i32 = 0;

    st_i32(stack, 0, j);
    let mut pj = j;
    if pinv_ptr != 0 {
        pj = ld_i32(pinv, j as usize);
    }
    st_i32(
        stack_pos,
        0,
        if pj >= 0 { ld_i32(gp, pj as usize) } else { 0 },
    );

    while depth >= 0 {
        let du = depth as usize;
        let i = ld_i32(stack, du);
        let mut pi = i;
        if pinv_ptr != 0 {
            pi = ld_i32(pinv, i as usize);
        }

        if ld_i32(mark, i as usize) != 0 {
            depth -= 1;
            continue;
        }

        if pi < 0 {
            st_i32(mark, i as usize, 1);
            top -= 1;
            st_i32(xi, top as usize, i);
            depth -= 1;
            continue;
        }

        let pos = ld_i32(stack_pos, du);
        let p_end = ld_i32(gp, pi as usize + 1);

        let mut found_child = false;
        for kk in pos..p_end {
            let child = ld_i32(gi, kk as usize);
            if ld_i32(mark, child as usize) == 0 {
                st_i32(stack_pos, du, kk + 1);
                depth += 1;
                let dnu = depth as usize;
                st_i32(stack, dnu, child);
                let mut pc = child;
                if pinv_ptr != 0 {
                    pc = ld_i32(pinv, child as usize);
                }
                st_i32(
                    stack_pos,
                    dnu,
                    if pc >= 0 { ld_i32(gp, pc as usize) } else { 0 },
                );
                found_child = true;
                break;
            }
        }

        if !found_child {
            st_i32(mark, i as usize, 1);
            top -= 1;
            st_i32(xi, top as usize, i);
            depth -= 1;
        }
    }

    top
}

/// Compute the elimination tree of a symmetric positive definite matrix A.
#[no_mangle]
pub unsafe extern "C" fn csEtree(
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    parent_ptr: i32,
    work_ptr: i32,
) {
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let parent = parent_ptr as usize as *mut i32;
    let ancestor = work_ptr as usize as *mut i32;
    let nu = n as usize;

    for i in 0..nu {
        st_i32(parent, i, -1);
        st_i32(ancestor, i, -1);
    }

    for k in 0..n {
        let ku = k as usize;
        let p_start = ld_i32(ap, ku);
        let p_end = ld_i32(ap, ku + 1);

        for p in p_start..p_end {
            let mut i = ld_i32(ai, p as usize);
            if i >= k {
                continue;
            }

            while i != -1 && i < k {
                let inext = ld_i32(ancestor, i as usize);
                st_i32(ancestor, i as usize, k);
                if inext == -1 {
                    st_i32(parent, i as usize, k);
                    break;
                }
                i = inext;
            }
        }
    }
}

/// Post-order traversal of elimination tree.
#[no_mangle]
pub unsafe extern "C" fn csPost(parent_ptr: i32, n: i32, post_ptr: i32, work_ptr: i32) {
    let parent = parent_ptr as usize as *const i32;
    let post = post_ptr as usize as *mut i32;
    let nu = n as usize;

    let first_child = work_ptr as usize as *mut i32;
    let next_sibling = first_child.add(nu);
    let stack = next_sibling.add(nu);
    let stack_state = stack.add(nu);

    for i in 0..nu {
        st_i32(first_child, i, -1);
        st_i32(next_sibling, i, -1);
    }

    // Build child lists in reverse
    for i in (0..n).rev() {
        let iu = i as usize;
        let p = ld_i32(parent, iu);
        if p >= 0 && p < n {
            let pu = p as usize;
            st_i32(next_sibling, iu, ld_i32(first_child, pu));
            st_i32(first_child, pu, i);
        }
    }

    let mut post_idx: i32 = 0;

    for root in 0..n {
        if ld_i32(parent, root as usize) != -1 {
            continue;
        }

        let mut depth: i32 = 0;
        st_i32(stack, 0, root);
        st_i32(stack_state, 0, 0);

        while depth >= 0 {
            let du = depth as usize;
            let node = ld_i32(stack, du);
            let state = ld_i32(stack_state, du);

            if state == 0 {
                st_i32(stack_state, du, 1);
                let mut child = ld_i32(first_child, node as usize);
                while child >= 0 {
                    depth += 1;
                    let dnu = depth as usize;
                    st_i32(stack, dnu, child);
                    st_i32(stack_state, dnu, 0);
                    child = ld_i32(next_sibling, child as usize);
                }
            } else {
                st_i32(post, post_idx as usize, node);
                post_idx += 1;
                depth -= 1;
            }
        }
    }
}

/// Permute a sparse matrix: C = P * A * Q^T.
#[no_mangle]
pub unsafe extern "C" fn csPermute(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    pinv_ptr: i32,
    q_ptr: i32,
    _m: i32,
    n: i32,
    c_values_ptr: i32,
    c_index_ptr: i32,
    c_ptr_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let pinv = pinv_ptr as usize as *const i32;
    let q = q_ptr as usize as *const i32;
    let cv = c_values_ptr as usize as *mut f64;
    let ci = c_index_ptr as usize as *mut i32;
    let cp = c_ptr_ptr as usize as *mut i32;

    let mut nnz: i32 = 0;

    for j in 0..n {
        let ju = j as usize;
        st_i32(cp, ju, nnz);

        let j_old = if q_ptr != 0 { ld_i32(q, ju) } else { j };
        let p_start = ld_i32(ap, j_old as usize);
        let p_end = ld_i32(ap, j_old as usize + 1);

        for p in p_start..p_end {
            let pu = p as usize;
            let i_old = ld_i32(ai, pu);
            let i_new = if pinv_ptr != 0 {
                ld_i32(pinv, i_old as usize)
            } else {
                i_old
            };

            let nzu = nnz as usize;
            st_f64(cv, nzu, ld_f64(av, pu));
            st_i32(ci, nzu, i_new);
            nnz += 1;
        }
    }

    st_i32(cp, n as usize, nnz);
    nnz
}

/// Sparse triangular solve: solve L*x = b or U*x = b.
#[no_mangle]
pub unsafe extern "C" fn csSpsolve(
    g_values_ptr: i32,
    g_index_ptr: i32,
    g_ptr_ptr: i32,
    n: i32,
    xi_ptr: i32,
    top: i32,
    x_ptr: i32,
    pinv_ptr: i32,
    is_lower: i32,
) {
    let gv = g_values_ptr as usize as *const f64;
    let gi = g_index_ptr as usize as *const i32;
    let gp = g_ptr_ptr as usize as *const i32;
    let xi = xi_ptr as usize as *const i32;
    let x = x_ptr as usize as *mut f64;
    let pinv = pinv_ptr as usize as *const i32;

    if is_lower != 0 {
        // Forward substitution
        for p in top..n {
            let j = ld_i32(xi, p as usize);
            let mut pj = j;
            if pinv_ptr != 0 {
                pj = ld_i32(pinv, j as usize);
            }
            if pj < 0 || pj >= n {
                continue;
            }

            let pju = pj as usize;
            let diag_start = ld_i32(gp, pju);
            let diag_end = ld_i32(gp, pju + 1);

            // Find diagonal
            let mut diag_val: f64 = 1.0;
            for k in diag_start..diag_end {
                if ld_i32(gi, k as usize) == pj {
                    diag_val = ld_f64(gv, k as usize);
                    break;
                }
            }

            let ju = j as usize;
            let xj = ld_f64(x, ju) / diag_val;
            st_f64(x, ju, xj);

            for k in diag_start..diag_end {
                let i = ld_i32(gi, k as usize);
                if i != pj {
                    let iu = i as usize;
                    st_f64(x, iu, ld_f64(x, iu) - ld_f64(gv, k as usize) * xj);
                }
            }
        }
    } else {
        // Back substitution
        for pp in (top..n).rev() {
            let j = ld_i32(xi, pp as usize);
            let mut pj = j;
            if pinv_ptr != 0 {
                pj = ld_i32(pinv, j as usize);
            }
            if pj < 0 || pj >= n {
                continue;
            }

            let pju = pj as usize;
            let p_start = ld_i32(gp, pju);
            let p_end = ld_i32(gp, pju + 1);

            let ju = j as usize;
            let xj = ld_f64(x, ju);

            for k in p_start..p_end {
                let i = ld_i32(gi, k as usize);
                if i != pj {
                    let iu = i as usize;
                    st_f64(x, iu, ld_f64(x, iu) - ld_f64(gv, k as usize) * xj);
                }
            }

            let mut diag_val: f64 = 1.0;
            for k in p_start..p_end {
                if ld_i32(gi, k as usize) == pj {
                    diag_val = ld_f64(gv, k as usize);
                    break;
                }
            }
            st_f64(x, ju, xj / diag_val);
        }
    }
}

/// Symbolic analysis for Cholesky factorization.
#[no_mangle]
pub unsafe extern "C" fn csCholSymbolic(
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    parent_ptr: i32,
    lnz_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let parent = parent_ptr as usize as *mut i32;
    let lnz = lnz_ptr as usize as *mut i32;
    let nu = n as usize;

    let col_count = work_ptr as usize as *mut i32;
    let first = col_count.add(nu);
    let level = first.add(nu);
    let ancestor = level.add(nu);
    let post = ancestor.add(nu);

    // Compute elimination tree
    csEtree(
        a_index_ptr,
        a_ptr_ptr,
        n,
        parent_ptr,
        ancestor as usize as i32,
    );

    for i in 0..nu {
        st_i32(first, i, -1);
        st_i32(col_count, i, 0);
    }

    // Post-order traversal
    csPost(
        parent_ptr,
        n,
        post as usize as i32,
        post.add(nu) as usize as i32,
    );

    // Compute levels
    for i in 0..n {
        let iu = i as usize;
        let p = ld_i32(parent, iu);
        if p >= 0 {
            st_i32(level, iu, ld_i32(level, p as usize) + 1);
        } else {
            st_i32(level, iu, 0);
        }
    }

    // Column count using row subtree method
    for i in 0..nu {
        st_i32(ancestor, i, i as i32);
    }

    let mut total_nnz: i32 = 0;

    for k in 0..n {
        let i = ld_i32(post, k as usize);
        let iu = i as usize;

        st_i32(col_count, iu, 1);

        let p_start = ld_i32(ap, iu);
        let p_end = ld_i32(ap, iu + 1);

        for p in p_start..p_end {
            let mut j = ld_i32(ai, p as usize);
            if j >= i {
                continue;
            }

            while j != -1 && j < i {
                let jnext = ld_i32(ancestor, j as usize);
                st_i32(ancestor, j as usize, i);
                if jnext == j {
                    st_i32(
                        col_count,
                        iu,
                        ld_i32(col_count, iu) + ld_i32(level, iu) - ld_i32(level, j as usize),
                    );
                    break;
                }
                j = jnext;
            }
        }

        st_i32(lnz, iu, ld_i32(col_count, iu));
        total_nnz += ld_i32(col_count, iu);
    }

    total_nnz
}

/// Sparse Cholesky factorization: A = L * L^T.
/// Returns 0 on success, -1 if not positive definite.
#[no_mangle]
pub unsafe extern "C" fn csChol(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    parent_ptr: i32,
    l_values_ptr: i32,
    l_index_ptr: i32,
    l_ptr_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let parent = parent_ptr as usize as *const i32;
    let lv = l_values_ptr as usize as *mut f64;
    let li = l_index_ptr as usize as *mut i32;
    let lp = l_ptr_ptr as usize as *const i32;
    let nu = n as usize;

    let x = work_ptr as usize as *mut f64;
    let c = (work_ptr as usize as *mut u8).add(nu * 8) as *mut i32;
    let s = c.add(nu);

    // Initialize column pointers
    for i in 0..nu {
        st_i32(c, i, ld_i32(lp, i));
    }

    for k in 0..n {
        let ku = k as usize;

        // csEreach inline — find reach of A[:,k] in etree
        let top = cs_ereach(ai, ap, k, parent, s, c, n, nu, s.add(nu) as *mut i32);

        // Initialize x with A[:,k]
        let a_start = ld_i32(ap, ku);
        let a_end = ld_i32(ap, ku + 1);
        for p in a_start..a_end {
            let i = ld_i32(ai, p as usize);
            if i >= k {
                st_f64(x, i as usize, ld_f64(av, p as usize));
            }
        }

        let mut d = ld_f64(x, ku);
        st_f64(x, ku, 0.0);

        // Process nonzeros in L[:,k]
        for p in top..n {
            let i = ld_i32(s, p as usize);
            let iu = i as usize;

            let lki = ld_f64(x, iu) / ld_f64(lv, ld_i32(lp, iu) as usize);
            st_f64(x, iu, 0.0);

            let l_start = ld_i32(lp, iu) + 1;
            let l_end = ld_i32(c, iu);
            for q in l_start..l_end {
                let j = ld_i32(li, q as usize);
                st_f64(
                    x,
                    j as usize,
                    ld_f64(x, j as usize) - ld_f64(lv, q as usize) * lki,
                );
            }

            d -= lki * lki;

            let cp = ld_i32(c, iu);
            st_i32(li, cp as usize, k);
            st_f64(lv, cp as usize, lki);
            st_i32(c, iu, cp + 1);
        }

        if d <= 0.0 {
            return -1;
        }

        let ck = ld_i32(c, ku);
        st_i32(li, ck as usize, k);
        st_f64(lv, ck as usize, sqrt(d));
        st_i32(c, ku, ck + 1);
    }

    0
}

/// csEreach helper — reach of column k in elimination tree.
unsafe fn cs_ereach(
    ai: *const i32,
    ap: *const i32,
    k: i32,
    parent: *const i32,
    s: *mut i32,
    _c: *mut i32,
    n: i32,
    _nu: usize,
    _work: *mut i32,
) -> i32 {
    let mut top = n;
    let mark = -(k + 2);

    let p_start = ld_i32(ap, k as usize);
    let p_end = ld_i32(ap, k as usize + 1);

    for p in p_start..p_end {
        let mut i = ld_i32(ai, p as usize);
        if i > k {
            continue;
        }

        let mut len: i32 = 0;
        while i != -1 && i < k {
            if ld_i32(s, i as usize) == mark {
                break;
            }
            st_i32(s, (n - 1 - len) as usize, i);
            len += 1;
            st_i32(s, i as usize, mark);
            i = ld_i32(parent, i as usize);
        }

        while len > 0 {
            len -= 1;
            top -= 1;
            st_i32(s, top as usize, ld_i32(s, (n - 1 - len) as usize));
        }
    }

    top
}

/// Sparse LU factorization with partial pivoting: P*A = L*U.
/// Returns 0 on success, -k-1 if structurally singular at column k.
#[no_mangle]
pub unsafe extern "C" fn csLu(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    tol: f64,
    l_values_ptr: i32,
    l_index_ptr: i32,
    l_ptr_ptr: i32,
    u_values_ptr: i32,
    u_index_ptr: i32,
    u_ptr_ptr: i32,
    pinv_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let lv = l_values_ptr as usize as *mut f64;
    let li_ptr = l_index_ptr as usize as *mut i32;
    let lp = l_ptr_ptr as usize as *mut i32;
    let uv = u_values_ptr as usize as *mut f64;
    let ui = u_index_ptr as usize as *mut i32;
    let up = u_ptr_ptr as usize as *mut i32;
    let pinv = pinv_ptr as usize as *mut i32;
    let nu = n as usize;

    let x = work_ptr as usize as *mut f64;
    let xi = (work_ptr as usize as *mut u8).add(nu * 8) as *mut i32;

    // Initialize pinv
    for i in 0..nu {
        st_i32(pinv, i, -1);
    }

    let mut lnz: i32 = 0;
    let mut unz: i32 = 0;

    for k in 0..n {
        let ku = k as usize;
        st_i32(lp, ku, lnz);
        st_i32(up, ku, unz);

        // Symbolic pattern
        let top = cs_spsolve_pattern(
            ai,
            ap,
            li_ptr,
            lp as *const i32,
            k,
            xi,
            pinv as *const i32,
            pinv_ptr,
            n,
            nu,
            xi.add(2 * nu),
        );

        // Initialize x
        for p in top..n {
            st_f64(x, ld_i32(xi, p as usize) as usize, 0.0);
        }
        let a_start = ld_i32(ap, ku);
        let a_end = ld_i32(ap, ku + 1);
        for p in a_start..a_end {
            let i = ld_i32(ai, p as usize);
            st_f64(x, i as usize, ld_f64(av, p as usize));
        }

        // Sparse triangular solve
        for p in top..n {
            let j = ld_i32(xi, p as usize);
            let jnew = ld_i32(pinv, j as usize);
            if jnew < 0 {
                continue;
            }

            let ljj = ld_f64(lv, ld_i32(lp as *const i32, jnew as usize) as usize);
            if ljj == 0.0 {
                continue;
            }

            let ju = j as usize;
            let xj = ld_f64(x, ju) / ljj;
            st_f64(x, ju, xj);

            let l_start = ld_i32(lp as *const i32, jnew as usize) + 1;
            let l_end = ld_i32(lp as *const i32, jnew as usize + 1);
            for q in l_start..l_end {
                let i = ld_i32(li_ptr, q as usize);
                st_f64(
                    x,
                    i as usize,
                    ld_f64(x, i as usize) - ld_f64(lv, q as usize) * xj,
                );
            }
        }

        // Find pivot
        let mut pivot: i32 = -1;
        let mut pivot_val: f64 = 0.0;

        for p in top..n {
            let i = ld_i32(xi, p as usize);
            if ld_i32(pinv, i as usize) < 0 {
                let t = fabs(ld_f64(x, i as usize));
                if t > pivot_val {
                    pivot_val = t;
                    pivot = i;
                }
            }
        }

        if pivot < 0 || pivot_val <= 0.0 {
            return -k - 1;
        }

        // Apply tolerance
        let mut ipiv = pivot;
        let thresh = tol * pivot_val;

        for p in top..n {
            let i = ld_i32(xi, p as usize);
            if ld_i32(pinv, i as usize) < 0 {
                if fabs(ld_f64(x, i as usize)) >= thresh && i < ipiv {
                    ipiv = i;
                }
            }
        }

        st_i32(pinv, ipiv as usize, k);

        // Store U[:,k]
        for p in top..n {
            let i = ld_i32(xi, p as usize);
            if ld_i32(pinv, i as usize) < k || i == ipiv {
                st_i32(ui, unz as usize, i);
                st_f64(uv, unz as usize, ld_f64(x, i as usize));
                unz += 1;
                st_f64(x, i as usize, 0.0);
            }
        }

        // Store L[:,k]
        let ukk = ld_f64(x, ipiv as usize);
        st_f64(x, ipiv as usize, 0.0);

        st_i32(li_ptr, lnz as usize, ipiv);
        st_f64(lv, lnz as usize, 1.0);
        lnz += 1;

        for p in top..n {
            let i = ld_i32(xi, p as usize);
            if ld_i32(pinv, i as usize) < 0 && i != ipiv {
                st_i32(li_ptr, lnz as usize, i);
                st_f64(lv, lnz as usize, ld_f64(x, i as usize) / ukk);
                lnz += 1;
                st_f64(x, i as usize, 0.0);
            }
        }
    }

    st_i32(lp, nu, lnz);
    st_i32(up, nu, unz);

    0
}

/// csSpsolvePattern helper — symbolic pattern for sparse solve.
unsafe fn cs_spsolve_pattern(
    ai: *const i32,
    ap: *const i32,
    li: *const i32,
    lp: *const i32,
    k: i32,
    xi: *mut i32,
    pinv: *const i32,
    _pinv_ptr: i32,
    n: i32,
    nu: usize,
    work: *mut i32,
) -> i32 {
    let mut top = n;
    let mark_arr = work;
    let stack = work.add(nu);
    let stack_pos = stack.add(nu);
    let current_mark = k + 1;

    let a_start = ld_i32(ap, k as usize);
    let a_end = ld_i32(ap, k as usize + 1);

    for p in a_start..a_end {
        let i = ld_i32(ai, p as usize);
        if ld_i32(mark_arr, i as usize) == current_mark {
            continue;
        }

        let mut depth: i32 = 0;
        st_i32(stack, 0, i);
        let pi = ld_i32(pinv, i as usize);
        st_i32(
            stack_pos,
            0,
            if pi >= 0 { ld_i32(lp, pi as usize) } else { 0 },
        );

        while depth >= 0 {
            let du = depth as usize;
            let j = ld_i32(stack, du);
            let pj = ld_i32(pinv, j as usize);

            if ld_i32(mark_arr, j as usize) == current_mark {
                depth -= 1;
                continue;
            }

            if pj < 0 {
                st_i32(mark_arr, j as usize, current_mark);
                top -= 1;
                st_i32(xi, top as usize, j);
                depth -= 1;
                continue;
            }

            let pos = ld_i32(stack_pos, du);
            let p_end = ld_i32(lp, pj as usize + 1);

            let mut found_child = false;
            for q in pos..p_end {
                let child = ld_i32(li, q as usize);
                if ld_i32(mark_arr, child as usize) != current_mark {
                    st_i32(stack_pos, du, q + 1);
                    depth += 1;
                    let dnu = depth as usize;
                    st_i32(stack, dnu, child);
                    let pc = ld_i32(pinv, child as usize);
                    st_i32(
                        stack_pos,
                        dnu,
                        if pc >= 0 { ld_i32(lp, pc as usize) } else { 0 },
                    );
                    found_child = true;
                    break;
                }
            }

            if !found_child {
                st_i32(mark_arr, j as usize, current_mark);
                top -= 1;
                st_i32(xi, top as usize, j);
                depth -= 1;
            }
        }
    }

    top
}

/// Sparse QR factorization using Householder reflections: A = Q*R.
#[no_mangle]
pub unsafe extern "C" fn csQr(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    m: i32,
    n: i32,
    r_values_ptr: i32,
    r_index_ptr: i32,
    r_ptr_ptr: i32,
    beta_ptr: i32,
    v_values_ptr: i32,
    v_index_ptr: i32,
    v_ptr_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let rv = r_values_ptr as usize as *mut f64;
    let ri = r_index_ptr as usize as *mut i32;
    let rp = r_ptr_ptr as usize as *mut i32;
    let beta = beta_ptr as usize as *mut f64;
    let vv = v_values_ptr as usize as *mut f64;
    let vi = v_index_ptr as usize as *mut i32;
    let vp = v_ptr_ptr as usize as *mut i32;
    let x = work_ptr as usize as *mut f64;

    let mu = m as usize;
    let mut rnz: i32 = 0;
    let mut vnz: i32 = 0;

    for k in 0..n {
        let ku = k as usize;
        st_i32(rp, ku, rnz);
        st_i32(vp, ku, vnz);

        // Clear x
        for i in 0..mu {
            st_f64(x, i, 0.0);
        }

        // Load A[:,k]
        let a_start = ld_i32(ap, ku);
        let a_end = ld_i32(ap, ku + 1);
        for p in a_start..a_end {
            let i = ld_i32(ai, p as usize);
            st_f64(x, i as usize, ld_f64(av, p as usize));
        }

        // Apply previous Householder transformations
        for j in 0..k {
            let ju = j as usize;
            let beta_j = ld_f64(beta, ju);
            if beta_j == 0.0 {
                continue;
            }

            let v_start = ld_i32(vp as *const i32, ju);
            let v_end = ld_i32(vp as *const i32, ju + 1);

            let mut v_tx: f64 = 0.0;
            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi as *const i32, pu);
                v_tx += ld_f64(vv, pu) * ld_f64(x, i as usize);
            }

            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi as *const i32, pu);
                let iu = i as usize;
                st_f64(x, iu, ld_f64(x, iu) - beta_j * ld_f64(vv, pu) * v_tx);
            }
        }

        // Compute Householder for x[k:m]
        let mut sigma: f64 = 0.0;
        for i in k..m {
            let v = ld_f64(x, i as usize);
            sigma += v * v;
        }
        sigma = sqrt(sigma);

        if sigma == 0.0 {
            st_f64(beta, ku, 0.0);
        } else {
            let xk = ld_f64(x, ku);
            let s = if xk >= 0.0 { 1.0 } else { -1.0 };
            let v0 = xk + s * sigma;

            // Store R above diagonal
            for i in 0..k {
                let xi = ld_f64(x, i as usize);
                if xi != 0.0 {
                    st_i32(ri, rnz as usize, i);
                    st_f64(rv, rnz as usize, xi);
                    rnz += 1;
                }
            }

            // R[k,k]
            st_i32(ri, rnz as usize, k);
            st_f64(rv, rnz as usize, -s * sigma);
            rnz += 1;

            // V[k] = 1
            st_i32(vi, vnz as usize, k);
            st_f64(vv, vnz as usize, 1.0);
            vnz += 1;

            for i in (k + 1)..m {
                let xi = ld_f64(x, i as usize);
                if xi != 0.0 {
                    st_i32(vi, vnz as usize, i);
                    st_f64(vv, vnz as usize, xi / v0);
                    vnz += 1;
                }
            }

            // beta = 2 * v0^2 / (v^T * v)
            let mut v_tv = v0 * v0;
            for i in (k + 1)..m {
                let val = ld_f64(x, i as usize);
                v_tv += val * val;
            }
            st_f64(beta, ku, (2.0 * v0 * v0) / v_tv);
        }
    }

    st_i32(rp, n as usize, rnz);
    st_i32(vp, n as usize, vnz);

    0
}

/// Apply Q (from QR) to a vector: y = Q*x or y = Q^T*x.
#[no_mangle]
pub unsafe extern "C" fn csQmult(
    v_values_ptr: i32,
    v_index_ptr: i32,
    v_ptr_ptr: i32,
    beta_ptr: i32,
    n: i32,
    x_ptr: i32,
    y_ptr: i32,
    m: i32,
    transpose: i32,
) {
    let vv = v_values_ptr as usize as *const f64;
    let vi = v_index_ptr as usize as *const i32;
    let vp = v_ptr_ptr as usize as *const i32;
    let beta = beta_ptr as usize as *const f64;
    let x = x_ptr as usize as *const f64;
    let y = y_ptr as usize as *mut f64;

    // Copy x to y
    for i in 0..m as usize {
        st_f64(y, i, ld_f64(x, i));
    }

    if transpose != 0 {
        for k in (0..n).rev() {
            let ku = k as usize;
            let beta_k = ld_f64(beta, ku);
            if beta_k == 0.0 {
                continue;
            }

            let v_start = ld_i32(vp, ku);
            let v_end = ld_i32(vp, ku + 1);

            let mut v_ty: f64 = 0.0;
            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi, pu) as usize;
                v_ty += ld_f64(vv, pu) * ld_f64(y, i);
            }

            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi, pu) as usize;
                st_f64(y, i, ld_f64(y, i) - beta_k * ld_f64(vv, pu) * v_ty);
            }
        }
    } else {
        for k in 0..n {
            let ku = k as usize;
            let beta_k = ld_f64(beta, ku);
            if beta_k == 0.0 {
                continue;
            }

            let v_start = ld_i32(vp, ku);
            let v_end = ld_i32(vp, ku + 1);

            let mut v_ty: f64 = 0.0;
            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi, pu) as usize;
                v_ty += ld_f64(vv, pu) * ld_f64(y, i);
            }

            for p in v_start..v_end {
                let pu = p as usize;
                let i = ld_i32(vi, pu) as usize;
                st_f64(y, i, ld_f64(y, i) - beta_k * ld_f64(vv, pu) * v_ty);
            }
        }
    }
}

/// Approximate Minimum Degree (AMD) ordering.
#[no_mangle]
pub unsafe extern "C" fn csAmd(
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    perm_ptr: i32,
    work_ptr: i32,
) {
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let perm = perm_ptr as usize as *mut i32;
    let nu = n as usize;

    let degree = work_ptr as usize as *mut i32;
    let eliminated = degree.add(nu);

    for j in 0..nu {
        let count = ld_i32(ap, j + 1) - ld_i32(ap, j);
        st_i32(degree, j, count);
        st_i32(eliminated, j, 0);
    }

    for k in 0..n {
        let mut min_deg = n + 1;
        let mut min_node: i32 = -1;

        for j in 0..n {
            let ju = j as usize;
            if ld_i32(eliminated, ju) == 0 && ld_i32(degree, ju) < min_deg {
                min_deg = ld_i32(degree, ju);
                min_node = j;
            }
        }

        if min_node < 0 {
            break;
        }

        st_i32(perm, k as usize, min_node);
        st_i32(eliminated, min_node as usize, 1);

        let p_start = ld_i32(ap, min_node as usize);
        let p_end = ld_i32(ap, min_node as usize + 1);

        for p in p_start..p_end {
            let neighbor = ld_i32(ai, p as usize) as usize;
            if ld_i32(eliminated, neighbor) == 0 {
                let new_deg = ld_i32(degree, neighbor) - 1;
                st_i32(degree, neighbor, if new_deg < 0 { 0 } else { new_deg });
            }
        }
    }
}

/// Reverse Cuthill-McKee (RCM) ordering.
#[no_mangle]
pub unsafe extern "C" fn csRcm(
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    n: i32,
    perm_ptr: i32,
    work_ptr: i32,
) {
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let perm = perm_ptr as usize as *mut i32;
    let nu = n as usize;

    let visited = work_ptr as usize as *mut i32;
    let queue = visited.add(nu);
    let degree = queue.add(nu);
    let neighbors = degree.add(nu);

    let mut _start: i32 = 0;
    let mut min_deg = n + 1;

    for j in 0..nu {
        let deg = ld_i32(ap, j + 1) - ld_i32(ap, j);
        st_i32(degree, j, deg);
        st_i32(visited, j, 0);
        if deg < min_deg {
            min_deg = deg;
            _start = j as i32;
        }
    }

    let mut head: i32 = 0;
    let mut tail: i32 = 0;
    let mut perm_idx: i32 = 0;

    for s in 0..n {
        let su = s as usize;
        if ld_i32(visited, su) != 0 {
            continue;
        }

        // Find min degree unvisited
        let mut c_start = s;
        min_deg = n + 1;
        for j in s..n {
            let ju = j as usize;
            if ld_i32(visited, ju) == 0 && ld_i32(degree, ju) < min_deg {
                min_deg = ld_i32(degree, ju);
                c_start = j;
            }
        }

        st_i32(queue, tail as usize, c_start);
        tail += 1;
        st_i32(visited, c_start as usize, 1);

        while head < tail {
            let node = ld_i32(queue, head as usize);
            head += 1;
            st_i32(perm, perm_idx as usize, node);
            perm_idx += 1;

            let mut num_neighbors: i32 = 0;
            let p_start = ld_i32(ap, node as usize);
            let p_end = ld_i32(ap, node as usize + 1);

            for p in p_start..p_end {
                let nb = ld_i32(ai, p as usize);
                if ld_i32(visited, nb as usize) == 0 {
                    st_i32(neighbors, num_neighbors as usize, nb);
                    num_neighbors += 1;
                    st_i32(visited, nb as usize, 1);
                }
            }

            // Insertion sort by degree
            for i in 1..num_neighbors {
                let iu = i as usize;
                let key = ld_i32(neighbors, iu);
                let key_deg = ld_i32(degree, key as usize);
                let mut j = i - 1;
                while j >= 0 {
                    let nj = ld_i32(neighbors, j as usize);
                    if ld_i32(degree, nj as usize) > key_deg {
                        st_i32(neighbors, j as usize + 1, nj);
                        j -= 1;
                    } else {
                        break;
                    }
                }
                st_i32(neighbors, (j + 1) as usize, key);
            }

            for i in 0..num_neighbors {
                st_i32(queue, tail as usize, ld_i32(neighbors, i as usize));
                tail += 1;
            }
        }
    }

    // Reverse
    for i in 0..(n / 2) {
        let iu = i as usize;
        let ju = (n - 1 - i) as usize;
        let temp = ld_i32(perm, iu);
        st_i32(perm, iu, ld_i32(perm, ju));
        st_i32(perm, ju, temp);
    }
}

/// Compute inverse permutation.
#[no_mangle]
pub unsafe extern "C" fn csInvPerm(perm_ptr: i32, n: i32, pinv_ptr: i32) {
    let perm = perm_ptr as usize as *const i32;
    let pinv = pinv_ptr as usize as *mut i32;

    for i in 0..n as usize {
        st_i32(pinv, ld_i32(perm, i) as usize, i as i32);
    }
}

/// Transpose a sparse matrix: B = A^T.
#[no_mangle]
pub unsafe extern "C" fn csTranspose(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    m: i32,
    n: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *mut f64;
    let bi = b_index_ptr as usize as *mut i32;
    let bp = b_ptr_ptr as usize as *mut i32;
    let count = work_ptr as usize as *mut i32;
    let mu = m as usize;

    let nnz = ld_i32(ap, n as usize);

    for i in 0..mu {
        st_i32(count, i, 0);
    }

    for p in 0..nnz as usize {
        let i = ld_i32(ai, p) as usize;
        st_i32(count, i, ld_i32(count, i) + 1);
    }

    let mut sum: i32 = 0;
    for i in 0..mu {
        st_i32(bp, i, sum);
        sum += ld_i32(count, i);
        st_i32(count, i, ld_i32(bp, i));
    }
    st_i32(bp, mu, sum);

    for j in 0..n {
        let p_start = ld_i32(ap, j as usize);
        let p_end = ld_i32(ap, j as usize + 1);
        for p in p_start..p_end {
            let pu = p as usize;
            let i = ld_i32(ai, pu) as usize;
            let q = ld_i32(count, i) as usize;
            st_i32(bi, q, j);
            st_f64(bv, q, ld_f64(av, pu));
            st_i32(count, i, q as i32 + 1);
        }
    }

    nnz
}

/// Multiply two sparse matrices: C = A * B.
#[no_mangle]
pub unsafe extern "C" fn csMult(
    a_values_ptr: i32,
    a_index_ptr: i32,
    a_ptr_ptr: i32,
    a_rows: i32,
    _a_cols: i32,
    b_values_ptr: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    b_cols: i32,
    c_values_ptr: i32,
    c_index_ptr: i32,
    c_ptr_ptr: i32,
    work_ptr: i32,
) -> i32 {
    let av = a_values_ptr as usize as *const f64;
    let ai = a_index_ptr as usize as *const i32;
    let ap = a_ptr_ptr as usize as *const i32;
    let bv = b_values_ptr as usize as *const f64;
    let bi_p = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;
    let cv = c_values_ptr as usize as *mut f64;
    let ci = c_index_ptr as usize as *mut i32;
    let cp = c_ptr_ptr as usize as *mut i32;
    let aru = a_rows as usize;

    let x = work_ptr as usize as *mut f64;
    let w = (work_ptr as usize as *mut u8).add(aru * 8) as *mut i32;

    let mut cnz: i32 = 0;

    for j in 0..b_cols {
        let ju = j as usize;
        st_i32(cp, ju, cnz);
        let mark = j + 1;

        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);

        for p in b_start..b_end {
            let pu = p as usize;
            let k = ld_i32(bi_p, pu);
            let bkj = ld_f64(bv, pu);

            let a_start = ld_i32(ap, k as usize);
            let a_end = ld_i32(ap, k as usize + 1);

            for q in a_start..a_end {
                let qu = q as usize;
                let i = ld_i32(ai, qu);
                let iu = i as usize;
                if ld_i32(w, iu) < mark {
                    st_i32(w, iu, mark);
                    st_i32(ci, cnz as usize, i);
                    cnz += 1;
                    st_f64(x, iu, ld_f64(av, qu) * bkj);
                } else {
                    st_f64(x, iu, ld_f64(x, iu) + ld_f64(av, qu) * bkj);
                }
            }
        }

        // Gather
        let col_start = ld_i32(cp, ju);
        for p in col_start..cnz {
            let pu = p as usize;
            let i = ld_i32(ci, pu) as usize;
            st_f64(cv, pu, ld_f64(x, i));
        }
    }

    st_i32(cp, b_cols as usize, cnz);
    cnz
}

/// Estimate number of nonzeros in sparse matrix multiply result.
#[no_mangle]
pub unsafe extern "C" fn csMultNnzEstimate(
    a_ptr_ptr: i32,
    a_cols: i32,
    b_index_ptr: i32,
    b_ptr_ptr: i32,
    b_cols: i32,
    a_rows: i32,
) -> i32 {
    let ap = a_ptr_ptr as usize as *const i32;
    let bi = b_index_ptr as usize as *const i32;
    let bp = b_ptr_ptr as usize as *const i32;

    let mut estimate: i32 = 0;

    for j in 0..b_cols {
        let ju = j as usize;
        let b_start = ld_i32(bp, ju);
        let b_end = ld_i32(bp, ju + 1);

        let mut col_nnz: i32 = 0;
        for p in b_start..b_end {
            let k = ld_i32(bi, p as usize);
            if k < a_cols {
                let ku = k as usize;
                col_nnz += ld_i32(ap, ku + 1) - ld_i32(ap, ku);
            }
        }

        if col_nnz > a_rows {
            col_nnz = a_rows;
        }
        estimate += col_nnz;
    }

    estimate
}
